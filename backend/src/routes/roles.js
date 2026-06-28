const router = require('express').Router();
const { getRoles, getRole, createRole, updateRole, deleteRole, toggleRoleStatus, getAuditLogs } = require('../controllers/roleController');
const { protect, authorize } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permission');
const { validateRole, validateRoleUpdate } = require('../validators/roleValidator');

router.use(protect);

router.route('/')
  .get(getRoles)
  .post(authorize('admin'), validateRole, createRole);

router.route('/:id')
  .get(getRole)
  .put(authorize('admin'), validateRoleUpdate, updateRole)
  .delete(authorize('admin'), deleteRole);

router.put('/:id/toggle', authorize('admin'), toggleRoleStatus);

router.get('/audit-logs', authorize('admin'), getAuditLogs);

module.exports = router;
