const router = require('express').Router();
const { getShifts, getShift, createShift, updateShift, deleteShift, toggleShiftStatus, getAssignments, createAssignment, updateAssignment, deleteAssignment } = require('../controllers/shiftController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getShifts).post(authorize('admin', 'manager'), createShift);
router.route('/:id').get(getShift).put(authorize('admin', 'manager'), updateShift).delete(authorize('admin'), deleteShift);
router.put('/:id/toggle', authorize('admin'), toggleShiftStatus);

router.get('/assignments/list', getAssignments);
router.post('/assignments', authorize('admin', 'manager'), createAssignment);
router.put('/assignments/:id', authorize('admin', 'manager'), updateAssignment);
router.delete('/assignments/:id', authorize('admin'), deleteAssignment);

module.exports = router;
