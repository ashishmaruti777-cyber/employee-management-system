const Shift = require('../models/Shift');
const ShiftAssignment = require('../models/ShiftAssignment');

exports.getShifts = async (req, res, next) => {
  try {
    const { search = '', isActive } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }
    if (isActive !== undefined) query.isActive = isActive === 'true';
    const shifts = await Shift.find(query).sort({ startTime: 1 });
    res.json({ success: true, data: shifts });
  } catch (error) {
    next(error);
  }
};

exports.getShift = async (req, res, next) => {
  try {
    const shift = await Shift.findById(req.params.id);
    if (!shift) { res.status(404); throw new Error('Shift not found'); }
    const assignments = await ShiftAssignment.find({ shift: shift._id, status: 'active' })
      .populate({ path: 'employee', select: 'firstName lastName employeeId' });
    res.json({ success: true, data: { ...shift.toJSON(), assignments } });
  } catch (error) {
    next(error);
  }
};

exports.createShift = async (req, res, next) => {
  try {
    const shift = await Shift.create(req.body);
    res.status(201).json({ success: true, data: shift });
  } catch (error) {
    next(error);
  }
};

exports.updateShift = async (req, res, next) => {
  try {
    const shift = await Shift.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!shift) { res.status(404); throw new Error('Shift not found'); }
    res.json({ success: true, data: shift });
  } catch (error) {
    next(error);
  }
};

exports.deleteShift = async (req, res, next) => {
  try {
    const shift = await Shift.findByIdAndDelete(req.params.id);
    if (!shift) { res.status(404); throw new Error('Shift not found'); }
    await ShiftAssignment.deleteMany({ shift: req.params.id });
    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

exports.toggleShiftStatus = async (req, res, next) => {
  try {
    const shift = await Shift.findById(req.params.id);
    if (!shift) { res.status(404); throw new Error('Shift not found'); }
    shift.isActive = !shift.isActive;
    await shift.save();
    res.json({ success: true, data: shift });
  } catch (error) {
    next(error);
  }
};

exports.getAssignments = async (req, res, next) => {
  try {
    const { employee, shift, startDate, endDate } = req.query;
    const query = {};
    if (employee) query.employee = employee;
    if (shift) query.shift = shift;
    if (startDate && endDate) {
      query.startDate = { $gte: new Date(startDate) };
      query.$or = [{ endDate: { $lte: new Date(endDate) } }, { endDate: { $exists: false } }];
    }
    const assignments = await ShiftAssignment.find(query)
      .populate({ path: 'employee', select: 'firstName lastName employeeId' })
      .populate({ path: 'shift', select: 'name code startTime endTime color' })
      .populate({ path: 'assignedBy', select: 'name' })
      .sort({ startDate: -1 });
    res.json({ success: true, data: assignments });
  } catch (error) {
    next(error);
  }
};

exports.createAssignment = async (req, res, next) => {
  try {
    const assignment = await ShiftAssignment.create({ ...req.body, assignedBy: req.user._id });
    const populated = await assignment.populate([
      { path: 'employee', select: 'firstName lastName employeeId' },
      { path: 'shift', select: 'name code startTime endTime color' },
    ]);
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    next(error);
  }
};

exports.updateAssignment = async (req, res, next) => {
  try {
    const assignment = await ShiftAssignment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate({ path: 'employee', select: 'firstName lastName employeeId' })
      .populate({ path: 'shift', select: 'name code startTime endTime color' });
    if (!assignment) { res.status(404); throw new Error('Assignment not found'); }
    res.json({ success: true, data: assignment });
  } catch (error) {
    next(error);
  }
};

exports.deleteAssignment = async (req, res, next) => {
  try {
    const assignment = await ShiftAssignment.findByIdAndDelete(req.params.id);
    if (!assignment) { res.status(404); throw new Error('Assignment not found'); }
    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};
