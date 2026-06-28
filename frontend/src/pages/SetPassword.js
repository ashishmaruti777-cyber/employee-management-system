import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import Sidebar from '../components/common/Sidebar';
import { authAPI } from '../api/api';
import toast from 'react-hot-toast';

const SetPassword = () => {
  const { user } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [forceChange, setForceChange] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!forceChange && !form.currentPassword) {
      toast.error('Current password is required');
      return;
    }
    if (!form.newPassword) {
      toast.error('New password is required');
      return;
    }
    if (form.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      setLoading(true);
      await authAPI.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        forceChange,
      });
      toast.success('Password changed successfully!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 14px', border: '1px solid #e2e8f0', borderRadius: 10,
    fontSize: '0.85rem', background: 'white', outline: 'none', boxSizing: 'border-box',
  };

  const labelStyle = {
    fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: 6, display: 'block',
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content" style={{ background: '#f8fafc' }}>
        <div style={{ padding: '24px 32px 0' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Set Password</h1>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 4 }}>
            Change your account password. Please set a strong password for security.
          </p>
        </div>

        <div style={{ maxWidth: 500, margin: '24px 32px', background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: 32 }}>
          {/* User Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid #f1f5f9' }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '1.2rem',
            }}>
              {user?.name?.[0] || 'U'}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b' }}>{user?.name}</div>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{user?.email}</div>
              <div style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 600, marginTop: 2, textTransform: 'capitalize' }}>{user?.role?.replace('-', ' ')}</div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Skip current password checkbox */}
            <div style={{ marginBottom: 20, padding: '12px 16px', background: '#eff6ff', borderRadius: 10, border: '1px solid #bfdbfe' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: '0.85rem', color: '#1e40af', fontWeight: 500 }}>
                <input
                  type="checkbox"
                  checked={forceChange}
                  onChange={(e) => setForceChange(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: '#6366f1' }}
                />
                First time? Set password without current password
              </label>
            </div>

            {!forceChange && (
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Current Password *</label>
                <input
                  type="password"
                  placeholder="Enter current password"
                  value={form.currentPassword}
                  onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                  style={inputStyle}
                />
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>New Password *</label>
              <input
                type="password"
                placeholder="Enter new password (min 6 characters)"
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                style={inputStyle}
              />
              {form.newPassword && form.newPassword.length < 6 && (
                <small style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: 4, display: 'block' }}>
                  Password must be at least 6 characters
                </small>
              )}
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={labelStyle}>Confirm New Password *</label>
              <input
                type="password"
                placeholder="Re-enter new password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                style={inputStyle}
              />
              {form.confirmPassword && form.newPassword !== form.confirmPassword && (
                <small style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: 4, display: 'block' }}>
                  Passwords do not match
                </small>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '12px 0', borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem', fontWeight: 700, background: loading ? '#cbd5e1' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white', boxShadow: loading ? 'none' : '0 4px 12px rgba(99,102,241,0.3)',
              }}
            >
              {loading ? 'Changing...' : 'Set Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SetPassword;
