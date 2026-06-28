import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Sidebar from '../components/common/Sidebar';
import Modal, { ConfirmModal } from '../components/common/Modal';
import Loading from '../components/common/Loading';
import { fetchShifts, createShift, updateShift, deleteShift, toggleShiftStatus, fetchAssignments, createAssignment, deleteAssignment } from '../slices/shiftSlice';
import { fetchEmployees } from '../slices/employeeSlice';
import toast from 'react-hot-toast';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const SHIFT_ICONS = {
  'Morning Shift': '\u2600\uFE0F',
  'General Shift': '\uD83C\uDF1E',
  'Afternoon Shift': '\u26C5',
  'Night Shift': '\uD83C\uDF19',
  'Flexi Shift': '\u23F0',
};

const getShiftIcon = (name) => {
  if (SHIFT_ICONS[name]) return SHIFT_ICONS[name];
  const lower = (name || '').toLowerCase();
  if (lower.includes('morning')) return '\u2600\uFE0F';
  if (lower.includes('general')) return '\uD83C\uDF1E';
  if (lower.includes('afternoon')) return '\u26C5';
  if (lower.includes('night')) return '\uD83C\uDF19';
  if (lower.includes('flexi') || lower.includes('flex')) return '\u23F0';
  return '\uD83D\uDD50';
};

const calcHours = (start, end) => {
  if (!start || !end) return 8;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let diff = (eh * 60 + em) - (sh * 60 + sm);
  if (diff <= 0) diff += 24 * 60;
  return Math.round(diff / 60);
};

