const express = require('express');
const router = express.Router();
const {
    getMyStudents,
    getStudentSubmissions,
    gradeSubmission,
    createReport,
    getMyReports,
} = require('../controllers/faculty.controller');
const { createCompany } = require('../controllers/admin.controller');
const { protect, requireRole, loadAdmin } = require('../middleware/auth.middleware');
const Report = require('../models/Report.model');

// All faculty routes require valid JWT, restricted to admins and super admins
router.use(protect);
router.use(requireRole('admin', 'super_admin'));
router.use(loadAdmin);

/**
 * @openapi
 * /api/faculty/students:
 *   get:
 *     summary: Get students supervised by this faculty
 *     tags: [Faculty]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/students', getMyStudents);

/**
 * @openapi
 * /api/faculty/submissions:
 *   get:
 *     summary: Get submissions from supervised students
 *     tags: [Faculty]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/submissions', getStudentSubmissions);

/**
 * @openapi
 * /api/faculty/submissions/{submissionId}/grade:
 *   put:
 *     summary: Grade a student submission
 *     tags: [Faculty]
 *     parameters:
 *       - in: path
 *         name: submissionId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [marks]
 *             properties:
 *               marks: { type: number }
 *               feedback: { type: string }
 *     responses:
 *       200:
 *         description: Success
 */
router.put('/submissions/:submissionId/grade', gradeSubmission);

/**
 * @openapi
 * /api/faculty/reports:
 *   post:
 *     summary: Create an internship report for a student
 *     tags: [Faculty]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [studentId, summary, overallRating, recommendation]
 *             properties:
 *               studentId: { type: string }
 *               summary: { type: string }
 *               overallRating: { type: number }
 *               recommendation: { type: string }
 *               completionStatus: { type: string }
 *               scores: 
 *                 type: object
 *                 properties:
 *                   technical: { type: number }
 *                   communication: { type: number }
 *                   teamwork: { type: number }
 *                   punctuality: { type: number }
 *     responses:
 *       201:
 *         description: Success
 */
router.post('/reports', createReport);

/**
 * @openapi
 * /api/faculty/reports:
 *   get:
 *     summary: Get reports created by this faculty
 *     tags: [Faculty]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/reports', getMyReports);
router.post('/companies', createCompany);

/**
 * @openapi
 * /api/faculty/reports/{reportId}:
 *   delete:
 *     summary: Delete a faculty report
 *     tags: [Faculty]
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Success
 */
router.delete('/reports/:reportId', async (req, res) => {
    try {
        const { reportId } = req.params;
        const report = await Report.findOneAndDelete({ _id: reportId, createdBy: req.admin._id });
        if (!report) return res.status(404).json({ success: false, message: 'Report not found or not yours.' });
        res.json({ success: true, message: 'Report deleted.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
