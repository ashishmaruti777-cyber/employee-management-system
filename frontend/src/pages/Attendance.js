import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Sidebar from '../components/common/Sidebar';
import Modal from '../components/common/Modal';
import Pagination from '../components/common/Pagination';
import Loading from '../components/common/Loading';
import { AttendanceTrendChart } from '../components/charts/Charts';
import { fetchAttendance, createAttendance } from '../slices/attendanceSlice';
import { fetchEmployees } from '../slices/employeeSlice';
import toast from 'react-hot-toast';

const statusOptions = [
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'late', label: 'Late' },
  { value: 'half-day', label: 'Half Day' },
  { value: 'on-leave', label: 'On Leave' },
];

const statusColorMap = {
  present: 'success',
  absent: 'danger',
  'half-day': 'warning',
  late: 'warning',
  'on-leave': 'info',
  holiday: 'secondary',
};

const emptyForm = { employee: '', date: '', status: 'present', notes: '' };

const Attendance = () => {
  const dispatch = useDispatch();
  const { items: records, pagination, loading } = useSelector((state) => state.attendance);
  const { items: employees } = useSelector((state) => state.employees);
  const [page, setPage] = useState(1);
  const [empFilter, setEmpFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    dispatch(fetchAttendance({ page, limit: 10, employee: empFilter, status: statusFilter }));
    dispatch(fetchEmployees({ limit: 100 }));
  }, [dispatch, page, empFilter, statusFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.employee || !form.date) {
      toast.error('Employee and date are required');
      return;
    }
    try {
      await dispatch(createAttendance(form)).unwrap();
      toast.success('Attendance recorded!');
      setShowModal(false);
      setForm(emptyForm);
    } catch (err) {
      toast.error(err || 'Failed');
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div>
            <h1>Attendance</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 2 }}>
              Track and manage employee attendance records
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setShowModal(true); }}>
            + Record Attendance
          </button>
        </div>

        <div className="charts-grid" style={{ marginBottom: 24 }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-light)' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Attendance Trend</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                Monthly attendance overview
              </p>
            </div>
            <div style={{ padding: 20 }}>
              <AttendanceTrendChart month={month} year={year} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="filter-bar">
            <select value={empFilter} onChange={(e) => { setEmpFilter(e.target.value); setPage(1); }}>
              <option value="">All Employees</option>
              {employees.map((e) => (
                <option key={e._id} value={e._id}>{e.firstName} {e.lastName}</option>
              ))}
            </select>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">All Status</option>
              {statusOptions.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <Loading />
          ) : records.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 48, height: 48, margin: '0 auto 16px' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <h3>No Attendance Records Found</h3>
              <p>Start tracking attendance by recording entries for your employees.</p>
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
                    <th>Status</th>
                    <th>Overtime</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="avatar">
                            {r.employee?.firstName?.[0]}{r.employee?.lastName?.[0]}
                          </div>
                          <span>{r.employee?.firstName} {r.employee?.lastName}</span>
                        </div>
                      </td>
                      <td>{new Date(r.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</td>
                      <td>{r.clockIn ? new Date(r.clockIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                      <td>{r.clockOut ? new Date(r.clockOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                      <td>
                        <span className={`badge badge-${statusColorMap[r.status]}`}>
                          {r.status}
                        </span>
                      </td>
                      <td>
                        {r.overtime ? (
                          <span style={{ fontWeight: 500 }}>{r.overtime.toFixed(1)}h</span>
                        ) : '-'}
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

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Record Attendance"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleCreate}>Save</button>
          </>
        }
      >
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label>Employee *</label>
            <select value={form.employee} onChange={(e) => setForm({ ...form, employee: e.target.value })}>
              <option value="">Select Employee</option>
              {employees.map((e) => (
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
            <textarea
              rows={3}
              placeholder="Add any additional notes..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Attendance;
