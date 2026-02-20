const express = require('express');
const router = express.Router();
const {
    getStudentProfile,
    getStudentApplications,
    createApplication
} = require('../controllers/student.controller');
const { protect, requireRole } = require('../middleware/auth.middleware');

router.use(protect);
router.use(requireRole('student'));

router.get('/profile', getStudentProfile);
router.get('/applications', getStudentApplications);
router.post('/apply', createApplication);

module.exports = router;
