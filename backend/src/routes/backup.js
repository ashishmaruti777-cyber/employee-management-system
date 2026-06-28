const router = require('express').Router();
const { createBackup, getBackups, downloadBackup, restoreBackup, deleteBackup } = require('../controllers/backupController');
const { protect, authorize } = require('../middleware/auth');

router.post('/cron-backup', (req, res, next) => {
  const ip = req.ip || req.connection?.remoteAddress || '';
  if (!ip.includes('127.0.0.1') && !ip.includes('::1') && !ip.includes('localhost')) {
    return res.status(403).json({ success: false, message: 'Access denied' });
  }
  next();
}, createBackup);

router.use(protect);
router.use(authorize('admin', 'super-admin'));

router.post('/create', createBackup);
router.get('/list', getBackups);
router.get('/download/:fileName', downloadBackup);
router.post('/restore', restoreBackup);
router.delete('/delete/:fileName', deleteBackup);

module.exports = router;
