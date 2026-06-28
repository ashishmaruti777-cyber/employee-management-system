const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');

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
