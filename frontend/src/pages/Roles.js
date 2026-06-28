import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Sidebar from '../components/common/Sidebar';
import Modal, { ConfirmModal } from '../components/common/Modal';
import Loading from '../components/common/Loading';
import { fetchRoles, createRole, updateRole, deleteRole, toggleRoleStatus } from '../slices/roleSlice';
import toast from 'react-hot-toast';

const MODULES = ['employees', 'departments', 'attendance', 'payroll', 'settings', 'roles', 'users', 'shifts'];
const ACTIONS = ['create', 'read', 'update', 'delete', 'export'];
const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

const Roles = () => {
  const dispatch = useDispatch();
  const { items: roles, loading } = useSelector((state) => state.roles);
  const [showModal, setShowModal] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', description: '', color: '#4f46e5', permissions: [] });

  useEffect(() => { dispatch(fetchRoles({ search })); }, [dispatch, search]);

  const togglePermission = (module, action) => {
    const perms = [...form.permissions];
    const modIdx = perms.findIndex((p) => p.module === module);
    if (modIdx === -1) {
      perms.push({ module, actions: [action] });
    } else {
      const actIdx = perms[modIdx].actions.indexOf(action);
      if (actIdx === -1) {
        perms[modIdx].actions.push(action);
      } else {
        perms[modIdx].actions.splice(actIdx, 1);
        if (perms[modIdx].actions.length === 0) perms.splice(modIdx, 1);
      }
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
    setForm({ name: role.name, description: role.description || '', color: role.color || '#4f46e5', permissions: role.permissions || [] });
    setEditId(role._id); setShowModal(true);
  };

  const handleDelete = async () => { await dispatch(deleteRole(deleteId)); toast.success('Role deleted!'); setShowDelete(false); };
  const handleToggle = async (id) => { await dispatch(toggleRoleStatus(id)); toast.success('Status toggled!'); };
  const resetForm = () => { setForm({ name: '', description: '', color: '#4f46e5', permissions: [] }); setEditId(null); };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar"><h1>Role Management</h1><button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>+ Add Role</button></div>
        <div className="card">
          <div className="filter-bar">
            <div className="search-box" style={{ flex: 1, maxWidth: 300 }}>
              <input placeholder="Search roles..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
          {loading ? <Loading /> : roles.length === 0 ? <p style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>No roles found</p> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 16 }}>
              {roles.map((role) => (
                <div key={role._id} className="card" style={{ borderLeft: `4px solid ${role.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{role.name}</h3>
                        <span className={`badge badge-${role.isActive ? 'success' : 'danger'}`}>{role.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: 4 }}>{role.description || 'No description'}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-sm btn-outline" onClick={() => handleEdit(role)}>Edit</button>
                      <button className="btn btn-sm btn-outline" onClick={() => handleToggle(role._id)} style={{ color: role.isActive ? 'var(--danger)' : 'var(--success)' }}>{role.isActive ? 'Disable' : 'Enable'}</button>
                      <button className="btn btn-sm btn-danger" onClick={() => { setDeleteId(role._id); setShowDelete(true); }}>Del</button>
                    </div>
                  </div>
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                    <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>PERMISSIONS</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {(role.permissions || []).map((p) => (
                        <div key={p.module} style={{ background: 'var(--bg)', padding: '4px 10px', borderRadius: 6, fontSize: '0.75rem' }}>
                          <strong>{p.module}</strong>: {p.actions.join(', ')}
                        </div>
                      ))}
                      {(!role.permissions || role.permissions.length === 0) && <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>No permissions set</span>}
                    </div>
                  </div>
                  <div style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Users: {role.userCount || 0}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editId ? 'Edit Role' : 'Add Role'} footer={
        <>
          <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit}>{editId ? 'Update' : 'Create'}</button>
        </>
      }>
        <div className="form-group"><label>Role Name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. HR Manager" /></div>
        <div className="form-group"><label>Description</label><textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <div className="form-group"><label>Color</label><div style={{ display: 'flex', gap: 8 }}>{COLORS.map((c) => <div key={c} onClick={() => setForm({ ...form, color: c })} style={{ width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer', border: form.color === c ? '3px solid var(--text)' : '3px solid transparent' }} />)}</div></div>
        <div style={{ marginTop: 16 }}>
          <label style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 10, display: 'block' }}>Permissions</label>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: '0.8rem' }}>
              <thead><tr><th style={{ textAlign: 'left', padding: '6px 8px' }}>Module</th>{ACTIONS.map((a) => <th key={a} style={{ textAlign: 'center', padding: '6px 4px', textTransform: 'capitalize' }}>{a}</th>)}</tr></thead>
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

export default Roles;
