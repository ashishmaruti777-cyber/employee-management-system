import React, { useEffect, useState } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { chartAPI } from '../../api/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export const EmployeeGrowthChart = () => {
  const [data, setData] = useState([]);
  useEffect(() => { chartAPI.getEmployeeGrowth({ year: new Date().getFullYear() }).then((r) => setData(r.data.data)); }, []);

  return (
    <div className="card">
      <div className="card-header"><h3>Employee Growth</h3></div>
      <Bar data={{
        labels: data.map((d) => d.label),
        datasets: [{ label: 'New Employees', data: data.map((d) => d.count), backgroundColor: 'rgba(79,70,229,0.8)', borderRadius: 6 }]
      }} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }} />
    </div>
  );
};

export const MonthlySalaryChart = () => {
  const [data, setData] = useState([]);
  useEffect(() => { chartAPI.getMonthlySalary({ year: new Date().getFullYear() }).then((r) => setData(r.data.data)); }, []);

  return (
    <div className="card">
      <div className="card-header"><h3>Monthly Salary Expense</h3></div>
      <Bar data={{
        labels: data.map((d) => d.label),
        datasets: [{ label: 'Expense ($)', data: data.map((d) => d.expense), backgroundColor: 'rgba(16,185,129,0.8)', borderRadius: 6 }]
      }} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
    </div>
  );
};

export const DepartmentExpenseChart = ({ month, year }) => {
  const [data, setData] = useState([]);
  useEffect(() => {
    if (month && year) {
      chartAPI.getDepartmentExpense({ month, year }).then((r) => setData(r.data.data));
    }
  }, [month, year]);

  const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <div className="card">
      <div className="card-header"><h3>Department Expense</h3></div>
      {data.length > 0 ? (
        <Doughnut data={{
          labels: data.map((d) => d.department),
          datasets: [{ data: data.map((d) => d.expense), backgroundColor: colors.slice(0, data.length), borderWidth: 0 }]
        }} options={{ responsive: true, plugins: { legend: { position: 'right' } }, cutout: '60%' }} />
      ) : <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>Select month and year to view data</p>}
    </div>
  );
};

export const AttendancePieChart = ({ present, absent, late, onLeave }) => {
  const total = present + absent + late + onLeave;
  const data = {
    labels: ['Present', 'Absent', 'Late', 'On Leave'],
    datasets: [{
      data: [present, absent, late, onLeave],
      backgroundColor: ['#10b981', '#ef4444', '#f59e0b', '#8b5cf6'],
      borderWidth: 3,
      borderColor: '#ffffff',
      hoverOffset: 8,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '55%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { padding: 16, usePointStyle: true, pointStyleWidth: 10, font: { size: 12, weight: 500 } },
      },
      tooltip: {
        callbacks: {
          label: function(ctx) {
            const val = ctx.parsed;
            const pct = total > 0 ? Math.round((val / total) * 100) : 0;
            return ` ${ctx.label}: ${val} (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <div style={{ height: 280, position: 'relative' }}>
      {total > 0 ? (
        <>
          <Doughnut data={data} options={options} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)' }}>{total}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Total</div>
          </div>
        </>
      ) : (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', paddingTop: 80 }}>No attendance data</p>
      )}
    </div>
  );
};

export const AttendanceTrendChart = ({ month, year }) => {
  const [data, setData] = useState([]);
  useEffect(() => {
    if (month && year) {
      chartAPI.getAttendanceTrend({ month, year }).then((r) => setData(r.data.data));
    }
  }, [month, year]);

  return (
    <div className="card">
      <div className="card-header"><h3>Attendance Trend</h3></div>
      {data.length > 0 ? (
        <Line data={{
          labels: data.map((d) => `Day ${d.day}`),
          datasets: [
            { label: 'Present', data: data.map((d) => d.present), borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', fill: true, tension: 0.4 },
            { label: 'Absent', data: data.map((d) => d.absent), borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', fill: true, tension: 0.4 },
            { label: 'Late', data: data.map((d) => d.late), borderColor: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.1)', fill: true, tension: 0.4 },
          ]
        }} options={{ responsive: true, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true } } }} />
      ) : <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px' }}>Select month and year to view data</p>}
    </div>
  );
};
