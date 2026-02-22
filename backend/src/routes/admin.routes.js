const express = require('express');
const router = express.Router();
const {
    createAdmin,
    getAllAdmins,
    getAllStudents,
    assignStudentToSupervisor,
    getDashboardStats,
    approveInternship,
    getPendingAgreements,
    verifyAgreement,
    getVerifiedStudents,
    assignInternship,
    deleteAdmin,
    updateAdmin,
    changeSupervisor
} = require('../controllers/admin.controller');
const { protect, requireRole } = require('../middleware/auth.middleware');
const Report = require('../models/Report.model');

router.use(protect);

router.get('/stats', requireRole('admin', 'super_admin'), getDashboardStats);
router.get('/students', requireRole('admin', 'super_admin'), getAllStudents);

router.post('/create-admin', requireRole('super_admin'), createAdmin);
router.get('/faculty', requireRole('super_admin'), getAllAdmins);
router.put('/faculty/:adminId', requireRole('super_admin'), updateAdmin);
router.delete('/faculty/:adminId', requireRole('super_admin'), deleteAdmin);
router.post('/assign-student', requireRole('super_admin'), assignStudentToSupervisor);
router.post('/change-supervisor', requireRole('super_admin'), changeSupervisor);
router.post('/approve-internship', requireRole('super_admin'), approveInternship);
router.get('/agreements', requireRole('super_admin'), getPendingAgreements);
router.post('/verify-agreement', requireRole('super_admin'), verifyAgreement);
router.get('/verified-students', requireRole('super_admin'), getVerifiedStudents);
router.post('/assign-internship', requireRole('super_admin'), assignInternship);

// Super admin: view all faculty reports
router.get('/reports', requireRole('super_admin'), async (req, res) => {
    try {
        const reports = await Report.find()
            .populate('student', 'name rollNumber degree assignedCompany assignedPosition')
            .populate('createdBy', 'name email')
            .sort({ updatedAt: -1 });
        res.json({ success: true, reports });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Super admin: get all company admins
router.get('/company-admins', requireRole('super_admin'), async (req, res) => {
    try {
        const Admin = require('../models/Admin.model');
        const admins = await Admin.find({ role: 'company_admin' }).select('-passwordHash');
        res.json({ success: true, admins });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;

