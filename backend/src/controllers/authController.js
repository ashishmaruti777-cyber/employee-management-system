const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');
const Employee = require('../models/Employee');
const LoginRequest = require('../models/LoginRequest');
const AuditLog = require('../models/AuditLog');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

const generateResetToken = (id) => jwt.sign({ id, type: 'reset' }, process.env.JWT_SECRET, { expiresIn: '15m' });

const getUserWithPermissions = async (user) => {
  const role = await Role.findOne({ slug: user.role, isActive: true });
  const userObj = user.toObject();
  delete userObj.password;
  return {
    ...userObj,
    rolePermissions: role ? role.permissions : [],
  };
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }
    const user = await User.create({ name, email, password, role });
    const userWithPermissions = await getUserWithPermissions(user);
    res.status(201).json({ success: true, data: { user: userWithPermissions, token: generateToken(user._id) } });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400);
      throw new Error('Please provide email and password');
    }
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error('Invalid credentials');
    }
    const userWithPermissions = await getUserWithPermissions(user);
    res.json({ success: true, data: { user: userWithPermissions, token: generateToken(user._id) } });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const userWithPermissions = await getUserWithPermissions(user);
    res.json({ success: true, data: userWithPermissions });
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400);
      throw new Error('Please provide email');
    }
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404);
      throw new Error('No account found with this email');
    }
    const resetToken = generateResetToken(user._id);
    res.json({
      success: true,
      message: 'Password reset token generated',
      data: { resetToken, email: user.email, name: user.name },
    });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) {
      res.status(400);
      throw new Error('Reset token and new password are required');
    }
    if (newPassword.length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters');
    }
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    if (decoded.type !== 'reset') {
      res.status(400);
      throw new Error('Invalid reset token');
    }
    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    user.password = newPassword;
    await user.save();
    const userWithPermissions = await getUserWithPermissions(user);
    res.json({
      success: true,
      message: 'Password reset successful',
      data: { user: userWithPermissions, token: generateToken(user._id) },
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ success: false, message: 'Reset token has expired. Please request a new one.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ success: false, message: 'Invalid reset token' });
    }
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, avatar } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, { name, email, avatar }, { new: true, runValidators: true });
    const userWithPermissions = await getUserWithPermissions(user);
    res.json({ success: true, data: userWithPermissions });
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, forceChange } = req.body;
    if (!newPassword) {
      res.status(400);
      throw new Error('New password is required');
    }
    if (newPassword.length < 6) {
      res.status(400);
      throw new Error('New password must be at least 6 characters');
    }
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    if (!forceChange) {
      if (!currentPassword) {
        res.status(400);
        throw new Error('Current password is required');
      }
      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        res.status(400);
        throw new Error('Current password is incorrect');
      }
    }
    user.password = newPassword;
    await user.save();
    await AuditLog.create({
      action: 'PASSWORD_CHANGED',
      module: 'auth',
      user: user._id,
      userName: user.name,
      details: forceChange ? `Password set for first time by ${user.name}` : `Password changed by ${user.name}`,
      ipAddress: req.ip || '',
      status: 'success',
    });
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

exports.requestLogin = async (req, res, next) => {
  try {
    const { mobile } = req.body;
    if (!mobile) {
      res.status(400);
      throw new Error('Mobile number is required');
    }
    const cleanMobile = mobile.replace(/\s+/g, '').replace(/^0/, '');
    const escapedMobile = cleanMobile.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const employee = await Employee.findOne({ phone: { $regex: escapedMobile, $options: 'i' } });
    if (!employee) {
      res.status(404);
      throw new Error('No employee found with this mobile number');
    }
    let user = await User.findOne({ email: employee.email });
    if (!user) {
      user = await User.create({
        name: `${employee.firstName} ${employee.lastName}`,
        email: employee.email,
        password: 'temp123456',
        role: 'employee',
        phone: employee.phone,
      });
    }
    await AuditLog.create({
      action: 'LOGIN',
      module: 'auth',
      user: user._id,
      userName: `${employee.firstName} ${employee.lastName}`,
      details: `Mobile login by ${employee.firstName} ${employee.lastName} (${employee.employeeId})`,
      ipAddress: req.ip || '',
      status: 'success',
    });
    const userWithPermissions = await getUserWithPermissions(user);
    res.json({
      success: true,
      message: 'Login successful',
      data: { user: userWithPermissions, token: generateToken(user._id) },
    });
  } catch (error) {
    next(error);
  }
};

