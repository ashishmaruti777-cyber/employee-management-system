import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Sidebar from '../components/common/Sidebar';
import Loading from '../components/common/Loading';
import { fetchDepartments } from '../slices/departmentSlice';
import API from '../api/api';
import toast from 'react-hot-toast';

const Reports = () => {
  const dispatch = useDispatch();
  const { items: departments } = useSelector((state) => state.departments);
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => { dispatch(fetchDepartments()); }, [dispatch]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedDept) params.department = selectedDept;
      if (selectedMonth) params.month = selectedMonth;
      if (selectedYear) params.year = selectedYear;
      const { data } = await API.get('/reports/department', { params });
      setReport(data.data);
    } catch (err) {
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReport(); }, [selectedDept, selectedMonth, selectedYear]);

  const exportPDF = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedDept) params.append('department', selectedDept);
      if (selectedMonth) params.append('month', selectedMonth);
      if (selectedYear) params.append('year', selectedYear);
      const { data } = await API.get(`/reports/export/pdf?${params.toString()}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `department-report-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF downloaded!');
    } catch (err) {
      toast.error('PDF export failed');
    }
  };

  const exportExcel = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedDept) params.append('department', selectedDept);
      if (selectedMonth) params.append('month', selectedMonth);
      if (selectedYear) params.append('year', selectedYear);
      const { data } = await API.get(`/reports/export/excel?${params.toString()}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `department-report-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Excel downloaded!');
    } catch (err) {
      toast.error('Excel export failed');
    }
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const years = [2024, 2025, 2026, 2027];

  const totalEmployees = report.reduce((s, r) => s + r.employees.total, 0);
  const totalActive = report.reduce((s, r) => s + r.employees.active, 0);
  const totalSalary = report.reduce((s, r) => s + r.payroll.totalSalary, 0);
  const totalPaid = report.reduce((s, r) => s + r.payroll.totalPaid, 0);
  const totalPending = report.reduce((s, r) => s + r.payroll.totalPending, 0);
  const avgAttendance = report.length > 0 ? (report.reduce((s, r) => s + parseFloat(r.attendance.attendanceRate || 0), 0) / report.length).toFixed(1) : 0;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <h1>Reports</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-outline" onClick={exportPDF}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16, marginRight: 4, verticalAlign: 'middle' }}>
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
              </svg>
              Export PDF
            </button>
            <button className="btn btn-primary" onClick={exportExcel}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16, marginRight: 4, verticalAlign: 'middle' }}>
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
              </svg>
              Export Excel
            </button>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ marginBottom: 0, minWidth: 200 }}>
              <label>Department</label>
              <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
                <option value="">All Departments</option>
                {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0, minWidth: 120 }}>
              <label>Month</label>
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0, minWidth: 100 }}>
              <label>Year</label>
              <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
          {[
            { label: 'Departments', value: report.length, color: '#4f46e5' },
            { label: 'Total Employees', value: totalEmployees, color: '#10b981' },
            { label: 'Active', value: totalActive, color: '#22c55e' },
            { label: 'Avg Attendance', value: `${avgAttendance}%`, color: '#f59e0b' },
            { label: 'Total Salary', value: `$${totalSalary.toLocaleString()}`, color: '#8b5cf6' },
            { label: 'Paid', value: `$${totalPaid.toLocaleString()}`, color: '#10b981' },
            { label: 'Pending', value: `$${totalPending.toLocaleString()}`, color: '#ef4444' },
          ].map((s) => (
            <div key={s.label} className="card" style={{ borderTop: `3px solid ${s.color}`, textAlign: 'center', padding: 16 }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 4 }}>{s.label}</p>
              <p style={{ fontSize: '1.3rem', fontWeight: 700, color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {loading ? <Loading /> : report.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>No data found</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {report.map((r) => (
              <div key={r.department._id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{r.department.name}</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Code: {r.department.code} | Budget: ${(r.department.budget || 0).toLocaleString()}</span>
                  </div>
                  <span className="badge badge-success">{r.employees.active} Active</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
                  <div style={{ background: 'var(--bg)', padding: 12, borderRadius: 8 }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: 2 }}>Employees</p>
                    <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{r.employees.total}</p>
                  </div>
                  <div style={{ background: 'var(--bg)', padding: 12, borderRadius: 8 }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: 2 }}>Attendance Rate</p>
                    <p style={{ fontSize: '1.1rem', fontWeight: 600, color: parseFloat(r.attendance.attendanceRate) >= 80 ? '#10b981' : '#ef4444' }}>{r.attendance.attendanceRate}%</p>
                  </div>
                  <div style={{ background: 'var(--bg)', padding: 12, borderRadius: 8 }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: 2 }}>Total Salary</p>
                    <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>${r.payroll.totalSalary.toLocaleString()}</p>
                  </div>
                  <div style={{ background: 'var(--bg)', padding: 12, borderRadius: 8 }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: 2 }}>Paid / Pending</p>
                    <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                      <span style={{ color: '#10b981' }}>${r.payroll.totalPaid.toLocaleString()}</span>
                      {' / '}
                      <span style={{ color: '#ef4444' }}>${r.payroll.totalPending.toLocaleString()}</span>
                    </p>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>EMPLOYEES</p>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                          <th style={{ textAlign: 'left', padding: '6px 8px' }}>ID</th>
                          <th style={{ textAlign: 'left', padding: '6px 8px' }}>Name</th>
                          <th style={{ textAlign: 'left', padding: '6px 8px' }}>Position</th>
                          <th style={{ textAlign: 'right', padding: '6px 8px' }}>Salary</th>
                          <th style={{ textAlign: 'center', padding: '6px 8px' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {r.employees.list.slice(0, 5).map((emp) => (
                          <tr key={emp._id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '6px 8px' }}>{emp.employeeId}</td>
                            <td style={{ padding: '6px 8px' }}>{emp.name}</td>
                            <td style={{ padding: '6px 8px' }}>{emp.position}</td>
                            <td style={{ padding: '6px 8px', textAlign: 'right' }}>${(emp.salary || 0).toLocaleString()}</td>
                            <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                              <span className={`badge badge-${emp.status === 'active' ? 'success' : 'danger'}`}>{emp.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {r.employees.list.length > 5 && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: 8 }}>
                        +{r.employees.list.length - 5} more employees
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
