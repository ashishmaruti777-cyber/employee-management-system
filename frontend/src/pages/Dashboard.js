import React, { useEffect, useState, useCallback } from 'react';
import Sidebar from '../components/common/Sidebar';
import Loading from '../components/common/Loading';
import { AttendancePieChart, MonthlySalaryChart } from '../components/charts/Charts';
import { chartAPI } from '../api/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchData = useCallback(async () => {
    try {
      const statsRes = await chartAPI.getDashboard();
      setStats(statsRes.data.data);
      setLastRefresh(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { const t = setInterval(() => setCurrentTime(new Date()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => { if (!autoRefresh) return; const i = setInterval(fetchData, 60000); return () => clearInterval(i); }, [autoRefresh, fetchData]);

  if (loading) return <div className="app-layout"><Sidebar /><div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loading /></div></div>;

  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const presentPct = stats?.todayTotal > 0 ? Math.round((stats.todayPresent / stats.todayTotal) * 100) : 0;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <div className="topbar">
          <div>
            <h1>Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: 1 }}>Welcome back! Here's what's happening today.</p>
          </div>
          <div className="topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', background: 'var(--card-bg)', padding: '5px 10px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              {dayName}, {dateStr}
            </span>
            <span style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 700, background: 'var(--card-bg)', padding: '5px 10px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', fontVariantNumeric: 'tabular-nums' }}>
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <button onClick={() => setAutoRefresh(!autoRefresh)} className="btn btn-sm" style={{ background: autoRefresh ? 'var(--success)' : 'var(--card-bg)', color: autoRefresh ? '#fff' : 'var(--text)', border: '1px solid var(--border)' }}>
              {autoRefresh ? 'Auto ON' : 'Auto OFF'}
            </button>
            <button onClick={fetchData} className="btn btn-sm btn-outline">Refresh</button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10, fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }}></span>
          Live updated {lastRefresh.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>

        <div className="stats-grid">
          {[
            { label: 'Total Employees', value: stats?.totalEmployees || 0, bg: 'linear-gradient(135deg, #eef2ff, #e0e7ff)', color: '#4f46e5', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', sub: stats?.totalDepartments + ' depts' },
            { label: "Present", value: stats?.todayPresent || 0, bg: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', color: '#059669', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', sub: presentPct + '% rate', trend: presentPct + '%', trendUp: presentPct >= 80 },
            { label: "Absent", value: stats?.todayAbsent || 0, bg: 'linear-gradient(135deg, #fee2e2, #fecaca)', color: '#dc2626', icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z', sub: 'of ' + (stats?.todayTotal || 0) },
            { label: 'Late', value: stats?.todayLate || 0, bg: 'linear-gradient(135deg, #fef3c7, #fde68a)', color: '#d97706', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', sub: 'late' },
            { label: 'On Leave', value: stats?.todayOnLeave || 0, bg: 'linear-gradient(135deg, #ede9fe, #ddd6fe)', color: '#7c3aed', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', sub: 'leave' },
            { label: 'Expense', value: '$' + (stats?.monthlyExpense || 0).toLocaleString(), bg: 'linear-gradient(135deg, #fef3c7, #fde68a)', color: '#d97706', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', sub: 'this month' },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-icon" style={{ background: s.bg }}>
                <svg viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={s.icon} /></svg>
              </div>
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
              {s.sub && <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: 2 }}>{s.sub}</div>}
              {s.trend && (
                <div style={{ marginTop: 4, fontSize: '0.65rem', fontWeight: 600, color: s.trendUp ? 'var(--success)' : 'var(--danger)' }}>
                  {s.trendUp ? '\u2191' : '\u2193'} {s.trend}
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '0.82rem', fontWeight: 600 }}>Attendance Overview</h3>
                  <p style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: 1 }}>Today's breakdown</p>
                </div>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{dayName}</span>
              </div>
              <div style={{ padding: 10 }}>
                <AttendancePieChart present={stats?.todayPresent || 0} absent={stats?.todayAbsent || 0} late={stats?.todayLate || 0} onLeave={stats?.todayOnLeave || 0} />
              </div>
            </div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-light)' }}>
                <h3 style={{ fontSize: '0.82rem', fontWeight: 600 }}>Monthly Salary Expense</h3>
              </div>
              <div style={{ padding: 10 }}>
                <MonthlySalaryChart />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-light)' }}>
                <h3 style={{ fontSize: '0.82rem', fontWeight: 600 }}>Department Breakdown</h3>
              </div>
              <div style={{ padding: 10 }}>
                {(stats?.deptStats || []).length === 0 ? (
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textAlign: 'center', padding: 12 }}>No data</p>
                ) : (
                  (stats?.deptStats || []).map((d, i) => {
                    const maxCount = Math.max(...(stats?.deptStats || []).map(x => x.count), 1);
                    const pct = Math.round((d.count / maxCount) * 100);
                    const colors = ['#4f46e5', '#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#ec4899', '#06b6d4'];
                    const color = colors[i % colors.length];
                    return (
                      <div key={i} style={{ marginBottom: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 500 }}>{d._id || 'Unassigned'}</span>
                          <span style={{ fontSize: '0.68rem', fontWeight: 600, color }}>{d.count}</span>
                        </div>
                        <div style={{ height: 4, background: 'var(--border-light)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: pct + '%', background: color, borderRadius: 2, transition: 'width 0.6s ease' }}></div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-light)' }}>
                <h3 style={{ fontSize: '0.82rem', fontWeight: 600 }}>Recent Activity</h3>
              </div>
              <div style={{ padding: 8, maxHeight: 180, overflowY: 'auto' }}>
                {(stats?.recentActivity || []).length === 0 ? (
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textAlign: 'center', padding: 12 }}>No activity</p>
                ) : (
                  (stats?.recentActivity || []).map((a, i) => {
                    const sc = { present: '#059669', absent: '#dc2626', late: '#d97706', 'on-leave': '#7c3aed' };
                    const sb = { present: '#d1fae5', absent: '#fee2e2', late: '#fef3c7', 'on-leave': '#ede9fe' };
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 0', borderBottom: i < stats.recentActivity.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.58rem', fontWeight: 700, color: '#4f46e5', flexShrink: 0 }}>
                          {a.name ? a.name.split(' ').map(function(n){ return n[0]; }).join('').slice(0, 2) : '??'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.72rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.name}</div>
                          <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)' }}>{a.department} - {a.time}</div>
                        </div>
                        <span style={{ fontSize: '0.58rem', fontWeight: 600, padding: '1px 5px', borderRadius: 6, background: sb[a.status] || '#f3f4f6', color: sc[a.status] || '#6b7280', textTransform: 'capitalize', flexShrink: 0 }}>
                          {a.status}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-light)' }}>
                <h3 style={{ fontSize: '0.82rem', fontWeight: 600 }}>Recently Added</h3>
              </div>
              <div style={{ padding: 8, maxHeight: 140, overflowY: 'auto' }}>
                {(stats?.recentEmployees || []).map((emp, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 0', borderBottom: i < (stats.recentEmployees?.length || 0) - 1 ? '1px solid var(--border-light)' : 'none' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.58rem', fontWeight: 700, color: '#4f46e5', flexShrink: 0 }}>
                      {emp.firstName?.[0]}{emp.lastName?.[0]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{emp.firstName} {emp.lastName}</div>
                      <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)' }}>{emp.position || emp.employeeId}</div>
                    </div>
                    <span style={{ fontSize: '0.58rem', fontWeight: 600, padding: '1px 5px', borderRadius: 6, background: emp.status === 'active' ? '#d1fae5' : '#fee2e2', color: emp.status === 'active' ? '#059669' : '#dc2626', textTransform: 'capitalize', flexShrink: 0 }}>
                      {emp.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
