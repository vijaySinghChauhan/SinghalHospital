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

> Mock mode is enabled by default (`src/config.ts`). Set `useMockApi` to `false` and update `baseURL` to connect to your backend.

## APIs
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/attendance/mark`
- `GET /api/salary/calculate/:employeeId`

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