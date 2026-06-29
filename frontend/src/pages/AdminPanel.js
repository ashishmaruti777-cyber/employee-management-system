import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Sidebar from '../components/common/Sidebar';
import Loading from '../components/common/Loading';
import { fetchUsers, createUser, updateUser, deleteUser, toggleUserStatus, resetPassword } from '../slices/userSlice';
import { fetchRoles, createRole, updateRole, deleteRole, toggleRoleStatus } from '../slices/roleSlice';
import { fetchDepartments, createDepartment, updateDepartment, deleteDepartment } from '../slices/departmentSlice';
import { fetchEmployees } from '../slices/employeeSlice';
import Modal, { ConfirmModal } from '../components/common/Modal';
import API from '../api/api';
import toast from 'react-hot-toast';

const TABS = ['Dashboard', 'Users', 'Departments', 'Roles'];

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (activeTab === 'Dashboard') {
      setLoadingStats(true);
      API.get('/admin/stats').then((r) => { setStats(r.data.data); setLoadingStats(false); }).catch(() => setLoadingStats(false));
    }
  }, [activeTab]);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <h1>Admin Panel</h1>
          <div style={{ display: 'flex', gap: 4, background: 'var(--bg)', borderRadius: 8, padding: 4 }}>
            {TABS.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '6px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: '0.85rem', background: activeTab === tab ? 'var(--primary)' : 'transparent', color: activeTab === tab ? '#fff' : 'var(--text)' }}>{tab}</button>
            ))}
          </div>
        </div>

        {activeTab === 'Dashboard' && <AdminDashboard stats={stats} loading={loadingStats} />}
        {activeTab === 'Users' && <AdminUsers />}
        {activeTab === 'Departments' && <AdminDepartments />}
        {activeTab === 'Roles' && <AdminRoles />}
      </div>
    </div>
  );
};

