const Admin = require('../models/Admin.model');
const Student = require('../models/Student.model');
const Application = require('../models/Application.model');
const Agreement = require('../models/Agreement.model');
const Submission = require('../models/Submission.model');
const Task = require('../models/Task.model');
const Report = require('../models/Report.model');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendEmail, staffInvitationTemplate } = require('../utils/email.util');
const Company = require('../models/Company.model');

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

        if (role === 'company_admin' && company) {
            const companyExists = await Company.findOne({ name: new RegExp(`^${company}$`, 'i') });
            if (!companyExists) {
                await Company.create({ name: company, email: email, isPartnered: true });
            }
        }

        const admin = await Admin.create({
            name,
            email,
            passwordHash: crypto.randomBytes(16).toString('hex'),
            role: role || 'admin',
            company: role === 'company_admin' ? company : null,
            isActive: false, // Inactive until onboarding completed
            resetPasswordToken,
            resetPasswordExpire
        });

        const frontendUrl = (process.env.FRONTEND_URL || '').replace(/\/$/, '');
        const setupUrl = `${frontendUrl}/complete-onboarding/${resetToken}`;
        const html = staffInvitationTemplate(admin.role, setupUrl);

        await sendEmail(admin.email, 'Staff Onboarding Invitation - CU Portal', html);

        res.status(201).json({
            success: true,
            message: 'Invitation email sent to new administrator',
            admin: {
                id: admin._id,
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                company: admin.company,
                isActive: admin.isActive
            }
        });
    } catch (err) {
        console.error('Error in createAdmin:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

const resendAdminInvitation = async (req, res) => {
    try {
        const { adminId } = req.params;
        const admin = await Admin.findById(adminId);

        if (!admin) {
            return res.status(404).json({ success: false, message: 'Administrator not found' });
        }

        if (admin.isActive) {
            return res.status(400).json({ success: false, message: 'This account is already active.' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        admin.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        admin.resetPasswordExpire = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
        await admin.save();

        const frontendUrl = (process.env.FRONTEND_URL || '').replace(/\/$/, '');
        const setupUrl = `${frontendUrl}/complete-onboarding/${resetToken}`;
        const html = staffInvitationTemplate(admin.role, setupUrl);

        await sendEmail(admin.email, 'Staff Onboarding Invitation (Resent) - CU Portal', html);

        res.json({ success: true, message: 'Invitation email resent successfully.' });
    } catch (err) {
        console.error('Error in resendAdminInvitation:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

const getAllAdmins = async (req, res) => {
    try {
        console.log('GET /faculty - Fetching all faculty admins');
        const admins = await Admin.find({ role: 'admin' }).select('-passwordHash');
        console.log(`Found ${admins.length} faculty admins`);
        res.json({ success: true, admins });
    } catch (err) {
        console.error('Error in getAllAdmins:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

const getCompanyAdmins = async (req, res) => {
    try {
        console.log('GET /company-admins - Fetching company admins');
        const admins = await Admin.find({ role: 'company_admin' }).select('-passwordHash');
        console.log(`Found ${admins.length} company admins`);
        res.json({ success: true, admins });
    } catch (err) {
        console.error('Error in getCompanyAdmins:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

const ALLOWED_DEGREES = ['BSE', 'BCS', 'BBA'];

const getAllStudents = async (req, res) => {
    try {
        const students = await Student.aggregate([
            { $match: { degree: { $in: ALLOWED_DEGREES } } },
            {
                $lookup: {
                    from: 'admins',
                    localField: 'supervisorId',
                    foreignField: '_id',
                    as: 'supervisor'
                }
            },
            { $unwind: { path: '$supervisor', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'applications',
                    let: { studentId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$studentId', '$$studentId'] } } },
                        { $sort: { createdAt: -1 } },
                        { $limit: 1 }
                    ],
                    as: 'latestApp'
                }
            },
            { $unwind: { path: '$latestApp', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'agreements',
                    let: { studentId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$studentId', '$$studentId'] } } },
                        { $sort: { createdAt: -1 } },
                        { $limit: 1 }
                    ],
                    as: 'latestAgreement'
                }
            },
            { $unwind: { path: '$latestAgreement', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'reports',
                    localField: '_id',
                    foreignField: 'student',
                    as: 'report'
                }
            },
            { $unwind: { path: '$report', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    passwordHash: 0,
                    'supervisor.passwordHash': 0,
                    'supervisor.resetPasswordToken': 0,
                    'supervisor.resetPasswordExpire': 0
                }
            }
        ]);

        const enhancedStudents = students.map(stu => ({
            ...stu,
            supervisorId: stu.supervisor ? { _id: stu.supervisor._id, name: stu.supervisor.name, email: stu.supervisor.email } : null,
            pipeline: {
                hasApplication: !!stu.latestApp,
                applicationStatus: stu.latestApp?.status || 'none',
                hasAgreement: !!stu.latestAgreement,
                agreementStatus: stu.latestAgreement?.status || 'none',
                hasReport: !!stu.report,
                reportStatus: stu.report?.completionStatus || 'none',
                reportRating: stu.report?.overallRating || null
            }
        }));

        res.json({ success: true, students: enhancedStudents });
    } catch (err) {
        console.error('Error in getAllStudents:', err);
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
        const statsAggregation = await Student.aggregate([
            { $match: { degree: { $in: ALLOWED_DEGREES } } },
            {
                $facet: {
                    totalStudents: [{ $count: 'count' }],
                    completedPlacements: [
                        { $match: { internshipStatus: 'internship_assigned' } },
                        { $count: 'count' }
                    ],
                    pendingAgreements: [
                        { $match: { internshipStatus: 'agreement_submitted' } },
                        { $count: 'count' }
                    ]
                }
            }
        ]);

        const activeAppsCount = await Application.countDocuments({ status: 'pending' });

        const stats = {
            totalStudents: statsAggregation[0]?.totalStudents[0]?.count || 0,
            activeApplications: activeAppsCount,
            completedPlacements: statsAggregation[0]?.completedPlacements[0]?.count || 0,
            pendingAgreements: statsAggregation[0]?.pendingAgreements[0]?.count || 0
        };

        const [recentApps, recentAgreements, recentSubmissions] = await Promise.all([
            Application.find().populate('studentId', 'name').sort({ createdAt: -1 }).limit(5).lean(),
            Agreement.find().populate('studentId', 'name').sort({ createdAt: -1 }).limit(5).lean(),
            Submission.find().populate('student', 'name').sort({ createdAt: -1 }).limit(5).lean()
        ]);

        const activities = [
            ...recentApps.map(a => ({ message: `${a.studentId?.name || 'Student'} applied for ${a.position} at ${a.companyName}`, timestamp: a.createdAt })),
            ...recentAgreements.map(a => ({ message: `${a.studentId?.name || 'Student'} submitted agreement`, timestamp: a.createdAt })),
            ...recentSubmissions.map(s => ({ message: `${s.student?.name || 'Student'} logged new submission`, timestamp: s.createdAt }))
        ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);

        res.json({ success: true, stats, recentActivity: activities });
    } catch (err) {
        console.error('Error in getDashboardStats:', err);
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
        const studentsWithAgreements = await Student.find({
            internshipStatus: 'agreement_submitted',
            degree: { $in: ALLOWED_DEGREES }
        })
            .select('name rollNumber degree email')
            .lean();

        const agreementsRaw = await Agreement.find({ status: 'submitted' })
            .populate('studentId', 'name rollNumber degree email')
            .populate('applicationId', 'companyName position internshipType')
            .lean();

        // Only include agreements for students in allowed degrees
        const agreements = agreementsRaw.filter(a => a.studentId && ALLOWED_DEGREES.includes(a.studentId.degree));

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
        const students = await Student.find({
            internshipStatus: 'verified',
            degree: { $in: ALLOWED_DEGREES }
        })
            .populate('supervisorId', 'name email')
            .select('-passwordHash')
            .lean();

        // Attach latest application for each student to pre-fill assignment details
        const studentsWithApps = await Promise.all(students.map(async (stu) => {
            const latestApp = await Application.findOne({ studentId: stu._id, status: 'approved' }).sort({ createdAt: -1 });
            return { ...stu, latestApplication: latestApp };
        }));

        res.json({ success: true, students: studentsWithApps });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getPartneredCompanies = async (req, res) => {
    try {
        const companyAdmins = await Admin.find({ role: 'company_admin' }).select('name email company').lean();
        const manualCompanies = await Company.find().lean();

        // Merge them. Use a Map to avoid duplicates by name
        const companiesMap = new Map();

        manualCompanies.forEach(c => {
            companiesMap.set(c.name.toLowerCase(), {
                _id: c._id,
                company: c.name,
                email: c.email || '—',
                name: 'Manual Entry',
                isManual: true,
                website: c.website,
                phone: c.phone
            });
        });

        companyAdmins.forEach(admin => {
            const key = (admin.company || '').toLowerCase();
            if (!key) return;

            if (companiesMap.has(key)) {
                // If the company already exists in the manual list, keep the Company ID but update the rep info
                const existing = companiesMap.get(key);
                companiesMap.set(key, {
                    ...existing,
                    name: admin.name,
                    email: admin.email,
                    isManual: false // It has a representative now
                });
            } else {
                // If it doesn't exist in the manual list, use the Admin ID (Virtual record)
                companiesMap.set(key, {
                    _id: admin._id,
                    company: admin.company,
                    email: admin.email,
                    name: admin.name,
                    isManual: false
                });
            }
        });

        res.json({ success: true, companies: Array.from(companiesMap.values()) });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const createCompany = async (req, res) => {
    try {
        const { name, email, website, phone, address } = req.body;
        if (!name) return res.status(400).json({ success: false, message: 'Company name is required.' });

        const exists = await Company.findOne({ name: new RegExp(`^${name}$`, 'i') });
        if (exists) return res.status(400).json({ success: false, message: 'Company already exists in the system.' });

        const company = await Company.create({ name, email, website, phone, address });
        res.status(201).json({ success: true, message: 'Company added successfully.', company });
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
        student.internshipAssignedAt = new Date();
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


// Delete a faculty admin — complete wipeout of their records and assignments
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

        console.log(`[WIPEOUT] Starting deletion for admin: ${admin.name} (${adminId})`);

        // 1. Unset supervisorId on all assigned students
        const studentUpdate = await Student.updateMany({ supervisorId: adminId }, { $unset: { supervisorId: '' } });
        console.log(`[WIPEOUT] Unset supervisor for ${studentUpdate.modifiedCount} students.`);

        // 2. Delete all reports created by this admin
        const reportDelete = await Report.deleteMany({ createdBy: adminId });
        console.log(`[WIPEOUT] Deleted ${reportDelete.deletedCount} reports.`);

        // 3. If they were a company admin, delete their tasks AND the submissions for those tasks
        if (admin.role === 'company_admin') {
            const tasks = await Task.find({ createdBy: adminId });
            const taskIds = tasks.map(t => t._id);
            const submissionDelete = await Submission.deleteMany({ task: { $in: taskIds } });
            const taskDelete = await Task.deleteMany({ createdBy: adminId });
            console.log(`[WIPEOUT] Deleted ${taskDelete.deletedCount} tasks and ${submissionDelete.deletedCount} submissions.`);
        }

        // 4. Update any submissions they graded to nullify the grader
        await Submission.updateMany({ 'companyGrade.gradedBy': adminId }, { $set: { 'companyGrade.gradedBy': null } });
        await Submission.updateMany({ 'facultyGrade.gradedBy': adminId }, { $set: { 'facultyGrade.gradedBy': null } });

        await Admin.findByIdAndDelete(adminId);
        console.log(`[WIPEOUT] Admin ${adminId} permanently removed.`);

        res.json({
            success: true,
            message: `Administrator "${admin.name}" and all their related records (tasks, reports, grading history) have been permanently wiped out.`
        });
    } catch (err) {
        console.error('[WIPEOUT ERROR] deleteAdmin:', err);
        res.status(500).json({ success: false, message: `Deletion failed: ${err.message}` });
    }
};

// Delete a student — complete wipeout of all their data
const deleteStudent = async (req, res) => {
    try {
        const { studentId } = req.params;

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found.' });
        }

        console.log(`[WIPEOUT] Starting complete wipeout for student: ${student.name} (${studentId})`);

        // 1. Delete all applications
        const appDelete = await Application.deleteMany({ studentId });
        console.log(`[WIPEOUT] Deleted ${appDelete.deletedCount} applications.`);

        // 2. Delete all agreements
        const agreementDelete = await Agreement.deleteMany({ studentId });
        console.log(`[WIPEOUT] Deleted ${agreementDelete.deletedCount} agreements.`);

        // 3. Delete all submissions
        const submissionDelete = await Submission.deleteMany({ student: studentId });
        console.log(`[WIPEOUT] Deleted ${submissionDelete.deletedCount} submissions.`);

        // 4. Delete all faculty reports regarding this student
        const reportDelete = await Report.deleteMany({ student: studentId });
        console.log(`[WIPEOUT] Deleted ${reportDelete.deletedCount} reports.`);

        // 5. Finally delete the student record
        await Student.findByIdAndDelete(studentId);
        console.log(`[WIPEOUT] Student ${studentId} permanently removed.`);

        res.json({
            success: true,
            message: `Student "${student.name}" (${student.rollNumber}) and all their relative records (applications, agreements, submissions, evaluations) have been permanently wiped out.`
        });
    } catch (err) {
        console.error('[WIPEOUT ERROR] deleteStudent:', err);
        res.status(500).json({ success: false, message: `Deletion failed: ${err.message}` });
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

const deleteCompany = async (req, res) => {
    try {
        const { companyId } = req.params;

        // 1. Check if it's a manual company entry in the Company model
        const company = await Company.findById(companyId);
        if (company) {
            const companyName = company.name;
            // Clear student assignments for this company name
            await Student.updateMany(
                { assignedCompany: companyName },
                { $set: { assignedCompany: null, assignedPosition: null, internshipStatus: 'verified' } }
            );

            await Company.findByIdAndDelete(companyId);
            return res.json({ success: true, message: `Partnered company "${companyName}" removed correctly.` });
        }

        // 2. Fallback: If they provided an Admin ID (legacy or edge case)
        const admin = await Admin.findById(companyId);
        if (admin && admin.role === 'company_admin') {
            return res.status(400).json({
                success: false,
                message: `This item is actually a Representative profile ("${admin.name}"). To delete it, please use the User Management tab.`
            });
        }

        res.status(404).json({ success: false, message: 'Company record not found.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const updateStudentInternship = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { assignedCompany, assignedPosition, siteSupervisorName, siteSupervisorEmail, siteSupervisorPhone, internshipStatus } = req.body;

        const student = await Student.findById(studentId);
        if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });

        student.assignedCompany = assignedCompany !== undefined ? assignedCompany : student.assignedCompany;
        student.assignedPosition = assignedPosition !== undefined ? assignedPosition : student.assignedPosition;
        student.siteSupervisorName = siteSupervisorName !== undefined ? siteSupervisorName : student.siteSupervisorName;
        student.siteSupervisorEmail = siteSupervisorEmail !== undefined ? siteSupervisorEmail : student.siteSupervisorEmail;
        student.siteSupervisorPhone = siteSupervisorPhone !== undefined ? siteSupervisorPhone : student.siteSupervisorPhone;

        if (internshipStatus) {
            student.internshipStatus = internshipStatus;
            if (internshipStatus === 'internship_assigned' && !student.internshipAssignedAt) {
                student.internshipAssignedAt = new Date();
            }
        }

        await student.save();
        res.json({ success: true, message: 'Student internship details updated successfully.', student });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/admin/students/:studentId/placement-context
// Returns student application + agreement + all partnered companies for smart modal auto-fill
const getStudentPlacementContext = async (req, res) => {
    try {
        const { studentId } = req.params;
        const [application, agreement, manualCompanies, companyAdmins] = await Promise.all([
            Application.findOne({ studentId }).sort({ createdAt: -1 }),
            Agreement.findOne({ studentId }),
            Company.find().lean(),
            Admin.find({ role: 'company_admin' }).select('name email company').lean()
        ]);

        const companiesMap = new Map();
        manualCompanies.forEach(c => {
            companiesMap.set(c.name.toLowerCase(), {
                _id: c._id,
                name: c.name,
                email: c.email || '—',
                website: c.website,
                phone: c.phone,
                isManual: true
            });
        });

        companyAdmins.forEach(admin => {
            const key = (admin.company || '').toLowerCase();
            if (!key) return;
            if (companiesMap.has(key)) {
                const existing = companiesMap.get(key);
                companiesMap.set(key, { ...existing, isManual: false });
            } else {
                companiesMap.set(key, {
                    _id: admin._id,
                    name: admin.company,
                    email: admin.email,
                    isManual: false
                });
            }
        });

        res.json({
            success: true,
            application: application ? {
                companyName: application.companyName,
                position: application.position,
                internshipType: application.internshipType,
                status: application.status,
            } : null,
            agreement: agreement ? {
                supervisorName: agreement.supervisorName,
                supervisorEmail: agreement.supervisorEmail,
                supervisorPhone: agreement.supervisorPhone,
                supervisorDesignation: agreement.supervisorDesignation,
                companyAddress: agreement.companyAddress,
                sourcingType: agreement.sourcingType,
            } : null,
            companies: Array.from(companiesMap.values()).sort((a, b) => a.name.localeCompare(b.name)),
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    createAdmin,
    getAllAdmins,
    getCompanyAdmins,
    getAllStudents,
    assignStudentToSupervisor,
    getDashboardStats,
    approveInternship,
    getPendingAgreements,
    verifyAgreement,
    getVerifiedStudents,
    assignInternship,
    deleteAdmin,
    deleteStudent,
    updateAdmin,
    changeSupervisor,
    getPartneredCompanies,
    createCompany,
    deleteCompany,
    updateStudentInternship,
    getStudentPlacementContext,
    resendAdminInvitation
};

