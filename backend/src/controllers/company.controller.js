const Task = require('../models/Task.model');
const Submission = require('../models/Submission.model');
const Student = require('../models/Student.model');

// GET /api/company/students — students assigned to this company
const getMyStudents = async (req, res) => {
    try {
        const companyName = req.admin.company;
        if (!companyName) {
            return res.status(400).json({ success: false, message: 'No company associated with this account.' });
        }
        const students = await Student.find({ assignedCompany: companyName, internshipStatus: 'internship_assigned' })
            .populate('supervisorId', 'name email')
            .select('-passwordHash');
        res.json({ success: true, students });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/company/tasks — create a task for students
const createTask = async (req, res) => {
    try {
        const { title, description, deadline, maxMarks, assignedTo } = req.body;
        const companyName = req.admin.company;

        if (!title || !description || !deadline) {
            return res.status(400).json({ success: false, message: 'title, description, and deadline are required.' });
        }

        // If assignedTo is provided, verify student is at this company
        if (assignedTo) {
            const student = await Student.findById(assignedTo);
            if (!student || student.assignedCompany !== companyName) {
                return res.status(403).json({ success: false, message: 'Student is not assigned to your company.' });
            }
        }

        const task = await Task.create({
            title,
            description,
            deadline: new Date(deadline),
            maxMarks: maxMarks || 100,
            assignedTo: assignedTo || null,
            createdBy: req.admin._id,
            company: companyName,
        });

        res.status(201).json({ success: true, message: 'Task created successfully.', task });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/company/tasks — list tasks created by this company admin
const getMyTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ createdBy: req.admin._id })
            .populate('assignedTo', 'name rollNumber')
            .sort({ createdAt: -1 });
        res.json({ success: true, tasks });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// PUT /api/company/tasks/:taskId — update a task
const updateTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { title, description, deadline, maxMarks, status } = req.body;

        const task = await Task.findOne({ _id: taskId, createdBy: req.admin._id });
        if (!task) {
            return res.status(404).json({ success: false, message: 'Task not found.' });
        }

        if (title) task.title = title;
        if (description) task.description = description;
        if (deadline) task.deadline = new Date(deadline);
        if (maxMarks !== undefined) task.maxMarks = maxMarks;
        if (status) task.status = status;

        await task.save();
        res.json({ success: true, message: 'Task updated.', task });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// DELETE /api/company/tasks/:taskId
const deleteTask = async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.taskId, createdBy: req.admin._id });
        if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
        res.json({ success: true, message: 'Task deleted.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/company/submissions — view all submissions for company tasks
const getSubmissions = async (req, res) => {
    try {
        const tasks = await Task.find({ createdBy: req.admin._id }).select('_id');
        const taskIds = tasks.map(t => t._id);

        const submissions = await Submission.find({ task: { $in: taskIds } })
            .populate('student', 'name rollNumber degree assignedCompany')
            .populate('task', 'title deadline maxMarks')
            .sort({ submittedAt: -1 });

        res.json({ success: true, submissions });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// PUT /api/company/submissions/:submissionId/grade — grade a submission
const gradeSubmission = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { marks, feedback } = req.body;

        if (marks === undefined) {
            return res.status(400).json({ success: false, message: 'marks is required.' });
        }

        // Verify the submission belongs to a task created by this company admin
        const submission = await Submission.findById(submissionId).populate('task');
        if (!submission) return res.status(404).json({ success: false, message: 'Submission not found.' });
        if (String(submission.task.createdBy) !== String(req.admin._id)) {
            return res.status(403).json({ success: false, message: 'Not authorised to grade this submission.' });
        }

        submission.companyGrade = {
            marks,
            feedback: feedback || null,
            gradedAt: new Date(),
            gradedBy: req.admin._id,
        };
        submission.status = submission.facultyGrade?.marks != null ? 'fully_graded' : 'graded_by_company';
        await submission.save();

        res.json({ success: true, message: 'Submission graded.', submission });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    getMyStudents,
    createTask,
    getMyTasks,
    updateTask,
    deleteTask,
    getSubmissions,
    gradeSubmission,
};
