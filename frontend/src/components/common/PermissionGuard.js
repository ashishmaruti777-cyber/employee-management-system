import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const PermissionGuard = ({ module, action = 'read', children, fallback = null }) => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'admin') {
    return children;
  }

  if (!user.rolePermissions) {
    return fallback || <Navigate to="/" replace />;
  }

  const modulePerm = user.rolePermissions.find((p) => p.module === module);
  const hasPermission = modulePerm && modulePerm.actions.includes(action);

  if (!hasPermission) {
    return fallback || (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2 style={{ color: 'var(--danger)', marginBottom: 8 }}>Access Denied</h2>
        <p style={{ color: 'var(--text-secondary)' }}>You don't have permission to access this page.</p>
      </div>
    );
  }

  return children;
};

export default PermissionGuard;
