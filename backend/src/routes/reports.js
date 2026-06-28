const router = require('express').Router();
const { getDepartmentReport, exportPDF, exportExcel } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/department', getDepartmentReport);
router.get('/export/pdf', exportPDF);
router.get('/export/excel', exportExcel);

module.exports = router;
