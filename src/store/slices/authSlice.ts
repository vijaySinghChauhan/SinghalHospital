import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

export interface User {
  name: string;
  employeeId: string;
  email: string;
  designation: string;
  department: string;
  baseSalary?: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

export const register = createAsyncThunk(
  'auth/register',
  async (payload: {
    name: string;
    employeeId: string;
    email: string;
    password: string;
    designation: string;
    department: string;
  }) => {
    const res = await api.post('/api/auth/register', payload);
    return res.data;
  },
);

export const login = createAsyncThunk(
  'auth/login',
  async (payload: {email: string; password: string}) => {
    const res = await api.post('/api/auth/login', payload);
    return res.data;
  },
);

export const loadSession = createAsyncThunk('auth/loadSession', async () => {
  const token = await AsyncStorage.getItem('token');
  const userRaw = await AsyncStorage.getItem('user');
  return {token, user: userRaw ? (JSON.parse(userRaw) as User) : null};
});

export const logout = createAsyncThunk('auth/logout', async () => {
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('user');
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(register.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Registration failed';
      })
      .addCase(login.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      })
      .addCase(loadSession.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(logout.fulfilled, state => {
        state.user = null;
        state.token = null;
      });
  },
});

export default authSlice.reducer;