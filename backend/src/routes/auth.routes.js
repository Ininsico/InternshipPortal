const express = require('express');
const router = express.Router();
const { signupStudent, verifyOtp, resendOtp, loginStudent, loginAdmin, logout, getMe, forgotPassword, resetPassword, completeOnboarding, verifyOnboarding } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

// ── Student Signup (OTP-based email verification) ──────────────────────────
router.post('/signup/student', signupStudent);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);


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
 *             required: [session, degree, rollNumber]
 *             properties:
 *               session: { type: string }
 *               degree: { type: string }
 *               rollNumber: { type: string }
 *     responses:
 *       200:
 *         description: Success
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
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Success
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
 *         description: Success
 */
router.post('/logout', protect, logout);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Get current authenticated user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/me', protect, getMe);

/**
 * @openapi
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string }
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/forgot-password', forgotPassword);

/**
 * @openapi
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password using token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/reset-password', resetPassword);
router.post('/complete-onboarding', completeOnboarding);
router.get('/verify-onboarding/:token', verifyOnboarding);

module.exports = router;
