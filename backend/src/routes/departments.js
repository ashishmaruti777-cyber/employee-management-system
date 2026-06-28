const router = require('express').Router();
const { getDepartments, getDepartment, createDepartment, updateDepartment, deleteDepartment } = require('../controllers/departmentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getDepartments).post(authorize('super-admin'), createDepartment);
router.route('/:id').get(getDepartment).put(authorize('super-admin'), updateDepartment).delete(authorize('super-admin'), deleteDepartment);

module.exports = router;
