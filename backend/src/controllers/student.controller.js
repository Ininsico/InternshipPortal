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

        // Check if application already exists for this student
        let application = await Application.findOne({ studentId: req.user.id });

        if (application) {
            // Update existing application
            application.companyName = companyName;
            application.position = position;
            application.description = description;
            application.internshipType = internshipType;
            application.duration = duration;
            application.status = 'pending'; // Reset status to pending if it was rejected
            await application.save();
        } else {
            // Create new application
            application = await Application.create({
                studentId: req.user.id,
                companyName,
                position,
                internshipType,
                duration,
                description
            });
        }

        // Update student's internship status
        await Student.findByIdAndUpdate(req.user.id, {
            internshipStatus: 'submitted'
        });

        res.status(201).json({ success: true, message: 'Internship request submitted successfully', application });
    } catch (err) {
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

// GET /api/student/tasks — tasks for this student's company
const getMyTasks = async (req, res) => {
    try {
        const student = await Student.findById(req.user.id);
        if (!student || !student.assignedCompany) {
            return res.json({ success: true, tasks: [] });
        }

        const tasks = await Task.find({
            company: student.assignedCompany,
            status: 'active',
            $or: [{ assignedTo: req.user.id }, { assignedTo: null }]
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
        if (!taskId || !content) {
            return res.status(400).json({ success: false, message: 'taskId and content are required.' });
        }

        const student = await Student.findById(req.user.id);
        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
        if (task.status === 'closed') return res.status(400).json({ success: false, message: 'This task is closed.' });
        if (task.company !== student.assignedCompany) {
            return res.status(403).json({ success: false, message: 'Task is not assigned to your company.' });
        }

        const submission = await Submission.findOneAndUpdate(
            { task: taskId, student: req.user.id },
            { content, submittedAt: new Date(), status: 'submitted' },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.json({ success: true, message: 'Submission saved.', submission });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/student/submissions — student's own submissions
const getMySubmissions = async (req, res) => {
    try {
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
        const report = await Report.findOne({ student: req.user.id })
            .populate('createdBy', 'name email');
        res.json({ success: true, report: report || null });
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
    submitTask,
    getMySubmissions,
    getMyReport,
};

