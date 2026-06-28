const router = require('express').Router();
const { getUsers, getUser, createUser, updateUser, deleteUser, toggleUserStatus, resetPassword } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getUsers).post(authorize('super-admin'), createUser);
router.route('/:id').get(getUser).put(authorize('super-admin'), updateUser).delete(authorize('super-admin'), deleteUser);
router.put('/:id/toggle', authorize('super-admin'), toggleUserStatus);
router.put('/:id/reset-password', authorize('super-admin'), resetPassword);

module.exports = router;
