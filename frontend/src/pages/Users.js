import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Sidebar from '../components/common/Sidebar';
import Modal, { ConfirmModal } from '../components/common/Modal';
import Pagination from '../components/common/Pagination';
import Loading from '../components/common/Loading';
import { fetchUsers, createUser, updateUser, deleteUser, toggleUserStatus, resetPassword } from '../slices/userSlice';
import { fetchRoles } from '../slices/roleSlice';
import toast from 'react-hot-toast';

const Users = () => {
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
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar"><h1>User Management</h1><button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>+ Add User</button></div>
        <div className="card">
          <div className="filter-bar">
            <div className="search-box" style={{ flex: 1, maxWidth: 300 }}>
              <input placeholder="Search users..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}>
              <option value="">All Roles</option>
              {roles.map((r) => <option key={r._id} value={r.slug}>{r.name}</option>)}
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="employee">Employee</option>
            </select>
          </div>
          {loading ? <Loading /> : users.length === 0 ? <p style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>No users found</p> : (
            <div className="table-container">
              <table>
                <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Last Login</th><th>Actions</th></tr></thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><div className="avatar">{user.name?.split(' ').map((n) => n[0]).join('').toUpperCase()}</div><div><div style={{ fontWeight: 500 }}>{user.name}</div>{user.phone && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user.phone}</div>}</div></div></td>
                      <td>{user.email}</td>
                      <td><span className="badge" style={{ background: `${roleColors[user.role] || '#6b7280'}20`, color: roleColors[user.role] || '#6b7280' }}>{user.role}</span></td>
                      <td><span className={`badge badge-${user.isActive ? 'success' : 'danger'}`}>{user.isActive ? 'Active' : 'Inactive'}</span></td>
                      <td style={{ fontSize: '0.8rem' }}>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</td>
                      <td>
                        <button className="btn btn-sm btn-outline" onClick={() => handleEdit(user)} style={{ marginRight: 4 }}>Edit</button>
                        <button className="btn btn-sm btn-outline" onClick={() => { setResetId(user._id); setShowReset(true); }} style={{ marginRight: 4, color: 'var(--warning)', borderColor: 'var(--warning)' }}>Reset PW</button>
                        <button className="btn btn-sm btn-outline" onClick={() => handleToggle(user._id)} style={{ marginRight: 4, color: user.isActive ? 'var(--danger)' : 'var(--success)', borderColor: user.isActive ? 'var(--danger)' : 'var(--success)' }}>{user.isActive ? 'Disable' : 'Enable'}</button>
                        <button className="btn btn-sm btn-danger" onClick={() => { setDeleteId(user._id); setShowDelete(true); }}>Del</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editId ? 'Edit User' : 'Add User'} footer={
        <>
          <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>{editId ? 'Update' : 'Create'}</button>
        </>
      }>
        <div className="form-group"><label>Name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />{errors.name && <small style={{ color: 'var(--danger)' }}>{errors.name}</small>}</div>
        <div className="form-group"><label>Email *</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />{errors.email && <small style={{ color: 'var(--danger)' }}>{errors.email}</small>}</div>
        {!editId && <div className="form-group"><label>Password *</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 6 characters" />{errors.password && <small style={{ color: 'var(--danger)' }}>{errors.password}</small>}</div>}
        <div className="form-row">
          <div className="form-group"><label>Role</label><select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="employee">Employee</option><option value="manager">Manager</option><option value="admin">Admin</option>
            {roles.map((r) => <option key={r._id} value={r.slug}>{r.name}</option>)}
          </select></div>
          <div className="form-group"><label>Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
        </div>
      </Modal>
      <Modal isOpen={showReset} onClose={() => setShowReset(false)} title="Reset Password" footer={
        <>
          <button className="btn btn-outline" onClick={() => setShowReset(false)}>Cancel</button>
          <button className="btn btn-warning" onClick={handleResetPassword}>Reset Password</button>
        </>
      }>
        <div className="form-group"><label>New Password</label><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} /></div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Default: password123</p>
      </Modal>
      <ConfirmModal isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} />
    </div>
  );
};

export default Users;
