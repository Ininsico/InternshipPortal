const express = require('express');
const router = express.Router();
const {
    getMyStudents,
    getStudentSubmissions,
    gradeSubmission,
    createReport,
    getMyReports,
} = require('../controllers/faculty.controller');
const { protect, requireRole, loadAdmin } = require('../middleware/auth.middleware');

// All faculty routes require valid JWT, admin role, and full admin document loaded
router.use(protect);
router.use(requireRole('admin'));
router.use(loadAdmin);

/**
 * @openapi
 * /api/faculty/students:
 *   get:
 *     summary: Get students supervised by this faculty
 *     tags: [Faculty]
 *     responses:
 *       200:
 *         description: List of students
 */
router.get('/students', getMyStudents);

/**
 * @openapi
 * /api/faculty/submissions:
 *   get:
 *     summary: Get submissions from supervised students
 *     tags: [Faculty]
 */
router.get('/submissions', getStudentSubmissions);

/**
 * @openapi
 * /api/faculty/grade:
 *   put:
 *     summary: Grade a student submission
 *     tags: [Faculty]
 */
router.put('/grade', gradeSubmission);

/**
 * @openapi
 * /api/faculty/report:
 *   post:
 *     summary: Create an internship report for a student
 *     tags: [Faculty]
 */
router.post('/report', createReport);

/**
 * @openapi
 * /api/faculty/reports:
 *   get:
 *     summary: Get reports created by this faculty
 *     tags: [Faculty]
 */
router.get('/reports', getMyReports);

module.exports = router;