const AdminDashboard = ({ stats, loading }) => {
  if (loading) return <Loading />;
  if (!stats) return <p style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>Failed to load stats</p>;

  const { overview, departmentStats, roleStats, recentUsers, genderDistribution, employmentTypes } = stats;

  const statCards = [
    { label: 'Total Employees', value: overview.totalEmployees, bg: '#ede9fe', color: '#7c3aed', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { label: 'Active Employees', value: overview.activeEmployees, bg: '#d1fae5', color: '#059669', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Departments', value: overview.totalDepartments, bg: '#dbeafe', color: '#2563eb', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5' },
    { label: 'Total Users', value: overview.totalUsers, bg: '#fce7f3', color: '#db2777', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
    { label: 'Today Attendance', value: overview.todayAttendance, bg: '#fef3c7', color: '#d97706', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { label: 'Monthly Expense', value: `$${(overview.monthlyExpense || 0).toLocaleString()}`, bg: '#ede9fe', color: '#7c3aed', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Pending Payroll', value: overview.pendingPayroll, bg: '#fef3c7', color: '#d97706', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Total Roles', value: overview.totalRoles, bg: '#d1fae5', color: '#059669', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  ];

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
        {statCards.map((s, i) => (
          <div key={i} className="card" style={{ borderTop: `3px solid ${s.color}`, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth={1.5} style={{ width: 22, height: 22 }}><path strokeLinecap="round" strokeLinejoin="round" d={s.icon} /></svg>
              </div>
              <div>
                <p style={{ fontSize: '1.3rem', fontWeight: 700, color: s.color }}>{s.value}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div className="card">
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 12 }}>Department Overview</h3>
          {departmentStats.map((d) => (
            <div key={d._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
              <span>{d.name} ({d.code})</span>
              <span style={{ fontWeight: 600 }}>{d.employeeCount} employees</span>
            </div>
          ))}
        </div>

        <div className="card">
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 12 }}>Role Distribution</h3>
          {roleStats.map((r) => (
            <div key={r._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: r.color }}></div>
                <span>{r.name}</span>
              </div>
              <span className="badge" style={{ background: `${r.color}20`, color: r.color }}>{r.userCount} users</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 12 }}>Gender Distribution</h3>
          {genderDistribution.length > 0 ? genderDistribution.map((g) => (
            <div key={g._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem', textTransform: 'capitalize' }}>
              <span>{g._id || 'Not specified'}</span>
              <span style={{ fontWeight: 600 }}>{g.count}</span>
            </div>
          )) : <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No data</p>}
        </div>

        <div className="card">
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 12 }}>Employment Types</h3>
          {employmentTypes.length > 0 ? employmentTypes.map((e) => (
            <div key={e._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.85rem', textTransform: 'capitalize' }}>
              <span>{(e._id || 'Not specified').replace('-', ' ')}</span>
              <span style={{ fontWeight: 600 }}>{e.count}</span>
            </div>
          )) : <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No data</p>}
        </div>
      </div>
    </>
  );
};

const AdminUsers = () => {
  const dispatch = useDispatch();
  const { items: users, pagination, loading } = useSelector((state) => state.users);
  const { items: roles } = useSelector((state) => state.roles);
  const [showModal, setShowModal] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [resetId, setResetId] = useState(null);
  const [newPassword, setNewPassword] = useState('password123');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'employee', phone: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(fetchUsers({ page, limit: 10, search, role: roleFilter }));
    dispatch(fetchRoles({}));
  }, [dispatch, page, search, roleFilter]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email is invalid';
    if (!editId && !form.password) e.password = 'Password is required';
    else if (!editId && form.password.length < 6) e.password = 'Min 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      if (editId) { await dispatch(updateUser({ id: editId, data: form })).unwrap(); toast.success('User updated!'); }
      else { await dispatch(createUser(form)).unwrap(); toast.success('User created!'); }
      setShowModal(false); resetForm();
    } catch (err) { toast.error(err || 'Failed'); }
  };

  const handleEdit = (user) => {
    setForm({ name: user.name, email: user.email, password: '', role: user.role, phone: user.phone || '' });
    setEditId(user._id); setShowModal(true);
  };

  const handleDelete = async () => { await dispatch(deleteUser(deleteId)); toast.success('User deleted!'); setShowDelete(false); };
  const handleToggle = async (id) => { await dispatch(toggleUserStatus(id)); toast.success('Status toggled!'); };
  const handleResetPassword = async () => {
    await dispatch(resetPassword({ id: resetId, password: newPassword }));
    toast.success('Password reset!'); setShowReset(false); setNewPassword('password123');
  };
  const resetForm = () => { setForm({ name: '', email: '', password: '', role: 'employee', phone: '' }); setEditId(null); setErrors({}); };

  const roleColors = { admin: '#ef4444', manager: '#f59e0b', employee: '#10b981' };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>User Management</h3>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>+ Add User</button>
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <input placeholder="Search users..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={{ flex: 1, maxWidth: 300, padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6, fontSize: '0.85rem' }} />
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6, fontSize: '0.85rem' }}>
          <option value="">All Roles</option>
          {roles.map((r) => <option key={r._id} value={r.slug}>{r.name}</option>)}
        </select>
      </div>
      {loading ? <Loading /> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '10px 8px' }}>User</th>
                <th style={{ textAlign: 'left', padding: '10px 8px' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '10px 8px' }}>Role</th>
                <th style={{ textAlign: 'center', padding: '10px 8px' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '10px 8px' }}>Last Login</th>
                <th style={{ textAlign: 'right', padding: '10px 8px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.75rem' }}>{user.name?.split(' ').map((n) => n[0]).join('').toUpperCase()}</div>
                      <div>
                        <div style={{ fontWeight: 500 }}>{user.name}</div>
                        {user.phone && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user.phone}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '10px 8px' }}>{user.email}</td>
                  <td style={{ padding: '10px 8px' }}><span className="badge" style={{ background: `${roleColors[user.role] || '#6b7280'}20`, color: roleColors[user.role] || '#6b7280' }}>{user.role}</span></td>
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}><span className={`badge badge-${user.isActive ? 'success' : 'danger'}`}>{user.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td style={{ padding: '10px 8px', fontSize: '0.8rem' }}>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                    <button className="btn btn-sm btn-outline" onClick={() => handleEdit(user)} style={{ marginRight: 4 }}>Edit</button>
                    <button className="btn btn-sm btn-outline" onClick={() => { setResetId(user._id); setShowReset(true); }} style={{ marginRight: 4, color: 'var(--warning)', borderColor: 'var(--warning)' }}>Reset</button>
                    <button className="btn btn-sm btn-outline" onClick={() => handleToggle(user._id)} style={{ marginRight: 4, color: user.isActive ? 'var(--danger)' : 'var(--success)', borderColor: user.isActive ? 'var(--danger)' : 'var(--success)' }}>{user.isActive ? 'Disable' : 'Enable'}</button>
                    <button className="btn btn-sm btn-danger" onClick={() => { setDeleteId(user._id); setShowDelete(true); }}>Del</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {pagination && pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)} style={{ padding: '6px 12px', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', background: p === page ? 'var(--primary)' : 'transparent', color: p === page ? '#fff' : 'var(--text)', fontSize: '0.85rem' }}>{p}</button>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editId ? 'Edit User' : 'Add User'} footer={
        <>
          <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>{editId ? 'Update' : 'Create'}</button>
        </>
      }>
        <div style={{ marginBottom: 12 }}><label style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize: '0.85rem' }}>Name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6 }} />{errors.name && <small style={{ color: 'var(--danger)' }}>{errors.name}</small>}</div>
        <div style={{ marginBottom: 12 }}><label style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize: '0.85rem' }}>Email *</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6 }} />{errors.email && <small style={{ color: 'var(--danger)' }}>{errors.email}</small>}</div>
        {!editId && <div style={{ marginBottom: 12 }}><label style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize: '0.85rem' }}>Password *</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6 }} />{errors.password && <small style={{ color: 'var(--danger)' }}>{errors.password}</small>}</div>}
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1, marginBottom: 12 }}><label style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize: '0.85rem' }}>Role</label><select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6 }}>
            {roles.map((r) => <option key={r._id} value={r.slug}>{r.name}</option>)}
          </select></div>
          <div style={{ flex: 1, marginBottom: 12 }}><label style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize: '0.85rem' }}>Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6 }} /></div>
        </div>
      </Modal>

      <Modal isOpen={showReset} onClose={() => setShowReset(false)} title="Reset Password" footer={
        <>
          <button className="btn btn-outline" onClick={() => setShowReset(false)}>Cancel</button>
          <button className="btn btn-warning" onClick={handleResetPassword}>Reset</button>
        </>
      }>
        <div style={{ marginBottom: 12 }}><label style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize: '0.85rem' }}>New Password</label><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6 }} /></div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Default: password123</p>
      </Modal>
      <ConfirmModal isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} />
    </div>
  );
};

