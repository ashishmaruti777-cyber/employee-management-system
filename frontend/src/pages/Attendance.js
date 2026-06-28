import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Sidebar from '../components/common/Sidebar';
import Modal, { ConfirmModal } from '../components/common/Modal';
import Pagination from '../components/common/Pagination';
import Loading from '../components/common/Loading';
import { fetchAttendance, createAttendance, updateAttendance, deleteAttendance, fetchAttendanceSummary } from '../slices/attendanceSlice';
import { fetchEmployees } from '../slices/employeeSlice';
import { fetchDepartments } from '../slices/departmentSlice';
import toast from 'react-hot-toast';

const statusOptions = [
  { value: 'present', label: 'Present', color: 'var(--success)' },
  { value: 'absent', label: 'Absent', color: 'var(--danger)' },
  { value: 'late', label: 'Late', color: 'var(--warning)' },
  { value: 'half-day', label: 'Half Day', color: '#f97316' },
  { value: 'on-leave', label: 'On Leave', color: 'var(--info)' },
  { value: 'holiday', label: 'Holiday', color: 'var(--text-muted)' },
];

const statusColorMap = {
  present: 'success',
  absent: 'danger',
  'half-day': 'warning',
  late: 'warning',
  'on-leave': 'info',
  holiday: 'secondary',
};

const emptyForm = { employee: '', date: '', status: 'present', clockIn: '', clockOut: '', overtime: 0, notes: '' };

