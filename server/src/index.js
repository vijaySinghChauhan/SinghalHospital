require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const { db, migrate } = require('./db');

const OVERTIME_RATE = Number(process.env.OVERTIME_RATE || 200); // per hour
const LATE_PENALTY = Number(process.env.LATE_PENALTY || 100); // per late instance

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'SinghalHospital API' });
});

// Auth: Register (DB-backed)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, employeeId, email, password, designation, department } = req.body || {};
    if (!name || !employeeId || !email || !password || !designation || !department) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const exists = await db('users').where(q => q.where({ email }).orWhere({ employeeId })).first();
    if (exists) return res.status(409).json({ error: 'User already exists' });

    const passwordHash = bcrypt.hashSync(password, 10);
    await db('users').insert({
      name,
      employeeId,
      email,
      passwordHash,
      designation,
      department,
      baseSalary: 40000,
    });

    const user = await db('users').where({ email }).first();
    const token = 'dev-token';
    res.json({ user: sanitizeUser(user), token });
  } catch (e) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Auth: Login (DB-backed)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = await db('users').where({ email }).first();
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = 'dev-token';
    res.json({ user: sanitizeUser(user), token });
  } catch (e) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Attendance: Mark (DB-backed)
// Rule: first mark of the day -> IN (login); second mark -> OUT (logout).
// After one IN/OUT pair for a day, further marks are rejected.
app.post('/api/attendance/mark', async (req, res) => {
  try {
    const { employeeId, timestamp } = req.body || {};
    if (!employeeId || !timestamp) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const dateKey = new Date(timestamp).toISOString().split('T')[0];

    // Try to use per-day session record (entry/exit timestamps)
    let session = await db('attendance').where({ employeeId, date: dateKey }).first();
    if (!session) {
      // First mark of the day -> entry
      await db('attendance').insert({ employeeId, date: dateKey, entryTimestamp: timestamp });
      session = await db('attendance').where({ employeeId, date: dateKey }).first();
      return res.json({ record: { employeeId, date: dateKey, entryTimestamp: session.entryTimestamp, exitTimestamp: session.exitTimestamp } });
    }

    if (session.exitTimestamp) {
      return res.status(409).json({ error: 'Already logged out for the day' });
    }

    // Second mark -> exit
    await db('attendance').where({ id: session.id }).update({ exitTimestamp: timestamp });
    const updated = await db('attendance').where({ id: session.id }).first();
    return res.json({ record: { employeeId, date: dateKey, entryTimestamp: updated.entryTimestamp, exitTimestamp: updated.exitTimestamp } });
  } catch (e) {
    res.status(500).json({ error: 'Failed to mark attendance' });
  }
});

// Salary: Calculate summary (DB-backed)
app.get('/api/salary/calculate/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const user = await db('users').where({ employeeId }).first();
    const baseSalary = user?.baseSalary ?? 40000;

    const records = await db('attendance').where({ employeeId });
    // Count days present using either per-day sessions or legacy IN/OUT rows
    const daySet = new Set();
    for (const r of records) {
      if (r.date) daySet.add(r.date);
      else if (r.timestamp) daySet.add(r.timestamp.split('T')[0]);
    }
    const totalDaysPresent = daySet.size;

    let overtimeHours = 0;
    let lateCount = 0;
    const byDay = new Map();
    for (const r of records) {
      const day = r.date || (r.timestamp ? r.timestamp.split('T')[0] : null);
      if (!day) continue;
      if (!byDay.has(day)) byDay.set(day, []);
      byDay.get(day).push(r);
    }
    for (const [day, recs] of byDay.entries()) {
      // Prefer consolidated session record
      const sessionRec = recs.find(rr => rr.entryTimestamp || rr.exitTimestamp);
      if (sessionRec) {
        const inTime = sessionRec.entryTimestamp ? new Date(sessionRec.entryTimestamp).getTime() : null;
        const outTime = sessionRec.exitTimestamp ? new Date(sessionRec.exitTimestamp).getTime() : null;
        if (inTime != null && outTime != null && outTime > inTime) {
          const hours = (outTime - inTime) / (1000 * 60 * 60);
          overtimeHours += Math.max(0, hours - 8);
        }
        if (inTime != null) {
          const threshold = new Date(`${day}T09:15:00`).getTime();
          if (inTime > threshold) lateCount += 1;
        }
        continue;
      }
      // Fallback to legacy IN/OUT rows
      let inTime = null;
      let outTime = null;
      for (const r of recs) {
        if ((r.type || '').toUpperCase() === 'IN' && r.timestamp) {
          const t = new Date(r.timestamp).getTime();
          if (inTime === null || t < inTime) inTime = t;
        }
        if ((r.type || '').toUpperCase() === 'OUT' && r.timestamp) {
          const t = new Date(r.timestamp).getTime();
          if (outTime === null || t > outTime) outTime = t;
        }
      }
      if (inTime != null && outTime != null && outTime > inTime) {
        const hours = (outTime - inTime) / (1000 * 60 * 60);
        overtimeHours += Math.max(0, hours - 8);
      }
      if (inTime != null) {
        const threshold = new Date(`${day}T09:15:00`).getTime();
        if (inTime > threshold) lateCount += 1;
      }
    }

    const summary = {
      employeeId,
      baseSalary,
      totalDaysPresent,
      overtimeHours: Number(overtimeHours.toFixed(2)),
      lateCount,
      overtimeRate: OVERTIME_RATE,
      latePenalty: LATE_PENALTY,
      grossSalary: baseSalary + overtimeHours * OVERTIME_RATE,
      netSalary: baseSalary + overtimeHours * OVERTIME_RATE - lateCount * LATE_PENALTY,
    };
    res.json({ summary });
  } catch (e) {
    res.status(500).json({ error: 'Failed to calculate salary' });
  }
});

function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, ...rest } = user;
  return rest;
}

async function seedDefaultUser() {
  const email = 'john@company.com';
  const exists = await db('users').where({ email }).first();
  if (!exists) {
    const passwordHash = bcrypt.hashSync('password', 10);
    await db('users').insert({
      name: 'John Doe',
      employeeId: 'EMP001',
      email,
      passwordHash,
      designation: 'Nurse',
      department: 'Emergency',
      baseSalary: 40000,
    });
  }
}

const PORT = process.env.PORT || 3000;
(async () => {
  await migrate();
  await seedDefaultUser();
  app.listen(PORT, () => {
    console.log(`SinghalHospital API listening on http://localhost:${PORT}`);
  });
})();
