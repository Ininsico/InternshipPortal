const express = require('express');
const router = express.Router();
const { loginStudent, loginAdmin, logout, getMe, forgotPassword, resetPassword } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

/**
 * @openapi
 * /api/auth/login/student:
 *   post:
 *     summary: Login for students
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               session:
 *                 type: string
 *               degree:
 *                 type: string
 *               rollNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/login/student', loginStudent);

/**
 * @openapi
 * /api/auth/login/admin:
 *   post:
 *     summary: Login for Admins/Faculty/Company
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/login/admin', loginAdmin);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout', protect, logout);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User data
 */
router.get('/me', protect, getMe);

/**
 * @openapi
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Email sent
 */
router.post('/forgot-password', forgotPassword);

/**
 * @openapi
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password with token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Password updated
 */
router.post('/reset-password', resetPassword);

module.exports = router;