exports.getLoginRequests = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const requests = await LoginRequest.find(filter)
      .populate('employee', 'firstName lastName employeeId phone department')
      .populate('hr', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: requests });
  } catch (error) {
    next(error);
  }
};

exports.approveLoginRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const request = await LoginRequest.findById(id);
    if (!request) {
      res.status(404);
      throw new Error('Login request not found');
    }
    if (request.status !== 'pending') {
      res.status(400);
      throw new Error('Request is already ' + request.status);
    }
    request.status = 'approved';
    request.hr = req.user.id;
    const hrUser = await User.findById(req.user.id);
    request.hrName = hrUser ? hrUser.name : 'HR';
    request.loginTime = new Date();
    await request.save();
    let user = await User.findById(request.user);
    if (!user) {
      user = await User.findOne({ email: { $exists: true } });
    }
    const userWithPermissions = await getUserWithPermissions(user);
    const token = generateToken(user._id);
    await AuditLog.create({
      action: 'LOGIN_APPROVED',
      module: 'auth',
      user: req.user.id,
      userName: hrUser ? hrUser.name : 'HR',
      details: `HR ${hrUser ? hrUser.name : ''} approved login for ${request.name} (${request.employeeId})`,
      ipAddress: req.ip || '',
      status: 'success',
    });
    res.json({
      success: true,
      message: 'Login request approved',
      data: { user: userWithPermissions, token, requestId: request._id },
    });
  } catch (error) {
    next(error);
  }
};

exports.rejectLoginRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const request = await LoginRequest.findById(id);
    if (!request) {
      res.status(404);
      throw new Error('Login request not found');
    }
    if (request.status !== 'pending') {
      res.status(400);
      throw new Error('Request is already ' + request.status);
    }
    request.status = 'rejected';
    request.hr = req.user.id;
    const hrUser = await User.findById(req.user.id);
    request.hrName = hrUser ? hrUser.name : 'HR';
    request.rejectReason = reason || 'Rejected by HR';
    await request.save();
    await AuditLog.create({
      action: 'LOGIN_REJECTED',
      module: 'auth',
      user: req.user.id,
      userName: hrUser ? hrUser.name : 'HR',
      details: `HR ${hrUser ? hrUser.name : ''} rejected login for ${request.name} (${request.employeeId}). Reason: ${reason || 'Rejected by HR'}`,
      ipAddress: req.ip || '',
      status: 'failed',
    });
    res.json({
      success: true,
      message: 'Login request rejected',
    });
  } catch (error) {
    next(error);
  }
};

exports.checkRequestStatus = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const request = await LoginRequest.findById(requestId)
      .populate('employee', 'firstName lastName employeeId');
    if (!request) {
      res.status(404);
      throw new Error('Request not found');
    }
    if (request.status === 'approved') {
      let user = await User.findById(request.user);
      if (!user) {
        res.status(404);
        throw new Error('User not found');
      }
      const userWithPermissions = await getUserWithPermissions(user);
      const token = generateToken(user._id);
      res.json({ success: true, data: { status: 'approved', user: userWithPermissions, token } });
    } else if (request.status === 'rejected') {
      res.json({ success: true, data: { status: 'rejected', reason: request.rejectReason } });
    } else {
      res.json({ success: true, data: { status: 'pending' } });
    }
  } catch (error) {
    next(error);
  }
};

exports.getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, module: mod } = req.query;
    const filter = {};
    if (mod) filter.module = mod;
    const total = await AuditLog.countDocuments(filter);
    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json({ success: true, data: { logs, total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};
