const router = require('express').Router();
const { getEmployees, getEmployee, getMyProfile, createEmployee, updateEmployee, deleteEmployee } = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/my-profile', getMyProfile);
router.route('/').get(getEmployees).post(authorize('super-admin', 'hr-manager'), createEmployee);
router.route('/:id').get(getEmployee).put(authorize('super-admin', 'hr-manager'), updateEmployee).delete(authorize('super-admin'), deleteEmployee);

module.exports = router;
