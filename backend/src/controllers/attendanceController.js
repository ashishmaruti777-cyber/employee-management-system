const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

const isEmployeeOnly = (req) => {
  return req.user && req.user.role === 'employee';
};

exports.getAttendance = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, employee, date, status, startDate, endDate, department } = req.query;
    const query = {};

    if (isEmployeeOnly(req)) {
      const myEmployee = await Employee.findOne({ user: req.user.id });
      if (!myEmployee) {
        return res.json({ success: true, data: [], pagination: { total: 0, page: 1, pages: 0, limit: parseInt(limit) } });
      }
      query.employee = myEmployee._id;
    } else {
      if (employee) query.employee = employee;
      if (status) query.status = status;
    }

    if (date) {
      const d = new Date(date);
      query.date = { $gte: new Date(d.setHours(0, 0, 0)), $lte: new Date(d.setHours(23, 59, 59)) };
    }
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    let populateOptions = { path: 'employee', select: 'firstName lastName employeeId department' };
    if (!isEmployeeOnly(req) && department) {
      populateOptions.match = { department };
    }

    const total = await Attendance.countDocuments(query);
    let records = await Attendance.find(query)
      .populate(populateOptions)
      .sort({ date: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    if (!isEmployeeOnly(req) && department) {
      records = records.filter(r => r.employee !== null);
    }

    res.json({ success: true, data: records, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit), limit: parseInt(limit) } });
  } catch (error) {
    next(error);
  }
};

exports.getAttendanceSummary = async (req, res, next) => {
  try {
    const { startDate, endDate, department } = req.query;
    const match = {};
    if (startDate && endDate) {
      match.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    if (isEmployeeOnly(req)) {
      const myEmployee = await Employee.findOne({ user: req.user.id });
      if (!myEmployee) {
        return res.json({ success: true, data: { present: 0, absent: 0, late: 0, 'half-day': 0, 'on-leave': 0, holiday: 0, total: 0, totalOvertime: 0, avgOvertime: 0 } });
      }
      match.employee = myEmployee._id;
    } else {
      const empMatch = {};
      if (department) empMatch.department = department;
      const employees = await Employee.find(empMatch).select('_id');
      const empIds = employees.map(e => e._id);
      match.employee = { $in: empIds };
    }

    const summary = await Attendance.aggregate([
      { $match: match },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const totalDays = await Attendance.aggregate([
      { $match: match },
      { $group: { _id: null, totalOvertime: { $sum: '$overtime' }, avgOvertime: { $avg: '$overtime' } } }
    ]);

    const result = {
      present: 0, absent: 0, late: 0, 'half-day': 0, 'on-leave': 0, holiday: 0, total: 0,
      totalOvertime: totalDays[0]?.totalOvertime || 0,
      avgOvertime: totalDays[0]?.avgOvertime || 0,
    };

    summary.forEach(s => { result[s._id] = s.count; result.total += s.count; });

    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.clockIn = async (req, res, next) => {
  try {
    let employeeId = req.body.employee;
    if (isEmployeeOnly(req)) {
      const myEmployee = await Employee.findOne({ user: req.user.id });
      if (!myEmployee) { res.status(404); throw new Error('Employee profile not found'); }
      employeeId = myEmployee._id;
    }
    if (!employeeId) { res.status(400); throw new Error('Employee ID is required'); }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let record = await Attendance.findOne({ employee: employeeId, date: today });
    if (record) { res.status(400); throw new Error('Already clocked in today'); }

    const clockInTime = new Date();
    const hour = clockInTime.getHours();
    const status = hour > 9 ? 'late' : 'present';

    record = await Attendance.create({ employee: employeeId, date: today, clockIn: clockInTime, status });
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

exports.clockOut = async (req, res, next) => {
  try {
    let employeeId = req.body.employee;
    if (isEmployeeOnly(req)) {
      const myEmployee = await Employee.findOne({ user: req.user.id });
      if (!myEmployee) { res.status(404); throw new Error('Employee profile not found'); }
      employeeId = myEmployee._id;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const record = await Attendance.findOne({ employee: employeeId, date: today });
    if (!record) { res.status(404); throw new Error('No clock-in record found for today'); }
    if (record.clockOut) { res.status(400); throw new Error('Already clocked out'); }

    record.clockOut = new Date();
    const diff = (record.clockOut - record.clockIn) / (1000 * 60 * 60);
    record.overtime = Math.max(0, diff - 8);
    await record.save();
    res.json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

exports.createAttendance = async (req, res, next) => {
  try {
    console.log('Create attendance:', JSON.stringify(req.body));
    const record = await Attendance.create(req.body);
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    console.error('Attendance error:', error.message);
    next(error);
  }
};

exports.bulkCreateAttendance = async (req, res, next) => {
  try {
    const { records } = req.body;
    if (!records || !Array.isArray(records) || records.length === 0) {
      res.status(400);
      throw new Error('Records array is required');
    }
    const created = await Attendance.insertMany(records);
    res.status(201).json({ success: true, data: created, count: created.length });
  } catch (error) {
    next(error);
  }
};

exports.updateAttendance = async (req, res, next) => {
  try {
    const record = await Attendance.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!record) { res.status(404); throw new Error('Record not found'); }
    res.json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

exports.deleteAttendance = async (req, res, next) => {
  try {
    const record = await Attendance.findByIdAndDelete(req.params.id);
    if (!record) { res.status(404); throw new Error('Record not found'); }
    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

exports.getMonthlyAttendance = async (req, res, next) => {
  try {
    let { employee, month, year } = req.query;
    if (isEmployeeOnly(req)) {
      const myEmployee = await Employee.findOne({ user: req.user.id });
      if (!myEmployee) {
        return res.json({ success: true, data: [] });
      }
      employee = myEmployee._id;
    }
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    const records = await Attendance.find({ employee, date: { $gte: startDate, $lte: endDate } }).sort({ date: 1 });
    res.json({ success: true, data: records });
  } catch (error) {
    next(error);
  }
};
