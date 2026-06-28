import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const fetchUsers = createAsyncThunk('users/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const { data } = await API.get('/users', { params });
    return data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

export const createUser = createAsyncThunk('users/create', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await API.post('/users', userData);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

export const updateUser = createAsyncThunk('users/update', async ({ id, data: userData }, { rejectWithValue }) => {
  try {
    const { data } = await API.put(`/users/${id}`, userData);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

export const deleteUser = createAsyncThunk('users/delete', async (id, { rejectWithValue }) => {
  try {
    await API.delete(`/users/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

export const toggleUserStatus = createAsyncThunk('users/toggle', async (id, { rejectWithValue }) => {
  try {
    const { data } = await API.put(`/users/${id}/toggle`);
    return data.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

export const resetPassword = createAsyncThunk('users/resetPassword', async ({ id, password }, { rejectWithValue }) => {
  try {
    const { data } = await API.put(`/users/${id}/reset-password`, { password });
    return { id, message: data.message };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

const userSlice = createSlice({
  name: 'users',
  initialState: { items: [], pagination: null, loading: false, error: null },
  reducers: { clearUserError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => { state.loading = true; })
      .addCase(fetchUsers.fulfilled, (state, action) => { state.loading = false; state.items = action.payload.data; state.pagination = action.payload.pagination; })
      .addCase(fetchUsers.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createUser.fulfilled, (state, action) => { state.items.unshift(action.payload); })
      .addCase(updateUser.fulfilled, (state, action) => {
        const idx = state.items.findIndex((u) => u._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteUser.fulfilled, (state, action) => { state.items = state.items.filter((u) => u._id !== action.payload); })
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        const idx = state.items.findIndex((u) => u._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      });
  },
});

export const { clearUserError } = userSlice.actions;
export default userSlice.reducer;
