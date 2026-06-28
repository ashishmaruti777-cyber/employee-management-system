const router = require('express').Router();
const { getSettings, updateSettings, initDefaultSettings } = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getSettings).put(authorize('super-admin'), updateSettings);
router.post('/init', authorize('super-admin'), initDefaultSettings);

module.exports = router;
