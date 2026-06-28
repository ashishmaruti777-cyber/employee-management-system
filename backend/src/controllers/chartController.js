const Payroll = require('../models/Payroll');
const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const Department = require('../models/Department');

exports.getEmployeeGrowth = async (req, res, next) => {
  try {
    const { year } = req.query;
    const y = parseInt(year) || new Date().getFullYear();
    const months = [];
    for (let i = 1; i <= 12; i++) {
      const start = new Date(y, i - 1, 1);
      const end = new Date(y, i, 0, 23, 59, 59);
      const count = await Employee.countDocuments({ joinDate: { $gte: start, $lte: end } });
      months.push({ month: i, label: new Date(y, i - 1).toLocaleString('default', { month: 'short' }), count });
    }
    res.json({ success: true, data: months });
  } catch (error) {
    next(error);
  }
};

exports.getMonthlySalaryExpense = async (req, res, next) => {
  try {
    const { year } = req.query;
    const y = parseInt(year) || new Date().getFullYear();
    const result = await Payroll.aggregate([
      { $match: { year: y } },
      { $group: { _id: '$month', totalExpense: { $sum: '$netSalary' } } },
      { $sort: { _id: 1 } },
    ]);
    const months = Array.from({ length: 12 }, (_, i) => {
      const found = result.find((r) => r._id === i + 1);
      return { month: i + 1, label: new Date(y, i).toLocaleString('default', { month: 'short' }), expense: found ? found.totalExpense : 0 };
    });
    res.json({ success: true, data: months });
  } catch (error) {
    next(error);
  }
};

exports.getDepartmentExpense = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const result = await Payroll.aggregate([
      { $match: { month: parseInt(month), year: parseInt(year) } },
      {
        $lookup: { from: 'employees', localField: 'employee', foreignField: '_id', as: 'emp' },
      },
      { $unwind: '$emp' },
      {
        $lookup: { from: 'departments', localField: 'emp.department', foreignField: '_id', as: 'dept' },
      },
      { $unwind: '$dept' },
      { $group: { _id: '$dept.name', totalExpense: { $sum: '$netSalary' } } },
      { $sort: { totalExpense: -1 } },
    ]);
    res.json({ success: true, data: result.map((r) => ({ department: r._id, expense: r.totalExpense })) });
  } catch (error) {
    next(error);
  }
};

exports.getAttendanceTrend = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    const result = await Attendance.aggregate([
      { $match: { date: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: { day: { $dayOfMonth: '$date' }, status: '$status' }, count: { $sum: 1 } } },
      { $sort: { '_id.day': 1 } },
    ]);
    const daysInMonth = endDate.getDate();
    const trend = Array.from({ length: daysInMonth }, (_, i) => {
      const dayData = result.filter((r) => r._id.day === i + 1);
      return { day: i + 1, present: dayData.find((d) => d._id.status === 'present')?.count || 0, absent: dayData.find((d) => d._id.status === 'absent')?.count || 0, late: dayData.find((d) => d._id.status === 'late')?.count || 0 };
    });
    res.json({ success: true, data: trend });
  } catch (error) {
    next(error);
  }
};

exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalEmployees = await Employee.countDocuments({ status: 'active' });
    const totalDepartments = await Department.countDocuments({ status: 'active' });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayAttendance = await Attendance.countDocuments({ date: today, status: { $in: ['present', 'late'] } });
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlyExpense = await Payroll.aggregate([
      { $match: { month: today.getMonth() + 1, year: today.getFullYear() } },
      { $group: { _id: null, total: { $sum: '$netSalary' } } },
    ]);
    res.json({
      success: true,
      data: {
        totalEmployees,
        totalDepartments,
        todayAttendance,
        monthlyExpense: monthlyExpense[0]?.total || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};
