import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../slices/authSlice';
import { authAPI } from '../api/api';
import toast from 'react-hot-toast';

const Login = () => {
  const [loginMode, setLoginMode] = useState('email');
  const [email, setEmail] = useState('admin@company.com');
  const [password, setPassword] = useState('password123');
  const [mobile, setMobile] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [requestStatus, setRequestStatus] = useState(null);
  const [requestId, setRequestId] = useState(null);
  const [pendingName, setPendingName] = useState('');
  const [polling, setPolling] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!requestId || !polling) return;
    const interval = setInterval(async () => {
      try {
        const res = await authAPI.checkRequest(requestId);
        const data = res.data.data;
        if (data.status === 'approved') {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          dispatch({ type: 'auth/login/fulfilled', payload: { user: data.user, token: data.token } });
          toast.success('Login approved by HR!');
          navigate('/');
          setPolling(false);
        } else if (data.status === 'rejected') {
          setRequestStatus('rejected');
          toast.error('Request rejected by HR: ' + (data.reason || 'No reason'));
          setPolling(false);
        }
      } catch (e) {
        console.error(e);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [requestId, polling, dispatch, navigate]);

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
      setRequestId(res.data.data.requestId);
      setPendingName(res.data.data.name);
      setRequestStatus('pending');
      setPolling(true);
      toast.success('Login request sent to HR!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request');
    }
  };

  const handleApproveLogin = async (reqId) => {
    try {
      const res = await authAPI.approveRequest(reqId);
      localStorage.setItem('token', res.data.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.data.user));
      dispatch({ type: 'auth/login/fulfilled', payload: { user: res.data.data.user, token: res.data.data.token } });
      toast.success('Login approved!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="login-page" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)', backgroundSize: '40px 40px' }}>
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
          <button type="button" onClick={() => { setLoginMode('email'); setRequestStatus(null); setPolling(false); }} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: 6, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', transition: 'var(--transition)', background: loginMode === 'email' ? 'rgba(255,255,255,0.15)' : 'transparent', color: loginMode === 'email' ? 'white' : 'rgba(255,255,255,0.5)' }}>
            Email Login
          </button>
          <button type="button" onClick={() => { setLoginMode('mobile'); setRequestStatus(null); setPolling(false); }} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: 6, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', transition: 'var(--transition)', background: loginMode === 'mobile' ? 'rgba(255,255,255,0.15)' : 'transparent', color: loginMode === 'mobile' ? 'white' : 'rgba(255,255,255,0.5)' }}>
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
            {requestStatus === 'pending' ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(245,158,11,0.15)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" style={{ width: 28, height: 28, animation: 'spin 2s linear infinite' }}>
                    <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <h3 style={{ color: 'white', fontSize: '1rem', marginBottom: 6 }}>Request Pending</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', marginBottom: 4 }}>Hi {pendingName}, login request sent to HR</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>Waiting for HR approval...</p>
                <div style={{ marginTop: 16, padding: '10px', background: 'rgba(245,158,11,0.1)', borderRadius: 'var(--radius)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <p style={{ color: '#fbbf24', fontSize: '0.75rem' }}>Auto-checking every 3 seconds...</p>
                </div>
              </div>
            ) : requestStatus === 'rejected' ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" style={{ width: 28, height: 28 }}>
                    <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6m0-6l6 6" />
                  </svg>
                </div>
                <h3 style={{ color: '#fca5a5', fontSize: '1rem', marginBottom: 6 }}>Request Rejected</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', marginBottom: 16 }}>HR rejected your login request</p>
                <button type="button" onClick={() => { setRequestStatus(null); setRequestId(null); }} className="login-btn" style={{ fontSize: '0.85rem', padding: '10px' }}>
                  Try Again
                </button>
              </div>
            ) : (
              <>
                <div className="login-field">
                  <label>Mobile Number</label>
                  <div className="login-input-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="login-input-icon">
                      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
                    </svg>
                    <input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="Enter mobile number" required />
                  </div>
                </div>
                <div style={{ padding: '10px', background: 'rgba(59,130,246,0.1)', borderRadius: 'var(--radius)', border: '1px solid rgba(59,130,246,0.2)', marginBottom: 16 }}>
                  <p style={{ color: '#93c5fd', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14, flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="10" /><path d="M12 16v-4m0-4h.01" />
                    </svg>
                    Enter your registered mobile number. HR will approve your login request.
                  </p>
                </div>
                <button type="submit" className="login-btn" disabled={loading}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                  {loading ? 'Sending...' : 'Send Login Request to HR'}
                </button>
              </>
            )}
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: 14, fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
          {loginMode === 'email' ? (
            <>Don't have an account? <Link to="/register" style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>Sign Up</Link></>
          ) : (
            <>Prefer email? <button type="button" onClick={() => { setLoginMode('email'); setRequestStatus(null); }} style={{ color: '#818cf8', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>Use Email Login</button></>
          )}
        </p>

        <p className="login-footer">Employee Management System</p>
      </div>
    </div>
  );
};

export default Login;
