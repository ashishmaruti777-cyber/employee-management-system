const router = require('express').Router();
const { getAttendance, clockIn, clockOut, createAttendance, updateAttendance, getMonthlyAttendance } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getAttendance).post(authorize('admin', 'manager'), createAttendance);
router.post('/clock-in', clockIn);
router.post('/clock-out', clockOut);
router.get('/monthly', getMonthlyAttendance);
router.put('/:id', authorize('admin', 'manager'), updateAttendance);

module.exports = router;
