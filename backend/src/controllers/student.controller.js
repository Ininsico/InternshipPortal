const Student = require('../models/Student.model');
const Application = require('../models/Application.model');

const Agreement = require('../models/Agreement.model');

const getStudentProfile = async (req, res) => {
    try {
        const student = await Student.findById(req.user.id)
            .populate('supervisorId', 'name email')
            .select('-passwordHash');

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        res.json({ success: true, student });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getStudentApplications = async (req, res) => {
    try {
        const applications = await Application.find({ studentId: req.user.id });
        res.json({ success: true, applications });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const createApplication = async (req, res) => {
    try {
        const { companyName, position, description, internshipType, duration } = req.body;

        // Process uploaded files if any
        let documents = [];
        if (req.files && req.files.length > 0) {
            documents = req.files.map(file => ({
                name: file.originalname,
                url: `${req.protocol}://${req.get('host')}/uploads/submissions/${file.filename}`,
                type: file.mimetype,
                uploadedAt: new Date()
            }));
        }

        // Check if application already exists for this student
        const existingApp = await Application.findOne({ studentId: req.user.id });

        if (existingApp) {
            if (existingApp.status !== 'rejected') {
                return res.status(400).json({
                    success: false,
                    message: 'You already have an active or approved application. Further changes are not allowed.'
                });
            }

            // Allow update only if rejected
            existingApp.companyName = companyName;
            existingApp.position = position;
            existingApp.internshipType = internshipType;
            existingApp.duration = duration;
            existingApp.description = description;
            // Merge or replace documents
            if (documents.length > 0) {
                existingApp.documents = documents;
            }
            existingApp.status = 'pending'; // Reset to pending after correction
            await existingApp.save();

            return res.json({ success: true, application: existingApp });
        }

        // Create new application
        const application = await Application.create({
            studentId: req.user.id,
            companyName,
            position,
            internshipType,
            duration,
            description,
            documents
        });

        // Update student's internship status
        await Student.findByIdAndUpdate(req.user.id, {
            internshipStatus: 'submitted'
        });

        res.status(201).json({ success: true, message: 'Internship request submitted successfully', application });
    } catch (err) {
        console.error('Error in createApplication:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

const submitAgreement = async (req, res) => {
    try {
        const studentId = req.user.id;
        const { applicationId, sourcingType, ...agreementData } = req.body;

        const student = await Student.findById(studentId);
        if (student.internshipStatus !== 'approved' && student.internshipStatus !== 'agreement_submitted') {
            return res.status(400).json({ success: false, message: 'You must have an approved internship request before submitting an agreement.' });
        }

        const application = await Application.findById(applicationId);
        if (!application || application.status !== 'approved') {
            return res.status(400).json({ success: false, message: 'Invalid or unapproved application.' });
        }

        let agreement = await Agreement.findOne({ studentId, applicationId });
        if (agreement) {
            Object.assign(agreement, { sourcingType, ...agreementData });
            await agreement.save();
        } else {
            agreement = await Agreement.create({
                studentId,
                applicationId,
                sourcingType,
                ...agreementData
            });
        }

        student.internshipStatus = 'agreement_submitted';
        await student.save();

        res.json({ success: true, message: 'Agreement submitted successfully', agreement });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getAgreement = async (req, res) => {
    try {
        const agreement = await Agreement.findOne({ studentId: req.user.id }).populate('applicationId');
        res.json({ success: true, agreement });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const Task = require('../models/Task.model');
const Submission = require('../models/Submission.model');
const Report = require('../models/Report.model');

// GET /api/student/dashboard-state — Fetch EVERYTHING for the dashboard in ONE call
const getDashboardState = async (req, res) => {
    try {
        const student = await Student.findById(req.user.id)
            .populate('supervisorId', 'name email')
            .select('-passwordHash')
            .lean();

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const stats = {
            internshipStatus: student.internshipStatus,
            assignedCompany: student.assignedCompany,
            assignedPosition: student.assignedPosition,
        };

        // Fetch applications, tasks, submissions and report in parallel
        const [applications, tasks, allSubmissions, report] = await Promise.all([
            Application.find({ studentId: req.user.id }).sort({ createdAt: -1 }).lean(),
            student.internshipStatus === 'internship_assigned' && student.assignedCompany
                ? Task.find({
                    company: { $regex: new RegExp(`^${student.assignedCompany.trim()}$`, 'i') },
                    status: 'active',
                    $or: [{ assignedTo: req.user.id }, { assignedTo: null }]
                }).populate('createdBy', 'name company').sort({ deadline: 1 }).lean()
                : Promise.resolve([]),
            student.internshipStatus === 'internship_assigned'
                ? Submission.find({ student: req.user.id }).select('task status companyGrade facultyGrade submittedAt content attachments').lean()
                : Promise.resolve([]),
            student.internshipStatus === 'internship_assigned'
                ? Report.findOne({ student: req.user.id }).populate('createdBy', 'name email').lean()
                : Promise.resolve(null)
        ]);

        const submissionMap = {};
        allSubmissions.forEach(s => { submissionMap[String(s.task)] = s; });

        const tasksWithStatus = tasks.map(t => ({
            ...t,
            mySubmission: submissionMap[String(t._id)] || null,
        }));

        res.json({
            success: true,
            student,
            applications,
            tasks: tasksWithStatus,
            submissions: allSubmissions,
            report
        });
    } catch (err) {
        console.error('Dashboard State Error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/student/tasks — tasks for this student's company
const getMyTasks = async (req, res) => {
    try {
        const student = await Student.findById(req.user.id);
        // Only students with internship fully assigned can see tasks
        if (!student || student.internshipStatus !== 'internship_assigned' || !student.assignedCompany) {
            return res.json({ success: true, tasks: [] });
        }

        // Use case-insensitive regex so company name mismatches don't block tasks
        const companyRegex = new RegExp(`^${student.assignedCompany.trim()}$`, 'i');

        const tasks = await Task.find({
            company: companyRegex,
            status: 'active',
            $or: [{ assignedTo: req.user.id }, { assignedTo: null }],
        })
            .populate('createdBy', 'name company')
            .sort({ deadline: 1 });

        const taskIds = tasks.map(t => t._id);
        const submissions = await Submission.find({ student: req.user.id, task: { $in: taskIds } })
            .select('task status companyGrade facultyGrade submittedAt content');

        const submissionMap = {};
        submissions.forEach(s => { submissionMap[String(s.task)] = s; });

        const tasksWithStatus = tasks.map(t => ({
            ...t.toObject(),
            mySubmission: submissionMap[String(t._id)] || null,
        }));

        res.json({ success: true, tasks: tasksWithStatus });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/student/submit — submit or resubmit work for a task
const submitTask = async (req, res) => {
    try {
        const { taskId, content } = req.body;
        if (!taskId) {
            return res.status(400).json({ success: false, message: 'taskId is required.' });
        }

        const student = await Student.findById(req.user.id);
        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
        if (task.status === 'closed') return res.status(400).json({ success: false, message: 'This task is closed.' });
        const studentCompany = (student.assignedCompany || "").toLowerCase().trim();
        const taskCompany = (task.company || "").toLowerCase().trim();

        if (taskCompany !== studentCompany) {
            return res.status(403).json({
                success: false,
                message: `Task is not assigned to your company. (Task: "${task.company}", You: "${student.assignedCompany || 'Unassigned'}")`
            });
        }

        // Process uploaded files
        let attachments = [];
        if (req.files && req.files.length > 0) {
            attachments = req.files.map(file => ({
                filename: file.filename,
                originalname: file.originalname,
                path: file.path.replace(/\\/g, '/'), // Windows fix
                mimetype: file.mimetype,
                size: file.size,
                url: `/uploads/submissions/${file.filename}`
            }));
        }

        const submission = await Submission.findOneAndUpdate(
            { task: taskId, student: req.user.id },
            {
                content: content || 'Documents submitted.',
                attachments,
                submittedAt: new Date(),
                status: 'submitted'
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.json({ success: true, message: 'Submission saved successfully.', submission });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/student/submissions — student's own submissions
const getMySubmissions = async (req, res) => {
    try {
        const student = await Student.findById(req.user.id);
        if (!student || student.internshipStatus !== 'internship_assigned') {
            return res.json({ success: true, submissions: [] });
        }
        const submissions = await Submission.find({ student: req.user.id })
            .populate('task', 'title company maxMarks deadline')
            .sort({ submittedAt: -1 });
        res.json({ success: true, submissions });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/student/report — student's own internship report
const getMyReport = async (req, res) => {
    try {
        const student = await Student.findById(req.user.id);
        if (!student || student.internshipStatus !== 'internship_assigned') {
            return res.json({ success: true, report: null });
        }
        const report = await Report.findOne({ student: req.user.id })
            .populate('createdBy', 'name email');
        res.json({ success: true, report: report || null });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const updateProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload an image.' });
        }

        const student = await Student.findById(req.user.id);
        if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });

        const url = `${req.protocol}://${req.get('host')}/uploads/profile/${req.file.filename}`;
        student.profilePicture = url;
        await student.save();

        res.json({ success: true, profilePicture: url });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    getStudentProfile,
    getStudentApplications,
    createApplication,
    submitAgreement,
    getAgreement,
    getMyTasks,
    getDashboardState,
    submitTask,
    getMySubmissions,
    getMyReport,
    updateProfilePicture,
};

