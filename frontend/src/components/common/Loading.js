import React from 'react';

const Loading = () => (
  <div className="loading">
    <div style={{ textAlign: 'center' }}>
      <div className="spinner"></div>
      <p style={{ marginTop: 12, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Loading...</p>
    </div>
  </div>
);

export const EmptyState = ({ icon, title, message, action }) => (
  <div className="empty-state">
    {icon || (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 56, height: 56, opacity: 0.3 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    )}
    <h3>{title || 'No Data Found'}</h3>
    <p>{message || 'No records available.'}</p>
    {action && <div style={{ marginTop: 16 }}>{action}</div>}
  </div>
);

export default Loading;
