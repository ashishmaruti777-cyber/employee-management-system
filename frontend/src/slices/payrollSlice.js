import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { payrollAPI } from '../api/api';

export const fetchPayrolls = createAsyncThunk('payroll/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const { data } = await payrollAPI.getAll(params);
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

export const createPayroll = createAsyncThunk('payroll/create', async (payrollData, { rejectWithValue }) => {
  try {
    const { data } = await payrollAPI.create(payrollData);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

export const processPayroll = createAsyncThunk('payroll/process', async (id, { rejectWithValue }) => {
  try {
    const { data } = await payrollAPI.process(id);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

export const markPaid = createAsyncThunk('payroll/markPaid', async (id, { rejectWithValue }) => {
  try {
    const { data } = await payrollAPI.markPaid(id);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

const payrollSlice = createSlice({
  name: 'payroll',
  initialState: { items: [], pagination: null, loading: false, error: null },
  reducers: { clearPayrollError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayrolls.pending, (state) => { state.loading = true; })
      .addCase(fetchPayrolls.fulfilled, (state, action) => { state.loading = false; state.items = action.payload.data; state.pagination = action.payload.pagination; })
      .addCase(fetchPayrolls.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createPayroll.fulfilled, (state, action) => { state.items.unshift(action.payload); })
      .addCase(processPayroll.fulfilled, (state, action) => {
        const idx = state.items.findIndex((p) => p._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(markPaid.fulfilled, (state, action) => {
        const idx = state.items.findIndex((p) => p._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      });
  },
});

export const { clearPayrollError } = payrollSlice.actions;
export default payrollSlice.reducer;
