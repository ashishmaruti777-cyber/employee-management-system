const Role = require('../models/Role');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

const logAudit = async (action, entityId, entityName, req, oldValues = {}, newValues = {}) => {
  try {
    await AuditLog.create({
      action,
      entity: 'role',
      entityId,
      entityName,
      performedBy: req.user._id,
      oldValues,
      newValues,
      ipAddress: req.ip || req.connection?.remoteAddress || '',
      userAgent: req.headers['user-agent'] || '',
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
};

exports.getRoles = async (req, res, next) => {
  try {
    const { search = '', isActive } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (isActive !== undefined) query.isActive = isActive === 'true';
    const roles = await Role.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: roles });
  } catch (error) {
    next(error);
  }
};

exports.getRole = async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) { res.status(404); throw new Error('Role not found'); }
    res.json({ success: true, data: role });
  } catch (error) {
    next(error);
  }
};

exports.createRole = async (req, res, next) => {
  try {
    const { name, description, permissions, color } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    
    const existingRole = await Role.findOne({ $or: [{ name }, { slug }] });
    if (existingRole) {
      return res.status(400).json({ success: false, message: 'Role with this name already exists' });
    }

    const role = await Role.create({ name, slug, description, permissions, color });
    
    await logAudit('create', role._id, role.name, req, {}, { name, description, permissions, color });
    
    res.status(201).json({ success: true, data: role });
  } catch (error) {
    next(error);
  }
};

exports.updateRole = async (req, res, next) => {
  try {
    const oldRole = await Role.findById(req.params.id);
    if (!oldRole) { res.status(404); throw new Error('Role not found'); }

    if (req.body.name && req.body.name !== oldRole.name) {
      const existingRole = await Role.findOne({ name: req.body.name, _id: { $ne: req.params.id } });
      if (existingRole) {
        return res.status(400).json({ success: false, message: 'Role with this name already exists' });
      }
      req.body.slug = req.body.name.toLowerCase().replace(/\s+/g, '-');
    }

    const role = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    
    if (req.body.name && req.body.name !== oldRole.name) {
      await User.updateMany({ role: oldRole.slug }, { role: role.slug });
    }
    
    const oldValues = {};
    const newValues = {};
    if (req.body.name && req.body.name !== oldRole.name) {
      oldValues.name = oldRole.name;
      newValues.name = role.name;
    }
    if (req.body.description !== undefined && req.body.description !== oldRole.description) {
      oldValues.description = oldRole.description;
      newValues.description = role.description;
    }
    if (req.body.permissions) {
      oldValues.permissions = oldRole.permissions;
      newValues.permissions = role.permissions;
    }
    if (req.body.color && req.body.color !== oldRole.color) {
      oldValues.color = oldRole.color;
      newValues.color = role.color;
    }
    
    await logAudit('update', role._id, role.name, req, oldValues, newValues);
    
    res.json({ success: true, data: role });
  } catch (error) {
    next(error);
  }
};

exports.deleteRole = async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) { res.status(404); throw new Error('Role not found'); }

    const usersWithRole = await User.countDocuments({ role: role.slug });
    if (usersWithRole > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete role "${role.name}". ${usersWithRole} user(s) are assigned to this role. Please reassign them first.` 
      });
    }

    const roleData = { name: role.name, slug: role.slug, permissions: role.permissions };
    
    await Role.findByIdAndDelete(req.params.id);
    
    await logAudit('delete', role._id, role.name, req, roleData, {});
    
    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

exports.toggleRoleStatus = async (req, res, next) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) { res.status(404); throw new Error('Role not found'); }
    
    const oldStatus = role.isActive;
    role.isActive = !role.isActive;
    await role.save();
    
    await logAudit('toggle', role._id, role.name, req, { isActive: oldStatus }, { isActive: role.isActive });
    
    res.json({ success: true, data: role });
  } catch (error) {
    next(error);
  }
};

exports.getAuditLogs = async (req, res, next) => {
  try {
    const { entity, entityId, performedBy, page = 1, limit = 20 } = req.query;
    const query = {};
    if (entity) query.entity = entity;
    if (entityId) query.entityId = entityId;
    if (performedBy) query.performedBy = performedBy;

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, data: logs, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
  } catch (error) {
    next(error);
  }
};
