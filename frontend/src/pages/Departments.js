import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Sidebar from '../components/common/Sidebar';
import Modal, { ConfirmModal } from '../components/common/Modal';
import Loading from '../components/common/Loading';
import { fetchDepartments, createDepartment, updateDepartment, deleteDepartment } from '../slices/departmentSlice';
import { fetchEmployees } from '../slices/employeeSlice';
import toast from 'react-hot-toast';

const Departments = () => {
  const dispatch = useDispatch();
  const { items: departments, loading } = useSelector((state) => state.departments);
  const { items: employees } = useSelector((state) => state.employees);
  const [showModal, setShowModal] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', description: '', budget: '' });
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    dispatch(fetchDepartments());
    dispatch(fetchEmployees({ limit: 100 }));
  }, [dispatch]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Department name is required';
    if (!form.code.trim()) e.code = 'Code is required';
    if (form.code.trim().length > 5) e.code = 'Code must be 5 characters or less';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      if (editId) {
        await dispatch(updateDepartment({ id: editId, data: form })).unwrap();
        toast.success('Department updated successfully!');
      } else {
        await dispatch(createDepartment(form)).unwrap();
        toast.success('Department created successfully!');
      }
      setShowModal(false);
      setForm({ name: '', code: '', description: '', budget: '' });
      setEditId(null);
      setErrors({});
    } catch (err) {
      toast.error(err || 'Operation failed');
    }
  };

  const handleEdit = (dept) => {
    setForm({
      name: dept.name,
      code: dept.code,
      description: dept.description || '',
      budget: dept.budget || ''
    });
    setEditId(dept._id);
    setErrors({});
    setShowModal(true);
  };

  const handleDelete = async () => {
    await dispatch(deleteDepartment(deleteId));
    toast.success('Department deleted successfully!');
    setShowDelete(false);
    setDeleteId(null);
  };

  const openCreateModal = () => {
    setForm({ name: '', code: '', description: '', budget: '' });
    setEditId(null);
    setErrors({});
    setShowModal(true);
  };

  const filteredDepartments = departments.filter((dept) => {
    if (!search) return true;
    const query = search.toLowerCase();
    return (
      dept.name.toLowerCase().includes(query) ||
      dept.code.toLowerCase().includes(query) ||
      (dept.description && dept.description.toLowerCase().includes(query))
    );
  });

  const totalEmployees = employees.length;
  const totalBudget = departments.reduce((sum, d) => sum + (d.budget || 0), 0);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div>
            <h1>Departments</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 2 }}>
              Manage organizational departments and team structures
            </p>
          </div>
          <button className="btn btn-primary" onClick={openCreateModal}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Department
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--card-bg)', padding: '18px 20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
            <div style={{ width: 42, height: 42, borderRadius: 'var(--radius)', background: 'var(--primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" style={{ width: 20, height: 20 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px' }}>{departments.length}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Departments</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--card-bg)', padding: '18px 20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
            <div style={{ width: 42, height: 42, borderRadius: 'var(--radius)', background: 'var(--success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="1.5" style={{ width: 20, height: 20 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px' }}>{totalEmployees}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Employees</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'var(--card-bg)', padding: '18px 20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
            <div style={{ width: 42, height: 42, borderRadius: 'var(--radius)', background: 'var(--warning-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="1.5" style={{ width: 20, height: 20 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px' }}>${totalBudget.toLocaleString()}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Budget</div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="filter-bar">
            <div className="search-box" style={{ flex: 1, maxWidth: 340 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
                <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
              </svg>
              <input
                placeholder="Search departments by name, code, or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {loading ? <Loading /> : filteredDepartments.length === 0 ? (
          <div className="card" style={{ marginTop: 20 }}>
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 48, height: 48, margin: '0 auto 16px', opacity: 0.3 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3>{search ? 'No departments found' : 'No departments yet'}</h3>
              <p>{search ? 'Try adjusting your search criteria' : 'Create your first department to get started'}</p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20, marginTop: 20 }}>
            {filteredDepartments.map((dept) => {
              const empCount = employees.filter(
                (e) => e.department?._id === dept._id || e.department === dept._id
              ).length;
              const budgetDisplay = (dept.budget || 0).toLocaleString();
              return (
                <div key={dept._id} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                  {/* Top color accent */}
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                    background: 'linear-gradient(90deg, var(--primary), var(--primary-light))'
                  }} />

                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, marginTop: 4 }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text)', marginBottom: 8, letterSpacing: '-0.2px' }}>
                        {dept.name}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span className="badge badge-primary">{dept.code}</span>
                        {empCount > 0 ? (
                          <span className="badge badge-success">Active</span>
                        ) : (
                          <span className="badge badge-secondary">No Staff</span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => handleEdit(dept)}
                        title="Edit department"
                        style={{ padding: '5px 10px' }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => { setDeleteId(dept._id); setShowDelete(true); }}
                        title="Delete department"
                        style={{ padding: '5px 10px' }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  <p style={{
                    color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: 18,
                    lineHeight: 1.5, minHeight: 40,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                  }}>
                    {dept.description || 'No description provided'}
                  </p>

                  {/* Footer Stats */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr',
                    borderTop: '1px solid var(--border-light)', paddingTop: 14, gap: 12
                  }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 12px', borderRadius: 'var(--radius)', background: 'var(--bg)'
                    }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--info-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="var(--info)" strokeWidth="2" style={{ width: 16, height: 16 }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>{empCount}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.3px' }}>Employees</div>
                      </div>
                    </div>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 12px', borderRadius: 'var(--radius)', background: 'var(--bg)'
                    }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--success-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" style={{ width: 16, height: 16 }}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>${budgetDisplay}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.3px' }}>Budget</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setErrors({}); }}
        title={editId ? 'Edit Department' : 'Create Department'}
        footer={
          <>
            <button className="btn btn-outline" onClick={() => { setShowModal(false); setErrors({}); }}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              {editId ? (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Update Department
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Create Department
                </>
              )}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Department Name *</label>
            <input
              value={form.name}
              onChange={(e) => { setForm({ ...form, name: e.target.value }); if (errors.name) setErrors({ ...errors, name: '' }); }}
              placeholder="e.g. Engineering"
              style={errors.name ? { borderColor: 'var(--danger)' } : {}}
            />
            {errors.name && <small style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: 4, display: 'block' }}>{errors.name}</small>}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Department Code *</label>
              <input
                value={form.code}
                onChange={(e) => { setForm({ ...form, code: e.target.value.toUpperCase() }); if (errors.code) setErrors({ ...errors, code: '' }); }}
                placeholder="e.g. ENG"
                maxLength={5}
                style={errors.code ? { borderColor: 'var(--danger)' } : {}}
              />
              {errors.code && <small style={{ color: 'var(--danger)', fontSize: '0.75rem', marginTop: 4, display: 'block' }}>{errors.code}</small>}
            </div>
            <div className="form-group">
              <label>Budget</label>
              <input
                type="number"
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the purpose and responsibilities of this department..."
              style={{ resize: 'vertical' }}
            />
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default Departments;
