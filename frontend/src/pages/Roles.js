import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Sidebar from '../components/common/Sidebar';
import { ConfirmModal } from '../components/common/Modal';
import Loading from '../components/common/Loading';
import { fetchRoles, createRole, updateRole, deleteRole, toggleRoleStatus } from '../slices/roleSlice';
import toast from 'react-hot-toast';

const MODULES = [
  { key: 'employees', label: 'Employees', icon: '👥', category: 'Employee' },
  { key: 'departments', label: 'Departments', icon: '🏢', category: 'Employee' },
  { key: 'attendance', label: 'Attendance', icon: '✅', category: 'Employee' },
  { key: 'payroll', label: 'Payroll', icon: '💰', category: 'Finance' },
  { key: 'settings', label: 'Settings', icon: '⚙️', category: 'Admin' },
  { key: 'roles', label: 'Roles', icon: '🛡️', category: 'Admin' },
  { key: 'users', label: 'Users', icon: '👤', category: 'Admin' },
  { key: 'shifts', label: 'Shifts', icon: '📅', category: 'Employee' }
];

const ACTIONS = ['create', 'read', 'update', 'delete', 'export'];
const ACTION_COLORS = {
  create: '#10b981',
  read: '#3b82f6',
  update: '#f59e0b',
  delete: '#ef4444',
  export: '#8b5cf6'
};

const COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#e11d48',
  '#3b82f6', '#16a34a', '#d97706', '#dc2626', '#7c3aed', '#db2777'
];

