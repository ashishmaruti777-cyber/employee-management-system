const Employee = require('../models/Employee');
const Department = require('../models/Department');
const User = require('../models/User');
const Role = require('../models/Role');
const Attendance = require('../models/Attendance');
const Payroll = require('../models/Payroll');

exports.getAdminStats = async (req, res, next) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const totalDepartments = await Department.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalRoles = await Role.countDocuments();
    const activeEmployees = await Employee.countDocuments({ status: 'active' });
    const activeUsers = await User.countDocuments({ isActive: true });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const todayAttendance = await Attendance.countDocuments({ date: { $gte: today, $lt: tomorrow } });

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlyPayroll = await Payroll.find({ createdAt: { $gte: startOfMonth } });
    const monthlyExpense = monthlyPayroll.reduce((sum, p) => sum + (p.netSalary || 0), 0);
    const pendingPayroll = await Payroll.countDocuments({ status: 'pending' });

    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('-password');
    const recentEmployees = await Employee.find().sort({ createdAt: -1 }).limit(5);

    const departmentStats = await Department.find().then(async (depts) => {
      return Promise.all(depts.map(async (d) => {
        const empCount = await Employee.countDocuments({ department: d._id });
        return { _id: d._id, name: d.name, code: d.code, employeeCount: empCount, budget: d.budget || 0 };
      }));
    });

    const roleStats = await Role.find().then(async (roles) => {
      return Promise.all(roles.map(async (r) => {
        const userCount = await User.countDocuments({ role: r.slug });
        return { _id: r._id, name: r.name, slug: r.slug, userCount, color: r.color };
      }));
    });

    const genderDistribution = await Employee.aggregate([
      { $group: { _id: '$gender', count: { $sum: 1 } } }
    ]);

    const employmentTypes = await Employee.aggregate([
      { $group: { _id: '$employmentType', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        overview: { totalEmployees, totalDepartments, totalUsers, totalRoles, activeEmployees, activeUsers, todayAttendance, monthlyExpense, pendingPayroll },
        recentUsers,
        recentEmployees,
        departmentStats,
        roleStats,
        genderDistribution,
        employmentTypes,
      },
    });
  } catch (error) {
    next(error);
  }
};