const Shifts = () => {
  const dispatch = useDispatch();
  const { items: shifts, assignments, loading } = useSelector((state) => state.shifts);
  const { items: employees } = useSelector((state) => state.employees);
  const [tab, setTab] = useState('shifts');
  const [showModal, setShowModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteType, setDeleteType] = useState('shift');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', code: '', startTime: '09:00', endTime: '17:00', breakMinutes: 60, gracePeriodMinutes: 15, overtimeThresholdHours: 8, isNightShift: false, color: '#10b981' });
  const [assignForm, setAssignForm] = useState({ employee: '', shift: '', startDate: '', endDate: '', recurring: false, daysOfWeek: [1, 2, 3, 4, 5], notes: '' });

  useEffect(() => {
    dispatch(fetchShifts({ search }));
    dispatch(fetchEmployees({ limit: 100 }));
    dispatch(fetchAssignments({}));
  }, [dispatch, search, tab]);

  const handleShiftSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.code) { toast.error('Name and code required'); return; }
    try {
      if (editId) { await dispatch(updateShift({ id: editId, data: form })).unwrap(); toast.success('Shift updated!'); }
      else { await dispatch(createShift(form)).unwrap(); toast.success('Shift created!'); }
      setShowModal(false); resetForm();
    } catch (err) { toast.error(err || 'Failed'); }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!assignForm.employee || !assignForm.shift || !assignForm.startDate) { toast.error('Employee, shift and start date required'); return; }
    try {
      await dispatch(createAssignment(assignForm)).unwrap();
      toast.success('Shift assigned!'); setShowAssignModal(false);
      setAssignForm({ employee: '', shift: '', startDate: '', endDate: '', recurring: false, daysOfWeek: [1, 2, 3, 4, 5], notes: '' });
    } catch (err) { toast.error(err || 'Failed'); }
  };

  const handleDelete = async () => {
    if (deleteType === 'shift') { await dispatch(deleteShift(deleteId)); toast.success('Shift deleted!'); }
    else { await dispatch(deleteAssignment(deleteId)); toast.success('Assignment deleted!'); }
    setShowDelete(false);
  };

  const handleEdit = (shift) => {
    setForm({ name: shift.name, code: shift.code, startTime: shift.startTime, endTime: shift.endTime, breakMinutes: shift.breakMinutes, gracePeriodMinutes: shift.gracePeriodMinutes, overtimeThresholdHours: shift.overtimeThresholdHours, isNightShift: shift.isNightShift, color: shift.color });
    setEditId(shift._id); setShowModal(true);
  };

  const resetForm = () => { setForm({ name: '', code: '', startTime: '09:00', endTime: '17:00', breakMinutes: 60, gracePeriodMinutes: 15, overtimeThresholdHours: 8, isNightShift: false, color: '#10b981' }); setEditId(null); };

  const toggleDay = (day) => {
    const days = assignForm.daysOfWeek.includes(day) ? assignForm.daysOfWeek.filter((d) => d !== day) : [...assignForm.daysOfWeek, day];
    setAssignForm({ ...assignForm, daysOfWeek: days });
  };

  const filteredShifts = shifts.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>Shift</span>
              </h1>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: -2 }}>Management</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: 2 }}>Manage employee shift assignments.</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="search-box" style={{ width: 200 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input placeholder="Search...." value={search} onChange={(e) => setSearch(e.target.value)} style={{ fontSize: '0.78rem', padding: '6px 10px 6px 32px' }} />
              </div>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--card-bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>
                <span style={{ position: 'absolute', top: 2, right: 2, width: 7, height: 7, borderRadius: '50%', background: 'var(--danger)' }}></span>
              </div>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--card-bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                <span style={{ position: 'absolute', top: 2, right: 2, width: 7, height: 7, borderRadius: '50%', background: 'var(--info)' }}></span>
              </div>
            </div>
          </div>
        </div>

        {loading ? <Loading /> : (
          <>
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, marginBottom: 16 }}>
              {filteredShifts.map((shift) => {
                const assignedCount = assignments.filter((a) => a.shift?._id === shift._id).length;
                const hours = calcHours(shift.startTime, shift.endTime);
                return (
                  <div key={shift._id} style={{ minWidth: 180, background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', padding: '14px', position: 'relative', cursor: 'pointer', transition: 'var(--transition)' }} onClick={() => handleEdit(shift)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <span style={{ fontSize: '1.4rem' }}>{getShiftIcon(shift.name)}</span>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-full)', background: shift.color + '20', color: shift.color }}>
                        {hours}h
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 2 }}>{shift.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: 10 }}>{shift.startTime} - {shift.endTime}</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{assignedCount.toLocaleString()}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>employees</div>
                    <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 2 }}>
                      <button onClick={(e) => { e.stopPropagation(); handleEdit(shift); }} style={{ width: 24, height: 24, borderRadius: 6, border: 'none', background: 'var(--bg)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteId(shift._id); setDeleteType('shift'); setShowDelete(true); }} style={{ width: 24, height: 24, borderRadius: 6, border: 'none', background: 'var(--danger-light)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                      </button>
                    </div>
                  </div>
                );
              })}
              <div style={{ minWidth: 160, background: 'var(--card-bg)', borderRadius: 'var(--radius-lg)', border: '2px dashed var(--border)', padding: '14px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'var(--transition)' }} onClick={() => { resetForm(); setShowModal(true); }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}>Add Shift</div>
              </div>
            </div>

            <div style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', borderRadius: 'var(--radius-lg)', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ color: 'white', fontSize: '0.95rem', fontWeight: 600, marginBottom: 2 }}>Shift Management</h3>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>Manage employee shift assignments</p>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.78rem' }} onClick={() => setShowAssignModal(true)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg>
                  Bulk Assign Shifts
                </button>
                <button className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.78rem' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                  Export
                </button>
              </div>
            </div>

            <div className="tabs" style={{ marginBottom: 14 }}>
              <button className={tab === 'shifts' ? 'active' : ''} onClick={() => setTab('shifts')}>Shifts</button>
              <button className={tab === 'assignments' ? 'active' : ''} onClick={() => setTab('assignments')}>Assignments</button>
            </div>

            {tab === 'assignments' && (
              <div className="card">
                {assignments.length === 0 ? (
                  <div className="empty-state">
                    <h3>No assignments found</h3>
                    <p>Assign a shift to an employee</p>
                  </div>
                ) : (
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Employee</th>
                          <th>Shift</th>
                          <th>Time</th>
                          <th>Start Date</th>
                          <th>Recurring</th>
                          <th>Days</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assignments.map((a) => (
                          <tr key={a._id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div className="avatar avatar-sm">{a.employee?.firstName?.[0]}{a.employee?.lastName?.[0]}</div>
                                <div>
                                  <div style={{ fontWeight: 500, fontSize: '0.78rem' }}>{a.employee?.firstName} {a.employee?.lastName}</div>
                                  <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{a.employee?.employeeId}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', background: 'var(--bg)', borderRadius: 'var(--radius)', fontSize: '0.78rem', fontWeight: 500 }}>
                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: a.shift?.color }}></span>
                                {a.shift?.name}
                              </span>
                            </td>
                            <td style={{ fontSize: '0.78rem' }}>{a.shift?.startTime} - {a.shift?.endTime}</td>
                            <td style={{ fontSize: '0.78rem' }}>{new Date(a.startDate).toLocaleDateString()}</td>
                            <td>{a.recurring ? <span className="badge badge-success">Yes</span> : <span className="badge badge-secondary">No</span>}</td>
                            <td style={{ fontSize: '0.72rem' }}>{(a.daysOfWeek || []).map((d) => DAYS[d]).join(', ')}</td>
                            <td><span className={`badge badge-${a.status === 'active' ? 'success' : 'warning'}`}>{a.status}</span></td>
                            <td>
                              <button className="btn btn-xs btn-danger" onClick={() => { setDeleteId(a._id); setDeleteType('assignment'); setShowDelete(true); }}>Remove</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editId ? 'Edit Shift' : 'Add Shift'} footer={
        <>
          <button className="btn btn-outline btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="btn btn-primary btn-sm" onClick={handleShiftSubmit}>{editId ? 'Update' : 'Create'}</button>
        </>
      }>
        <form onSubmit={handleShiftSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Shift Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Morning Shift" />
            </div>
            <div className="form-group">
              <label>Code *</label>
              <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="e.g. MST" maxLength={5} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Start Time *</label>
              <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
            </div>
            <div className="form-group">
              <label>End Time *</label>
              <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Break (min)</label>
              <input type="number" value={form.breakMinutes} onChange={(e) => setForm({ ...form, breakMinutes: Number(e.target.value) })} />
            </div>
            <div className="form-group">
              <label>Grace Period (min)</label>
              <input type="number" value={form.gracePeriodMinutes} onChange={(e) => setForm({ ...form, gracePeriodMinutes: Number(e.target.value) })} />
            </div>
            <div className="form-group">
              <label>OT Threshold (h)</label>
              <input type="number" value={form.overtimeThresholdHours} onChange={(e) => setForm({ ...form, overtimeThresholdHours: Number(e.target.value) })} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.isNightShift} onChange={(e) => setForm({ ...form, isNightShift: e.target.checked })} style={{ width: 14, height: 14 }} />
                <span>Night Shift</span>
              </label>
            </div>
            <div className="form-group">
              <label>Color</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {COLORS.map((c) => (
                  <div key={c} onClick={() => setForm({ ...form, color: c })} style={{ width: 24, height: 24, borderRadius: '50%', background: c, cursor: 'pointer', border: form.color === c ? '2px solid var(--text)' : '2px solid transparent', transition: 'var(--transition)' }} />
                ))}
              </div>
            </div>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title="Assign Shift" footer={
        <>
          <button className="btn btn-outline btn-sm" onClick={() => setShowAssignModal(false)}>Cancel</button>
          <button className="btn btn-primary btn-sm" onClick={handleAssignSubmit}>Assign</button>
        </>
      }>
        <form onSubmit={handleAssignSubmit}>
          <div className="form-group">
            <label>Employee *</label>
            <select value={assignForm.employee} onChange={(e) => setAssignForm({ ...assignForm, employee: e.target.value })}>
              <option value="">Select Employee</option>
              {employees.map((e) => <option key={e._id} value={e._id}>{e.firstName} {e.lastName} ({e.employeeId})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Shift *</label>
            <select value={assignForm.shift} onChange={(e) => setAssignForm({ ...assignForm, shift: e.target.value })}>
              <option value="">Select Shift</option>
              {shifts.filter((s) => s.isActive).map((s) => <option key={s._id} value={s._id}>{s.name} ({s.startTime} - {s.endTime})</option>)}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Start Date *</label>
              <input type="date" value={assignForm.startDate} onChange={(e) => setAssignForm({ ...assignForm, startDate: e.target.value })} />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input type="date" value={assignForm.endDate} onChange={(e) => setAssignForm({ ...assignForm, endDate: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input type="checkbox" checked={assignForm.recurring} onChange={(e) => setAssignForm({ ...assignForm, recurring: e.target.checked })} style={{ width: 14, height: 14 }} />
              <span>Recurring Weekly</span>
            </label>
          </div>
          {assignForm.recurring && (
            <div className="form-group">
              <label>Days of Week</label>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {DAYS.map((d, i) => (
                  <button key={i} type="button" style={{ padding: '5px 10px', border: '1px solid var(--border)', background: assignForm.daysOfWeek.includes(i) ? 'var(--primary)' : 'var(--card-bg)', color: assignForm.daysOfWeek.includes(i) ? 'white' : 'var(--text)', borderRadius: 'var(--radius)', fontSize: '0.72rem', fontWeight: 500, cursor: 'pointer' }} onClick={() => toggleDay(i)}>{d}</button>
                ))}
              </div>
            </div>
          )}
          <div className="form-group">
            <label>Notes</label>
            <textarea value={assignForm.notes} onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })} rows={2} placeholder="Add notes..." style={{ resize: 'vertical', minHeight: 50 }} />
          </div>
        </form>
      </Modal>

      <ConfirmModal isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} message={`Are you sure you want to delete this ${deleteType}?`} />
    </div>
  );
};

export default Shifts;
