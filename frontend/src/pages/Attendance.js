import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Sidebar from '../components/common/Sidebar';
import Loading from '../components/common/Loading';
import { fetchAttendance, createAttendance, updateAttendance, fetchAttendanceSummary } from '../slices/attendanceSlice';
import { fetchEmployees } from '../slices/employeeSlice';
import { fetchDepartments } from '../slices/departmentSlice';
import toast from 'react-hot-toast';

const Attendance = () => {
  const dispatch = useDispatch();
  const { items: records, loading, summary } = useSelector((state) => state.attendance);
  const { items: employees } = useSelector((state) => state.employees);
  const { items: departments } = useSelector((state) => state.departments);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [deptFilter, setDeptFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(fetchAttendance({ page: 1, limit: 500, startDate: selectedDate, endDate: selectedDate }));
    dispatch(fetchEmployees({ limit: 200 }));
    dispatch(fetchDepartments());
    dispatch(fetchAttendanceSummary({ startDate: selectedDate, endDate: selectedDate }));
  }, [dispatch, selectedDate]);

  const summaryStats = useMemo(() => {
    if (!summary) return { present: 0, absent: 0, late: 0, 'on-leave': 0 };
    return summary;
  }, [summary]);

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

  const handleQuickMark = async (empId, status) => {
    const existing = getRecordForEmployee(empId);
    try {
      if (existing) {
        await dispatch(updateAttendance({ id: existing._id, data: { status } })).unwrap();
      } else {
        await dispatch(createAttendance({ employee: empId, date: selectedDate, status })).unwrap();
      }
      toast.success(`Marked as ${status}!`);
      dispatch(fetchAttendance({ page: 1, limit: 500, startDate: selectedDate, endDate: selectedDate }));
      dispatch(fetchAttendanceSummary({ startDate: selectedDate, endDate: selectedDate }));
    } catch (err) {
      toast.error(err || 'Failed');
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

  const getAvatarColor = (status) => {
    const colors = { present: '#d1fae5', absent: '#fee2e2', late: '#fef3c7', 'on-leave': '#dbeafe' };
    return colors[status] || '#f3f4f6';
  };

  const getAvatarTextColor = (status) => {
    const colors = { present: '#059669', absent: '#dc2626', late: '#d97706', 'on-leave': '#2563eb' };
    return colors[status] || '#6b7280';
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content" style={{ background: '#f8fafc' }}>
        {/* Header */}
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
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" style={{ width: 20, height: 20 }}>
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', background: '#ef4444', color: 'white', fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>3</span>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" style={{ width: 20, height: 20 }}>
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, padding: '20px 32px' }}>
          <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: 14, padding: '18px 20px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.8rem', opacity: 0.9, fontWeight: 500 }}>Present</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.1 }}>{summaryStats.present || 0}</div>
            </div>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>✓</div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', borderRadius: 14, padding: '18px 20px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.8rem', opacity: 0.9, fontWeight: 500 }}>Absent</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.1 }}>{summaryStats.absent || 0}</div>
            </div>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>✕</div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', borderRadius: 14, padding: '18px 20px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.8rem', opacity: 0.9, fontWeight: 500 }}>Late</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.1 }}>{summaryStats.late || 0}</div>
            </div>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>⏰</div>
          </div>
          <div style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', borderRadius: 14, padding: '18px 20px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.8rem', opacity: 0.9, fontWeight: 500 }}>On Leave</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.1 }}>{summaryStats['on-leave'] || 0}</div>
            </div>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🏖</div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ padding: '0 32px 16px', display: 'flex', gap: 12 }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, marginBottom: 4, display: 'block' }}>Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: '0.85rem', background: 'white', outline: 'none', minWidth: 160 }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, marginBottom: 4, display: 'block' }}>Department</label>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              style={{ padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: '0.85rem', background: 'white', outline: 'none', minWidth: 180 }}
            >
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

          {/* Table Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 2.2fr', padding: '12px 20px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '0.78rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            <span>Employee</span>
            <span>Department</span>
            <span>Status</span>
            <span style={{ textAlign: 'center' }}>Mark Attendance</span>
          </div>

          {loading ? (
            <Loading />
          ) : filteredEmployees.length === 0 ? (
            <div style={{ padding: 60, textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
              <h3 style={{ color: '#64748b', fontWeight: 600 }}>No employees found</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Try adjusting your filters.</p>
            </div>
          ) : (
            <div style={{ maxHeight: 'calc(100vh - 340px)', overflowY: 'auto' }}>
              {filteredEmployees.map((emp) => {
                const record = getRecordForEmployee(emp._id);
                const currentStatus = record?.status || '';
                return (
                  <div
                    key={emp._id}
                    style={{
                      display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 2.2fr',
                      padding: '12px 20px', borderBottom: '1px solid #f1f5f9',
                      alignItems: 'center', transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                  >
                    {/* Employee */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: getAvatarColor(currentStatus),
                        color: getAvatarTextColor(currentStatus),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '0.8rem',
                      }}>
                        {emp.firstName?.[0]}{emp.lastName?.[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1e293b' }}>{emp.firstName} {emp.lastName}</div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{emp.employeeId}</div>
                      </div>
                    </div>

                    {/* Department */}
                    <div>
                      <span style={{ fontSize: '0.82rem', color: '#475569' }}>
                        {emp.department?.name || 'N/A'}
                      </span>
                    </div>

                    {/* Status */}
                    <div>
                      {currentStatus ? getStatusBadge(currentStatus) : (
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>Not marked</span>
                      )}
                    </div>

                    {/* Mark Buttons */}
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                      <button
                        onClick={() => handleQuickMark(emp._id, 'present')}
                        style={{
                          padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                          fontSize: '0.75rem', fontWeight: 600,
                          background: currentStatus === 'present' ? '#059669' : '#d1fae5',
                          color: currentStatus === 'present' ? 'white' : '#059669',
                          transition: 'all 0.15s',
                        }}
                      >
                        ✓ Present
                      </button>
                      <button
                        onClick={() => handleQuickMark(emp._id, 'absent')}
                        style={{
                          padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                          fontSize: '0.75rem', fontWeight: 600,
                          background: currentStatus === 'absent' ? '#dc2626' : '#fee2e2',
                          color: currentStatus === 'absent' ? 'white' : '#dc2626',
                          transition: 'all 0.15s',
                        }}
                      >
                        ✕ Absent
                      </button>
                      <button
                        onClick={() => handleQuickMark(emp._id, 'late')}
                        style={{
                          padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                          fontSize: '0.75rem', fontWeight: 600,
                          background: currentStatus === 'late' ? '#d97706' : '#fef3c7',
                          color: currentStatus === 'late' ? 'white' : '#d97706',
                          transition: 'all 0.15s',
                        }}
                      >
                        ⏰ Late
                      </button>
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
