import React, { useEffect, useState } from 'react';
import Sidebar from '../components/common/Sidebar';
import Loading from '../components/common/Loading';
import { EmployeeGrowthChart, MonthlySalaryChart } from '../components/charts/Charts';
import { chartAPI } from '../api/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chartAPI.getDashboard().then((r) => { setStats(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="app-layout"><Sidebar /><div className="main-content"><Loading /></div></div>;

  const statCards = [
    { label: 'Total Employees', value: stats?.totalEmployees || 0, bg: 'linear-gradient(135deg, #eef2ff, #e0e7ff)', color: '#4f46e5', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', trend: '+12%', trendUp: true },
    { label: 'Departments', value: stats?.totalDepartments || 0, bg: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', color: '#2563eb', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { label: "Today's Attendance", value: stats?.todayAttendance || 0, bg: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', color: '#059669', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4', trend: 'On Track', trendUp: true },
    { label: 'Monthly Expense', value: `$${(stats?.monthlyExpense || 0).toLocaleString()}`, bg: 'linear-gradient(135deg, #fef3c7, #fde68a)', color: '#d97706', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  ];

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div>
            <h1>Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 2 }}>Welcome back! Here's what's happening today.</p>
          </div>
          <div className="topbar-actions">
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', background: 'var(--card-bg)', padding: '8px 16px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>

        <div className="stats-grid">
          {statCards.map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-icon" style={{ background: s.bg }}>
                <svg viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth={1.5} style={{ width: 24, height: 24 }}><path strokeLinecap="round" strokeLinejoin="round" d={s.icon} /></svg>
              </div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
              {s.trend && (
                <div style={{ marginTop: 8, fontSize: '0.72rem', fontWeight: 600, color: s.trendUp ? 'var(--success)' : 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  {s.trendUp ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 12, height: 12 }}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 12, height: 12 }}><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /></svg>
                  )}
                  {s.trend}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="charts-grid">
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-light)' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Employee Growth</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>Monthly employee count</p>
            </div>
            <div style={{ padding: 20 }}>
              <EmployeeGrowthChart />
            </div>
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-light)' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Monthly Salary</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>Salary expense overview</p>
            </div>
            <div style={{ padding: 20 }}>
              <MonthlySalaryChart />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
