const Admin = require('../models/Admin.model');
const Student = require('../models/Student.model');
const Application = require('../models/Application.model');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendEmail, staffInvitationTemplate } = require('../utils/email.util');

const createAdmin = async (req, res) => {
    try {
        const { name, email, role, company } = req.body;

        const exists = await Admin.findOne({ email });
        if (exists) {
            return res.status(400).json({ success: false, message: 'Admin with this email already exists' });
        }

        if (role === 'company_admin' && !company) {
            return res.status(400).json({ success: false, message: 'Company name is required for company admin accounts.' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const resetPasswordExpire = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

        const admin = await Admin.create({
            name,
            email,
            passwordHash: crypto.randomBytes(16).toString('hex'),
            role: role || 'admin',
            company: role === 'company_admin' ? company : null,
            isActive: false,
            resetPasswordToken,
            resetPasswordExpire
        });

        const setupUrl = `http://localhost:5173/reset-password/${resetToken}`;
        const html = staffInvitationTemplate(admin.role, setupUrl);

        await sendEmail(admin.email, 'Staff Onboarding Invitation - CU Portal', html);

        res.status(201).json({
            success: true,
            message: 'Invitation email sent to new administrator',
            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                company: admin.company,
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


const Agreement = require('../models/Agreement.model');

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

        // Count unique students by roll number to ensure total accuracy
        const activeAggregation = await Application.aggregate([
            { $match: { status: { $in: ['pending', 'in_progress'] } } },
            {
                $lookup: {
                    from: 'students',
                    localField: 'studentId',
                    foreignField: '_id',
                    as: 'student'
                }
            },
            { $unwind: '$student' },
            { $group: { _id: '$student.rollNumber' } },
            { $count: 'count' }
        ]);

        const completedAggregation = await Application.aggregate([
            { $match: { status: 'completed' } },
            {
                $lookup: {
                    from: 'students',
                    localField: 'studentId',
                    foreignField: '_id',
                    as: 'student'
                }
            },
            { $unwind: '$student' },
            { $group: { _id: '$student.rollNumber' } },
            { $count: 'count' }
        ]);

        const activeCount = activeAggregation[0]?.count || 0;
        const completedCount = completedAggregation[0]?.count || 0;

        // Get count of pending agreements
        const pendingAgreementsCount = await Student.countDocuments({ internshipStatus: 'agreement_submitted' });

        // Get unique recent activities - Grouped by roll number + Status Prioritization
        const recentActivity = await Application.aggregate([
            // 1. Sort by status (alphabetical 'approved' comes before 'pending') and then date
            { $sort: { status: 1, createdAt: -1 } },
            {
                $lookup: {
                    from: 'students',
                    localField: 'studentId',
                    foreignField: '_id',
                    as: 'studentInfo'
                }
            },
            { $unwind: '$studentInfo' },
            {
                $group: {
                    _id: '$studentInfo.rollNumber',
                    application: { $first: '$$ROOT' },
                    studentName: { $first: '$studentInfo.name' },
                    studentId: { $first: '$studentInfo._id' }
                }
            },
            // 2. Limit to most recent unique students
            { $sort: { 'application.createdAt': -1 } },
            { $limit: 5 },
            {
                $project: {
                    _id: '$application._id',
                    studentId: {
                        _id: '$studentId',
                        name: '$studentName'
                    },
                    companyName: '$application.companyName',
                    position: '$application.position',
                    status: '$application.status',
                    createdAt: '$application.createdAt'
                }
            }
        ]);

        res.json({
            success: true,
            stats: {
                totalStudents,
                activeApplications: activeCount,
                completedPlacements: completedCount,
                pendingAgreements: pendingAgreementsCount,
                placementRate: totalStudents > 0 ? Math.round((completedCount / totalStudents) * 100) : 0
            },
            recentActivity
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const approveInternship = async (req, res) => {
    try {
        const { studentId, status, feedback } = req.body;

        if (!status || !['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        student.internshipStatus = status;
        await student.save();

        // Update all pending applications for this student to prevent dangling 'pending' records
        await Application.updateMany(
            { studentId, status: 'pending' },
            { status, feedback }
        );

        res.json({ success: true, message: `Internship request ${status} successfully` });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getPendingAgreements = async (req, res) => {
    try {
        const studentsWithAgreements = await Student.find({ internshipStatus: 'agreement_submitted' })
            .select('name rollNumber degree email')
            .lean();

        const agreements = await Agreement.find({ status: 'submitted' })
            .populate('studentId', 'name rollNumber degree email')
            .populate('applicationId', 'companyName position internshipType')
            .lean();

        res.json({ success: true, agreements });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const verifyAgreement = async (req, res) => {
    try {
        const { agreementId, status } = req.body; // status: 'verified' or 'rejected'

        if (!agreementId || !['verified', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid request' });
        }

        const agreement = await Agreement.findById(agreementId);
        if (!agreement) {
            return res.status(404).json({ success: false, message: 'Agreement not found' });
        }

        if (status === 'verified') {
            agreement.status = 'verified';
            await agreement.save();

            // Update student status to fully verified/unlocked
            await Student.findByIdAndUpdate(agreement.studentId, { internshipStatus: 'verified' });
        } else {
            // If rejected, student goes back to 'approved' to re-submit form
            await Student.findByIdAndUpdate(agreement.studentId, { internshipStatus: 'approved' });
            // Optionally delete or mark agreement as rejected
            agreement.status = 'submitted'; // Reset for re-submission or delete
            await agreement.save();
        }

        res.json({ success: true, message: `Agreement ${status} successfully` });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getVerifiedStudents = async (req, res) => {
    try {
        const students = await Student.find({ internshipStatus: 'verified' })
            .populate('supervisorId', 'name email')
            .select('-passwordHash');
        res.json({ success: true, students });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const assignInternship = async (req, res) => {
    try {
        const {
            studentId,
            facultySupervisorId,
            assignedCompany,
            assignedPosition,
            siteSupervisorName,
            siteSupervisorEmail,
            siteSupervisorPhone
        } = req.body;

        if (!studentId || !facultySupervisorId || !assignedCompany || !assignedPosition) {
            return res.status(400).json({ success: false, message: 'studentId, facultySupervisorId, assignedCompany, and assignedPosition are required.' });
        }

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found.' });
        }
        if (student.internshipStatus !== 'verified') {
            return res.status(400).json({ success: false, message: 'Student must have a verified agreement before internship can be assigned.' });
        }

        const supervisor = await Admin.findById(facultySupervisorId);
        if (!supervisor || !['admin', 'super_admin'].includes(supervisor.role)) {
            return res.status(404).json({ success: false, message: 'Faculty supervisor not found.' });
        }

        student.supervisorId = facultySupervisorId;
        student.assignedCompany = assignedCompany;
        student.assignedPosition = assignedPosition;
        student.siteSupervisorName = siteSupervisorName || null;
        student.siteSupervisorEmail = siteSupervisorEmail || null;
        student.siteSupervisorPhone = siteSupervisorPhone || null;
        student.internshipStatus = 'internship_assigned';
        await student.save();

        // Mark the student's application as in_progress
        await Application.updateMany(
            { studentId, status: 'approved' },
            { status: 'in_progress' }
        );

        res.json({ success: true, message: 'Internship assigned successfully.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


// Delete a faculty admin — also clears supervisorId on all their assigned students
const deleteAdmin = async (req, res) => {
    try {
        const { adminId } = req.params;

        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({ success: false, message: 'Faculty member not found.' });
        }
        if (admin.role === 'super_admin') {
            return res.status(403).json({ success: false, message: 'Cannot delete a super admin.' });
        }

        // Count how many students are currently assigned to this supervisor
        const affectedCount = await Student.countDocuments({ supervisorId: adminId });

        // Unset supervisorId on all assigned students
        await Student.updateMany({ supervisorId: adminId }, { $unset: { supervisorId: '' } });

        await Admin.findByIdAndDelete(adminId);

        res.json({
            success: true,
            message: `Faculty member deleted. ${affectedCount} student(s) unassigned.`,
            affectedCount
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Update faculty admin name / email
const updateAdmin = async (req, res) => {
    try {
        const { adminId } = req.params;
        const { name, email } = req.body;

        if (!name && !email) {
            return res.status(400).json({ success: false, message: 'Nothing to update.' });
        }

        // Check email uniqueness if changing email
        if (email) {
            const exists = await Admin.findOne({ email, _id: { $ne: adminId } });
            if (exists) {
                return res.status(400).json({ success: false, message: 'Email already in use by another account.' });
            }
        }

        const admin = await Admin.findByIdAndUpdate(
            adminId,
            { ...(name && { name }), ...(email && { email }) },
            { new: true }
        ).select('-passwordHash');

        if (!admin) {
            return res.status(404).json({ success: false, message: 'Faculty member not found.' });
        }

        res.json({ success: true, message: 'Faculty details updated.', admin });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Reassign a student to a different faculty supervisor
const changeSupervisor = async (req, res) => {
    try {
        const { studentId, newSupervisorId } = req.body;

        if (!studentId) {
            return res.status(400).json({ success: false, message: 'studentId is required.' });
        }

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found.' });
        }

        if (newSupervisorId) {
            const supervisor = await Admin.findById(newSupervisorId);
            if (!supervisor || !['admin', 'super_admin'].includes(supervisor.role)) {
                return res.status(404).json({ success: false, message: 'Supervisor not found.' });
            }
            student.supervisorId = newSupervisorId;
        } else {
            // null means "remove supervisor"
            student.supervisorId = undefined;
        }

        await student.save();
        await student.populate('supervisorId', 'name email');

        res.json({ success: true, message: 'Supervisor updated successfully.', student });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    createAdmin,
    getAllAdmins,
    getAllStudents,
    assignStudentToSupervisor,
    getDashboardStats,
    approveInternship,
    getPendingAgreements,
    verifyAgreement,
    getVerifiedStudents,
    assignInternship,
    deleteAdmin,
    updateAdmin,
    changeSupervisor
};

