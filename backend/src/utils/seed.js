const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Department = require('../models/Department');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Payroll = require('../models/Payroll');
const Settings = require('../models/Settings');
const Role = require('../models/Role');
const Shift = require('../models/Shift');
const ShiftAssignment = require('../models/ShiftAssignment');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  await User.deleteMany({});
  await Department.deleteMany({});
  await Employee.deleteMany({});
  await Attendance.deleteMany({});
  await Payroll.deleteMany({});
  await Settings.deleteMany({});
  await Role.deleteMany({});
  await Shift.deleteMany({});
  await ShiftAssignment.deleteMany({});

  const roles = await Role.insertMany([
    { name: 'Super Admin', slug: 'super-admin', description: 'Full system access', color: '#ef4444', userCount: 1, permissions: [
      { module: 'employees', actions: ['create', 'read', 'update', 'delete', 'export'] },
      { module: 'departments', actions: ['create', 'read', 'update', 'delete'] },
      { module: 'attendance', actions: ['create', 'read', 'update', 'delete', 'export'] },
      { module: 'payroll', actions: ['create', 'read', 'update', 'delete', 'export'] },
      { module: 'roles', actions: ['create', 'read', 'update', 'delete'] },
      { module: 'users', actions: ['create', 'read', 'update', 'delete'] },
      { module: 'shifts', actions: ['create', 'read', 'update', 'delete'] },
      { module: 'settings', actions: ['read', 'update'] },
    ]},
    { name: 'HR Manager', slug: 'hr-manager', description: 'Manages HR operations', color: '#f59e0b', userCount: 1, permissions: [
      { module: 'employees', actions: ['create', 'read', 'update', 'export'] },
      { module: 'attendance', actions: ['read', 'update', 'export'] },
      { module: 'payroll', actions: ['read', 'update', 'export'] },
      { module: 'shifts', actions: ['create', 'read', 'update'] },
    ]},
    { name: 'Team Lead', slug: 'team-lead', description: 'Team management access', color: '#3b82f6', userCount: 1, permissions: [
      { module: 'employees', actions: ['read'] },
      { module: 'attendance', actions: ['read'] },
      { module: 'shifts', actions: ['read'] },
    ]},
    { name: 'Employee', slug: 'employee', description: 'Basic employee access', color: '#10b981', userCount: 5, permissions: [
      { module: 'attendance', actions: ['read'] },
    ]},
  ]);

  const admin = await User.create({ name: 'Admin User', email: 'admin@company.com', password: 'password123', role: 'super-admin', phone: '+1000000000' });
  const manager = await User.create({ name: 'HR Manager', email: 'manager@company.com', password: 'password123', role: 'hr-manager', phone: '+1000000001' });
  const lead = await User.create({ name: 'Team Lead', email: 'lead@company.com', password: 'password123', role: 'team-lead', phone: '+1000000002' });
  const empUser1 = await User.create({ name: 'John Doe', email: 'john@company.com', password: 'password123', role: 'employee', phone: '+1000000003' });
  const empUser2 = await User.create({ name: 'Jane Smith', email: 'jane@company.com', password: 'password123', role: 'employee', phone: '+1000000004' });
  await User.create({ name: 'Bob Wilson', email: 'bob@company.com', password: 'password123', role: 'employee', phone: '+1000000005' });
  await User.create({ name: 'Alice Brown', email: 'alice@company.com', password: 'password123', role: 'employee', phone: '+1000000006' });
  await User.create({ name: 'Charlie Davis', email: 'charlie@company.com', password: 'password123', role: 'employee', phone: '+1000000007' });

  const depts = await Department.insertMany([
    { name: 'Engineering', code: 'ENG', description: 'Software development team', budget: 500000 },
    { name: 'Human Resources', code: 'HR', description: 'People management', budget: 200000 },
    { name: 'Marketing', code: 'MKT', description: 'Brand and growth', budget: 300000 },
    { name: 'Finance', code: 'FIN', description: 'Financial operations', budget: 250000 },
    { name: 'Operations', code: 'OPS', description: 'Business operations', budget: 350000 },
  ]);

  const employees = await Employee.insertMany([
    { user: admin._id, employeeId: 'EMP-0001', firstName: 'Sarah', lastName: 'Wilson', email: 'sarah@company.com', dateOfBirth: new Date('1985-03-15'), gender: 'female', department: depts[0]._id, position: 'CTO', salary: 150000, joinDate: new Date('2020-01-15'), status: 'active', phone: '+1234567890' },
    { user: manager._id, employeeId: 'EMP-0002', firstName: 'Emily', lastName: 'Brown', email: 'emily@company.com', dateOfBirth: new Date('1988-05-30'), gender: 'female', department: depts[1]._id, position: 'HR Director', salary: 110000, joinDate: new Date('2019-08-05'), status: 'active', phone: '+1234567893' },
    { user: lead._id, employeeId: 'EMP-0003', firstName: 'Michael', lastName: 'Chen', email: 'michael@company.com', dateOfBirth: new Date('1990-07-22'), gender: 'male', department: depts[0]._id, position: 'Engineering Manager', salary: 120000, joinDate: new Date('2021-03-10'), status: 'active', phone: '+1234567891' },
    { user: empUser1._id, employeeId: 'EMP-0004', firstName: 'John', lastName: 'Doe', email: 'john.doe@company.com', dateOfBirth: new Date('1995-11-08'), gender: 'male', department: depts[0]._id, position: 'Software Engineer', salary: 85000, joinDate: new Date('2022-06-20'), status: 'active', phone: '+1234567892' },
    { user: empUser2._id, employeeId: 'EMP-0005', firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@company.com', dateOfBirth: new Date('1993-02-25'), gender: 'female', department: depts[2]._id, position: 'Marketing Specialist', salary: 70000, joinDate: new Date('2022-09-01'), status: 'active', phone: '+1234567895' },
  ]);

  const shifts = await Shift.insertMany([
    { name: 'Morning Shift', code: 'MST', startTime: '09:00', endTime: '17:00', breakMinutes: 60, gracePeriodMinutes: 15, overtimeThresholdHours: 8, isNightShift: false, color: '#10b981' },
    { name: 'Evening Shift', code: 'EVE', startTime: '14:00', endTime: '22:00', breakMinutes: 60, gracePeriodMinutes: 15, overtimeThresholdHours: 8, isNightShift: false, color: '#3b82f6' },
    { name: 'Night Shift', code: 'NGT', startTime: '22:00', endTime: '06:00', breakMinutes: 60, gracePeriodMinutes: 15, overtimeThresholdHours: 8, isNightShift: true, color: '#8b5cf6' },
    { name: 'Flex Shift', code: 'FLX', startTime: '10:00', endTime: '18:00', breakMinutes: 45, gracePeriodMinutes: 30, overtimeThresholdHours: 8, isNightShift: false, color: '#f59e0b' },
  ]);

  await ShiftAssignment.insertMany([
    { employee: employees[2]._id, shift: shifts[0]._id, startDate: new Date('2026-01-01'), recurring: true, daysOfWeek: [1, 2, 3, 4, 5], status: 'active', assignedBy: admin._id },
    { employee: employees[3]._id, shift: shifts[0]._id, startDate: new Date('2026-01-01'), recurring: true, daysOfWeek: [1, 2, 3, 4, 5], status: 'active', assignedBy: admin._id },
    { employee: employees[4]._id, shift: shifts[3]._id, startDate: new Date('2026-03-01'), recurring: true, daysOfWeek: [1, 2, 3, 4, 5], status: 'active', assignedBy: manager._id },
  ]);

  for (const emp of employees) {
    const daysInMonth = 28;
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(2026, 5, day);
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      const statuses = ['present', 'present', 'present', 'present', 'late', 'absent'];
      await Attendance.create({
        employee: emp._id, date,
        clockIn: new Date(2026, 5, day, 9 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60)),
        clockOut: new Date(2026, 5, day, 17 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60)),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        overtime: Math.random() > 0.7 ? Math.random() * 3 : 0,
      });
    }
  }

  const months = [4, 5, 6];
  for (const emp of employees) {
    for (const m of months) {
      const allowances = { housing: emp.salary * 0.15, transport: emp.salary * 0.08, medical: emp.salary * 0.05, other: 0 };
      const deductions = { tax: emp.salary * 0.2, insurance: emp.salary * 0.05, loan: 0, other: 0 };
      const totalAllow = Object.values(allowances).reduce((a, b) => a + b, 0);
      const totalDed = Object.values(deductions).reduce((a, b) => a + b, 0);
      await Payroll.create({
        employee: emp._id, month: m, year: 2026,
        basicSalary: emp.salary, allowances, deductions,
        overtime: Math.random() * 500, bonus: m === 6 ? emp.salary * 0.1 : 0,
        netSalary: emp.salary + totalAllow - totalDed + (m === 6 ? emp.salary * 0.1 : 0),
        status: m < 6 ? 'paid' : 'pending',
        paidDate: m < 6 ? new Date(2026, m, 25) : undefined,
      });
    }
  }

  const defaultSettings = [
    { key: 'company_name', value: 'Employee Management Co.', category: 'basic' },
    { key: 'company_email', value: 'hr@company.com', category: 'basic' },
    { key: 'annual_leave_days', value: 20, category: 'leave' },
    { key: 'sick_leave_days', value: 10, category: 'leave' },
    { key: 'personal_leave_days', value: 5, category: 'leave' },
    { key: 'payroll_day', value: 25, category: 'payroll' },
    { key: 'currency', value: 'USD', category: 'payroll' },
    { key: 'tax_rate', value: 0.2, category: 'payroll' },
    { key: 'smtp_host', value: 'smtp.gmail.com', category: 'email' },
    { key: 'smtp_port', value: 587, category: 'email' },
    { key: 'theme', value: 'light', category: 'ui' },
    { key: 'sidebar_collapsed', value: false, category: 'ui' },
  ];
  await Settings.insertMany(defaultSettings);

  console.log('Seed completed!');
  console.log('---');
  console.log('Admin:      admin@company.com / password123');
  console.log('HR Manager: manager@company.com / password123');
  console.log('Team Lead:  lead@company.com / password123');
  console.log('Employee:   john@company.com / password123');
  console.log('Employee:   jane@company.com / password123');
  process.exit();
};

seed().catch((err) => { console.error(err); process.exit(1); });
