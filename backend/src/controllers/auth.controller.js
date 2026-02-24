const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Admin = require('../models/Admin.model');
const Student = require('../models/Student.model');
const { studentLoginSchema, adminLoginSchema, forgotPasswordSchema, resetPasswordSchema } = require('../schemas/auth.schema');
const { sendEmail, passwordResetTemplate, otpVerificationTemplate } = require('../utils/email.util');

const signToken = (payload) =>
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

const formatZodError = (err) => err.errors.map((e) => e.message).join(', ');

/** Generate a random 6-digit numeric OTP */
const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/signup/student
// Requires @cuiatd.edu.pk email. Creates unverified student, sends OTP.
// ─────────────────────────────────────────────────────────────────────────────
const signupStudent = async (req, res) => {
    const { name, email, rollNumber, password } = req.body;

    // Validate required fields
    if (!name || !email || !rollNumber || !password) {
        return res.status(400).json({ success: false, message: 'Name, email, roll number, and password are all required.' });
    }

    // Enforce university email
    if (!email.toLowerCase().endsWith('@cuiatd.edu.pk')) {
        return res.status(400).json({ success: false, message: 'You must use your @cuiatd.edu.pk university email to register.' });
    }

    if (password.length < 6) {
        return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    try {
        // Check if email already registered
        const existingEmail = await Student.findOne({ email: email.toLowerCase() });
        if (existingEmail) {
            if (existingEmail.isEmailVerified) {
                return res.status(400).json({ success: false, message: 'An account with this email already exists. Please sign in.' });
            }
            // Unverified — resend OTP below
            const otp = generateOtp();
            existingEmail.emailOtp = otp;
            existingEmail.emailOtpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 min
            await existingEmail.save();
            const html = otpVerificationTemplate(existingEmail.name, otp);
            await sendEmail(existingEmail.email, 'Verify Your Email — CU Portal', html);
            return res.json({ success: true, message: 'A new verification code has been sent to your email.', pendingEmail: existingEmail.email });
        }

        // Check roll number uniqueness
        const existingRoll = await Student.findOne({ rollNumber: rollNumber.toUpperCase() });
        if (existingRoll) {
            return res.status(400).json({ success: false, message: 'A student with this roll number already exists.' });
        }

        // Parse rollNumber to extract session, degree, serialNo
        // Expected format: FA21-BCS-015
        const rollParts = rollNumber.toUpperCase().trim().match(/^([A-Z]{2}\d{2})-([A-Z]{2,3})-(\d+)$/);
        if (!rollParts) {
            return res.status(400).json({ success: false, message: 'Invalid roll number format. Expected: FA21-BCS-015' });
        }
        const [, session, degree, serialNo] = rollParts;

        const otp = generateOtp();
        const student = await Student.create({
            name: name.trim(),
            email: email.toLowerCase(),
            rollNumber: rollNumber.toUpperCase().trim(),
            session,
            degree,
            serialNo,
            passwordHash: password,   // schema pre-save hook hashes this
            isActive: false,           // becomes active after email verification
            isEmailVerified: false,
            emailOtp: otp,
            emailOtpExpire: new Date(Date.now() + 10 * 60 * 1000),
        });

        const html = otpVerificationTemplate(student.name, otp);
        await sendEmail(student.email, 'Verify Your Email — CU Portal', html);

        return res.status(201).json({
            success: true,
            message: 'Account created! A 6-digit verification code has been sent to your university email.',
            pendingEmail: student.email,
        });
    } catch (err) {
        console.error('signupStudent:', err);
        return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/verify-otp
// Verifies the OTP and activates the student account.
// ─────────────────────────────────────────────────────────────────────────────
const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
    }

    try {
        const student = await Student.findOne({ email: email.toLowerCase() });
        if (!student) {
            return res.status(404).json({ success: false, message: 'No account found for this email.' });
        }
        if (student.isEmailVerified) {
            return res.status(400).json({ success: false, message: 'Email is already verified. Please sign in.' });
        }
        if (!student.emailOtp || !student.emailOtpExpire) {
            return res.status(400).json({ success: false, message: 'No OTP found. Please request a new one.' });
        }
        if (new Date() > student.emailOtpExpire) {
            return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new one.' });
        }
        if (student.emailOtp !== otp.trim()) {
            return res.status(400).json({ success: false, message: 'Incorrect verification code. Please try again.' });
        }

        // Mark verified & activate account
        student.isEmailVerified = true;
        student.isActive = true;
        student.emailOtp = undefined;
        student.emailOtpExpire = undefined;
        await student.save();

        const token = signToken({ id: student._id, role: 'student', rollNumber: student.rollNumber });

        return res.json({
            success: true,
            message: 'Email verified! Welcome to the CU Internship Portal.',
            token,
            user: {
                id: student._id,
                name: student.name,
                rollNumber: student.rollNumber,
                email: student.email,
                role: 'student',
                internshipStatus: student.internshipStatus,
            },
        });
    } catch (err) {
        console.error('verifyOtp:', err);
        return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/resend-otp
// Resends a new OTP to the given email (for unverified accounts).
// ─────────────────────────────────────────────────────────────────────────────
const resendOtp = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required.' });
    }
    try {
        const student = await Student.findOne({ email: email.toLowerCase() });
        if (!student) {
            return res.status(404).json({ success: false, message: 'No account found for this email.' });
        }
        if (student.isEmailVerified) {
            return res.status(400).json({ success: false, message: 'Account is already verified.' });
        }

        const otp = generateOtp();
        student.emailOtp = otp;
        student.emailOtpExpire = new Date(Date.now() + 10 * 60 * 1000);
        await student.save();

        const html = otpVerificationTemplate(student.name, otp);
        await sendEmail(student.email, 'Your New Verification Code — CU Portal', html);

        return res.json({ success: true, message: 'A new verification code has been sent.' });
    } catch (err) {
        console.error('resendOtp:', err);
        return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
};

const loginStudent = async (req, res) => {
    const parse = studentLoginSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ success: false, message: formatZodError(parse.error) });
    }

    const { session, degree, rollId, password } = parse.data;
    const rollNumber = `${session}-${degree}-${rollId}`.toUpperCase();

    try {
        const student = await Student.findOne({ rollNumber, isActive: true });
        if (!student) {
            return res.status(401).json({ success: false, message: 'Student not found or account inactive.' });
        }

        // Enforce allowed degrees
        const allowedDegrees = ['BSE', 'BCS', 'BBA'];
        if (!allowedDegrees.includes(student.degree)) {
            return res.status(403).json({ success: false, message: `Access denied. Your degree (${student.degree}) is not authorized for this portal.` });
        }

        const match = await student.comparePassword(password);
        if (!match) {
            return res.status(401).json({ success: false, message: 'Incorrect password.' });
        }

        const token = signToken({ id: student._id, role: 'student', rollNumber });

        return res.json({
            success: true,
            message: `Welcome back, ${student.name}!`,
            token,
            user: {
                id: student._id,
                name: student.name,
                rollNumber: student.rollNumber,
                email: student.email,
                role: 'student',
                internshipStatus: student.internshipStatus,
            },
        });
    } catch (err) {
        console.error('loginStudent:', err);
        return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
};

