import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const fetchShifts = createAsyncThunk('shifts/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const { data } = await API.get('/shifts', { params });
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

export const createShift = createAsyncThunk('shifts/create', async (shiftData, { rejectWithValue }) => {
  try {
    const { data } = await API.post('/shifts', shiftData);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

export const updateShift = createAsyncThunk('shifts/update', async ({ id, data: shiftData }, { rejectWithValue }) => {
  try {
    const { data } = await API.put(`/shifts/${id}`, shiftData);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

export const deleteShift = createAsyncThunk('shifts/delete', async (id, { rejectWithValue }) => {
  try {
    await API.delete(`/shifts/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

export const toggleShiftStatus = createAsyncThunk('shifts/toggle', async (id, { rejectWithValue }) => {
  try {
    const { data } = await API.put(`/shifts/${id}/toggle`);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

export const fetchAssignments = createAsyncThunk('shifts/fetchAssignments', async (params, { rejectWithValue }) => {
  try {
    const { data } = await API.get('/shifts/assignments/list', { params });
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

export const createAssignment = createAsyncThunk('shifts/createAssignment', async (assignmentData, { rejectWithValue }) => {
  try {
    const { data } = await API.post('/shifts/assignments', assignmentData);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

export const deleteAssignment = createAsyncThunk('shifts/deleteAssignment', async (id, { rejectWithValue }) => {
  try {
    await API.delete(`/shifts/assignments/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

const shiftSlice = createSlice({
  name: 'shifts',
  initialState: { items: [], assignments: [], loading: false, error: null },
  reducers: { clearShiftError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchShifts.pending, (state) => { state.loading = true; })
      .addCase(fetchShifts.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchShifts.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createShift.fulfilled, (state, action) => { state.items.push(action.payload); })
      .addCase(updateShift.fulfilled, (state, action) => {
        const idx = state.items.findIndex((s) => s._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteShift.fulfilled, (state, action) => { state.items = state.items.filter((s) => s._id !== action.payload); })
      .addCase(toggleShiftStatus.fulfilled, (state, action) => {
        const idx = state.items.findIndex((s) => s._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(fetchAssignments.fulfilled, (state, action) => { state.assignments = action.payload; })
      .addCase(createAssignment.fulfilled, (state, action) => { state.assignments.unshift(action.payload); })
      .addCase(deleteAssignment.fulfilled, (state, action) => { state.assignments = state.assignments.filter((a) => a._id !== action.payload); });
  },
});

export const { clearShiftError } = shiftSlice.actions;
export default shiftSlice.reducer;
