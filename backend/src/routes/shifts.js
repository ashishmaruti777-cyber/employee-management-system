const router = require('express').Router();
const { getShifts, getShift, createShift, updateShift, deleteShift, toggleShiftStatus, getAssignments, createAssignment, updateAssignment, deleteAssignment } = require('../controllers/shiftController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getShifts).post(authorize('super-admin', 'hr-manager'), createShift);
router.route('/:id').get(getShift).put(authorize('super-admin', 'hr-manager'), updateShift).delete(authorize('super-admin'), deleteShift);
router.put('/:id/toggle', authorize('super-admin'), toggleShiftStatus);

router.get('/assignments/list', getAssignments);
router.post('/assignments', authorize('super-admin', 'hr-manager'), createAssignment);
router.put('/assignments/:id', authorize('super-admin', 'hr-manager'), updateAssignment);
router.delete('/assignments/:id', authorize('super-admin'), deleteAssignment);

module.exports = router;
