import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { employeeAPI } from '../api/api';

export const fetchEmployees = createAsyncThunk('employees/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const { data } = await employeeAPI.getAll(params);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch employees');
  }
});

export const fetchMyProfile = createAsyncThunk('employees/fetchMyProfile', async (_, { rejectWithValue }) => {
  try {
    const { data } = await employeeAPI.getMyProfile();
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
  }
});

export const fetchEmployee = createAsyncThunk('employees/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const { data } = await employeeAPI.getOne(id);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch employee');
  }
});

export const createEmployee = createAsyncThunk('employees/create', async (employeeData, { rejectWithValue }) => {
  try {
    const { data } = await employeeAPI.create(employeeData);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create employee');
  }
});

export const updateEmployee = createAsyncThunk('employees/update', async ({ id, data: empData }, { rejectWithValue }) => {
  try {
    const { data } = await employeeAPI.update(id, empData);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update employee');
  }
});

export const deleteEmployee = createAsyncThunk('employees/delete', async (id, { rejectWithValue }) => {
  try {
    await employeeAPI.delete(id);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete employee');
  }
});

const employeeSlice = createSlice({
  name: 'employees',
  initialState: { items: [], current: null, pagination: null, loading: false, error: null },
  reducers: {
    clearEmployeeError: (state) => { state.error = null; },
    clearCurrentEmployee: (state) => { state.current = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => { state.loading = true; })
      .addCase(fetchEmployees.fulfilled, (state, action) => { state.loading = false; state.items = action.payload.data; state.pagination = action.payload.pagination; })
      .addCase(fetchEmployees.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchMyProfile.fulfilled, (state, action) => { state.loading = false; state.items = [action.payload]; state.current = action.payload; })
      .addCase(fetchEmployee.fulfilled, (state, action) => { state.current = action.payload; })
      .addCase(createEmployee.fulfilled, (state, action) => { state.items.unshift(action.payload); })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        const idx = state.items.findIndex((e) => e._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
        state.current = action.payload;
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => { state.items = state.items.filter((e) => e._id !== action.payload); });
  },
});

export const { clearEmployeeError, clearCurrentEmployee } = employeeSlice.actions;
export default employeeSlice.reducer;