const loginAdmin = async (req, res) => {
    const parse = adminLoginSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ success: false, message: formatZodError(parse.error) });
    }

    const { email, password } = parse.data;

    try {
        const admin = await Admin.findOne({ email, isActive: true });
        if (!admin) {
            return res.status(401).json({ success: false, message: 'Admin not found or account inactive.' });
        }

        const match = await admin.comparePassword(password);
        if (!match) {
            return res.status(401).json({ success: false, message: 'Incorrect password.' });
        }

        const token = signToken({ id: admin._id, role: admin.role, email: admin.email });

        return res.json({
            success: true,
            message: `Welcome, ${admin.name}!`,
            token,
            user: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                company: admin.company || null,
            },
        });
    } catch (err) {
        console.error('loginAdmin:', err);
        return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
    }
};

const logout = async (req, res) => {
    try {
        return res.json({
            success: true,
            message: 'Logged out successfully.'
        });
    } catch (err) {
        console.error('logout:', err);
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
};

const getMe = async (req, res) => {
    try {
        const { id, role } = req.user;

        if (role === 'student') {
            const student = await Student.findById(id).select('-passwordHash');
            if (!student) {
                return res.status(404).json({ success: false, message: 'Student not found.' });
            }
            return res.json({
                success: true,
                user: {
                    id: student._id,
                    name: student.name,
                    rollNumber: student.rollNumber,
                    email: student.email,
                    session: student.session,
                    degree: student.degree,
                    role: 'student',
                    internshipStatus: student.internshipStatus,
                },
            });
        }

        const admin = await Admin.findById(id).select('-passwordHash');
        if (!admin) {
            return res.status(404).json({ success: false, message: 'Admin not found.' });
        }
        return res.json({
            success: true,
            user: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                company: admin.company || null,
            },
        });
    } catch (err) {
        console.error('getMe:', err);
        return res.status(500).json({ success: false, message: 'Server error.' });
    }
};

