import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { departmentAPI } from '../api/api';

export const fetchDepartments = createAsyncThunk('departments/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await departmentAPI.getAll();
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

export const createDepartment = createAsyncThunk('departments/create', async (deptData, { rejectWithValue }) => {
  try {
    const { data } = await departmentAPI.create(deptData);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

export const updateDepartment = createAsyncThunk('departments/update', async ({ id, data: deptData }, { rejectWithValue }) => {
  try {
    const { data } = await departmentAPI.update(id, deptData);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

export const deleteDepartment = createAsyncThunk('departments/delete', async (id, { rejectWithValue }) => {
  try {
    await departmentAPI.delete(id);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

const departmentSlice = createSlice({
  name: 'departments',
  initialState: { items: [], loading: false, error: null },
  reducers: { clearDeptError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartments.pending, (state) => { state.loading = true; })
      .addCase(fetchDepartments.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchDepartments.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createDepartment.fulfilled, (state, action) => { state.items.push(action.payload); })
      .addCase(updateDepartment.fulfilled, (state, action) => {
        const idx = state.items.findIndex((d) => d._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteDepartment.fulfilled, (state, action) => { state.items = state.items.filter((d) => d._id !== action.payload); });
  },
});

export const { clearDeptError } = departmentSlice.actions;
export default departmentSlice.reducer;
