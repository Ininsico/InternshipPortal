const Student = require('../models/Student.model');
const Application = require('../models/Application.model');
const Agreement = require('../models/Agreement.model');
const WeeklyUpdate = require('../models/WeeklyUpdate.model');

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
        const {
            companyName, position, description, internshipType, duration,
            internshipCategory, workMode, internshipField,
            companyDomain, professionalSummary,
            semester, contactNumber,
            sup_name, sup_email, sup_phone, sup_designation, sup_address,
            acc_count
        } = req.body;

        // Process uploaded files if any
        let documents = [];
        if (req.files && req.files.length > 0) {
            documents = req.files.map(file => ({
                name: file.originalname,
                url: file.path,
                type: file.mimetype,
                uploadedAt: new Date()
            }));
        }

        const cat = internshipCategory || 'university_assigned';

        // Build supervisor object from flat fields
        const parsedSupervisor = {
            name: sup_name || '',
            email: sup_email || '',
            phone: sup_phone || '',
            designation: sup_designation || '',
            companyAddress: sup_address || ''
        };

        // Build freelancer accounts from indexed flat fields
        const accCount = parseInt(acc_count || '0', 10);
        const parsedAccounts = [];
        for (let i = 0; i < accCount; i++) {
            parsedAccounts.push({
                platform: req.body[`acc_${i}_platform`] || '',
                profileUrl: req.body[`acc_${i}_profileUrl`] || '',
                username: req.body[`acc_${i}_username`] || ''
            });
        }

        // (Frontend required fields enforce this — no server double-check needed)

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
            existingApp.internshipCategory = cat;
            existingApp.workMode = cat === 'freelancer' ? null : (workMode || null);
            existingApp.internshipField = internshipField || null;
            existingApp.selfFoundSupervisor = cat === 'self_found' ? parsedSupervisor : {};
            existingApp.freelancerAccounts = cat === 'freelancer' ? (Array.isArray(parsedAccounts) ? parsedAccounts : []) : [];
            existingApp.companyDomain = companyDomain || null;
            existingApp.professionalSummary = professionalSummary || null;
            existingApp.semester = semester || existingApp.semester;
            existingApp.contactNumber = contactNumber || existingApp.contactNumber;
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
            internshipCategory: cat,
            workMode: cat === 'freelancer' ? null : (workMode || null),
            internshipField: internshipField || null,
            selfFoundSupervisor: cat === 'self_found' ? parsedSupervisor : {},
            freelancerAccounts: cat === 'freelancer' ? (Array.isArray(parsedAccounts) ? parsedAccounts : []) : [],
            companyDomain: companyDomain || null,
            professionalSummary: professionalSummary || null,
            semester,
            contactNumber,
            documents
        });

        // Update student's internship status and profile info
        await Student.findByIdAndUpdate(req.user.id, {
            internshipStatus: 'submitted',
            semester: semester || null,
            contactNumber: contactNumber || null
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

        const isFreelancer = student.internshipCategory === 'freelancer';
        const isAssigned = student.internshipStatus === 'internship_assigned';

        // Fetch data in parallel based on internship type
        const [applications, tasks, allSubmissions, report, weeklyUpdates] = await Promise.all([
            Application.find({ studentId: req.user.id }).sort({ createdAt: -1 }).lean(),

            // Freelancers get NO tasks
            isAssigned && !isFreelancer && student.assignedCompany
                ? Task.find({
                    company: { $regex: new RegExp(`^${student.assignedCompany.trim()}$`, 'i') },
                    status: 'active',
                    $or: [{ assignedTo: req.user.id }, { assignedTo: null }]
                }).populate('createdBy', 'name company').sort({ deadline: 1 }).lean()
                : Promise.resolve([]),

            isAssigned && !isFreelancer
                ? Submission.find({ student: req.user.id }).select('task status companyGrade facultyGrade submittedAt content attachments').lean()
                : Promise.resolve([]),

            isAssigned
                ? Report.findOne({ student: req.user.id }).populate('createdBy', 'name email').lean()
                : Promise.resolve(null),

            // Freelancers get weekly updates instead
            isAssigned && isFreelancer
                ? WeeklyUpdate.find({ studentId: req.user.id }).sort({ weekNumber: 1 }).lean()
                : Promise.resolve([]),
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
            report,
            weeklyUpdates,
            isFreelancer,
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
        // Freelancers never see tasks
        if (!student || student.internshipStatus !== 'internship_assigned' || !student.assignedCompany || student.internshipCategory === 'freelancer') {
            return res.json({ success: true, tasks: [] });
        }

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

        // Freelancers cannot submit tasks
        if (student.internshipCategory === 'freelancer') {
            return res.status(403).json({ success: false, message: 'Freelance interns submit weekly updates, not task submissions.' });
        }

        const task = await Task.findById(taskId);
        if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
        if (task.status === 'closed') return res.status(400).json({ success: false, message: 'This task is closed.' });
        const studentCompany = (student.assignedCompany || '').toLowerCase().trim();
        const taskCompany = (task.company || '').toLowerCase().trim();

        if (taskCompany !== studentCompany) {
            return res.status(403).json({
                success: false,
                message: `Task is not assigned to your company. (Task: "${task.company}", You: "${student.assignedCompany || 'Unassigned'}")`
            });
        }

        let attachments = [];
        if (req.files && req.files.length > 0) {
            attachments = req.files.map(file => ({
                filename: file.filename,
                originalname: file.originalname,
                path: file.path,
                mimetype: file.mimetype,
                size: file.size,
                url: file.path
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

// POST /api/student/weekly-update — submit a weekly update (freelancers only)
const submitWeeklyUpdate = async (req, res) => {
    try {
        const student = await Student.findById(req.user.id);
        if (!student || student.internshipCategory !== 'freelancer' || student.internshipStatus !== 'internship_assigned') {
            return res.status(403).json({ success: false, message: 'Only assigned freelance interns can submit weekly updates.' });
        }

        const { weekNumber, workSummary, platformLinks, hoursWorked, technologiesUsed, challenges } = req.body;

        if (!weekNumber || !workSummary) {
            return res.status(400).json({ success: false, message: 'weekNumber and workSummary are required.' });
        }

        // Upsert: one update per week per student
        const update = await WeeklyUpdate.findOneAndUpdate(
            { studentId: req.user.id, weekNumber: Number(weekNumber) },
            {
                workSummary,
                platformLinks: platformLinks || [],
                hoursWorked: hoursWorked || 0,
                technologiesUsed: technologiesUsed || '',
                challenges: challenges || '',
                status: 'submitted',
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.json({ success: true, message: 'Weekly update submitted successfully.', update });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/student/weekly-updates — fetch student's weekly updates
const getMyWeeklyUpdates = async (req, res) => {
    try {
        const student = await Student.findById(req.user.id);
        if (!student || student.internshipCategory !== 'freelancer') {
            return res.json({ success: true, updates: [] });
        }
        const updates = await WeeklyUpdate.find({ studentId: req.user.id }).sort({ weekNumber: 1 });
        res.json({ success: true, updates });
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

        const url = req.file.path; // Cloudinary URL
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
    submitWeeklyUpdate,
    getMyWeeklyUpdates,
};
