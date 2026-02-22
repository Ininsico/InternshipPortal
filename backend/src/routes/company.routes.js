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

router.get('/students', getMyStudents);
router.get('/tasks', getMyTasks);
router.post('/tasks', createTask);
router.put('/tasks/:taskId', updateTask);
router.delete('/tasks/:taskId', deleteTask);
router.get('/submissions', getSubmissions);
router.put('/submissions/:submissionId/grade', gradeSubmission);

module.exports = router;
