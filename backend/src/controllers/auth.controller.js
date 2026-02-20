const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Admin = require('../models/Admin.model');
const Student = require('../models/Student.model');
const { studentLoginSchema, adminLoginSchema, forgotPasswordSchema, resetPasswordSchema } = require('../schemas/auth.schema');
const { sendEmail, passwordResetTemplate } = require('../utils/email.util');

const signToken = (payload) =>
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

const formatZodError = (err) => err.errors.map((e) => e.message).join(', ');

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

        const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
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

module.exports = { loginStudent, loginAdmin, logout, getMe, forgotPassword, resetPassword };
