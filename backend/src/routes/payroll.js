const router = require('express').Router();
const { getPayrolls, createPayroll, updatePayroll, processPayroll, markPaid, getSalarySummary } = require('../controllers/payrollController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getPayrolls).post(authorize('super-admin'), createPayroll);
router.get('/summary', getSalarySummary);
router.put('/:id', authorize('super-admin'), updatePayroll);
router.put('/:id/process', authorize('super-admin'), processPayroll);
router.put('/:id/pay', authorize('super-admin'), markPaid);

module.exports = router;
