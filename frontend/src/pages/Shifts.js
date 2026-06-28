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

  const renderShiftCard = (shift) => {
    const assignedCount = assignments.filter((a) => a.shift?._id === shift._id).length;
    return (
      <div key={shift._id} className="card shift-card" style={{ borderLeft: `4px solid ${shift.color}` }}>
        <div className="shift-card-header">
          <div className="shift-card-title">
            <h3>{shift.name}</h3>
            <div className="shift-card-badges">
              <span className="badge badge-info">{shift.code}</span>
              {shift.isNightShift && <span className="badge badge-warning">Night</span>}
            </div>
          </div>
          <div className="shift-card-actions">
            <button className="btn btn-sm btn-outline" onClick={() => handleEdit(shift)}>Edit</button>
            <button className="btn btn-sm btn-outline" onClick={() => { dispatch(toggleShiftStatus(shift._id)); toast.success('Toggled!'); }} style={{ color: shift.isActive ? 'var(--danger)' : 'var(--success)' }}>
              {shift.isActive ? 'Disable' : 'Enable'}
            </button>
            <button className="btn btn-sm btn-danger" onClick={() => { setDeleteId(shift._id); setDeleteType('shift'); setShowDelete(true); }}>Delete</button>
          </div>
        </div>

        <div className="shift-time-display">
          <div className="shift-time-box" style={{ background: `${shift.color}15` }}>
            <div className="shift-time-value" style={{ color: shift.color }}>{shift.startTime}</div>
            <div className="shift-time-label">Start</div>
          </div>
          <div className="shift-time-arrow">→</div>
          <div className="shift-time-box" style={{ background: `${shift.color}15` }}>
            <div className="shift-time-value" style={{ color: shift.color }}>{shift.endTime}</div>
            <div className="shift-time-label">End</div>
          </div>
        </div>

        <div className="shift-details">
          <span>Break: {shift.breakMinutes}m</span>
          <span>Grace: {shift.gracePeriodMinutes}m</span>
          <span>OT: {shift.overtimeThresholdHours}h</span>
        </div>

        <div className="shift-footer">
          <span>Assigned: {assignedCount} employees</span>
        </div>
      </div>
    );
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <h1>Shift Management</h1>
          <div className="topbar-actions">
            {tab === 'shifts' && (
              <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add Shift
              </button>
            )}
            {tab === 'assignments' && (
              <button className="btn btn-primary" onClick={() => setShowAssignModal(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <line x1="20" y1="8" x2="20" y2="14"></line>
                  <line x1="23" y1="11" x2="17" y2="11"></line>
                </svg>
                Assign Shift
              </button>
            )}
          </div>
        </div>

        <div className="tabs">
          <button className={tab === 'shifts' ? 'active' : ''} onClick={() => setTab('shifts')}>Shifts</button>
          <button className={tab === 'assignments' ? 'active' : ''} onClick={() => setTab('assignments')}>Assignments</button>
        </div>

        {tab === 'shifts' && (
          <div className="card">
            <div className="filter-bar">
              <div className="search-box" style={{ flex: 1, maxWidth: 300 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input placeholder="Search shifts..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>
            {loading ? <Loading /> : shifts.length === 0 ? (
              <div className="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <h3>No shifts found</h3>
                <p>Create your first shift to get started</p>
              </div>
            ) : (
              <div className="shifts-grid">
                {shifts.map(renderShiftCard)}
              </div>
            )}
          </div>
        )}

        {tab === 'assignments' && (
          <div className="card">
            {loading ? <Loading /> : assignments.length === 0 ? (
              <div className="empty-state">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <line x1="20" y1="8" x2="20" y2="14"></line>
                  <line x1="23" y1="11" x2="17" y2="11"></line>
                </svg>
                <h3>No assignments found</h3>
                <p>Assign a shift to an employee to get started</p>
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
                          <div className="employee-cell">
                            <div className="avatar avatar-sm">
                              {a.employee?.firstName?.[0]}{a.employee?.lastName?.[0]}
                            </div>
                            <div>
                              <div className="employee-name">{a.employee?.firstName} {a.employee?.lastName}</div>
                              <div className="employee-id">({a.employee?.employeeId})</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="shift-badge">
                            <span className="shift-dot" style={{ background: a.shift?.color }}></span>
                            {a.shift?.name}
                          </span>
                        </td>
                        <td>{a.shift?.startTime} - {a.shift?.endTime}</td>
                        <td>{new Date(a.startDate).toLocaleDateString()}</td>
                        <td>{a.recurring ? <span className="badge badge-success">Yes</span> : <span className="badge badge-secondary">No</span>}</td>
                        <td>{(a.daysOfWeek || []).map((d) => DAYS[d]).join(', ')}</td>
                        <td><span className={`badge badge-${a.status === 'active' ? 'success' : 'warning'}`}>{a.status}</span></td>
                        <td>
                          <button className="btn btn-sm btn-danger" onClick={() => { setDeleteId(a._id); setDeleteType('assignment'); setShowDelete(true); }}>Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editId ? 'Edit Shift' : 'Add Shift'} footer={
        <>
          <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleShiftSubmit}>{editId ? 'Update' : 'Create'}</button>
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
              <label className="checkbox-label">
                <input type="checkbox" checked={form.isNightShift} onChange={(e) => setForm({ ...form, isNightShift: e.target.checked })} />
                <span>Night Shift</span>
              </label>
            </div>
            <div className="form-group">
              <label>Color</label>
              <div className="color-picker">
                {COLORS.map((c) => (
                  <div key={c} onClick={() => setForm({ ...form, color: c })} className={`color-swatch ${form.color === c ? 'active' : ''}`} style={{ background: c }} />
                ))}
              </div>
            </div>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title="Assign Shift" footer={
        <>
          <button className="btn btn-outline" onClick={() => setShowAssignModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleAssignSubmit}>Assign</button>
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
            <label className="checkbox-label">
              <input type="checkbox" checked={assignForm.recurring} onChange={(e) => setAssignForm({ ...assignForm, recurring: e.target.checked })} />
              <span>Recurring Weekly</span>
            </label>
          </div>
          {assignForm.recurring && (
            <div className="form-group">
              <label>Days of Week</label>
              <div className="days-picker">
                {DAYS.map((d, i) => (
                  <button key={i} type="button" className={`day-btn ${assignForm.daysOfWeek.includes(i) ? 'active' : ''}`} onClick={() => toggleDay(i)}>{d}</button>
                ))}
              </div>
            </div>
          )}
          <div className="form-group">
            <label>Notes</label>
            <textarea value={assignForm.notes} onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })} rows={3} placeholder="Add any notes about this assignment..." />
          </div>
        </form>
      </Modal>

      <ConfirmModal isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} message={`Are you sure you want to delete this ${deleteType}?`} />

      <style>{`
        .shifts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 16px;
        }
        .shift-card {
          border-left: 4px solid var(--primary);
          transition: var(--transition);
        }
        .shift-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }
        .shift-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }
        .shift-card-title {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .shift-card-title h3 {
          font-size: 1.05rem;
          font-weight: 600;
          margin: 0;
        }
        .shift-card-badges {
          display: flex;
          gap: 6px;
          align-items: center;
        }
        .shift-card-actions {
          display: flex;
          gap: 4px;
        }
        .shift-time-display {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
        }
        .shift-time-box {
          text-align: center;
          padding: 10px 20px;
          border-radius: var(--radius);
          flex: 1;
        }
        .shift-time-value {
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: 2px;
        }
        .shift-time-label {
          font-size: 0.7rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .shift-time-arrow {
          color: var(--text-secondary);
          font-size: 1.2rem;
        }
        .shift-details {
          display: flex;
          gap: 16px;
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-bottom: 12px;
        }
        .shift-footer {
          border-top: 1px solid var(--border);
          padding-top: 12px;
          font-size: 0.8rem;
          color: var(--text-secondary);
        }
        .employee-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .employee-name {
          font-weight: 500;
          font-size: 0.9rem;
        }
        .employee-id {
          font-size: 0.75rem;
          color: var(--text-secondary);
        }
        .shift-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 4px 10px;
          background: var(--bg);
          border-radius: var(--radius);
          font-size: 0.85rem;
          font-weight: 500;
        }
        .shift-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-size: 0.9rem;
        }
        .checkbox-label input[type="checkbox"] {
          width: 18px;
          height: 18px;
          accent-color: var(--primary);
          cursor: pointer;
        }
        .color-picker {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .color-swatch {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          border: 3px solid transparent;
          transition: var(--transition);
        }
        .color-swatch:hover {
          transform: scale(1.1);
        }
        .color-swatch.active {
          border-color: var(--text);
          transform: scale(1.1);
          box-shadow: 0 0 0 2px var(--card-bg), 0 0 0 4px var(--text);
        }
        .days-picker {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .day-btn {
          min-width: 50px;
          padding: 8px 12px;
          border: 1.5px solid var(--border);
          background: var(--card-bg);
          border-radius: var(--radius);
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: var(--transition);
          color: var(--text);
        }
        .day-btn:hover {
          border-color: var(--primary);
          color: var(--primary);
        }
        .day-btn.active {
          background: var(--primary);
          border-color: var(--primary);
          color: white;
        }
        .form-group textarea {
          resize: vertical;
          min-height: 80px;
        }
        @media (max-width: 768px) {
          .shifts-grid {
            grid-template-columns: 1fr;
          }
          .shift-card-header {
            flex-direction: column;
            gap: 12px;
          }
          .shift-card-actions {
            width: 100%;
            justify-content: flex-end;
          }
          .shift-time-display {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
};

export default Shifts;