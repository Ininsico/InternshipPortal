const Admin = require('../models/Admin.model');
const Student = require('../models/Student.model');
const Application = require('../models/Application.model');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendEmail, staffInvitationTemplate } = require('../utils/email.util');

const createAdmin = async (req, res) => {
    try {
        const { name, email, role } = req.body;

        const exists = await Admin.findOne({ email });
        if (exists) {
            return res.status(400).json({ success: false, message: 'Admin with this email already exists' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const resetPasswordExpire = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

        // Create admin with temporary random password and inactive status
        const admin = await Admin.create({
            name,
            email,
            passwordHash: crypto.randomBytes(16).toString('hex'), // Random temp password
            role: role || 'admin',
            isActive: false, // Inactive until password is set
            resetPasswordToken,
            resetPasswordExpire
        });

        const setupUrl = `http://localhost:5173/reset-password/${resetToken}`;
        const html = staffInvitationTemplate(admin.role, setupUrl);

        await sendEmail(admin.email, 'Faculty Onboarding Invitation - CU Portal', html);

        res.status(201).json({
            success: true,
            message: 'Invitation email sent to new administrator',
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.find({ role: 'admin' }).select('-passwordHash');
        res.json({ success: true, admins });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getAllStudents = async (req, res) => {
    try {
        const students = await Student.find()
            .populate('supervisorId', 'name email')
            .select('-passwordHash');
        res.json({ success: true, students });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const assignStudentToSupervisor = async (req, res) => {
    try {
        const { studentId, supervisorId } = req.body;

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const supervisor = await Admin.findById(supervisorId);
        if (!supervisor || supervisor.role !== 'admin') {
            return res.status(404).json({ success: false, message: 'Supervisor not found or invalid role' });
        }

        student.supervisorId = supervisorId;
        await student.save();

        res.json({ success: true, message: 'Student assigned to supervisor successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getDashboardStats = async (req, res) => {
    try {
        const totalStudents = await Student.countDocuments();
        const activeApplications = await Application.countDocuments({ status: { $in: ['pending', 'in_progress'] } });
        const completedPlacements = await Application.countDocuments({ status: 'completed' });

        const recentActivity = await Application.find()
            .populate('studentId', 'name')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            success: true,
            stats: {
                totalStudents,
                activeApplications,
                completedPlacements,
                placementRate: totalStudents > 0 ? Math.round((completedPlacements / totalStudents) * 100) : 0
            },
            recentActivity
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    createAdmin,
    getAllAdmins,
    getAllStudents,
    assignStudentToSupervisor,
    getDashboardStats
};
