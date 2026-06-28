const router = require('express').Router();
const { getPayrolls, createPayroll, updatePayroll, processPayroll, markPaid, getSalarySummary } = require('../controllers/payrollController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getPayrolls).post(authorize('admin'), createPayroll);
router.get('/summary', getSalarySummary);
router.put('/:id', authorize('admin'), updatePayroll);
router.put('/:id/process', authorize('admin'), processPayroll);
router.put('/:id/pay', authorize('admin'), markPaid);

module.exports = router;
