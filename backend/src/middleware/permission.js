const Role = require('../models/Role');

const checkPermission = (module, action) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
      }

      if (req.user.role === 'admin') {
        return next();
      }

      const role = await Role.findOne({ slug: req.user.role, isActive: true });
      if (!role) {
        return res.status(403).json({ success: false, message: 'Role not found or inactive' });
      }

      const modulePermission = role.permissions.find((p) => p.module === module);
      if (!modulePermission || !modulePermission.actions.includes(action)) {
        return res.status(403).json({ 
          success: false, 
          message: `No ${action} permission on ${module}` 
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

const checkAnyPermission = (permissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized' });
      }

      if (req.user.role === 'admin') {
        return next();
      }

      const role = await Role.findOne({ slug: req.user.role, isActive: true });
      if (!role) {
        return res.status(403).json({ success: false, message: 'Role not found or inactive' });
      }

      const hasPermission = permissions.some(({ module, action }) => {
        const modulePermission = role.permissions.find((p) => p.module === module);
        return modulePermission && modulePermission.actions.includes(action);
      });

      if (!hasPermission) {
        return res.status(403).json({ 
          success: false, 
          message: 'Insufficient permissions' 
        });
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { checkPermission, checkAnyPermission };
