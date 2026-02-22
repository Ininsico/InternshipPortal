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

router.get('/students', getMyStudents);
router.get('/submissions', getStudentSubmissions);
router.put('/submissions/:submissionId/grade', gradeSubmission);
router.post('/reports', createReport);
router.get('/reports', getMyReports);

module.exports = router;
