import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { attendanceAPI } from '../api/api';

export const fetchAttendance = createAsyncThunk('attendance/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const { data } = await attendanceAPI.getAll(params);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

export const fetchAttendanceSummary = createAsyncThunk('attendance/fetchSummary', async (params, { rejectWithValue }) => {
  try {
    const { data } = await attendanceAPI.getSummary(params);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

export const clockIn = createAsyncThunk('attendance/clockIn', async (employeeId, { rejectWithValue }) => {
  try {
    const { data } = await attendanceAPI.clockIn({ employee: employeeId });
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

export const clockOut = createAsyncThunk('attendance/clockOut', async (employeeId, { rejectWithValue }) => {
  try {
    const { data } = await attendanceAPI.clockOut({ employee: employeeId });
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

export const createAttendance = createAsyncThunk('attendance/create', async (attData, { rejectWithValue }) => {
  try {
    const { data } = await attendanceAPI.create(attData);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

export const bulkCreateAttendance = createAsyncThunk('attendance/bulkCreate', async (records, { rejectWithValue }) => {
  try {
    const { data } = await attendanceAPI.bulkCreate({ records });
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

export const updateAttendance = createAsyncThunk('attendance/update', async ({ id, data: attData }, { rejectWithValue }) => {
  try {
    const { data } = await attendanceAPI.update(id, attData);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

export const deleteAttendance = createAsyncThunk('attendance/delete', async (id, { rejectWithValue }) => {
  try {
    await attendanceAPI.delete(id);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState: { items: [], pagination: null, loading: false, error: null, summary: null },
  reducers: { clearAttendanceError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttendance.pending, (state) => { state.loading = true; })
      .addCase(fetchAttendance.fulfilled, (state, action) => { state.loading = false; state.items = action.payload.data; state.pagination = action.payload.pagination; })
      .addCase(fetchAttendance.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchAttendanceSummary.fulfilled, (state, action) => { state.summary = action.payload; })
      .addCase(createAttendance.fulfilled, (state, action) => { state.items.unshift(action.payload); })
      .addCase(bulkCreateAttendance.fulfilled, (state, action) => { state.items = [...action.payload.data, ...state.items]; })
      .addCase(updateAttendance.fulfilled, (state, action) => {
        const idx = state.items.findIndex(r => r._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(clockIn.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(clockOut.fulfilled, (state, action) => {
        const idx = state.items.findIndex(r => r._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteAttendance.fulfilled, (state, action) => {
        state.items = state.items.filter(r => r._id !== action.payload);
      });
  },
});

export const { clearAttendanceError } = attendanceSlice.actions;
export default attendanceSlice.reducer;
