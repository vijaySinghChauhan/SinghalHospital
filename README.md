# Singhal Hospital – Employee Attendance & Salary (React Native Windows)

This app manages employee authentication, biometric attendance, and salary calculation for Windows desktop using React Native Windows.

## Features
- Authentication: Register and Login with name, employee ID, email, password, designation, and department.
- Attendance: Fingerprint verification (Windows Hello stub) and mark IN/OUT with timestamp and employee ID; posts to `/api/attendance/mark`.
- Salary: Monthly salary computed as `BaseSalary + (OvertimeHours × OvertimeRate) − (LateCount × LatePenalty)`; displays summary screen with key metrics.
- Dashboard: Quick stats (Attendance %, Salary this month, Overtime hours).
- State: Redux Toolkit, AsyncStorage session persistence.
- UI: React Native Paper components and theme.
- API: Axios client with mock mode and sample JSON data.

## Folder Structure
```
SinghalHospital/
├─ App.tsx
├─ index.js
├─ package.json
├─ src/
│  ├─ config.ts
│  ├─ navigation/AppNavigator.tsx
│  ├─ services/api.ts
│  ├─ services/biometric.ts
│  ├─ utils/salary.ts
│  ├─ components/
│  │  ├─ ErrorBanner.tsx
│  │  └─ LoadingOverlay.tsx
│  ├─ screens/
│  │  ├─ LoginScreen.tsx
│  │  ├─ RegisterScreen.tsx
│  │  ├─ DashboardScreen.tsx
│  │  ├─ AttendanceScreen.tsx
│  │  └─ SalarySummaryScreen.tsx
│  └─ store/
│     ├─ index.ts
│     └─ slices/
│        ├─ authSlice.ts
│        ├─ attendanceSlice.ts
│        └─ salarySlice.ts
├─ assets/mock/mock.json
├─ tsconfig.json
├─ babel.config.js
└─ react-native.config.js
```

## Setup (Windows)
1. Install prerequisites: Node.js LTS, Yarn/NPM, Visual Studio 2022 with UWP workload.
2. Install dependencies: `npm install` or `yarn`.
3. Initialize Windows platform (creates native `windows/` directory):
   - `npx react-native-windows-init --overwrite`
4. Run the app on Windows:
   - `npx react-native run-windows`

> Mock mode is disabled (`src/config.ts`). The app uses the backend API by default. Ensure `baseURL` points to your server.

## APIs
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/attendance/mark`
- `GET /api/salary/calculate/:employeeId`

## Backend (Node.js)

Location: `server/`

### Run locally
- Install deps: `cd server && npm install`
- Start dev: `npm run dev` (auto-restarts with nodemon)
- Start prod: `npm start`

The server listens on `http://localhost:3000` by default, matching `src/config.ts`.

### Endpoints
- `POST /api/auth/register` → body: `{ name, employeeId, email, password, designation, department }` → `{ user, token }`
- `POST /api/auth/login` → body: `{ email, password }` → `{ user, token }`
- `POST /api/attendance/mark` → body: `{ employeeId, timestamp }` → `{ record }`
- `GET /api/salary/calculate/:employeeId` → `{ summary }` with `grossSalary` and `netSalary`

Notes:
- Database is MySQL-only via `mysql2`.
- Salary calculation assumes 8h workday, overtime after 8h, and late if first IN is after 09:15.

### Environment

Create `server/.env` and adjust values as needed:

```
PORT=3000
DATABASE_CLIENT=mysql2
DATABASE_URL=mysql://user:password@localhost:3306/singhal_hospital
OVERTIME_RATE=200
LATE_PENALTY=100
JWT_SECRET=dev-secret
```

SQLite is not supported.

### Attendance API Notes

- The server enforces per-day sequencing: first mark is `IN` (login), second is `OUT` (logout). Further marks for the same day are rejected.
- The attendance mark endpoint auto-assigns `type` based on the day’s existing records.

### MySQL Setup

- Install and run MySQL locally or use a managed instance.
- Create a database, e.g., `singhal_hospital`.
- Provide credentials via `DATABASE_URL`, for example:
  - `mysql://user:password@localhost:3306/singhal_hospital`
- Ensure the user has privileges to create tables (migrations will auto-create `users` and `attendance`).

The Axios client uses request interceptors to include `Authorization` header when `token` is stored.

## Biometric Integration (Windows Hello)
The app includes a simple biometric service (`src/services/biometric.ts`) that calls `NativeModules.BiometricAuth.verify()` when available. For production on Windows:

- Implement a native Windows module that bridges to `Windows.Security.Credentials.UI.UserConsentVerifier` and exposes `verify()` to JS.
- Register the module in your RN Windows C++/C# project so `NativeModules.BiometricAuth` is available.

Until then, the stub returns success in Windows for demonstration purposes.

## State & Persistence
- Redux Toolkit slices: `auth`, `attendance`, `salary`.
- Session: `token` and `user` are persisted in `AsyncStorage`. `loadSession` restores on app start.

## Testing with Mock Data
- Edit `src/config.ts` to keep `useMockApi: true`. The app will respond using `assets/mock/mock.json`.
- Example credentials: `john@company.com` / `password`.

## Notes
- React Navigation is configured with an auth flow and app flow. After login/registration, users land on Dashboard.
- Salary summary is fetched via API call and rendered using `DataTable`.
- UI is kept clean and modern with React Native Paper.
