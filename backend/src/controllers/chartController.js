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
    const Employee = require('../models/Employee');
    const Department = require('../models/Department');
    const User = require('../models/User');

    const isEmployeeOnly = req.user && req.user.role === 'employee';

    if (isEmployeeOnly) {
      const myEmployee = await Employee.findOne({ user: req.user.id }).populate('department', 'name');
      if (!myEmployee) {
        return res.json({ success: true, data: { totalEmployees: 1, totalDepartments: 0, totalUsers: 1, todayPresent: 0, todayAbsent: 0, todayLate: 0, todayOnLeave: 0, todayTotal: 0, monthlyExpense: 0, totalPayroll: 0, deptStats: [], recentEmployees: [], recentActivity: [] } });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const myRecord = await Attendance.findOne({ employee: myEmployee._id, date: { $gte: today, $lt: tomorrow } }).populate({ path: 'employee', select: 'firstName lastName employeeId department', populate: { path: 'department', select: 'name' } });

      const myMonthlyPayroll = await Payroll.aggregate([
        { $match: { employee: myEmployee._id, month: today.getMonth() + 1, year: today.getFullYear() } },
        { $group: { _id: null, total: { $sum: '$netSalary' } } },
      ]);

      const recentActivity = [];
      if (myRecord) {
        recentActivity.push({
          name: `${myEmployee.firstName} ${myEmployee.lastName}`,
          status: myRecord.status,
          time: myRecord.clockIn ? new Date(myRecord.clockIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-',
          department: myEmployee.department?.name || 'N/A',
        });
      }

      return res.json({
        success: true,
        data: {
          totalEmployees: 1,
          totalDepartments: 0,
          totalUsers: 1,
          todayPresent: myRecord?.status === 'present' ? 1 : 0,
          todayAbsent: myRecord?.status === 'absent' ? 1 : 0,
          todayLate: myRecord?.status === 'late' ? 1 : 0,
          todayOnLeave: myRecord?.status === 'on-leave' ? 1 : 0,
          todayTotal: myRecord ? 1 : 0,
          monthlyExpense: myMonthlyPayroll[0]?.total || 0,
          totalPayroll: myMonthlyPayroll[0]?.total || 0,
          deptStats: [{ _id: myEmployee.department?.name || 'N/A', count: 1, avgSalary: myEmployee.salary }],
          recentEmployees: [myEmployee],
          recentActivity,
        },
      });
    }

    const totalEmployees = await Employee.countDocuments({ status: 'active' });
    const totalDepartments = await Department.countDocuments();
    const totalUsers = await User.countDocuments();

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayRecords, monthlyExpense, totalPayroll, deptStats, recentEmployees] = await Promise.all([
      Attendance.find({ date: { $gte: today, $lt: tomorrow } }).populate({ path: 'employee', select: 'firstName lastName employeeId department', populate: { path: 'department', select: 'name' } }),
      Payroll.aggregate([
        { $match: { month: today.getMonth() + 1, year: today.getFullYear() } },
        { $group: { _id: null, total: { $sum: '$netSalary' } } },
      ]),
      Payroll.aggregate([
        { $group: { _id: null, total: { $sum: '$netSalary' } } },
      ]),
      Employee.aggregate([
        { $match: { status: 'active' } },
        { $lookup: { from: 'departments', localField: 'department', foreignField: '_id', as: 'dept' } },
        { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
        { $group: { _id: '$dept.name', count: { $sum: 1 }, avgSalary: { $avg: '$salary' } } },
        { $sort: { count: -1 } },
      ]),
      Employee.find().sort({ createdAt: -1 }).limit(5).select('firstName lastName employeeId position department status').populate('department', 'name'),
    ]);

    const todayPresent = todayRecords.filter(r => r.status === 'present').length;
    const todayAbsent = todayRecords.filter(r => r.status === 'absent').length;
    const todayLate = todayRecords.filter(r => r.status === 'late').length;
    const todayOnLeave = todayRecords.filter(r => r.status === 'on-leave').length;

    const recentActivity = todayRecords.slice(0, 10).map(r => ({
      name: `${r.employee?.firstName} ${r.employee?.lastName}`,
      status: r.status,
      time: r.clockIn ? new Date(r.clockIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-',
      department: r.employee?.department?.name || 'N/A',
    }));

    res.json({
      success: true,
      data: {
        totalEmployees,
        totalDepartments,
        totalUsers,
        todayPresent,
        todayAbsent,
        todayLate,
        todayOnLeave,
        todayTotal: todayRecords.length,
        monthlyExpense: monthlyExpense[0]?.total || 0,
        totalPayroll: totalPayroll[0]?.total || 0,
        deptStats,
        recentEmployees,
        recentActivity,
      },
    });
  } catch (error) {
    next(error);
  }
};
