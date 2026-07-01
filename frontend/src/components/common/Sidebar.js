import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../slices/authSlice';

const Sidebar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isEmployee = user?.role === 'employee';
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const hasPermission = (module, action = 'read') => {
    if (!user || !user.role) return false;
    if (user.role === 'admin' || user.role === 'super-admin') return true;
    if (!user.rolePermissions) return false;
    const modulePerm = user.rolePermissions.find((p) => p.module === module);
    return modulePerm && modulePerm.actions.includes(action);
  };

  const links = [
    { to: '/', label: 'Dashboard', icon: '🏠', module: null, employeeOnly: false },
    { to: '/employees', label: isEmployee ? 'My Profile' : 'Employees', icon: '👥', module: 'employees', employeeOnly: false },
    { to: '/attendance', label: isEmployee ? 'My Attendance' : 'Attendance', icon: '✅', module: 'attendance', employeeOnly: false },
    { to: '/departments', label: 'Departments', icon: '🏢', module: 'departments', employeeOnly: false },
    { to: '/payroll', label: 'Payroll', icon: '💰', module: 'payroll', employeeOnly: false },
    { to: '/shifts', label: 'Shifts', icon: '📅', module: 'shifts', employeeOnly: false },
    { to: '/reports', label: 'Reports', icon: '📊', module: 'employees', employeeOnly: false },
    { to: '/roles', label: 'Roles', icon: '🛡️', module: 'roles', employeeOnly: false },
    { to: '/users', label: 'Users', icon: '👤', module: 'users', employeeOnly: false },
    { to: '/admin', label: 'Admin Panel', icon: '⚙️', module: 'settings', employeeOnly: false },
    { to: '/backup', label: 'Backup', icon: '💾', module: 'settings', employeeOnly: false },
    { to: '/settings', label: 'Settings', icon: '🔧', module: 'settings', employeeOnly: false },
    { to: '/set-password', label: 'Set Password', icon: '🔑', module: null, employeeOnly: false },
  ];

  const filteredLinks = links.filter((link) => {
    if (isEmployee) {
      const empLinks = ['/', '/employees', '/attendance', '/set-password'];
      return !link.employeeOnly && empLinks.includes(link.to);
    }
    if (!link.module) return true;
    return hasPermission(link.module, 'read');
  });

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleLinkClick = () => setMobileOpen(false);

  return (
    <>
      <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? '✕' : '☰'}
      </button>
      {mobileOpen && <div className="sidebar-overlay open" onClick={() => setMobileOpen(false)} />}
      <div className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Welcome to</h2>
          <p>{user?.name || 'User'}</p>
        </div>
        <nav className="sidebar-nav">
          {filteredLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'} className={({ isActive }) => isActive ? 'active' : ''} onClick={handleLinkClick}>
              <span style={{ fontSize: '1rem' }}>{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
          <a onClick={() => { handleLogout(); handleLinkClick(); }} style={{ cursor: 'pointer', marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 14, marginTop: 16, display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', borderRadius: 10, color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem', fontWeight: 500, transition: 'var(--transition)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#fca5a5'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}>
            <span style={{ fontSize: '1rem' }}>🚪</span>
            Logout
          </a>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
