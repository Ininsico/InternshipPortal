const express = require('express');
const router = express.Router();
const { loginStudent, loginAdmin, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/login/student', loginStudent);
router.post('/login/admin', loginAdmin);
router.get('/me', protect, getMe);

module.exports = router;
