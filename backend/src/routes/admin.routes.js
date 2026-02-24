const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth.middleware');
const AdminController = require('../controllers/admin.controller');
const Report = require('../models/Report.model');
const Student = require('../models/Student.model');
const Application = require('../models/Application.model');
const Agreement = require('../models/Agreement.model');
const Submission = require('../models/Submission.model');

router.use(protect);

router.get('/dashboard-state', requireRole('admin', 'super_admin'), AdminController.getAdminDashboardState);
router.post('/resend-invitation/:adminId', requireRole('super_admin'), AdminController.resendAdminInvitation);
router.put('/students/:studentId/internship', requireRole('super_admin'), AdminController.updateStudentInternship);
router.get('/students/:studentId/placement-context', requireRole('super_admin'), AdminController.getStudentPlacementContext);

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
router.get('/stats', requireRole('admin', 'super_admin'), AdminController.getDashboardStats);

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
router.get('/students', requireRole('admin', 'super_admin'), AdminController.getAllStudents);

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
router.post('/create-admin', requireRole('super_admin'), AdminController.createAdmin);

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
router.get('/faculty', requireRole('super_admin'), AdminController.getAllAdmins);
router.get('/faculty/:adminId/students', requireRole('super_admin'), AdminController.getStudentsBySupervisor);
router.get('/company-admins', requireRole('super_admin'), AdminController.getCompanyAdmins);

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
router.put('/faculty/:adminId', requireRole('super_admin'), AdminController.updateAdmin);

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
router.delete('/faculty/:adminId', requireRole('super_admin'), AdminController.deleteAdmin);

/**
 * @openapi
 * /api/admin/students/{studentId}:
 *   delete:
 *     summary: Delete a student record (Super Admin)
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 */
router.delete('/students/:studentId', requireRole('super_admin'), AdminController.deleteStudent);

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
router.post('/assign-student', requireRole('super_admin'), AdminController.assignStudentToSupervisor);

/**
 * @openapi
 * /api/admin/change-supervisor:
 *   post:
 *     summary: Change faculty supervisor for a student
 *     tags: [Admin]
 */
router.post('/change-supervisor', requireRole('super_admin'), AdminController.changeSupervisor);

/**
 * @openapi
 * /api/admin/approve-internship:
 *   post:
 *     summary: Step 2 - Approve/Reject internship application
 *     tags: [Admin]
 */
router.post('/approve-internship', requireRole('super_admin'), AdminController.approveInternship);

/**
 * @openapi
 * /api/admin/agreements:
 *   get:
 *     summary: Step 4 - Get all pending agreements
 *     tags: [Admin]
 */
router.get('/agreements', requireRole('super_admin'), AdminController.getPendingAgreements);

/**
 * @openapi
 * /api/admin/verify-agreement:
 *   post:
 *     summary: Step 5 - Verify student agreement
 *     tags: [Admin]
 */
router.post('/verify-agreement', requireRole('super_admin'), AdminController.verifyAgreement);

/**
 * @openapi
 * /api/admin/verified-students:
 *   get:
 *     summary: Get students whose agreements are verified
 *     tags: [Admin]
 */
router.get('/verified-students', requireRole('super_admin'), AdminController.getVerifiedStudents);

/**
 * @openapi
 * /api/admin/partnered-companies:
 *   get:
 *     summary: Get list of partnered companies
 *     tags: [Admin]
 */
router.get('/partnered-companies', requireRole('super_admin'), AdminController.getPartneredCompanies);
router.post('/companies', requireRole('admin', 'super_admin'), AdminController.createCompany);
router.delete('/companies/:companyId', requireRole('super_admin'), AdminController.deleteCompany);

/**
 * @openapi
 * /api/admin/assign-internship:
 *   post:
 *     summary: Step 6 - Finalize internship assignment
 *     tags: [Admin]
 */
router.post('/assign-internship', requireRole('super_admin'), AdminController.assignInternship);

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
            .populate({
                path: 'student',
                select: 'name rollNumber degree assignedCompany assignedPosition siteSupervisorName siteSupervisorEmail siteSupervisorPhone supervisorId',
                populate: { path: 'supervisorId', select: 'name email' }
            })
            .populate('createdBy', 'name email')
            .sort({ updatedAt: -1 })
            .lean();
        res.json({ success: true, reports });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * @openapi
 * /api/admin/reports/{reportId}:
 *   delete:
 *     summary: Delete a report (Super Admin)
 *     tags: [Admin]
 */
router.delete('/reports/:reportId', requireRole('super_admin'), async (req, res) => {
    try {
        const report = await Report.findByIdAndDelete(req.params.reportId);
        if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });
        res.json({ success: true, message: 'Report deleted.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * @openapi
 * /api/admin/reports/{reportId}:
 *   put:
 *     summary: Update a report (Super Admin)
 *     tags: [Admin]
 */
router.put('/reports/:reportId', requireRole('super_admin'), async (req, res) => {
    try {
        const { summary, overallRating, recommendation, completionStatus, scores } = req.body;
        const report = await Report.findByIdAndUpdate(
            req.params.reportId,
            { summary, overallRating, recommendation, completionStatus, scores },
            { new: true }
        ).populate('student', 'name rollNumber degree assignedCompany')
            .populate('createdBy', 'name email');

        if (!report) return res.status(404).json({ success: false, message: 'Report not found.' });
        res.json({ success: true, report });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * @openapi
 * /api/admin/submissions:
 *   get:
 *     summary: View all student submissions (Super Admin)
 *     tags: [Admin]
 */
router.get('/submissions', requireRole('super_admin'), async (req, res) => {
    try {
        const submissions = await Submission.find()
            .populate('student', 'name rollNumber degree')
            .populate('task', 'title')
            .sort({ createdAt: -1 })
            .lean();
        res.json({ success: true, submissions });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

/**
 * @openapi
 * /api/admin/submissions/{submissionId}/grade:
 *   put:
 *     summary: Override a submission grade (Super Admin)
 *     tags: [Admin]
 */
router.put('/submissions/:submissionId/grade', requireRole('super_admin'), async (req, res) => {
    try {
        const { facultyGrade, companyGrade, status } = req.body;
        const submission = await Submission.findByIdAndUpdate(
            req.params.submissionId,
            { facultyGrade, companyGrade, status },
            { new: true }
        ).populate('student', 'name rollNumber').populate('task', 'title');

        if (!submission) return res.status(404).json({ success: false, message: 'Submission not found.' });
        res.json({ success: true, submission });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;

