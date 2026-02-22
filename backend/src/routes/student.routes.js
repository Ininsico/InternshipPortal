const express = require('express');
const router = express.Router();
const {
    getStudentProfile,
    getStudentApplications,
    createApplication,
    submitAgreement,
    getAgreement,
    getMyTasks,
    submitTask,
    getMySubmissions,
    getMyReport,
} = require('../controllers/student.controller');
const { protect, requireRole } = require('../middleware/auth.middleware');

router.use(protect);
router.use(requireRole('student'));

/**
 * @openapi
 * /api/student/profile:
 *   get:
 *     summary: Get student profile
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile data
 */
router.get('/profile', getStudentProfile);

/**
 * @openapi
 * /api/student/applications:
 *   get:
 *     summary: Get student's internship applications
 *     tags: [Student]
 *     responses:
 *       200:
 *         description: List of applications
 */
router.get('/applications', getStudentApplications);

/**
 * @openapi
 * /api/student/apply:
 *   post:
 *     summary: Submit new internship request
 *     tags: [Student]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyName:
 *                 type: string
 *               position:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Application created
 */
router.post('/apply', createApplication);

/**
 * @openapi
 * /api/student/agreement:
 *   post:
 *     summary: Submit student agreement (Contract)
 *     tags: [Student]
 *     responses:
 *       200:
 *         description: Agreement saved
 */
router.post('/agreement', submitAgreement);

/**
 * @openapi
 * /api/student/agreement:
 *   get:
 *     summary: Get submitted agreement
 *     tags: [Student]
 *     responses:
 *       200:
 *         description: Agreement data
 */
router.get('/agreement', getAgreement);

/**
 * @openapi
 * /api/student/tasks:
 *   get:
 *     summary: Get tasks from assigned company
 *     tags: [Student]
 *     responses:
 *       200:
 *         description: List of tasks with submission status
 */
router.get('/tasks', getMyTasks);

/**
 * @openapi
 * /api/student/submit-task:
 *   post:
 *     summary: Submit work for a task
 *     tags: [Student]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               taskId:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Submission saved
 */
router.post('/submit', submitTask);
router.post('/submit-task', submitTask);

/**
 * @openapi
 * /api/student/submissions:
 *   get:
 *     summary: Get all my submissions
 *     tags: [Student]
 *     responses:
 *       200:
 *         description: List of submissions
 */
router.get('/submissions', getMySubmissions);

/**
 * @openapi
 * /api/student/report:
 *   get:
 *     summary: Get faculty internship report
 *     tags: [Student]
 *     responses:
 *       200:
 *         description: Report data
 */
router.get('/report', getMyReport);

module.exports = router;
