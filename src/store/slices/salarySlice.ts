import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import api from '../../services/api';

export interface SalarySummary {
  employeeId: string;
  baseSalary: number;
  totalDaysPresent: number;
  overtimeHours: number;
  lateCount: number;
  overtimeRate: number;
  latePenalty: number;
  grossSalary: number;
  netSalary: number;
}

interface SalaryState {
  summary: SalarySummary | null;
  loading: boolean;
  error: string | null;
}

const initialState: SalaryState = {
  summary: null,
  loading: false,
  error: null,
};

export const fetchSalary = createAsyncThunk(
  'salary/fetch',
  async (employeeId: string) => {
    const res = await api.get(`/api/salary/calculate/${employeeId}`);
    return res.data;
  },
);

const salarySlice = createSlice({
  name: 'salary',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchSalary.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSalary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload.summary;
      })
      .addCase(fetchSalary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch salary';
      });
  },
});

export default salarySlice.reducer;