const Department = require('../models/Department');
const Employee = require('../models/Employee');

exports.getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().populate('manager', 'firstName lastName');
    res.json({ success: true, data: departments });
  } catch (error) {
    next(error);
  }
};

exports.getDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id).populate('manager', 'firstName lastName');
    if (!department) { res.status(404); throw new Error('Department not found'); }
    const employees = await Employee.find({ department: department._id });
    res.json({ success: true, data: { ...department.toJSON(), employees } });
  } catch (error) {
    next(error);
  }
};

exports.createDepartment = async (req, res, next) => {
  try {
    const department = await Department.create(req.body);
    res.status(201).json({ success: true, data: department });
  } catch (error) {
    next(error);
  }
};

exports.updateDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!department) { res.status(404); throw new Error('Department not found'); }
    res.json({ success: true, data: department });
  } catch (error) {
    next(error);
  }
};

exports.deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) { res.status(404); throw new Error('Department not found'); }
    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
