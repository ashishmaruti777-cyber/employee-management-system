const router = require('express').Router();
const { getSettings, updateSettings, initDefaultSettings } = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getSettings).put(authorize('admin'), updateSettings);
router.post('/init', authorize('admin'), initDefaultSettings);

module.exports = router;
