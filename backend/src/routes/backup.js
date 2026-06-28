const router = require('express').Router();
const { createBackup, getBackups, downloadBackup, restoreBackup, deleteBackup } = require('../controllers/backupController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin', 'super-admin'));

router.post('/create', createBackup);
router.get('/list', getBackups);
router.get('/download/:fileName', downloadBackup);
router.post('/restore', restoreBackup);
router.delete('/delete/:fileName', deleteBackup);

module.exports = router;
