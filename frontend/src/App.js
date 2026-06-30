import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getMe } from './slices/authSlice';
import { fetchEmployees } from './slices/employeeSlice';
import { fetchDepartments } from './slices/departmentSlice';
import Loading from './components/common/Loading';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Employees = lazy(() => import('./pages/Employees'));
const Departments = lazy(() => import('./pages/Departments'));
const Attendance = lazy(() => import('./pages/Attendance'));
const Payroll = lazy(() => import('./pages/Payroll'));
const Settings = lazy(() => import('./pages/Settings'));
const Roles = lazy(() => import('./pages/Roles'));
const Users = lazy(() => import('./pages/Users'));
const Shifts = lazy(() => import('./pages/Shifts'));
const Reports = lazy(() => import('./pages/Reports'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const Backup = lazy(() => import('./pages/Backup'));
const SetPassword = lazy(() => import('./pages/SetPassword'));

const PrivateRoute = ({ children }) => {
  const { token } = useSelector((state) => state.auth);
  return token ? children : <Navigate to="/login" />;
};

function App() {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (token) {
      Promise.all([
        dispatch(getMe()),
        dispatch(fetchEmployees({ limit: 500 })),
        dispatch(fetchDepartments()),
      ]).finally(() => setReady(true));
    } else {
      setReady(true);
    }
  }, [dispatch, token]);

  if (!ready && token) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0f172a', color: 'white', flexDirection: 'column', gap: 16 }}>
        <div style={{ width: 40, height: 40, border: '3px solid rgba(139,92,246,0.2)', borderTopColor: '#8b5cf6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)' }}>Loading your workspace...</div>
      </div>
    );
  }

  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/employees" element={<PrivateRoute><Employees /></PrivateRoute>} />
        <Route path="/departments" element={<PrivateRoute><Departments /></PrivateRoute>} />
        <Route path="/attendance" element={<PrivateRoute><Attendance /></PrivateRoute>} />
        <Route path="/payroll" element={<PrivateRoute><Payroll /></PrivateRoute>} />
        <Route path="/roles" element={<PrivateRoute><Roles /></PrivateRoute>} />
        <Route path="/users" element={<PrivateRoute><Users /></PrivateRoute>} />
        <Route path="/shifts" element={<PrivateRoute><Shifts /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute><AdminPanel /></PrivateRoute>} />
        <Route path="/backup" element={<PrivateRoute><Backup /></PrivateRoute>} />
        <Route path="/set-password" element={<PrivateRoute><SetPassword /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;