const Roles = () => {
  const dispatch = useDispatch();
  const { items: roles, loading } = useSelector((state) => state.roles);
  const [showModal, setShowModal] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', description: '', color: '#6366f1', permissions: [] });
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [expandedCard, setExpandedCard] = useState(null);
  const [modalStep, setModalStep] = useState(1);

  useEffect(() => {
    dispatch(fetchRoles({ search }));
  }, [dispatch, search]);

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

  const toggleAllModule = (module) => {
    const perms = [...form.permissions];
    const modIdx = perms.findIndex((p) => p.module === module);
    if (modIdx === -1) {
      perms.push({ module, actions: [...ACTIONS] });
    } else if (perms[modIdx].actions.length === ACTIONS.length) {
      perms.splice(modIdx, 1);
    } else {
      perms[modIdx].actions = [...ACTIONS];
    }
    setForm({ ...form, permissions: perms });
  };

  const hasPermission = (module, action) => {
    const mod = form.permissions.find((p) => p.module === module);
    return mod ? mod.actions.includes(action) : false;
  };

  const isAllSelected = (module) => {
    const mod = form.permissions.find((p) => p.module === module);
    return mod && mod.actions.length === ACTIONS.length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Role name is required'); return; }
    try {
      if (editId) {
        await dispatch(updateRole({ id: editId, data: form })).unwrap();
        toast.success('Role updated!');
      } else {
        await dispatch(createRole(form)).unwrap();
        toast.success('Role created!');
      }
      setShowModal(false);
      resetForm();
    } catch (err) { toast.error(err || 'Failed'); }
  };

  const handleEdit = (role) => {
    setForm({ name: role.name, description: role.description || '', color: role.color || '#6366f1', permissions: JSON.parse(JSON.stringify(role.permissions || [])) });
    setEditId(role._id);
    setShowModal(true);
  };

  const handleDelete = async () => {
    await dispatch(deleteRole(deleteId));
    toast.success('Role deleted!');
    setShowDelete(false);
  };

  const handleToggle = async (id) => {
    await dispatch(toggleRoleStatus(id));
    toast.success('Status updated!');
  };

  const resetForm = () => {
    setForm({ name: '', description: '', color: '#6366f1', permissions: [] });
    setEditId(null);
    setModalStep(1);
  };

  const totalPerms = (role) => {
    if (!role.permissions) return 0;
    return role.permissions.reduce((sum, p) => sum + (p.actions?.length || 0), 0);
  };

  const getPermPercent = (role) => {
    const total = MODULES.length * ACTIONS.length;
    return Math.round((totalPerms(role) / total) * 100);
  };

  const filteredRoles = useMemo(() => {
    let filtered = roles;
    if (statusFilter === 'active') filtered = filtered.filter(r => r.isActive);
    if (statusFilter === 'inactive') filtered = filtered.filter(r => !r.isActive);
    if (categoryFilter !== 'All') {
      const catModules = MODULES.filter(m => m.category === categoryFilter).map(m => m.key);
      filtered = filtered.filter(r => r.permissions?.some(p => catModules.includes(p.module)));
    }
    return filtered;
  }, [roles, statusFilter, categoryFilter]);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content" style={{ background: '#f0f2f5' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1a1a2e', letterSpacing: '-0.5px', margin: 0 }}>Role Management</h1>
              <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: 4 }}>Control what each role can access in your system</p>
            </div>
            <button onClick={() => { resetForm(); setShowModal(true); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '11px 22px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: 'white', border: 'none', borderRadius: 12,
                cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem',
                boxShadow: '0 4px 15px rgba(99,102,241,0.35)',
                transition: 'all 0.3s', letterSpacing: '0.3px'
              }}>
              <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>+</span>
              New Role
            </button>
          </div>

          {/* Filters Row */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, maxWidth: 300, position: 'relative' }}>
              <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: '1rem' }}>🔍</span>
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search roles..."
                style={{
                  width: '100%', padding: '10px 14px 10px 40px',
                  border: '2px solid #e5e7eb', borderRadius: 12,
                  fontSize: '0.85rem', background: 'white', outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={{ display: 'flex', gap: 4, background: 'white', borderRadius: 12, padding: 4, border: '2px solid #e5e7eb' }}>
              {['all', 'active', 'inactive'].map(tab => (
                <button key={tab} onClick={() => setStatusFilter(tab)}
                  style={{
                    padding: '7px 16px', borderRadius: 9, border: 'none',
                    cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                    background: statusFilter === tab ? '#6366f1' : 'transparent',
                    color: statusFilter === tab ? 'white' : '#6b7280',
                    transition: 'all 0.2s'
                  }}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 4, background: 'white', borderRadius: 12, padding: 4, border: '2px solid #e5e7eb' }}>
              {['All', 'Employee', 'Finance', 'Admin'].map(cat => (
                <button key={cat} onClick={() => setCategoryFilter(cat)}
                  style={{
                    padding: '7px 14px', borderRadius: 9, border: 'none',
                    cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                    background: categoryFilter === cat ? '#10b981' : 'transparent',
                    color: categoryFilter === cat ? 'white' : '#6b7280',
                    transition: 'all 0.2s'
                  }}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
          <div style={{ background: 'white', borderRadius: 14, padding: '16px 18px', border: '2px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>🛡️</div>
            <div><div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1a1a2e' }}>{roles.length}</div><div style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 500 }}>Total Roles</div></div>
          </div>
          <div style={{ background: 'white', borderRadius: 14, padding: '16px 18px', border: '2px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>✅</div>
            <div><div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1a1a2e' }}>{roles.filter(r => r.isActive).length}</div><div style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 500 }}>Active</div></div>
          </div>
          <div style={{ background: 'white', borderRadius: 14, padding: '16px 18px', border: '2px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>⚡</div>
            <div><div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1a1a2e' }}>{roles.reduce((sum, r) => sum + totalPerms(r), 0)}</div><div style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 500 }}>Permissions</div></div>
          </div>
          <div style={{ background: 'white', borderRadius: 14, padding: '16px 18px', border: '2px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>👥</div>
            <div><div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1a1a2e' }}>{roles.reduce((sum, r) => sum + (r.userCount || 0), 0)}</div><div style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 500 }}>Users Assigned</div></div>
          </div>
        </div>

        {/* Roles Grid */}
        {loading ? <Loading /> : filteredRoles.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 16, padding: 60, textAlign: 'center', border: '2px solid #e5e7eb' }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🛡️</div>
            <h3 style={{ fontWeight: 700, color: '#1a1a2e', marginBottom: 4 }}>No roles found</h3>
            <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>Create your first role to get started</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
            {filteredRoles.map((role) => {
              const permPercent = getPermPercent(role);
              const isExpanded = expandedCard === role._id;
              return (
                <div key={role._id}
                  style={{
                    background: 'white', borderRadius: 16, overflow: 'hidden',
                    border: '2px solid #e5e7eb', transition: 'all 0.3s',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = role.color + '60'; e.currentTarget.style.boxShadow = `0 8px 30px ${role.color}15`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; }}>

                  {/* Color Accent */}
                  <div style={{ height: 4, background: `linear-gradient(90deg, ${role.color}, ${role.color}88)` }} />

                  <div style={{ padding: '18px 20px' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: 12,
                          background: `${role.color}12`, display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          fontSize: '1.2rem', border: `2px solid ${role.color}20`
                        }}>
                          {role.name === 'Super Admin' ? '👑' : role.name === 'HR Manager' ? '💼' : role.name === 'Team Lead' ? '🎯' : role.name === 'Admin' ? '🛡️' : '👤'}
                        </div>
                        <div>
                          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>{role.name}</h3>
                          <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: 0, marginTop: 2 }}>{role.description || 'No description'}</p>
                        </div>
                      </div>
                      <span style={{
                        padding: '4px 10px', borderRadius: 20,
                        fontSize: '0.68rem', fontWeight: 700,
                        background: role.isActive ? '#dcfce7' : '#fee2e2',
                        color: role.isActive ? '#16a34a' : '#dc2626'
                      }}>
                        {role.isActive ? '● Active' : '● Inactive'}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#6b7280' }}>Permission Coverage</span>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: role.color }}>{permPercent}%</span>
                      </div>
                      <div style={{ height: 6, background: '#f3f4f6', borderRadius: 10, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${permPercent}%`, background: `linear-gradient(90deg, ${role.color}, ${role.color}aa)`, borderRadius: 10, transition: 'width 0.5s' }} />
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                      <div style={{ flex: 1, textAlign: 'center', padding: '10px 0', background: '#f9fafb', borderRadius: 10 }}>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: role.color }}>{role.permissions?.length || 0}</div>
                        <div style={{ fontSize: '0.65rem', color: '#9ca3af', fontWeight: 600 }}>MODULES</div>
                      </div>
                      <div style={{ flex: 1, textAlign: 'center', padding: '10px 0', background: '#f9fafb', borderRadius: 10 }}>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1a1a2e' }}>{totalPerms(role)}</div>
                        <div style={{ fontSize: '0.65rem', color: '#9ca3af', fontWeight: 600 }}>ACTIONS</div>
                      </div>
                      <div style={{ flex: 1, textAlign: 'center', padding: '10px 0', background: '#f9fafb', borderRadius: 10 }}>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#10b981' }}>{role.userCount || 0}</div>
                        <div style={{ fontSize: '0.65rem', color: '#9ca3af', fontWeight: 600 }}>USERS</div>
                      </div>
                    </div>

                    {/* Permission Tags */}
                    <div style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {(role.permissions || []).slice(0, isExpanded ? 99 : 3).map((p) => (
                          <span key={p.module} style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            padding: '4px 10px', borderRadius: 8,
                            fontSize: '0.7rem', fontWeight: 600,
                            background: `${role.color}08`, color: role.color,
                            border: `1px solid ${role.color}20`
                          }}>
                            {MODULES.find(m => m.key === p.module)?.icon} {p.module}
                            <span style={{ fontSize: '0.6rem', opacity: 0.6 }}>({p.actions.length})</span>
                          </span>
                        ))}
                        {(!role.permissions || role.permissions.length === 0) && (
                          <span style={{ fontSize: '0.75rem', color: '#d1d5db', fontStyle: 'italic' }}>No permissions</span>
                        )}
                        {(role.permissions?.length || 0) > 3 && (
                          <button onClick={() => setExpandedCard(isExpanded ? null : role._id)}
                            style={{
                              border: 'none', background: 'none', color: '#6366f1',
                              fontSize: '0.7rem', cursor: 'pointer', fontWeight: 700,
                              padding: '4px 8px'
                            }}>
                            {isExpanded ? 'Less' : `+${role.permissions.length - 3} more`}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: 6, paddingTop: 14, borderTop: '1px solid #f3f4f6' }}>
                      <button onClick={() => handleEdit(role)}
                        style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          padding: '8px 0', border: '2px solid #e5e7eb', borderRadius: 10,
                          background: 'white', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
                          color: '#374151', transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => { e.target.style.borderColor = '#6366f1'; e.target.style.color = '#6366f1'; }}
                        onMouseLeave={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.color = '#374151'; }}>
                        ✏️ Edit
                      </button>
                      <button onClick={() => handleToggle(role._id)}
                        style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          padding: '8px 0', borderRadius: 10, cursor: 'pointer',
                          fontSize: '0.78rem', fontWeight: 600, border: 'none',
                          background: role.isActive ? '#fef2f2' : '#f0fdf4',
                          color: role.isActive ? '#dc2626' : '#16a34a',
                          transition: 'all 0.2s'
                        }}>
                        {role.isActive ? '🔴 Disable' : '🟢 Enable'}
                      </button>
                      <button onClick={() => { setDeleteId(role._id); setShowDelete(true); }}
                        style={{
                          padding: '8px 12px', borderRadius: 10, border: 'none',
                          background: '#fef2f2', cursor: 'pointer', fontSize: '0.78rem',
                          color: '#dc2626', transition: 'all 0.2s'
                        }}>
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create/Edit Modal */}
        {showModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div onClick={() => setShowModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
            <div style={{
              position: 'relative', background: 'white', borderRadius: 20,
              width: '90%', maxWidth: 650, maxHeight: '88vh', overflow: 'auto',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)'
            }}>

              {/* Modal Header */}
              <div style={{
                padding: '20px 28px', borderBottom: '1px solid #f3f4f6',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                position: 'sticky', top: 0, background: 'white', zIndex: 1,
                borderRadius: '20px 20px 0 0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: `${form.color}12`, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem'
                  }}>
                    {editId ? '✏️' : '➕'}
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>{editId ? 'Edit Role' : 'Create New Role'}</h2>
                    <p style={{ fontSize: '0.72rem', color: '#9ca3af', margin: 0 }}>{editId ? 'Update role settings & permissions' : 'Define a new role with specific access'}</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)}
                  style={{
                    width: 34, height: 34, borderRadius: 10,
                    border: '2px solid #e5e7eb', background: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', fontSize: '0.9rem', color: '#6b7280',
                    transition: 'all 0.2s'
                  }}>
                  ✕
                </button>
              </div>

              {/* Steps Indicator */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '16px 28px 0' }}>
                {[1, 2].map(step => (
                  <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: modalStep >= step ? form.color : '#e5e7eb',
                      color: modalStep >= step ? 'white' : '#9ca3af',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.72rem', fontWeight: 700, transition: 'all 0.3s'
                    }}>{step}</div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: modalStep >= step ? '#1a1a2e' : '#9ca3af' }}>
                      {step === 1 ? 'Basic Info' : 'Permissions'}
                    </span>
                    {step < 2 && <div style={{ width: 30, height: 2, background: modalStep > 1 ? form.color : '#e5e7eb', borderRadius: 4, margin: '0 4px' }} />}
                  </div>
                ))}
              </div>

              {/* Modal Body */}
              <div style={{ padding: '18px 28px' }}>
                {modalStep === 1 ? (
                  <div>
                    {/* Role Name */}
                    <div style={{ marginBottom: 18 }}>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginBottom: 8 }}>Role Name *</label>
                      <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g. HR Manager, Team Lead..."
                        style={{
                          width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb',
                          borderRadius: 12, fontSize: '0.88rem', outline: 'none',
                          background: '#f9fafb', transition: 'all 0.2s'
                        }}
                        onFocus={(e) => { e.target.style.borderColor = form.color; e.target.style.background = 'white'; }}
                        onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = '#f9fafb'; }}
                      />
                    </div>

                    {/* Description */}
                    <div style={{ marginBottom: 18 }}>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginBottom: 8 }}>Description</label>
                      <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                        placeholder="Brief description of this role..."
                        style={{
                          width: '100%', padding: '12px 16px', border: '2px solid #e5e7eb',
                          borderRadius: 12, fontSize: '0.88rem', outline: 'none',
                          background: '#f9fafb', transition: 'all 0.2s'
                        }}
                        onFocus={(e) => { e.target.style.borderColor = form.color; e.target.style.background = 'white'; }}
                        onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.background = '#f9fafb'; }}
                      />
                    </div>

                    {/* Color Picker */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#374151', marginBottom: 10 }}>Role Color</label>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {COLORS.map((c) => (
                          <div key={c} onClick={() => setForm({ ...form, color: c })}
                            style={{
                              width: 32, height: 32, borderRadius: 10,
                              background: c, cursor: 'pointer',
                              border: form.color === c ? '3px solid #1a1a2e' : '3px solid transparent',
                              transition: 'all 0.15s',
                              transform: form.color === c ? 'scale(1.15)' : 'scale(1)',
                              boxShadow: form.color === c ? `0 4px 12px ${c}40` : 'none'
                            }} />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#374151' }}>Permission Matrix</span>
                      <span style={{ fontSize: '0.72rem', color: '#9ca3af', background: '#f3f4f6', padding: '4px 10px', borderRadius: 8 }}>{form.permissions.length} modules selected</span>
                    </div>

                    <div style={{ borderRadius: 12, overflow: 'hidden', border: '2px solid #e5e7eb' }}>
                      {/* Table Header */}
                      <div style={{ display: 'grid', gridTemplateColumns: '150px repeat(5, 1fr)', background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                        <div style={{ padding: '10px 16px', fontSize: '0.7rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Module</div>
                        {ACTIONS.map((a) => (
                          <div key={a} style={{ padding: '10px 4px', fontSize: '0.7rem', fontWeight: 700, color: ACTION_COLORS[a], textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                              {a === 'create' && '➕'}
                              {a === 'read' && '👁️'}
                              {a === 'update' && '✏️'}
                              {a === 'delete' && '🗑️'}
                              {a === 'export' && '📤'}
                              <span className="sr-only">{a}</span>
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Table Rows */}
                      {MODULES.map((m, i) => (
                        <div key={m.key}
                          style={{
                            display: 'grid', gridTemplateColumns: '150px repeat(5, 1fr)',
                            borderTop: '1px solid #f3f4f6',
                            background: i % 2 === 0 ? 'white' : '#f9fafb',
                            alignItems: 'center',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#f0f2ff'}
                          onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 0 ? 'white' : '#f9fafb'}
                        >
                          <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input type="checkbox" checked={isAllSelected(m.key)}
                              onChange={() => toggleAllModule(m.key)}
                              style={{ accentColor: form.color, width: 15, height: 15, cursor: 'pointer' }} />
                            <span style={{ fontSize: '1rem' }}>{m.icon}</span>
                            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1a1a2e' }}>{m.label}</span>
                          </div>
                          {ACTIONS.map((a) => (
                            <div key={a} style={{ textAlign: 'center', padding: '12px 4px' }}>
                              <div
                                onClick={() => togglePermission(m.key, a)}
                                style={{
                                  width: 28, height: 28, borderRadius: 8,
                                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                  cursor: 'pointer', fontSize: '0.8rem',
                                  background: hasPermission(m.key, a) ? `${ACTION_COLORS[a]}15` : '#f3f4f6',
                                  border: `2px solid ${hasPermission(m.key, a) ? ACTION_COLORS[a] : 'transparent'}`,
                                  color: hasPermission(m.key, a) ? ACTION_COLORS[a] : '#d1d5db',
                                  transition: 'all 0.15s'
                                }}>
                                {hasPermission(m.key, a) ? '✓' : '—'}
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div style={{
                padding: '16px 28px', borderTop: '1px solid #f3f4f6',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                position: 'sticky', bottom: 0, background: 'white',
                borderRadius: '0 0 20px 20px'
              }}>
                <div>
                  {modalStep === 2 && (
                    <button onClick={() => setModalStep(1)}
                      style={{
                        padding: '9px 18px', border: '2px solid #e5e7eb', borderRadius: 10,
                        background: 'white', cursor: 'pointer', fontSize: '0.82rem',
                        fontWeight: 600, color: '#374151', transition: 'all 0.2s'
                      }}>
                      ← Back
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setShowModal(false)}
                    style={{
                      padding: '9px 18px', border: '2px solid #e5e7eb', borderRadius: 10,
                      background: 'white', cursor: 'pointer', fontSize: '0.82rem',
                      fontWeight: 600, color: '#374151'
                    }}>
                    Cancel
                  </button>
                  {modalStep === 1 ? (
                    <button onClick={() => { if (!form.name.trim()) { toast.error('Role name is required'); return; } setModalStep(2); }}
                      style={{
                        padding: '9px 24px', border: 'none', borderRadius: 10,
                        background: `linear-gradient(135deg, ${form.color}, ${form.color}cc)`,
                        cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700,
                        color: 'white', boxShadow: `0 4px 15px ${form.color}35`,
                        transition: 'all 0.2s'
                      }}>
                      Next →
                    </button>
                  ) : (
                    <button onClick={handleSubmit}
                      style={{
                        padding: '9px 24px', border: 'none', borderRadius: 10,
                        background: `linear-gradient(135deg, ${form.color}, ${form.color}cc)`,
                        cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700,
                        color: 'white', boxShadow: `0 4px 15px ${form.color}35`,
                        transition: 'all 0.2s'
                      }}>
                      {editId ? '💾 Update Role' : '✨ Create Role'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <ConfirmModal isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete}
          title="Delete Role" message="This action cannot be undone. The role will be permanently removed." />
      </div>
    </div>
  );
};

export default Roles;
