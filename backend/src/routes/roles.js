const router = require('express').Router();
const { getRoles, getRole, createRole, updateRole, deleteRole, toggleRoleStatus, getAuditLogs } = require('../controllers/roleController');
const { protect, authorize } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permission');
const { validateRole, validateRoleUpdate } = require('../validators/roleValidator');

router.use(protect);

router.route('/')
  .get(getRoles)
  .post(checkPermission('roles', 'create'), validateRole, createRole);

router.route('/:id')
  .get(getRole)
  .put(checkPermission('roles', 'update'), validateRoleUpdate, updateRole)
  .delete(checkPermission('roles', 'delete'), deleteRole);

router.put('/:id/toggle', checkPermission('roles', 'update'), toggleRoleStatus);

router.get('/audit-logs', checkPermission('roles', 'read'), getAuditLogs);

module.exports = router;
