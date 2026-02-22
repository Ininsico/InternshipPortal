const express = require('express');
const router = express.Router();
const {
    getMyStudents,
    createTask,
    getMyTasks,
    updateTask,
    deleteTask,
    getSubmissions,
    gradeSubmission,
} = require('../controllers/company.controller');
const { protect, requireRole, loadAdmin } = require('../middleware/auth.middleware');

// All company routes require a valid JWT, company_admin role, and a full admin document loaded
router.use(protect);
router.use(requireRole('company_admin'));
router.use(loadAdmin);

/**
 * @openapi
 * /api/company/students:
 *   get:
 *     summary: Get interns assigned to this company
 *     tags: [Company]
 *     responses:
 *       200:
 *         description: List of students
 */
router.get('/students', getMyStudents);

/**
 * @openapi
 * /api/company/tasks:
 *   get:
 *     summary: Get tasks created by this company
 *     tags: [Company]
 *     responses:
 *       200:
 *         description: List of tasks
 */
router.get('/tasks', getMyTasks);

/**
 * @openapi
 * /api/company/tasks:
 *   post:
 *     summary: Create a new task for interns
 *     tags: [Company]
 *     responses:
 *       201:
 *         description: Task created
 */
router.post('/tasks', createTask);

/**
 * @openapi
 * /api/company/tasks/{taskId}:
 *   put:
 *     summary: Update a task
 *     tags: [Company]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *     responses:
 *       200:
 *         description: Task updated
 */
router.put('/tasks/:taskId', updateTask);

/**
 * @openapi
 * /api/company/tasks/{taskId}:
 *   delete:
 *     summary: Delete a task
 *     tags: [Company]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 */
router.delete('/tasks/:taskId', deleteTask);

/**
 * @openapi
 * /api/company/submissions:
 *   get:
 *     summary: Get all submissions for company tasks
 *     tags: [Company]
 */
router.get('/submissions', getSubmissions);

/**
 * @openapi
 * /api/company/submissions/{submissionId}/grade:
 *   put:
 *     summary: Grade a student submission
 *     tags: [Company]
 *     parameters:
 *       - in: path
 *         name: submissionId
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               marks:
 *                 type: number
 *               feedback:
 *                 type: string
 */
router.put('/submissions/:submissionId/grade', gradeSubmission);

module.exports = router;