const forgotPassword = async (req, res) => {
    const parse = forgotPasswordSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ success: false, message: formatZodError(parse.error) });
    }

    const { email } = parse.data;

    try {
        // Search in both Student and Admin
        let userInstance = await Student.findOne({ email });
        let role = 'student';

        if (!userInstance) {
            userInstance = await Admin.findOne({ email });
            role = 'admin';
        }

        if (!userInstance) {
            // For security, don't reveal if user exists or not
            return res.json({ success: true, message: 'If an account exists with this email, a reset link has been sent.' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        userInstance.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        userInstance.resetPasswordExpire = Date.now() + 3600000; // 1 hour

        await userInstance.save();

        const frontendUrl = (process.env.FRONTEND_URL || '').replace(/\/$/, '');
        const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
        const html = passwordResetTemplate(userInstance.name, resetUrl);

        await sendEmail(userInstance.email, 'Password Reset Request - CU Portal', html);

        return res.json({ success: true, message: 'If an account exists with this email, a reset link has been sent.' });
    } catch (err) {
        console.error('forgotPassword:', err);
        return res.status(500).json({ success: false, message: 'Error sending reset email.' });
    }
};

const resetPassword = async (req, res) => {
    const parse = resetPasswordSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ success: false, message: formatZodError(parse.error) });
    }

    const { token, password } = parse.data;
    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

    try {
        let userInstance = await Student.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!userInstance) {
            userInstance = await Admin.findOne({
                resetPasswordToken,
                resetPasswordExpire: { $gt: Date.now() }
            });
        }

        if (!userInstance) {
            return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
        }

        userInstance.passwordHash = password;
        userInstance.isActive = true; // Activate account if it was inactive
        userInstance.resetPasswordToken = undefined;
        userInstance.resetPasswordExpire = undefined;

        await userInstance.save();

        return res.json({ success: true, message: 'Password reset successful. You can now log in.' });
    } catch (err) {
        console.error('resetPassword:', err);
        return res.status(500).json({ success: false, message: 'Error resetting password.' });
    }
};

const completeOnboarding = async (req, res) => {
    const { token, password, name } = req.body;

    if (!token || !password) {
        return res.status(400).json({ success: false, message: 'Token and password are required.' });
    }

    try {
        const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

        const admin = await Admin.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!admin) {
            return res.status(400).json({ success: false, message: 'Invalid or expired invitation token.' });
        }

        if (name) admin.name = name;
        admin.passwordHash = password;
        admin.isActive = true;
        admin.resetPasswordToken = undefined;
        admin.resetPasswordExpire = undefined;

        await admin.save();

        return res.json({ success: true, message: 'Account activation successful. You can now log in.' });
    } catch (err) {
        console.error('completeOnboarding:', err);
        return res.status(500).json({ success: false, message: 'Error completing onboarding.' });
    }
};

module.exports = {
    signupStudent,
    verifyOtp,
    resendOtp,
    loginStudent,
    loginAdmin,
    logout,
    getMe,
    forgotPassword,
    resetPassword,
    completeOnboarding
};
