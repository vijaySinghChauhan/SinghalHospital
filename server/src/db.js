require('dotenv').config();
const knex = require('knex');

// Enforce MySQL only
const client = 'mysql2';
const url = process.env.DATABASE_URL;
let connection;
if (url && url.trim().length > 0) {
  connection = url;
} else {
  const host = process.env.MYSQL_HOST || 'localhost';
  const port = Number(process.env.MYSQL_PORT || 3306);
  const user = process.env.MYSQL_USER;
  const password = process.env.MYSQL_PASSWORD;
  const database = process.env.MYSQL_DATABASE;
  if (!user || !password || !database) {
    throw new Error('MYSQL_USER, MYSQL_PASSWORD, and MYSQL_DATABASE are required');
  }
  connection = { host, port, user, password, database };
}

const knexConfig = {
  client,
  connection,
};

const db = knex(knexConfig);

async function migrate() {
  const hasUsers = await db.schema.hasTable('users');
  if (!hasUsers) {
    await db.schema.createTable('users', t => {
      t.increments('id').primary();
      t.string('name').notNullable();
      t.string('employeeId').notNullable().unique();
      t.string('email').notNullable().unique();
      t.string('passwordHash').notNullable();
      t.string('designation').notNullable();
      t.string('department').notNullable();
      t.integer('baseSalary').notNullable().defaultTo(40000);
      t.timestamps(true, true);
    });
  }

  const hasAttendance = await db.schema.hasTable('attendance');
  if (!hasAttendance) {
    await db.schema.createTable('attendance', t => {
      t.increments('id').primary();
      t.string('employeeId').notNullable();
      // Legacy columns (for backward compatibility with earlier schema)
      t.string('timestamp');
      t.string('type');
      // New consolidated per-day session columns
      t.string('date'); // YYYY-MM-DD
      t.string('entryTimestamp'); // ISO string
      t.string('exitTimestamp'); // ISO string
      t.timestamps(true, true);
    });
  } else {
    // Ensure new columns exist if migrating from legacy schema
    const hasDate = await db.schema.hasColumn('attendance', 'date');
    const hasEntry = await db.schema.hasColumn('attendance', 'entryTimestamp');
    const hasExit = await db.schema.hasColumn('attendance', 'exitTimestamp');
    if (!hasDate || !hasEntry || !hasExit) {
      await db.schema.alterTable('attendance', t => {
        if (!hasDate) t.string('date');
        if (!hasEntry) t.string('entryTimestamp');
        if (!hasExit) t.string('exitTimestamp');
      });
    }
  }
}

module.exports = { db, migrate };
