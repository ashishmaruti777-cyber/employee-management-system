import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Sidebar from '../components/common/Sidebar';
import Loading from '../components/common/Loading';
import { fetchAttendance, clockIn, clockOut, fetchAttendanceSummary } from '../slices/attendanceSlice';
import { fetchMyProfile } from '../slices/employeeSlice';
import toast from 'react-hot-toast';

const Attendance = () => {
  const dispatch = useDispatch();
  const { items: records, loading, summary } = useSelector((state) => state.attendance);
  const { user } = useSelector((state) => state.auth);
  const isEmployee = user?.role === 'employee';
  const { items: myEmployees } = useSelector((state) => state.employees);
  const { items: employees } = useSelector((state) => state.employees);
  const { items: departments } = useSelector((state) => state.departments);
  const myProfile = isEmployee ? myEmployees[0] : null;

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [deptFilter, setDeptFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isEmployee) {
      dispatch(fetchMyProfile());
    }
    dispatch(fetchAttendance({ page: 1, limit: 200, startDate: selectedDate, endDate: selectedDate }));
    dispatch(fetchAttendanceSummary({ startDate: selectedDate, endDate: selectedDate }));
  }, [dispatch, selectedDate, isEmployee]);

  const myTodayRecord = useMemo(() => {
    if (!isEmployee || !myProfile || !records.length) return null;
    return records.find(r => r.employee?._id === myProfile._id || r.employee === myProfile._id);
  }, [isEmployee, myProfile, records]);

  const summaryStats = useMemo(() => {
    if (!summary) return { present: 0, absent: 0, late: 0, 'on-leave': 0 };
    return summary;
  }, [summary]);

  const handleClockIn = async () => {
    try {
      await dispatch(clockIn(myProfile._id)).unwrap();
      toast.success('Clocked in successfully!');
    } catch (err) {
      toast.error(err || 'Clock in failed');
    }
  };

  const handleClockOut = async () => {
    try {
      await dispatch(clockOut(myProfile._id)).unwrap();
      toast.success('Clocked out successfully!');
    } catch (err) {
      toast.error(err || 'Clock out failed');
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      present: { bg: '#d1fae5', color: '#059669', label: 'present' },
      absent: { bg: '#fee2e2', color: '#dc2626', label: 'absent' },
      late: { bg: '#fef3c7', color: '#d97706', label: 'late' },
      'half-day': { bg: '#ffedd5', color: '#ea580c', label: 'half-day' },
      'on-leave': { bg: '#dbeafe', color: '#2563eb', label: 'on leave' },
      holiday: { bg: '#ede9fe', color: '#7c3aed', label: 'holiday' },
    };
    const c = config[status] || config.present;
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600,
        background: c.bg, color: c.color,
      }}>
        {status === 'present' && '✓'}
        {status === 'absent' && '✕'}
        {status === 'late' && '⏰'}
        {status === 'on-leave' && '🏖'}
        {status === 'half-day' && '½'}
        {' '}{c.label}
      </span>
    );
  };

  if (isEmployee) {
    const currentStatus = myTodayRecord?.status || '';
    const clockInTime = myTodayRecord?.clockIn ? new Date(myTodayRecord.clockIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-';
    const clockOutTime = myTodayRecord?.clockOut ? new Date(myTodayRecord.clockOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-';
    const overtime = myTodayRecord?.overtime ? `${myTodayRecord.overtime.toFixed(1)}h` : '-';

    return (
      <div className="app-layout">
        <Sidebar />
        <div className="main-content" style={{ background: '#f8fafc' }}>
          <div style={{ padding: '24px 32px 0' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>My Attendance</h1>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 4 }}>Track your daily attendance and work hours.</p>
          </div>

          {/* My Attendance Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, padding: '20px 32px' }}>
            <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: 14, padding: '18px 20px', color: 'white' }}>
              <div style={{ fontSize: '0.8rem', opacity: 0.9, fontWeight: 500 }}>Present</div>
              <div style={{ fontSize: '2rem', fontWeight: 800 }}>{summaryStats.present || 0}</div>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', borderRadius: 14, padding: '18px 20px', color: 'white' }}>
              <div style={{ fontSize: '0.8rem', opacity: 0.9, fontWeight: 500 }}>Absent</div>
              <div style={{ fontSize: '2rem', fontWeight: 800 }}>{summaryStats.absent || 0}</div>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', borderRadius: 14, padding: '18px 20px', color: 'white' }}>
              <div style={{ fontSize: '0.8rem', opacity: 0.9, fontWeight: 500 }}>Late</div>
              <div style={{ fontSize: '2rem', fontWeight: 800 }}>{summaryStats.late || 0}</div>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', borderRadius: 14, padding: '18px 20px', color: 'white' }}>
              <div style={{ fontSize: '0.8rem', opacity: 0.9, fontWeight: 500 }}>On Leave</div>
              <div style={{ fontSize: '2rem', fontWeight: 800 }}>{summaryStats['on-leave'] || 0}</div>
            </div>
          </div>

          {/* Clock In/Out Card */}
          <div style={{ margin: '0 32px 20px', background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, marginBottom: 8 }}>Today's Status</h3>
                <div style={{ display: 'flex', gap: 20 }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Clock In</span>
                    <div style={{ fontSize: '1rem', fontWeight: 600 }}>{clockInTime}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Clock Out</span>
                    <div style={{ fontSize: '1rem', fontWeight: 600 }}>{clockOutTime}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Overtime</span>
                    <div style={{ fontSize: '1rem', fontWeight: 600 }}>{overtime}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Status</span>
                    <div style={{ marginTop: 4 }}>{currentStatus ? getStatusBadge(currentStatus) : <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.82rem' }}>Not marked</span>}</div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                {!myTodayRecord ? (
                  <button onClick={handleClockIn} style={{
                    padding: '12px 32px', borderRadius: 12, border: 'none', cursor: 'pointer',
                    fontSize: '0.9rem', fontWeight: 700, background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: 'white', boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                  }}>
                    ✓ Clock In
                  </button>
                ) : !myTodayRecord.clockOut ? (
                  <button onClick={handleClockOut} style={{
                    padding: '12px 32px', borderRadius: 12, border: 'none', cursor: 'pointer',
                    fontSize: '0.9rem', fontWeight: 700, background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white', boxShadow: '0 4px 12px rgba(239,68,68,0.3)',
                  }}>
                    ✕ Clock Out
                  </button>
                ) : (
                  <span style={{ padding: '12px 32px', borderRadius: 12, background: '#f1f5f9', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
                    Day Complete ✓
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Date Picker */}
          <div style={{ padding: '0 32px 16px' }}>
            <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, marginBottom: 4, display: 'block' }}>Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: '0.85rem', background: 'white', outline: 'none', minWidth: 160 }}
            />
          </div>

          {/* My Records */}
          <div style={{ margin: '0 32px', background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>My Attendance Records</h3>
            </div>
            {loading ? <Loading /> : records.length === 0 ? (
              <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>No records found</div>
            ) : (
              <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                {records.map((record) => (
                  <div key={record._id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', padding: '12px 20px', borderBottom: '1px solid #f1f5f9', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                      {record.clockIn ? new Date(record.clockIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                      {record.clockOut ? new Date(record.clockOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </div>
                    <div>{getStatusBadge(record.status)}</div>
                    <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                      {record.overtime ? `${record.overtime.toFixed(1)}h` : '-'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Admin/HR view - original code
  const getRecordForEmployee = (empId) => {
    return records.find(r => r.employee?._id === empId || r.employee === empId);
  };

  const filteredEmployees = useMemo(() => {
    let filtered = employees.filter(e => e.status === 'active');
    if (deptFilter) {
      filtered = filtered.filter(e => (e.department?._id || e.department) === deptFilter);
    }
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(e =>
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(s) ||
        e.employeeId?.toLowerCase().includes(s)
      );
    }
    return filtered;
  }, [employees, deptFilter, search]);

  const getAvatarColor = (status) => {
    const colors = { present: '#d1fae5', absent: '#fee2e2', late: '#fef3c7', 'on-leave': '#dbeafe' };
    return colors[status] || '#f3f4f6';
  };

  const getAvatarTextColor = (status) => {
    const colors = { present: '#059669', absent: '#dc2626', late: '#d97706', 'on-leave': '#2563eb' };
    return colors[status] || '#6b7280';
  };

  const handleQuickMark = async (empId, status) => {
    const existing = getRecordForEmployee(empId);
    try {
      if (existing) {
        const { updateAttendance: updAtt } = await import('../slices/attendanceSlice');
        await dispatch(updAtt({ id: existing._id, data: { status } })).unwrap();
      } else {
        const { createAttendance: createAtt } = await import('../slices/attendanceSlice');
        const newRecord = await dispatch(createAtt({ employee: empId, date: selectedDate, status })).unwrap();
      }
      toast.success(`Marked as ${status}!`);
    } catch (err) {
      toast.error(err || 'Failed');
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content" style={{ background: '#f8fafc' }}>
        <div style={{ padding: '24px 32px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Attendance Management</h1>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 4 }}>Track and manage employee attendance.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ width: 18, height: 18, position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
              </svg>
              <input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ padding: '10px 14px 10px 40px', border: '1px solid #e2e8f0', borderRadius: 10, width: 220, fontSize: '0.85rem', background: 'white', outline: 'none' }}
              />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, padding: '20px 32px' }}>
          <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: 14, padding: '18px 20px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><div style={{ fontSize: '0.8rem', opacity: 0.9, fontWeight: 500 }}>Present</div><div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.1 }}>{summaryStats.present || 0}</div></div>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>✓</div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', borderRadius: 14, padding: '18px 20px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><div style={{ fontSize: '0.8rem', opacity: 0.9, fontWeight: 500 }}>Absent</div><div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.1 }}>{summaryStats.absent || 0}</div></div>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>✕</div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', borderRadius: 14, padding: '18px 20px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><div style={{ fontSize: '0.8rem', opacity: 0.9, fontWeight: 500 }}>Late</div><div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.1 }}>{summaryStats.late || 0}</div></div>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>⏰</div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', borderRadius: 14, padding: '18px 20px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><div style={{ fontSize: '0.8rem', opacity: 0.9, fontWeight: 500 }}>On Leave</div><div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.1 }}>{summaryStats['on-leave'] || 0}</div></div>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🏖</div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ padding: '0 32px 16px', display: 'flex', gap: 12 }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, marginBottom: 4, display: 'block' }}>Select Date</label>
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
              style={{ padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: '0.85rem', background: 'white', outline: 'none', minWidth: 160 }} />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, marginBottom: 4, display: 'block' }}>Department</label>
            <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}
              style={{ padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: '0.85rem', background: 'white', outline: 'none', minWidth: 180 }}>
              <option value="">All Departments</option>
              {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>
        </div>

        {/* Daily Attendance Table */}
        <div style={{ margin: '0 32px', background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Daily Attendance - {new Date(selectedDate).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })}</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 2.2fr', padding: '12px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.78rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            <span>Employee</span><span>Department</span><span>Status</span><span style={{ textAlign: 'center' }}>Mark Attendance</span>
          </div>
          {loading ? <Loading /> : filteredEmployees.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center' }}><div style={{ fontSize: 48, marginBottom: 16 }}>👥</div><h3 style={{ color: '#64748b', fontWeight: 600 }}>No employees found</h3></div>
          ) : (
            <div style={{ maxHeight: 'calc(100vh - 340px)', overflowY: 'auto' }}>
              {filteredEmployees.map((emp) => {
                const record = getRecordForEmployee(emp._id);
                const currentStatus = record?.status || '';
                return (
                  <div key={emp._id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 2.2fr', padding: '12px 20px', borderBottom: '1px solid #f1f5f9', alignItems: 'center' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: getAvatarColor(currentStatus), color: getAvatarTextColor(currentStatus), display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
                        {emp.firstName?.[0]}{emp.lastName?.[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{emp.firstName} {emp.lastName}</div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{emp.employeeId}</div>
                      </div>
                    </div>
                    <div><span style={{ fontSize: '0.82rem', color: '#475569' }}>{emp.department?.name || 'N/A'}</span></div>
                    <div>{currentStatus ? getStatusBadge(currentStatus) : <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>Not marked</span>}</div>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                      <button onClick={() => handleQuickMark(emp._id, 'present')} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, background: currentStatus === 'present' ? '#059669' : '#d1fae5', color: currentStatus === 'present' ? 'white' : '#059669' }}>✓ Present</button>
                      <button onClick={() => handleQuickMark(emp._id, 'absent')} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, background: currentStatus === 'absent' ? '#dc2626' : '#fee2e2', color: currentStatus === 'absent' ? 'white' : '#dc2626' }}>✕ Absent</button>
                      <button onClick={() => handleQuickMark(emp._id, 'late')} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, background: currentStatus === 'late' ? '#d97706' : '#fef3c7', color: currentStatus === 'late' ? 'white' : '#d97706' }}>⏰ Late</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;
