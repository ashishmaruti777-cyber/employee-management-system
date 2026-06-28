const router = require('express').Router();
const { getRoles, getRole, createRole, updateRole, deleteRole, toggleRoleStatus, getAuditLogs } = require('../controllers/roleController');
const { protect, authorize } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permission');
const { validateRole, validateRoleUpdate } = require('../validators/roleValidator');

router.use(protect);

router.route('/')
  .get(getRoles)
  .post(authorize('super-admin'), validateRole, createRole);

router.route('/:id')
  .get(getRole)
  .put(authorize('super-admin'), validateRoleUpdate, updateRole)
  .delete(authorize('super-admin'), deleteRole);

router.put('/:id/toggle', authorize('super-admin'), toggleRoleStatus);

router.get('/audit-logs', authorize('super-admin'), getAuditLogs);

module.exports = router;