const AdminDepartments = () => {
  const dispatch = useDispatch();
  const { items: departments, loading } = useSelector((state) => state.departments);
  const { items: employees } = useSelector((state) => state.employees);
  const [showModal, setShowModal] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', description: '', budget: '' });
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => { dispatch(fetchDepartments()); dispatch(fetchEmployees({ limit: 100 })); }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.code) { toast.error('Name and code are required'); return; }
    try {
      if (editId) { await dispatch(updateDepartment({ id: editId, data: form })).unwrap(); toast.success('Department updated!'); }
      else { await dispatch(createDepartment(form)).unwrap(); toast.success('Department created!'); }
      setShowModal(false); setForm({ name: '', code: '', description: '', budget: '' }); setEditId(null);
    } catch (err) { toast.error(err || 'Failed'); }
  };

  const handleEdit = (dept) => { setForm({ name: dept.name, code: dept.code, description: dept.description || '', budget: dept.budget || '' }); setEditId(dept._id); setShowModal(true); };
  const handleDelete = async () => { await dispatch(deleteDepartment(deleteId)); toast.success('Deleted!'); setShowDelete(false); };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Department Management</h3>
        <button className="btn btn-primary" onClick={() => { setForm({ name: '', code: '', description: '', budget: '' }); setEditId(null); setShowModal(true); }}>+ Add Department</button>
      </div>
      {loading ? <Loading /> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '10px 8px' }}>Department</th>
                <th style={{ textAlign: 'left', padding: '10px 8px' }}>Code</th>
                <th style={{ textAlign: 'left', padding: '10px 8px' }}>Description</th>
                <th style={{ textAlign: 'center', padding: '10px 8px' }}>Employees</th>
                <th style={{ textAlign: 'right', padding: '10px 8px' }}>Budget</th>
                <th style={{ textAlign: 'right', padding: '10px 8px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => {
                const empCount = employees.filter((e) => e.department?._id === dept._id || e.department === dept._id).length;
                return (
                  <tr key={dept._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 8px', fontWeight: 500 }}>{dept.name}</td>
                    <td style={{ padding: '10px 8px' }}><span className="badge badge-info">{dept.code}</span></td>
                    <td style={{ padding: '10px 8px', color: 'var(--text-secondary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{dept.description || '-'}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'center' }}>{empCount}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right' }}>${(dept.budget || 0).toLocaleString()}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right' }}>
                      <button className="btn btn-sm btn-outline" onClick={() => handleEdit(dept)} style={{ marginRight: 4 }}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => { setDeleteId(dept._id); setShowDelete(true); }}>Del</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editId ? 'Edit Department' : 'Add Department'} footer={
        <>
          <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>{editId ? 'Update' : 'Create'}</button>
        </>
      }>
        <div style={{ marginBottom: 12 }}><label style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize: '0.85rem' }}>Department Name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6 }} /></div>
        <div style={{ marginBottom: 12 }}><label style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize: '0.85rem' }}>Code *</label><input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} maxLength={5} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6 }} /></div>
        <div style={{ marginBottom: 12 }}><label style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize: '0.85rem' }}>Description</label><textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6 }} /></div>
        <div style={{ marginBottom: 12 }}><label style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize: '0.85rem' }}>Budget</label><input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6 }} /></div>
      </Modal>
      <ConfirmModal isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} />
    </div>
  );
};

