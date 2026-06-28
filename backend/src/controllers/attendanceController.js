const Attendance = require('../models/Attendance');

exports.getAttendance = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, employee, date, status, startDate, endDate } = req.query;
    const query = {};
    if (employee) query.employee = employee;
    if (status) query.status = status;
    if (date) {
      const d = new Date(date);
      query.date = { $gte: new Date(d.setHours(0, 0, 0)), $lte: new Date(d.setHours(23, 59, 59)) };
    }
    if (startDate && endDate) {
      query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const total = await Attendance.countDocuments(query);
    const records = await Attendance.find(query)
      .populate({ path: 'employee', select: 'firstName lastName employeeId' })
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, data: records, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit), limit: parseInt(limit) } });
  } catch (error) {
    next(error);
  }
};

exports.clockIn = async (req, res, next) => {
  try {
    const { employee } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let record = await Attendance.findOne({ employee, date: today });
    if (record) { res.status(400); throw new Error('Already clocked in today'); }

    const clockInTime = new Date();
    const hour = clockInTime.getHours();
    const status = hour > 9 ? 'late' : 'present';

    record = await Attendance.create({ employee, date: today, clockIn: clockInTime, status });
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

exports.clockOut = async (req, res, next) => {
  try {
    const { employee } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const record = await Attendance.findOne({ employee, date: today });
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
    const record = await Attendance.create(req.body);
    res.status(201).json({ success: true, data: record });
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

exports.getMonthlyAttendance = async (req, res, next) => {
  try {
    const { employee, month, year } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    const records = await Attendance.find({ employee, date: { $gte: startDate, $lte: endDate } }).sort({ date: 1 });
    res.json({ success: true, data: records });
  } catch (error) {
    next(error);
  }
};
