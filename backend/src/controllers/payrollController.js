const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');

exports.getPayrolls = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, employee, month, year, status } = req.query;
    const query = {};
    if (employee) query.employee = employee;
    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);
    if (status) query.status = status;

    const total = await Payroll.countDocuments(query);
    const records = await Payroll.find(query)
      .populate({ path: 'employee', select: 'firstName lastName employeeId department' })
      .sort({ year: -1, month: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, data: records, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit), limit: parseInt(limit) } });
  } catch (error) {
    next(error);
  }
};

exports.createPayroll = async (req, res, next) => {
  try {
    const { employee, month, year, basicSalary, allowances, deductions, overtime, bonus } = req.body;
    const totalAllowances = Object.values(allowances || {}).reduce((a, b) => a + b, 0);
    const totalDeductions = Object.values(deductions || {}).reduce((a, b) => a + b, 0);
    const netSalary = basicSalary + totalAllowances + (overtime || 0) + (bonus || 0) - totalDeductions;

    const record = await Payroll.create({ employee, month, year, basicSalary, allowances, deductions, overtime, bonus, netSalary });
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

exports.updatePayroll = async (req, res, next) => {
  try {
    const record = await Payroll.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!record) { res.status(404); throw new Error('Payroll record not found'); }
    res.json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

exports.processPayroll = async (req, res, next) => {
  try {
    const record = await Payroll.findByIdAndUpdate(req.params.id, { status: 'processed' }, { new: true });
    if (!record) { res.status(404); throw new Error('Payroll record not found'); }
    res.json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

exports.markPaid = async (req, res, next) => {
  try {
    const record = await Payroll.findByIdAndUpdate(req.params.id, { status: 'paid', paidDate: new Date() }, { new: true });
    if (!record) { res.status(404); throw new Error('Payroll record not found'); }
    res.json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

exports.getSalarySummary = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const summary = await Payroll.aggregate([
      { $match: { month: parseInt(month), year: parseInt(year) } },
      {
        $group: {
          _id: null,
          totalSalary: { $sum: '$netSalary' },
          avgSalary: { $avg: '$netSalary' },
          count: { $sum: 1 },
          totalAllowances: { $sum: { $add: ['$allowances.housing', '$allowances.transport', '$allowances.medical', '$allowances.other'] } },
          totalDeductions: { $sum: { $add: ['$deductions.tax', '$deductions.insurance', '$deductions.loan', '$deductions.other'] } },
        },
      },
    ]);
    res.json({ success: true, data: summary[0] || {} });
  } catch (error) {
    next(error);
  }
};
