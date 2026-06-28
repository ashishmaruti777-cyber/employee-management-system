const Employee = require('../models/Employee');

const cleanObjectIdFields = (data) => {
  const obj = { ...data };
  ['department', 'reportingTo'].forEach((field) => {
    if (obj[field] === '' || obj[field] === null || obj[field] === undefined) {
      delete obj[field];
    }
  });
  return obj;
};

const isEmployeeOnly = (req) => {
  return req.user && req.user.role === 'employee';
};

exports.getMyProfile = async (req, res, next) => {
  try {
    const employee = await Employee.findOne({ user: req.user.id })
      .populate('department', 'name code')
      .populate('reportingTo', 'firstName lastName employeeId');
    if (!employee) { res.status(404); throw new Error('Employee profile not found'); }
    res.json({ success: true, data: employee });
  } catch (error) {
    next(error);
  }
};

exports.getEmployees = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', department = '', status = '', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const query = {};

    if (isEmployeeOnly(req)) {
      const myEmployee = await Employee.findOne({ user: req.user.id });
      if (!myEmployee) {
        return res.json({ success: true, data: [], pagination: { total: 0, page: 1, pages: 0, limit: parseInt(limit) } });
      }
      query._id = myEmployee._id;
    } else {
      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { employeeId: { $regex: search, $options: 'i' } },
        ];
      }
      if (department) query.department = department;
      if (status) query.status = status;
    }

    const total = await Employee.countDocuments(query);
    const employees = await Employee.find(query)
      .populate('department', 'name code')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, data: employees, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit), limit: parseInt(limit) } });
  } catch (error) {
    next(error);
  }
};

exports.getEmployee = async (req, res, next) => {
  try {
    if (isEmployeeOnly(req)) {
      const employee = await Employee.findOne({ user: req.user.id }).populate('department', 'name code');
      if (!employee) { res.status(404); throw new Error('Employee not found'); }
      return res.json({ success: true, data: employee });
    }
    const employee = await Employee.findById(req.params.id).populate('department', 'name code');
    if (!employee) { res.status(404); throw new Error('Employee not found'); }
    res.json({ success: true, data: employee });
  } catch (error) {
    next(error);
  }
};

exports.createEmployee = async (req, res, next) => {
  try {
    if (isEmployeeOnly(req)) {
      res.status(403); throw new Error('Not authorized to create employees');
    }
    const count = await Employee.countDocuments();
    const employeeId = `EMP-${String(count + 1).padStart(4, '0')}`;
    const data = cleanObjectIdFields({ ...req.body, employeeId });
    const employee = await Employee.create(data);
    res.status(201).json({ success: true, data: employee });
  } catch (error) {
    next(error);
  }
};

exports.updateEmployee = async (req, res, next) => {
  try {
    if (isEmployeeOnly(req)) {
      const allowedFields = ['phone', 'address', 'emergencyContact', 'bankDetails', 'documents', 'personalInfo', 'education', 'experience', 'skills', 'notes'];
      const restrictedData = {};
      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) restrictedData[field] = req.body[field];
      });
      const employee = await Employee.findOneAndUpdate({ user: req.user.id }, restrictedData, { new: true, runValidators: true });
      if (!employee) { res.status(404); throw new Error('Employee not found'); }
      return res.json({ success: true, data: employee });
    }
    const data = cleanObjectIdFields(req.body);
    const employee = await Employee.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!employee) { res.status(404); throw new Error('Employee not found'); }
    res.json({ success: true, data: employee });
  } catch (error) {
    next(error);
  }
};

exports.deleteEmployee = async (req, res, next) => {
  try {
    if (isEmployeeOnly(req)) {
      res.status(403); throw new Error('Not authorized to delete employees');
    }
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) { res.status(404); throw new Error('Employee not found'); }
    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
