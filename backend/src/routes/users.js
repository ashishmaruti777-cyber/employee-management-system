const router = require('express').Router();
const { getUsers, getUser, createUser, updateUser, deleteUser, toggleUserStatus, resetPassword } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getUsers).post(authorize('admin'), createUser);
router.route('/:id').get(getUser).put(authorize('admin'), updateUser).delete(authorize('admin'), deleteUser);
router.put('/:id/toggle', authorize('admin'), toggleUserStatus);
router.put('/:id/reset-password', authorize('admin'), resetPassword);

module.exports = router;
