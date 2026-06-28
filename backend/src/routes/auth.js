const router = require('express').Router();
const {
  register, login, getMe, updateProfile, changePassword, forgotPassword, resetPassword,
  requestLogin, getLoginRequests, approveLoginRequest, rejectLoginRequest,
  checkRequestStatus, getAuditLogs,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

router.post('/request-login', requestLogin);
router.get('/check-request/:requestId', checkRequestStatus);
router.get('/login-requests', protect, getLoginRequests);
router.post('/approve/:id', protect, approveLoginRequest);
router.post('/reject/:id', protect, rejectLoginRequest);
router.get('/audit-logs', protect, getAuditLogs);

module.exports = router;
