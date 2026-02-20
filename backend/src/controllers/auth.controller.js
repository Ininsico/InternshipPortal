const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin.model');
const Student = require('../models/Student.model');
const { studentLoginSchema, adminLoginSchema } = require('../schemas/auth.schema');

const signToken = (payload) =>
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

const formatZodError = (err) => err.errors.map((e) => e.message).join(', ');

// ─── POST /api/auth/login/student ─────────────────────────────────────────────
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

// ─── POST /api/auth/login/admin ───────────────────────────────────────────────
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

module.exports = { loginStudent, loginAdmin };
