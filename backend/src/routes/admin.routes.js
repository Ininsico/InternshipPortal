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
    changeSupervisor,
    getPartneredCompanies
} = require('../controllers/admin.controller');
const { protect, requireRole } = require('../middleware/auth.middleware');
const Report = require('../models/Report.model');

router.use(protect);

/**
 * @openapi
 * /api/admin/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved stats
 */
router.get('/stats', requireRole('admin', 'super_admin'), getDashboardStats);

/**
 * @openapi
 * /api/admin/students:
 *   get:
 *     summary: View all students
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of students
 */
router.get('/students', requireRole('admin', 'super_admin'), getAllStudents);

/**
 * @openapi
 * /api/admin/application/{studentId}:
 *   get:
 *     summary: View a specific student's latest application
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Application data
 */
router.get('/application/:studentId', requireRole('super_admin'), async (req, res) => {
    try {
        const Application = require('../models/Application.model');
        const application = await Application.findOne({ studentId: req.params.studentId }).sort({ createdAt: -1 });
        if (!application) return res.status(404).json({ success: false, message: 'No application found.' });
        res.json({ success: true, application });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * @openapi
 * /api/admin/create-admin:
 *   post:
 *     summary: Create a new admin or company user (Super Admin only)
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               role: { type: string, enum: [admin, company_admin] }
 *     responses:
 *       201:
 *         description: Admin created
 */
router.post('/create-admin', requireRole('super_admin'), createAdmin);

/**
 * @openapi
 * /api/admin/faculty:
 *   get:
 *     summary: Get all faculty members
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/faculty', requireRole('super_admin'), getAllAdmins);

/**
 * @openapi
 * /api/admin/faculty/{adminId}:
 *   put:
 *     summary: Update faculty details
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: adminId
 *         required: true
 */
router.put('/faculty/:adminId', requireRole('super_admin'), updateAdmin);

/**
 * @openapi
 * /api/admin/faculty/{adminId}:
 *   delete:
 *     summary: Delete a faculty member
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: adminId
 *         required: true
 */
router.delete('/faculty/:adminId', requireRole('super_admin'), deleteAdmin);

/**
 * @openapi
 * /api/admin/assign-student:
 *   post:
 *     summary: Assign a student to a faculty supervisor
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentId: { type: string }
 *               supervisorId: { type: string }
 */
router.post('/assign-student', requireRole('super_admin'), assignStudentToSupervisor);

/**
 * @openapi
 * /api/admin/change-supervisor:
 *   post:
 *     summary: Change faculty supervisor for a student
 *     tags: [Admin]
 */
router.post('/change-supervisor', requireRole('super_admin'), changeSupervisor);

/**
 * @openapi
 * /api/admin/approve-internship:
 *   post:
 *     summary: Step 2 - Approve/Reject internship application
 *     tags: [Admin]
 */
router.post('/approve-internship', requireRole('super_admin'), approveInternship);

/**
 * @openapi
 * /api/admin/agreements:
 *   get:
 *     summary: Step 4 - Get all pending agreements
 *     tags: [Admin]
 */
router.get('/agreements', requireRole('super_admin'), getPendingAgreements);

/**
 * @openapi
 * /api/admin/verify-agreement:
 *   post:
 *     summary: Step 5 - Verify student agreement
 *     tags: [Admin]
 */
router.post('/verify-agreement', requireRole('super_admin'), verifyAgreement);

/**
 * @openapi
 * /api/admin/verified-students:
 *   get:
 *     summary: Get students whose agreements are verified
 *     tags: [Admin]
 */
router.get('/verified-students', requireRole('super_admin'), getVerifiedStudents);

/**
 * @openapi
 * /api/admin/partnered-companies:
 *   get:
 *     summary: Get list of partnered companies
 *     tags: [Admin]
 */
router.get('/partnered-companies', requireRole('super_admin'), getPartneredCompanies);

/**
 * @openapi
 * /api/admin/assign-internship:
 *   post:
 *     summary: Step 6 - Finalize internship assignment
 *     tags: [Admin]
 */
router.post('/assign-internship', requireRole('super_admin'), assignInternship);

/**
 * @openapi
 * /api/admin/reports:
 *   get:
 *     summary: View all faculty reports globally
 *     tags: [Admin]
 */
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

/**
 * @openapi
 * /api/admin/company-admins:
 *   get:
 *     summary: Get all company administrators
 *     tags: [Admin]
 */
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

