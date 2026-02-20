const express = require('express');
const router = express.Router();
const { loginStudent, loginAdmin, logout, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/login/student', loginStudent);
router.post('/login/admin', loginAdmin);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;
