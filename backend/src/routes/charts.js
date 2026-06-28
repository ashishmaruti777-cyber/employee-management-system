const router = require('express').Router();
const { getEmployeeGrowth, getMonthlySalaryExpense, getDepartmentExpense, getAttendanceTrend, getDashboardStats } = require('../controllers/chartController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/employee-growth', getEmployeeGrowth);
router.get('/monthly-salary', getMonthlySalaryExpense);
router.get('/department-expense', getDepartmentExpense);
router.get('/attendance-trend', getAttendanceTrend);
router.get('/dashboard', getDashboardStats);

module.exports = router;
