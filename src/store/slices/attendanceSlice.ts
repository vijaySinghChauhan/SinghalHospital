import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import api from '../../services/api';

export interface AttendanceRecord {
  employeeId: string;
  timestamp: string;
  type: 'IN' | 'OUT';
}

interface AttendanceState {
  records: AttendanceRecord[];
  loading: boolean;
  error: string | null;
}

const initialState: AttendanceState = {
  records: [],
  loading: false,
  error: null,
};

export const markAttendance = createAsyncThunk(
  'attendance/mark',
  async (payload: AttendanceRecord) => {
    const res = await api.post('/api/attendance/mark', payload);
    return res.data;
  },
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(markAttendance.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.records.push(action.payload.record);
      })
      .addCase(markAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to mark attendance';
      });
  },
});

export default attendanceSlice.reducer;