const { body, param, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      message: 'Validation failed', 
      errors: errors.array() 
    });
  }
  next();
};

const validateRole = [
  body('name')
    .trim()
    .notEmpty().withMessage('Role name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Role name must be 2-50 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Role name must contain only letters and spaces'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Description must be under 200 characters'),
  body('color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Color must be a valid hex color'),
  body('permissions')
    .optional()
    .isArray().withMessage('Permissions must be an array'),
  body('permissions.*.module')
    .if(body('permissions').exists())
    .notEmpty().withMessage('Module name is required')
    .isIn(['employees', 'departments', 'attendance', 'payroll', 'settings', 'roles', 'users', 'shifts']).withMessage('Invalid module name'),
  body('permissions.*.actions')
    .if(body('permissions').exists())
    .isArray().withMessage('Actions must be an array')
    .custom((actions) => {
      const validActions = ['create', 'read', 'update', 'delete', 'export'];
      if (!actions.every(a => validActions.includes(a))) {
        throw new Error('Invalid action. Must be one of: create, read, update, delete, export');
      }
      return true;
    }),
  handleValidationErrors
];

const validateRoleUpdate = [
  param('id').isMongoId().withMessage('Invalid role ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Role name must be 2-50 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Role name must contain only letters and spaces'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Description must be under 200 characters'),
  body('color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Color must be a valid hex color'),
  body('permissions')
    .optional()
    .isArray().withMessage('Permissions must be an array'),
  body('permissions.*.module')
    .if(body('permissions').exists())
    .notEmpty().withMessage('Module name is required')
    .isIn(['employees', 'departments', 'attendance', 'payroll', 'settings', 'roles', 'users', 'shifts']).withMessage('Invalid module name'),
  body('permissions.*.actions')
    .if(body('permissions').exists())
    .isArray().withMessage('Actions must be an array')
    .custom((actions) => {
      const validActions = ['create', 'read', 'update', 'delete', 'export'];
      if (!actions.every(a => validActions.includes(a))) {
        throw new Error('Invalid action. Must be one of: create, read, update, delete, export');
      }
      return true;
    }),
  handleValidationErrors
];

module.exports = { validateRole, validateRoleUpdate };
