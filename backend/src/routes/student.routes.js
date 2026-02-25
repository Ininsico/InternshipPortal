const express = require('express');
const router = express.Router();
const {
    getStudentProfile,
    getStudentApplications,
    createApplication,
    submitAgreement,
    getAgreement,
    getMyTasks,
    getDashboardState,
    submitTask,
    getMySubmissions,
    getMyReport,
    updateProfilePicture,
    submitWeeklyUpdate,
    getMyWeeklyUpdates,
} = require('../controllers/student.controller');
const { protect, requireRole } = require('../middleware/auth.middleware');
const { upload } = require('../config/cloudinary.config');

router.use(protect);
router.use(requireRole('student'));

router.get('/dashboard-state', getDashboardState);

/**
 * @openapi
 * /api/student/profile:
 *   get:
 *     summary: Get student profile details
 *     tags: [Student]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/profile', getStudentProfile);

/**
 * @openapi
 * /api/student/profile-picture:
 *   post:
 *     summary: Update profile picture
 *     tags: [Student]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/profile-picture', upload.single('profilePicture'), updateProfilePicture);

/**
 * @openapi
 * /api/student/applications:
 *   get:
 *     summary: Get student's internship applications
 *     tags: [Student]
 *     responses:
 *       200:
 *         description: Success
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
 *             required: [companyName, position]
 *             properties:
 *               companyName:
 *                 type: string
 *               position:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Success
 */
router.post('/apply', upload.array('files'), createApplication);

/**
 * @openapi
 * /api/student/agreement:
 *   post:
 *     summary: Submit student agreement form
 *     tags: [Student]
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/agreement', submitAgreement);

/**
 * @openapi
 * /api/student/agreement:
 *   get:
 *     summary: Get submitted agreement data
 *     tags: [Student]
 *     responses:
 *       200:
 *         description: Success
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
 *         description: Success
 */
router.get('/tasks', getMyTasks);

/**
 * @openapi
 * /api/student/submit-task:
 *   post:
 *     summary: Submit work for a specific task
 *     tags: [Student]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [taskId]
 *             properties:
 *               taskId:
 *                 type: string
 *               content:
 *                 type: string
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/submit-task', upload.array('files'), submitTask);

/**
 * @openapi
 * /api/student/submissions:
 *   get:
 *     summary: Get all submissions made by the student
 *     tags: [Student]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/submissions', getMySubmissions);

/**
 * @openapi
 * /api/student/report:
 *   get:
 *     summary: Get final faculty internship report
 *     tags: [Student]
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/report', getMyReport);

// Weekly updates (freelancer interns only)
router.post('/weekly-update', submitWeeklyUpdate);
router.get('/weekly-updates', getMyWeeklyUpdates);

module.exports = router;
