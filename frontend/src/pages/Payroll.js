import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Sidebar from '../components/common/Sidebar';
import Modal from '../components/common/Modal';
import Pagination from '../components/common/Pagination';
import Loading from '../components/common/Loading';
import { DepartmentExpenseChart } from '../components/charts/Charts';
import { fetchPayrolls, createPayroll, processPayroll, markPaid } from '../slices/payrollSlice';
import { fetchEmployees } from '../slices/employeeSlice';
import toast from 'react-hot-toast';

const Payroll = () => {
  const dispatch = useDispatch();
  const { items: payrolls, pagination, loading } = useSelector((state) => state.payroll);
  const { items: employees } = useSelector((state) => state.employees);
  const [page, setPage] = useState(1);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    employee: '', basicSalary: '', allowanceHousing: '', allowanceTransport: '',
    allowanceMedical: '', deductionTax: '', deductionInsurance: '', overtime: '', bonus: ''
  });

  useEffect(() => {
    dispatch(fetchPayrolls({ page, limit: 10, month, year }));
    dispatch(fetchEmployees({ limit: 100 }));
  }, [dispatch, page, month, year]);

  const summaryStats = useMemo(() => {
    const totalBasic = payrolls.reduce((sum, p) => sum + (p.basicSalary || 0), 0);
    const totalAllowances = payrolls.reduce((sum, p) => sum + Object.values(p.allowances || {}).reduce((a, b) => a + b, 0), 0);
    const totalDeductions = payrolls.reduce((sum, p) => sum + Object.values(p.deductions || {}).reduce((a, b) => a + b, 0), 0);
    const totalNet = payrolls.reduce((sum, p) => sum + (p.netSalary || 0), 0);
    const paidCount = payrolls.filter(p => p.status === 'paid').length;
    const pendingCount = payrolls.filter(p => p.status === 'pending').length;
    return { totalBasic, totalAllowances, totalDeductions, totalNet, paidCount, pendingCount };
  }, [payrolls]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.employee || !form.basicSalary) { toast.error('Employee and salary required'); return; }
    const payrollData = {
      employee: form.employee, month, year, basicSalary: Number(form.basicSalary),
      allowances: {
        housing: Number(form.allowanceHousing || 0),
        transport: Number(form.allowanceTransport || 0),
        medical: Number(form.allowanceMedical || 0), other: 0
      },
      deductions: {
        tax: Number(form.deductionTax || 0),
        insurance: Number(form.deductionInsurance || 0), loan: 0, other: 0
      },
      overtime: Number(form.overtime || 0), bonus: Number(form.bonus || 0),
    };
    try {
      await dispatch(createPayroll(payrollData)).unwrap();
      toast.success('Payroll created!');
      setShowModal(false);
      setForm({ employee: '', basicSalary: '', allowanceHousing: '', allowanceTransport: '', allowanceMedical: '', deductionTax: '', deductionInsurance: '', overtime: '', bonus: '' });
    } catch (err) { toast.error(err || 'Failed'); }
  };

  const handleProcess = async (id) => { await dispatch(processPayroll(id)); toast.success('Processed!'); };
  const handlePay = async (id) => { await dispatch(markPaid(id)); toast.success('Marked as paid!'); };

  const statusColors = { pending: 'warning', processed: 'info', paid: 'success' };
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const summaryCards = [
    { label: 'Total Payroll', value: `$${summaryStats.totalNet.toLocaleString()}`, color: '#4f46e5', bg: 'linear-gradient(135deg, #eef2ff, #e0e7ff)' },
    { label: 'Total Allowances', value: `+$${summaryStats.totalAllowances.toLocaleString()}`, color: '#10b981', bg: 'linear-gradient(135deg, #d1fae5, #a7f3d0)' },
    { label: 'Total Deductions', value: `-$${summaryStats.totalDeductions.toLocaleString()}`, color: '#ef4444', bg: 'linear-gradient(135deg, #fee2e2, #fecaca)' },
    { label: 'Paid / Pending', value: `${summaryStats.paidCount} / ${summaryStats.pendingCount}`, color: '#f59e0b', bg: 'linear-gradient(135deg, #fef3c7, #fde68a)' },
  ];

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div>
            <h1>Payroll</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 2 }}>Manage employee salaries and payments</p>
          </div>
          <div className="topbar-actions">
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Create Payroll
            </button>
          </div>
        </div>

        <div className="stats-grid" style={{ marginBottom: 24 }}>
          {summaryCards.map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-icon" style={{ background: s.bg }}>
                <svg viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth="1.5" style={{ width: 24, height: 24 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="charts-grid" style={{ marginBottom: 24 }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-light)' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Department Expenses</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>Monthly salary distribution by department</p>
            </div>
            <div style={{ padding: 20 }}>
              <DepartmentExpenseChart month={month} year={year} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Payroll Records</h3>
            <div className="filter-bar" style={{ marginBottom: 0 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <select value={month} onChange={(e) => { setMonth(Number(e.target.value)); setPage(1); }}>
                  {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <select value={year} onChange={(e) => { setYear(Number(e.target.value)); setPage(1); }}>
                  {[2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <Loading />
          ) : payrolls.length === 0 ? (
            <div className="empty-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 48, height: 48, margin: '0 auto 16px', opacity: 0.4, color: 'var(--text-muted)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3>No payroll records found</h3>
              <p>Create a new payroll record to get started</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Period</th>
                    <th>Basic Salary</th>
                    <th>Allowances</th>
                    <th>Deductions</th>
                    <th>Net Salary</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payrolls.map((p) => {
                    const totalAllow = Object.values(p.allowances || {}).reduce((a, b) => a + b, 0);
                    const totalDed = Object.values(p.deductions || {}).reduce((a, b) => a + b, 0);
                    return (
                      <tr key={p._id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="avatar">
                              {p.employee?.firstName?.[0]}{p.employee?.lastName?.[0]}
                            </div>
                            <span style={{ fontWeight: 500 }}>{p.employee?.firstName} {p.employee?.lastName}</span>
                          </div>
                        </td>
                        <td>
                          <span style={{ color: 'var(--text-secondary)' }}>
                            {months[p.month - 1]} {p.year}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 500 }}>
                            ${p.basicSalary?.toLocaleString()}
                          </span>
                        </td>
                        <td>
                          <span style={{ color: 'var(--success)', fontWeight: 500 }}>
                            +${totalAllow.toLocaleString()}
                          </span>
                        </td>
                        <td>
                          <span style={{ color: 'var(--danger)', fontWeight: 500 }}>
                            -${totalDed.toLocaleString()}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, color: 'var(--text)' }}>
                            ${p.netSalary?.toLocaleString()}
                          </span>
                        </td>
                        <td>
                          <span className={`badge badge-${statusColors[p.status]}`}>
                            {p.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {p.status === 'pending' && (
                              <button className="btn btn-sm btn-outline" onClick={() => handleProcess(p._id)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                                Process
                              </button>
                            )}
                            {p.status === 'processed' && (
                              <button className="btn btn-sm btn-success" onClick={() => handlePay(p._id)}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
                                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                                </svg>
                                Pay
                              </button>
                            )}
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

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create Payroll"
        footer={
          <>
            <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleCreate}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Create
            </button>
          </>
        }
      >
        <div className="form-group">
          <label>Employee *</label>
          <select
            value={form.employee}
            onChange={(e) => {
              const emp = employees.find((em) => em._id === e.target.value);
              setForm({ ...form, employee: e.target.value, basicSalary: emp?.salary || '' });
            }}
          >
            <option value="">Select employee</option>
            {employees.map((e) => (
              <option key={e._id} value={e._id}>{e.firstName} {e.lastName}</option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Basic Salary *</label>
            <input type="number" value={form.basicSalary} onChange={(e) => setForm({ ...form, basicSalary: e.target.value })} placeholder="0.00" />
          </div>
          <div className="form-group">
            <label>Overtime</label>
            <input type="number" value={form.overtime} onChange={(e) => setForm({ ...form, overtime: e.target.value })} placeholder="0.00" />
          </div>
        </div>

        <div style={{ marginTop: 8, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{ width: 4, height: 16, background: 'var(--success)', borderRadius: 2 }}></div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>Allowances</h4>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Housing</label>
              <input type="number" value={form.allowanceHousing} onChange={(e) => setForm({ ...form, allowanceHousing: e.target.value })} placeholder="0.00" />
            </div>
            <div className="form-group">
              <label>Transport</label>
              <input type="number" value={form.allowanceTransport} onChange={(e) => setForm({ ...form, allowanceTransport: e.target.value })} placeholder="0.00" />
            </div>
            <div className="form-group">
              <label>Medical</label>
              <input type="number" value={form.allowanceMedical} onChange={(e) => setForm({ ...form, allowanceMedical: e.target.value })} placeholder="0.00" />
            </div>
          </div>
        </div>

        <div style={{ marginTop: 8, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{ width: 4, height: 16, background: 'var(--danger)', borderRadius: 2 }}></div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>Deductions</h4>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Tax</label>
              <input type="number" value={form.deductionTax} onChange={(e) => setForm({ ...form, deductionTax: e.target.value })} placeholder="0.00" />
            </div>
            <div className="form-group">
              <label>Insurance</label>
              <input type="number" value={form.deductionInsurance} onChange={(e) => setForm({ ...form, deductionInsurance: e.target.value })} placeholder="0.00" />
            </div>
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Bonus</label>
          <input type="number" value={form.bonus} onChange={(e) => setForm({ ...form, bonus: e.target.value })} placeholder="0.00" />
        </div>
      </Modal>
    </div>
  );
};

export default Payroll;
