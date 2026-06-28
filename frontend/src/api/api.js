import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const API = axios.create({ baseURL: API_URL });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
  changePassword: (data) => API.put('/auth/change-password', data),
  requestLogin: (data) => API.post('/auth/request-login', data),
  checkRequest: (id) => API.get(`/auth/check-request/${id}`),
  getLoginRequests: (params) => API.get('/auth/login-requests', { params }),
  approveRequest: (id) => API.post(`/auth/approve/${id}`),
  rejectRequest: (id, data) => API.post(`/auth/reject/${id}`, data),
  getAuditLogs: (params) => API.get('/auth/audit-logs', { params }),
};

export const employeeAPI = {
  getAll: (params) => API.get('/employees', { params }),
  getOne: (id) => API.get(`/employees/${id}`),
  getMyProfile: () => API.get('/employees/my-profile'),
  create: (data) => API.post('/employees', data),
  update: (id, data) => API.put(`/employees/${id}`, data),
  delete: (id) => API.delete(`/employees/${id}`),
};

export const departmentAPI = {
  getAll: () => API.get('/departments'),
  getOne: (id) => API.get(`/departments/${id}`),
  create: (data) => API.post('/departments', data),
  update: (id, data) => API.put(`/departments/${id}`, data),
  delete: (id) => API.delete(`/departments/${id}`),
};

export const attendanceAPI = {
  getAll: (params) => API.get('/attendance', { params }),
  clockIn: (data) => API.post('/attendance/clock-in', data),
  clockOut: (data) => API.post('/attendance/clock-out', data),
  create: (data) => API.post('/attendance', data),
  bulkCreate: (data) => API.post('/attendance/bulk', data),
  update: (id, data) => API.put(`/attendance/${id}`, data),
  delete: (id) => API.delete(`/attendance/${id}`),
  getMonthly: (params) => API.get('/attendance/monthly', { params }),
  getSummary: (params) => API.get('/attendance/summary', { params }),
};

export const payrollAPI = {
  getAll: (params) => API.get('/payroll', { params }),
  create: (data) => API.post('/payroll', data),
  update: (id, data) => API.put(`/payroll/${id}`, data),
  process: (id) => API.put(`/payroll/${id}/process`),
  markPaid: (id) => API.put(`/payroll/${id}/pay`),
  getSummary: (params) => API.get('/payroll/summary', { params }),
};

export const roleAPI = {
  getAll: (params) => API.get('/roles', { params }),
  getOne: (id) => API.get(`/roles/${id}`),
  create: (data) => API.post('/roles', data),
  update: (id, data) => API.put(`/roles/${id}`, data),
  delete: (id) => API.delete(`/roles/${id}`),
  toggle: (id) => API.put(`/roles/${id}/toggle`),
  getAuditLogs: (params) => API.get('/roles/audit-logs', { params }),
};

export const userAPI = {
  getAll: (params) => API.get('/users', { params }),
  getOne: (id) => API.get(`/users/${id}`),
  create: (data) => API.post('/users', data),
  update: (id, data) => API.put(`/users/${id}`, data),
  delete: (id) => API.delete(`/users/${id}`),
  toggle: (id) => API.put(`/users/${id}/toggle`),
  resetPassword: (id, data) => API.put(`/users/${id}/reset-password`, data),
};

export const settingsAPI = {
  getAll: (params) => API.get('/settings', { params }),
  update: (data) => API.put('/settings', data),
  init: () => API.post('/settings/init'),
};

export const chartAPI = {
  getEmployeeGrowth: (params) => API.get('/charts/employee-growth', { params }),
  getMonthlySalary: (params) => API.get('/charts/monthly-salary', { params }),
  getDepartmentExpense: (params) => API.get('/charts/department-expense', { params }),
  getAttendanceTrend: (params) => API.get('/charts/attendance-trend', { params }),
  getDashboard: () => API.get('/charts/dashboard'),
};

export default API;
