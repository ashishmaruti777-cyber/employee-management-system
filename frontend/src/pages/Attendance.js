import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Sidebar from '../components/common/Sidebar';
import Modal, { ConfirmModal } from '../components/common/Modal';
import Pagination from '../components/common/Pagination';
import Loading from '../components/common/Loading';
import { fetchAttendance, createAttendance, updateAttendance, deleteAttendance, fetchAttendanceSummary } from '../slices/attendanceSlice';
import { fetchEmployees } from '../slices/employeeSlice';
import { fetchDepartments } from '../slices/departmentSlice';
import toast from 'react-hot-toast';

const statusConfig = [
  { value: 'present', label: 'Present', color: '#10b981', bg: '#d1fae5', icon: '✓' },
  { value: 'absent', label: 'Absent', color: '#ef4444', bg: '#fee2e2', icon: '✕' },
  { value: 'late', label: 'Late', color: '#f59e0b', bg: '#fef3c7', icon: '⏰' },
  { value: 'half-day', label: 'Half Day', color: '#f97316', bg: '#ffedd5', icon: '½' },
  { value: 'on-leave', label: 'On Leave', color: '#3b82f6', bg: '#dbeafe', icon: '🏖' },
  { value: 'holiday', label: 'Holiday', color: '#8b5cf6', bg: '#ede9fe', icon: '🎉' },
];

const statusColorMap = { present: 'success', absent: 'danger', 'half-day': 'warning', late: 'warning', 'on-leave': 'info', holiday: 'secondary' };

const emptyForm = { employee: '', date: '', status: 'present', clockIn: '', clockOut: '', overtime: 0, notes: '' };

const LiveClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }} />
      <span style={{ fontFamily: 'monospace', fontSize: '1.8rem', fontWeight: 700, color: 'var(--text)', letterSpacing: 2 }}>
        {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </span>
      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
      </span>
    </div>
  );
};

const ProgressBar = ({ value, max, color }) => {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ width: '100%', height: 6, borderRadius: 3, background: 'var(--border-light)', overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: color, transition: 'width 0.6s ease' }} />
    </div>
  );
};

