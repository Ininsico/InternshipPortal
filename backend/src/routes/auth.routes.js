const express = require('express');
const router = express.Router();
const { loginStudent, loginAdmin, logout, getMe, forgotPassword, resetPassword } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/login/student', loginStudent);
router.post('/login/admin', loginAdmin);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
