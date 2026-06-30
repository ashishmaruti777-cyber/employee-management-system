import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../slices/authSlice';
import { authAPI } from '../api/api';
import toast from 'react-hot-toast';

const Login = () => {
  const [loginMode, setLoginMode] = useState('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    const result = await dispatch(login({ email, password }));
    if (login.fulfilled.match(result)) {
      toast.success('Login successful!');
      navigate('/');
    } else {
      toast.error(result.payload);
    }
  };

  const handleMobileLogin = async (e) => {
    e.preventDefault();
    if (!mobile || mobile.length < 10) {
      toast.error('Enter valid mobile number');
      return;
    }
    try {
      const res = await authAPI.requestLogin({ mobile });
      localStorage.setItem('token', res.data.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.data.user));
      dispatch({ type: 'auth/login/fulfilled', payload: { user: res.data.data.user, token: res.data.data.token } });
      toast.success('Login successful!');
      navigate('/employees');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to login');
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-shape login-bg-shape-1"></div>
      <div className="login-bg-shape login-bg-shape-2"></div>
      <div className="login-bg-shape login-bg-shape-3"></div>

      <div className="login-card">
        <div className="login-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 24, height: 24 }}>
            <path d="M3 21h18M3 7v1a3 3 0 006 0V7m0 0V4h6v3m0 0v1a3 3 0 006 0V7M6 21V10m6 11V10m6 11V10" />
            <rect x="2" y="7" width="20" height="14" rx="2" />
            <path d="M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2" />
          </svg>
        </div>
        <h2 className="login-title">Employee Management</h2>
        <p className="login-subtitle">Sign in to access your dashboard</p>

        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--radius)', padding: 3, marginBottom: 20 }}>
          <button type="button" onClick={() => setLoginMode('email')} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: 6, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', transition: 'var(--transition)', background: loginMode === 'email' ? 'rgba(255,255,255,0.15)' : 'transparent', color: loginMode === 'email' ? 'white' : 'rgba(255,255,255,0.5)' }}>
            Email Login
          </button>
          <button type="button" onClick={() => setLoginMode('mobile')} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: 6, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', transition: 'var(--transition)', background: loginMode === 'mobile' ? 'rgba(255,255,255,0.15)' : 'transparent', color: loginMode === 'mobile' ? 'white' : 'rgba(255,255,255,0.5)' }}>
            Mobile Login
          </button>
        </div>

        {error && (
          <div className="login-error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14, flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
            </svg>
            {error}
          </div>
        )}

        {loginMode === 'email' ? (
          <form onSubmit={handleEmailLogin}>
            <div className="login-field">
              <label>Email Address</label>
              <div className="login-input-wrapper">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="login-input-icon">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@company.com" required />
              </div>
            </div>
            <div className="login-field">
              <label>Password</label>
              <div className="login-input-wrapper">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="login-input-icon">
                  <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required />
                <button type="button" className="login-eye-btn" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 16, height: 16 }}>
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 16, height: 16 }}>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div className="login-options">
              <label className="login-checkbox">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="login-forgot" style={{ textDecoration: 'none' }}>Forgot password?</Link>
            </div>
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleMobileLogin}>
            <div className="login-field">
              <label>Mobile Number</label>
              <div className="login-input-wrapper">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="login-input-icon">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
                </svg>
                <input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="Enter registered mobile number" required />
              </div>
            </div>
            <div style={{ padding: '10px', background: 'rgba(59,130,246,0.1)', borderRadius: 'var(--radius)', border: '1px solid rgba(59,130,246,0.2)', marginBottom: 16 }}>
              <p style={{ color: '#93c5fd', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14, flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10" /><path d="M12 16v-4m0-4h.01" />
                </svg>
                Enter your registered mobile number to login directly.
              </p>
            </div>
            <button type="submit" className="login-btn" disabled={loading}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {loading ? 'Logging in...' : 'Login with Mobile'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};

export default Login;