const MiniCalendar = ({ records, month, year }) => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const dateStatusMap = useMemo(() => {
    const map = {};
    records.forEach(r => {
      const d = new Date(r.date).getDate();
      if (!map[d]) map[d] = { present: 0, absent: 0, late: 0, total: 0 };
      map[d][r.status] = (map[d][r.status] || 0) + 1;
      map[d].total++;
    });
    return map;
  }, [records]);

  return (
    <div className="card" style={{ padding: 20 }}>
      <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 16 }}>
        {new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Calendar
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, textAlign: 'center' }}>
        {days.map(d => <div key={d} style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', padding: '4px 0' }}>{d}</div>)}
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const data = dateStatusMap[day];
          const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;
          const isWeekend = new Date(year, month, day).getDay() === 0 || new Date(year, month, day).getDay() === 6;
          return (
            <div key={day} style={{
              padding: '6px 2px', borderRadius: 8, fontSize: '0.75rem', position: 'relative',
              background: isToday ? 'var(--primary)' : isWeekend ? 'var(--bg)' : 'transparent',
              color: isToday ? 'white' : isWeekend ? 'var(--text-muted)' : 'var(--text)',
              fontWeight: isToday ? 700 : 400,
            }}>
              <div>{day}</div>
              {data && (
                <div style={{ display: 'flex', gap: 1, justifyContent: 'center', marginTop: 2 }}>
                  {data.present > 0 && <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#10b981' }} />}
                  {data.absent > 0 && <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#ef4444' }} />}
                  {data.late > 0 && <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#f59e0b' }} />}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 12, justifyContent: 'center' }}>
        {[{ color: '#10b981', label: 'Present' }, { color: '#ef4444', label: 'Absent' }, { color: '#f59e0b', label: 'Late' }].map(i => (
          <span key={i.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: i.color }} />{i.label}
          </span>
        ))}
      </div>
    </div>
  );
};

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
  const [view, setView] = useState('table');

  const today = new Date().toISOString().split('T')[0];
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const fetchData = useCallback(() => {
    const params = { page, limit: 10 };
    if (empFilter) params.employee = empFilter;
    if (statusFilter) params.status = statusFilter;
    if (dateFrom && dateTo) { params.startDate = dateFrom; params.endDate = dateTo; }
    dispatch(fetchAttendance(params));
    dispatch(fetchAttendanceSummary({ startDate: dateFrom || today, endDate: dateTo || today }));
  }, [dispatch, page, empFilter, statusFilter, dateFrom, dateTo, today]);

  useEffect(() => {
    fetchData();
    dispatch(fetchEmployees({ limit: 200 }));
    dispatch(fetchDepartments());
  }, [fetchData, dispatch]);

  const summaryStats = useMemo(() => {
    if (!summary) return { present: 0, absent: 0, late: 0, 'half-day': 0, 'on-leave': 0, total: 0 };
    return summary;
  }, [summary]);

  const attendanceRate = useMemo(() => {
    const total = summaryStats.total || 1;
    return Math.round(((summaryStats.present + summaryStats.late) / total) * 100);
  }, [summaryStats]);

  const deptBreakdown = useMemo(() => {
    const map = {};
    departments.forEach(d => { map[d._id] = { name: d.name, present: 0, total: 0 }; });
    records.forEach(r => {
      const deptId = r.employee?.department;
      if (deptId && map[deptId]) {
        map[deptId].total++;
        if (r.status === 'present' || r.status === 'late') map[deptId].present++;
      }
    });
    return Object.values(map).filter(d => d.total > 0).slice(0, 5);
  }, [records, departments]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.employee || !form.date) { toast.error('Employee and date are required'); return; }
    try {
      await dispatch(createAttendance(form)).unwrap();
      toast.success('Attendance recorded!');
      setShowModal(false); setForm(emptyForm); fetchData();
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
      setShowEditModal(false); setEditId(null); fetchData();
    } catch (err) { toast.error(err || 'Failed'); }
  };

  const handleDelete = async () => {
    await dispatch(deleteAttendance(deleteId));
    toast.success('Attendance deleted!');
    setShowDelete(false); setDeleteId(null); fetchData();
  };

  const handleBulkMark = async () => {
    const activeEmps = employees.filter(e => e.status === 'active');
    const existingEmps = records.filter(r => r.date?.split('T')[0] === bulkDate).map(r => r.employee?._id);
    const newRecords = activeEmps.filter(e => !existingEmps.includes(e._id)).map(e => ({ employee: e._id, date: bulkDate, status: bulkStatus }));
    if (newRecords.length === 0) { toast.error('All employees already marked'); return; }
    try {
      const result = await dispatch(bulkCreateAttendance(newRecords)).unwrap();
      toast.success(`${result.count || newRecords.length} records created!`);
      setShowBulk(false); fetchData();
    } catch (err) { toast.error(err || 'Failed'); }
  };

  const clearFilters = () => { setEmpFilter(''); setStatusFilter(''); setDeptFilter(''); setDateFrom(''); setDateTo(''); setPage(1); };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div>
            <h1>Attendance Management</h1>
            <LiveClock />
          </div>
          <div className="topbar-actions">
            <div style={{ display: 'flex', border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
              <button onClick={() => setView('table')} style={{ padding: '8px 14px', border: 'none', background: view === 'table' ? 'var(--primary)' : 'transparent', color: view === 'table' ? 'white' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500, fontSize: '0.8rem' }}>Table</button>
              <button onClick={() => setView('calendar')} style={{ padding: '8px 14px', border: 'none', borderLeft: '1px solid var(--border)', background: view === 'calendar' ? 'var(--primary)' : 'transparent', color: view === 'calendar' ? 'white' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 500, fontSize: '0.8rem' }}>Calendar</button>
            </div>
            <button className="btn btn-outline" onClick={() => setShowBulk(true)}>Bulk Mark</button>
            <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setShowModal(true); }}>+ Record</button>
          </div>
        </div>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
          <div className="card" style={{ padding: '20px', cursor: 'pointer', border: statusFilter === 'present' ? '2px solid #10b981' : '2px solid transparent' }} onClick={() => setStatusFilter(statusFilter === 'present' ? '' : 'present')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Present</span>
              <span style={{ width: 32, height: 32, borderRadius: 8, background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>✓</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981' }}>{summaryStats.present || 0}</div>
            <ProgressBar value={summaryStats.present || 0} max={summaryStats.total || 1} color="#10b981" />
          </div>

          <div className="card" style={{ padding: '20px', cursor: 'pointer', border: statusFilter === 'absent' ? '2px solid #ef4444' : '2px solid transparent' }} onClick={() => setStatusFilter(statusFilter === 'absent' ? '' : 'absent')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Absent</span>
              <span style={{ width: 32, height: 32, borderRadius: 8, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>✕</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ef4444' }}>{summaryStats.absent || 0}</div>
            <ProgressBar value={summaryStats.absent || 0} max={summaryStats.total || 1} color="#ef4444" />
          </div>

          <div className="card" style={{ padding: '20px', cursor: 'pointer', border: statusFilter === 'late' ? '2px solid #f59e0b' : '2px solid transparent' }} onClick={() => setStatusFilter(statusFilter === 'late' ? '' : 'late')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Late</span>
              <span style={{ width: 32, height: 32, borderRadius: 8, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>⏰</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b' }}>{summaryStats.late || 0}</div>
            <ProgressBar value={summaryStats.late || 0} max={summaryStats.total || 1} color="#f59e0b" />
          </div>

          <div className="card" style={{ padding: '20px', cursor: 'pointer', border: statusFilter === 'on-leave' ? '2px solid #3b82f6' : '2px solid transparent' }} onClick={() => setStatusFilter(statusFilter === 'on-leave' ? '' : 'on-leave')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.5px' }}>On Leave</span>
              <span style={{ width: 32, height: 32, borderRadius: 8, background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>🏖</span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#3b82f6' }}>{summaryStats['on-leave'] || 0}</div>
            <ProgressBar value={summaryStats['on-leave'] || 0} max={summaryStats.total || 1} color="#3b82f6" />
          </div>

          <div className="card" style={{ padding: '20px', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: 'white' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.8, marginBottom: 8 }}>Attendance Rate</div>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{attendanceRate}%</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: 4 }}>{summaryStats.total || 0} total records</div>
          </div>
        </div>

        {/* Department Breakdown */}
        {deptBreakdown.length > 0 && (
          <div className="card" style={{ padding: 20, marginBottom: 24 }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 16 }}>Department Breakdown</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
              {deptBreakdown.map(d => {
                const rate = d.total > 0 ? Math.round((d.present / d.total) * 100) : 0;
                return (
                  <div key={d.name} style={{ padding: 12, background: 'var(--bg)', borderRadius: 10 }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>{d.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{d.present}/{d.total}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: rate >= 80 ? '#10b981' : rate >= 50 ? '#f59e0b' : '#ef4444' }}>{rate}%</span>
                    </div>
                    <ProgressBar value={d.present} max={d.total} color={rate >= 80 ? '#10b981' : rate >= 50 ? '#f59e0b' : '#ef4444'} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="filter-bar" style={{ flexWrap: 'wrap', margin: 0, padding: '16px 20px' }}>
            <div className="search-box" style={{ flex: 1, minWidth: 200 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}>
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
              </svg>
              <input placeholder="Search employee..." value={empFilter} onChange={(e) => { setEmpFilter(e.target.value); setPage(1); }} />
            </div>
            <select value={deptFilter} onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}>
              <option value="">All Departments</option>
              {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
            <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} style={{ maxWidth: 160 }} />
            <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} style={{ maxWidth: 160 }} />
            {(empFilter || statusFilter || deptFilter || dateFrom || dateTo) && (
              <button className="btn btn-ghost btn-sm" onClick={clearFilters}>✕ Clear</button>
            )}
          </div>
        </div>

        {view === 'table' ? (
          <div className="card">
            {loading ? <Loading /> : records.length === 0 ? (
              <div className="empty-state">
                <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
                <h3>No Records Found</h3>
                <p>Adjust filters or record attendance.</p>
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
                      const hours = clockInTime && clockOutTime ? ((clockOutTime - clockInTime) / (1000 * 60 * 60)).toFixed(1) : '-';
                      const sc = statusConfig.find(s => s.value === r.status) || statusConfig[0];
                      return (
                        <tr key={r._id} style={{ transition: 'background 0.15s' }}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${sc.color}20`, color: sc.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
                                {r.employee?.firstName?.[0]}{r.employee?.lastName?.[0]}
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{r.employee?.firstName} {r.employee?.lastName}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{r.employee?.employeeId}</div>
                              </div>
                            </div>
                          </td>
                          <td><span style={{ fontSize: '0.82rem' }}>{new Date(r.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span></td>
                          <td><span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{clockInTime ? clockInTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}</span></td>
                          <td><span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{clockOutTime ? clockOutTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}</span></td>
                          <td><span style={{ fontWeight: 600, fontSize: '0.82rem' }}>{hours}h</span></td>
                          <td>{r.overtime > 0 ? <span style={{ color: '#f59e0b', fontWeight: 600, fontSize: '0.82rem' }}>+{r.overtime.toFixed(1)}h</span> : <span style={{ color: 'var(--text-muted)' }}>-</span>}</td>
                          <td>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, background: `${sc.color}15`, color: sc.color }}>
                              {sc.icon} {r.status.replace('-', ' ')}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                              <button className="btn btn-sm btn-outline" onClick={() => handleEdit(r)} title="Edit" style={{ padding: '6px 8px' }}>✏️</button>
                              <button className="btn btn-sm btn-danger" onClick={() => { setDeleteId(r._id); setShowDelete(true); }} title="Delete" style={{ padding: '6px 8px' }}>🗑️</button>
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
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 24 }}>
            <MiniCalendar records={records} month={currentMonth} year={currentYear} />
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 16 }}>Recent Activity</h3>
              <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                {records.slice(0, 20).map(r => {
                  const sc = statusConfig.find(s => s.value === r.status) || statusConfig[0];
                  return (
                    <div key={r._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: sc.color, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{r.employee?.firstName} {r.employee?.lastName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{new Date(r.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                      </div>
                      <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 600, background: `${sc.color}15`, color: sc.color }}>
                        {r.status.replace('-', ' ')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Record Attendance"
        footer={<><button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleCreate}>Save</button></>}>
        <form onSubmit={handleCreate}>
          <div className="form-group"><label>Employee *</label>
            <select value={form.employee} onChange={(e) => setForm({ ...form, employee: e.target.value })}>
              <option value="">Select Employee</option>
              {employees.map((e) => <option key={e._id} value={e._id}>{e.firstName} {e.lastName}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Date *</label><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
          <div className="form-group"><label>Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {statusOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Notes</label><textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
        </form>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Attendance"
        footer={<><button className="btn btn-outline" onClick={() => setShowEditModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleUpdate}>Update</button></>}>
        <form onSubmit={handleUpdate}>
          <div className="form-group"><label>Date *</label><input type="date" value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} /></div>
          <div className="form-group"><label>Status</label>
            <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
              {statusOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group"><label>Clock In</label><input type="datetime-local" value={editForm.clockIn} onChange={(e) => setEditForm({ ...editForm, clockIn: e.target.value })} /></div>
            <div className="form-group"><label>Clock Out</label><input type="datetime-local" value={editForm.clockOut} onChange={(e) => setEditForm({ ...editForm, clockOut: e.target.value })} /></div>
          </div>
          <div className="form-group"><label>Overtime (hours)</label><input type="number" step="0.5" min="0" value={editForm.overtime} onChange={(e) => setEditForm({ ...editForm, overtime: parseFloat(e.target.value) || 0 })} /></div>
          <div className="form-group"><label>Notes</label><textarea rows={2} value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} /></div>
        </form>
      </Modal>

      <Modal isOpen={showBulk} onClose={() => setShowBulk(false)} title="Bulk Mark Attendance" size="small"
        footer={<><button className="btn btn-outline" onClick={() => setShowBulk(false)}>Cancel</button><button className="btn btn-primary" onClick={handleBulkMark}>Mark All Active</button></>}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>Mark attendance for all active employees without a record on the selected date.</p>
        <div className="form-group"><label>Date *</label><input type="date" value={bulkDate} onChange={(e) => setBulkDate(e.target.value)} /></div>
        <div className="form-group"><label>Status</label>
          <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)}>
            {statusOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div style={{ padding: 12, background: 'var(--bg)', borderRadius: 8, fontSize: '0.82rem' }}>Active employees: <strong>{employees.filter(e => e.status === 'active').length}</strong></div>
      </Modal>

      <ConfirmModal isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete} message="This record will be permanently deleted." />

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
};

const statusOptions = [
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'late', label: 'Late' },
  { value: 'half-day', label: 'Half Day' },
  { value: 'on-leave', label: 'On Leave' },
  { value: 'holiday', label: 'Holiday' },
];

export default Attendance;
