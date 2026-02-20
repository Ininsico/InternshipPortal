const express = require('express');
const router = express.Router();
const { loginStudent, loginAdmin } = require('../controllers/auth.controller');

// POST /api/auth/login/student
router.post('/login/student', loginStudent);

// POST /api/auth/login/admin
router.post('/login/admin', loginAdmin);

module.exports = router;