const Attendance = () => {
  const dispatch = useDispatch();
  const { items: records, pagination, loading, summary } = useSelector((state) => state.attendance);
  const { items: employees } = useSelector((state) => state.employees);
  const { items: departments } = useSelector((state) => state.departments);

  const [page, setPage] = useState(1);
  const [empFilter, setEmpFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [bulkDate, setBulkDate] = useState(new Date().toISOString().split('T')[0]);
  const [bulkStatus, setBulkStatus] = useState('present');

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const params = { page, limit: 10 };
    if (empFilter) params.employee = empFilter;
    if (statusFilter) params.status = statusFilter;
    if (dateFrom && dateTo) { params.startDate = dateFrom; params.endDate = dateTo; }
    dispatch(fetchAttendance(params));
    dispatch(fetchEmployees({ limit: 200 }));
    dispatch(fetchDepartments());
    dispatch(fetchAttendanceSummary({ startDate: dateFrom || today, endDate: dateTo || today }));
  }, [dispatch, page, empFilter, statusFilter, dateFrom, dateTo]);

  const summaryStats = useMemo(() => {
    if (!summary) return { present: 0, absent: 0, late: 0, 'half-day': 0, 'on-leave': 0, total: 0 };
    return summary;
  }, [summary]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.employee || !form.date) { toast.error('Employee and date are required'); return; }
    try {
      await dispatch(createAttendance(form)).unwrap();
      toast.success('Attendance recorded!');
      setShowModal(false);
      setForm(emptyForm);
    } catch (err) { toast.error(err || 'Failed'); }
  };

  const handleEdit = (record) => {
    setEditForm({
      employee: record.employee?._id || '',
      date: record.date?.split('T')[0] || '',
      status: record.status,
      clockIn: record.clockIn ? new Date(record.clockIn).toISOString().slice(0, 16) : '',
      clockOut: record.clockOut ? new Date(record.clockOut).toISOString().slice(0, 16) : '',
      overtime: record.overtime || 0,
      notes: record.notes || '',
    });
    setEditId(record._id);
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateAttendance({ id: editId, data: editForm })).unwrap();
      toast.success('Attendance updated!');
      setShowEditModal(false);
      setEditId(null);
    } catch (err) { toast.error(err || 'Failed'); }
  };

  const handleDelete = async () => {
    await dispatch(deleteAttendance(deleteId));
    toast.success('Attendance deleted!');
    setShowDelete(false);
    setDeleteId(null);
  };

  const handleBulkMark = async () => {
    const activeEmps = employees.filter(e => e.status === 'active');
    const existingDates = records.filter(r => r.date?.split('T')[0] === bulkDate).map(r => r.employee?._id);
    const newRecords = activeEmps
      .filter(e => !existingDates.includes(e._id))
      .map(e => ({ employee: e._id, date: bulkDate, status: bulkStatus }));
    if (newRecords.length === 0) { toast.error('All employees already marked for this date'); return; }
    try {
      const result = await dispatch(bulkCreateAttendance(newRecords)).unwrap();
      toast.success(`${result.count || newRecords.length} attendance records created!`);
      setShowBulk(false);
      dispatch(fetchAttendance({ page, limit: 10 }));
    } catch (err) { toast.error(err || 'Failed'); }
  };

  const clearFilters = () => {
    setEmpFilter('');
    setStatusFilter('');
    setDeptFilter('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const filteredEmployees = useMemo(() => {
    if (!deptFilter) return employees;
    return employees.filter(e => e.department?._id === deptFilter || e.department === deptFilter);
  }, [employees, deptFilter]);

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div>
            <h1>Attendance Management</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 2 }}>
              Track employee attendance, clock in/out, and manage records.
            </p>
          </div>
          <div className="topbar-actions">
            <button className="btn btn-outline" onClick={() => setShowBulk(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Bulk Mark
            </button>
            <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setShowModal(true); }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                <path d="M12 5v14m-7-7h14" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Record Attendance
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 24 }}>
          {statusOptions.map((s) => (
            <div
              key={s.value}
              className="card"
              style={{ padding: '16px 20px', cursor: 'pointer', borderLeft: `4px solid ${s.color}`, transition: 'all 0.2s' }}
              onClick={() => setStatusFilter(statusFilter === s.value ? '' : s.value)}
            >
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: s.color, marginTop: 4 }}>
                {summaryStats[s.value] || 0}
              </div>
            </div>
          ))}
          <div className="card" style={{ padding: '16px 20px', borderLeft: '4px solid var(--primary)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Records</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', marginTop: 4 }}>{summaryStats.total || 0}</div>
          </div>
        </div>

        <div className="card">
          <div className="filter-bar" style={{ flexWrap: 'wrap' }}>
            <div className="search-box" style={{ flex: 1, minWidth: 200 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
              </svg>
              <input
                placeholder="Search employee..."
                value={empFilter}
                onChange={(e) => { setEmpFilter(e.target.value); setPage(1); }}
              />
            </div>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">All Status</option>
              {statusOptions.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <select value={deptFilter} onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}>
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
            <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} placeholder="From" style={{ maxWidth: 160 }} />
            <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} placeholder="To" style={{ maxWidth: 160 }} />
            {(empFilter || statusFilter || deptFilter || dateFrom || dateTo) && (
              <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Clear
              </button>
            )}
          </div>

          {loading ? (
            <Loading />
          ) : records.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 48, height: 48, margin: '0 auto 16px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <h3>No Attendance Records Found</h3>
              <p>Try adjusting your filters or record attendance for today.</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Date</th>
                    <th>Clock In</th>
                    <th>Clock Out</th>
                    <th>Hours</th>
                    <th>Overtime</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => {
                    const clockInTime = r.clockIn ? new Date(r.clockIn) : null;
                    const clockOutTime = r.clockOut ? new Date(r.clockOut) : null;
                    const hoursWorked = clockInTime && clockOutTime ? ((clockOutTime - clockInTime) / (1000 * 60 * 60)).toFixed(1) : '-';
                    return (
                      <tr key={r._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.7rem' }}>
                              {r.employee?.firstName?.[0]}{r.employee?.lastName?.[0]}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{r.employee?.firstName} {r.employee?.lastName}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.employee?.employeeId}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.85rem' }}>
                            {new Date(r.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>
                            {clockInTime ? clockInTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>
                            {clockOutTime ? clockOutTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 500, fontSize: '0.85rem' }}>{hoursWorked}h</span>
                        </td>
                        <td>
                          {r.overtime > 0 ? (
                            <span style={{ color: 'var(--warning)', fontWeight: 600 }}>+{r.overtime.toFixed(1)}h</span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>-</span>
                          )}
                        </td>
                        <td>
                          <span className={`badge badge-${statusColorMap[r.status]}`}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: `var(--${statusColorMap[r.status]})`, marginRight: 6 }} />
                            {r.status.replace('-', ' ')}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                            <button className="btn btn-sm btn-outline" onClick={() => handleEdit(r)} title="Edit">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
                                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                            <button className="btn btn-sm btn-danger" onClick={() => { setDeleteId(r._id); setShowDelete(true); }} title="Delete">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
                                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
      </div>

      {/* Record Attendance Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Record Attendance"
        footer={<>
          <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleCreate}>Save</button>
        </>}
      >
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label>Employee *</label>
            <select value={form.employee} onChange={(e) => setForm({ ...form, employee: e.target.value })}>
              <option value="">Select Employee</option>
              {filteredEmployees.map((e) => (
                <option key={e._id} value={e._id}>{e.firstName} {e.lastName}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Date *</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {statusOptions.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea rows={2} placeholder="Any notes..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        </form>
      </Modal>

      {/* Edit Attendance Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Attendance"
        footer={<>
          <button className="btn btn-outline" onClick={() => setShowEditModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleUpdate}>Update</button>
        </>}
      >
        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label>Date *</label>
            <input type="date" value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
              {statusOptions.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Clock In</label>
              <input type="datetime-local" value={editForm.clockIn} onChange={(e) => setEditForm({ ...editForm, clockIn: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Clock Out</label>
              <input type="datetime-local" value={editForm.clockOut} onChange={(e) => setEditForm({ ...editForm, clockOut: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label>Overtime (hours)</label>
            <input type="number" step="0.5" min="0" value={editForm.overtime} onChange={(e) => setEditForm({ ...editForm, overtime: parseFloat(e.target.value) || 0 })} />
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea rows={2} value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} />
          </div>
        </form>
      </Modal>

      {/* Bulk Mark Modal */}
      <Modal isOpen={showBulk} onClose={() => setShowBulk(false)} title="Bulk Mark Attendance"
        size="small"
        footer={<>
          <button className="btn btn-outline" onClick={() => setShowBulk(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleBulkMark}>Mark All Active Employees</button>
        </>}
      >
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
          This will mark attendance for all active employees who don't have a record on the selected date.
        </p>
        <div className="form-group">
          <label>Date *</label>
          <input type="date" value={bulkDate} onChange={(e) => setBulkDate(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Status</label>
          <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)}>
            {statusOptions.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div style={{ padding: 12, background: 'var(--bg)', borderRadius: 8, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          Active employees to be marked: <strong>{employees.filter(e => e.status === 'active').length}</strong>
        </div>
      </Modal>

      <ConfirmModal isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} message="This attendance record will be permanently deleted." />
    </div>
  );
};

export default Attendance;
