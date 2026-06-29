const User = require('../models/User');
const Role = require('../models/Role');

exports.getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', role = '', isActive } = req.query;
    const query = { role: { $ne: 'employee' } };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: users,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit), limit: parseInt(limit) },
    });
  } catch (error) {
    next(error);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) { res.status(404); throw new Error('User not found'); }
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, avatar } = req.body;
    const exists = await User.findOne({ email });
    if (exists) { res.status(400); throw new Error('User with this email already exists'); }
    const user = await User.create({ name, email, password, role, avatar });
    if (role) {
      await Role.findOneAndUpdate({ slug: role }, { $inc: { userCount: 1 } });
    }
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, role, avatar, isActive } = req.body;
    const oldUser = await User.findById(req.params.id);
    if (!oldUser) { res.status(404); throw new Error('User not found'); }

    const user = await User.findByIdAndUpdate(req.params.id, { name, email, role, avatar, isActive }, { new: true, runValidators: true }).select('-password');

    if (oldUser.role !== role) {
      if (oldUser.role) await Role.findOneAndUpdate({ slug: oldUser.role }, { $inc: { userCount: -1 } });
      if (role) await Role.findOneAndUpdate({ slug: role }, { $inc: { userCount: 1 } });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) { res.status(404); throw new Error('User not found'); }
    if (user.role) await Role.findOneAndUpdate({ slug: user.role }, { $inc: { userCount: -1 } });
    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) { res.status(404); throw new Error('User not found'); }
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) { res.status(404); throw new Error('User not found'); }
    user.password = req.body.password || 'password123';
    await user.save();
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
};
