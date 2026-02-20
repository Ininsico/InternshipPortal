const express = require('express');
const router = express.Router();
const {
    createAdmin,
    getAllAdmins,
    getAllStudents,
    assignStudentToSupervisor,
    getDashboardStats
} = require('../controllers/admin.controller');
const { protect, requireRole } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/stats', requireRole('admin', 'super_admin'), getDashboardStats);
router.get('/students', requireRole('admin', 'super_admin'), getAllStudents);

router.post('/create-admin', requireRole('super_admin'), createAdmin);
router.get('/faculty', requireRole('super_admin'), getAllAdmins);
router.post('/assign-student', requireRole('super_admin'), assignStudentToSupervisor);

module.exports = router;
