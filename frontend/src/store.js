import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import employeeReducer from './slices/employeeSlice';
import departmentReducer from './slices/departmentSlice';
import attendanceReducer from './slices/attendanceSlice';
import payrollReducer from './slices/payrollSlice';
import roleReducer from './slices/roleSlice';
import userReducer from './slices/userSlice';
import shiftReducer from './slices/shiftSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    employees: employeeReducer,
    departments: departmentReducer,
    attendance: attendanceReducer,
    payroll: payrollReducer,
    roles: roleReducer,
    users: userReducer,
    shifts: shiftReducer,
  },
});
