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

router.get('/profile', getStudentProfile);
router.get('/applications', getStudentApplications);
router.post('/apply', createApplication);
router.post('/agreement', submitAgreement);
router.get('/agreement', getAgreement);
router.get('/tasks', getMyTasks);
router.post('/submit', submitTask);         // existing
router.post('/submit-task', submitTask);    // alias used by frontend
router.get('/submissions', getMySubmissions);
router.get('/report', getMyReport);

module.exports = router;
