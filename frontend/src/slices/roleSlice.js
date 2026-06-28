import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { roleAPI } from '../api/api';

export const fetchRoles = createAsyncThunk('roles/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const { data } = await roleAPI.getAll(params);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

export const createRole = createAsyncThunk('roles/create', async (roleData, { rejectWithValue }) => {
  try {
    const { data } = await roleAPI.create(roleData);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

export const updateRole = createAsyncThunk('roles/update', async ({ id, data: roleData }, { rejectWithValue }) => {
  try {
    const { data } = await roleAPI.update(id, roleData);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

export const deleteRole = createAsyncThunk('roles/delete', async (id, { rejectWithValue }) => {
  try {
    await roleAPI.delete(id);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

export const toggleRoleStatus = createAsyncThunk('roles/toggle', async (id, { rejectWithValue }) => {
  try {
    const { data } = await roleAPI.toggle(id);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

const roleSlice = createSlice({
  name: 'roles',
  initialState: { items: [], loading: false, error: null },
  reducers: { clearRoleError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => { state.loading = true; })
      .addCase(fetchRoles.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
      .addCase(fetchRoles.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createRole.fulfilled, (state, action) => { state.items.unshift(action.payload); })
      .addCase(updateRole.fulfilled, (state, action) => {
        const idx = state.items.findIndex((r) => r._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteRole.fulfilled, (state, action) => { state.items = state.items.filter((r) => r._id !== action.payload); })
      .addCase(toggleRoleStatus.fulfilled, (state, action) => {
        const idx = state.items.findIndex((r) => r._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      });
  },
});

export const { clearRoleError } = roleSlice.actions;
export default roleSlice.reducer;
