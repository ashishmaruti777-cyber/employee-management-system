const router = require('express').Router();
const { getAttendance, clockIn, clockOut, createAttendance, bulkCreateAttendance, updateAttendance, deleteAttendance, getMonthlyAttendance, getAttendanceSummary } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getAttendance).post(authorize('super-admin', 'hr-manager'), createAttendance);
router.post('/clock-in', clockIn);
router.post('/clock-out', clockOut);
router.post('/bulk', authorize('super-admin', 'hr-manager'), bulkCreateAttendance);
router.get('/summary', getAttendanceSummary);
router.get('/monthly', getMonthlyAttendance);
router.route('/:id').put(authorize('super-admin', 'hr-manager'), updateAttendance).delete(authorize('super-admin'), deleteAttendance);

module.exports = router;
