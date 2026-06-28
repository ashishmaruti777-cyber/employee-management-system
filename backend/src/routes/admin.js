const router = require('express').Router();
const { getAdminStats } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin', 'super-admin'));

router.get('/stats', getAdminStats);

module.exports = router;