const AdminRoles = () => {
  const dispatch = useDispatch();
  const { items: roles, loading } = useSelector((state) => state.roles);
  const [showModal, setShowModal] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', description: '', color: '#4f46e5', permissions: [] });

  const MODULES = ['employees', 'departments', 'attendance', 'payroll', 'settings', 'roles', 'users', 'shifts'];
  const ACTIONS = ['create', 'read', 'update', 'delete', 'export'];
  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

  useEffect(() => { dispatch(fetchRoles({ search })); }, [dispatch, search]);

  const togglePermission = (module, action) => {
    const perms = [...form.permissions];
    const modIdx = perms.findIndex((p) => p.module === module);
    if (modIdx === -1) { perms.push({ module, actions: [action] }); }
    else {
      const actIdx = perms[modIdx].actions.indexOf(action);
      if (actIdx === -1) { perms[modIdx].actions.push(action); }
      else { perms[modIdx].actions.splice(actIdx, 1); if (perms[modIdx].actions.length === 0) perms.splice(modIdx, 1); }
    }
    setForm({ ...form, permissions: perms });
  };

  const hasPermission = (module, action) => {
    const mod = form.permissions.find((p) => p.module === module);
    return mod ? mod.actions.includes(action) : false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Role name is required'); return; }
    try {
      if (editId) { await dispatch(updateRole({ id: editId, data: form })).unwrap(); toast.success('Role updated!'); }
      else { await dispatch(createRole(form)).unwrap(); toast.success('Role created!'); }
      setShowModal(false); resetForm();
    } catch (err) { toast.error(err || 'Failed'); }
  };

  const handleEdit = (role) => {
    setForm({ name: role.name, description: role.description || '', color: role.color || '#4f46e5', permissions: JSON.parse(JSON.stringify(role.permissions || [])) });
    setEditId(role._id); setShowModal(true);
  };

  const handleDelete = async () => { await dispatch(deleteRole(deleteId)); toast.success('Role deleted!'); setShowDelete(false); };
  const handleToggle = async (id) => { await dispatch(toggleRoleStatus(id)); toast.success('Status toggled!'); };
  const resetForm = () => { setForm({ name: '', description: '', color: '#4f46e5', permissions: [] }); setEditId(null); };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Role Management</h3>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>+ Add Role</button>
      </div>
      {loading ? <Loading /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 12 }}>
          {roles.map((role) => (
            <div key={role._id} style={{ border: '1px solid var(--border)', borderRadius: 8, borderLeft: `4px solid ${role.color}`, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{role.name}</h4>
                    <span className={`badge badge-${role.isActive ? 'success' : 'danger'}`}>{role.isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: 2 }}>{role.description || 'No description'}</p>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="btn btn-sm btn-outline" onClick={() => handleEdit(role)}>Edit</button>
                  <button className="btn btn-sm btn-outline" onClick={() => handleToggle(role._id)} style={{ color: role.isActive ? 'var(--danger)' : 'var(--success)', borderColor: role.isActive ? 'var(--danger)' : 'var(--success)' }}>{role.isActive ? 'Disable' : 'Enable'}</button>
                  <button className="btn btn-sm btn-danger" onClick={() => { setDeleteId(role._id); setShowDelete(true); }}>Del</button>
                </div>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 8 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {(role.permissions || []).map((p) => (
                    <span key={p.module} style={{ background: 'var(--bg)', padding: '2px 8px', borderRadius: 4, fontSize: '0.7rem' }}><strong>{p.module}</strong>: {p.actions.join(', ')}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editId ? 'Edit Role' : 'Add Role'} footer={
        <>
          <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>{editId ? 'Update' : 'Create'}</button>
        </>
      }>
        <div style={{ marginBottom: 12 }}><label style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize: '0.85rem' }}>Role Name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6 }} /></div>
        <div style={{ marginBottom: 12 }}><label style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize: '0.85rem' }}>Description</label><textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 6 }} /></div>
        <div style={{ marginBottom: 12 }}><label style={{ display: 'block', marginBottom: 4, fontWeight: 500, fontSize: '0.85rem' }}>Color</label><div style={{ display: 'flex', gap: 8 }}>{COLORS.map((c) => <div key={c} onClick={() => setForm({ ...form, color: c })} style={{ width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer', border: form.color === c ? '3px solid var(--text)' : '3px solid transparent' }} />)}</div></div>
        <div>
          <label style={{ fontWeight: 500, fontSize: '0.85rem', marginBottom: 8, display: 'block' }}>Permissions</label>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
              <thead><tr style={{ borderBottom: '1px solid var(--border)' }}><th style={{ textAlign: 'left', padding: '6px 8px' }}>Module</th>{ACTIONS.map((a) => <th key={a} style={{ textAlign: 'center', padding: '6px 4px', textTransform: 'capitalize' }}>{a}</th>)}</tr></thead>
              <tbody>
                {MODULES.map((m) => (
                  <tr key={m} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '6px 8px', fontWeight: 500, textTransform: 'capitalize' }}>{m}</td>
                    {ACTIONS.map((a) => (
                      <td key={a} style={{ textAlign: 'center', padding: '6px 4px' }}>
                        <input type="checkbox" checked={hasPermission(m, a)} onChange={() => togglePermission(m, a)} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
      <ConfirmModal isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} />
    </div>
  );
};

export default AdminPanel;
