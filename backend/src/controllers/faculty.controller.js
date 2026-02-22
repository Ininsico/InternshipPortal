const Student = require('../models/Student.model');
const Submission = require('../models/Submission.model');
const Report = require('../models/Report.model');
const Task = require('../models/Task.model');

// GET /api/faculty/students — students supervised by this faculty admin
const getMyStudents = async (req, res) => {
    try {
        const students = await Student.find({ supervisorId: req.admin._id })
            .select('-passwordHash');
        res.json({ success: true, students });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/faculty/submissions — submissions for students this faculty supervises
const getStudentSubmissions = async (req, res) => {
    try {
        const students = await Student.find({ supervisorId: req.admin._id }).select('_id');
        const studentIds = students.map(s => s._id);

        const submissions = await Submission.find({ student: { $in: studentIds } })
            .populate('student', 'name rollNumber degree assignedCompany assignedPosition')
            .populate('task', 'title deadline maxMarks company')
            .sort({ submittedAt: -1 });

        res.json({ success: true, submissions });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// PUT /api/faculty/submissions/:submissionId/grade — faculty grades a submission
const gradeSubmission = async (req, res) => {
    try {
        const { submissionId } = req.params;
        const { marks, feedback } = req.body;

        if (marks === undefined) {
            return res.status(400).json({ success: false, message: 'marks is required.' });
        }

        const submission = await Submission.findById(submissionId)
            .populate('student', 'supervisorId');
        if (!submission) return res.status(404).json({ success: false, message: 'Submission not found.' });

        // Ensure the student belongs to this faculty supervisor
        if (String(submission.student.supervisorId) !== String(req.admin._id)) {
            return res.status(403).json({ success: false, message: 'Not authorised to grade this submission.' });
        }

        submission.facultyGrade = {
            marks,
            feedback: feedback || null,
            gradedAt: new Date(),
            gradedBy: req.admin._id,
        };
        submission.status = submission.companyGrade?.marks != null ? 'fully_graded' : 'graded_by_faculty';
        await submission.save();

        res.json({ success: true, message: 'Submission graded.', submission });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// POST /api/faculty/reports — create a report for a student
const createReport = async (req, res) => {
    try {
        const { studentId, summary, overallRating, scores, recommendation, completionStatus } = req.body;

        if (!studentId || !summary || overallRating === undefined || !recommendation) {
            return res.status(400).json({ success: false, message: 'studentId, summary, overallRating, and recommendation are required.' });
        }

        // Verify the student is under this faculty
        const student = await Student.findById(studentId);
        if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });
        if (String(student.supervisorId) !== String(req.admin._id)) {
            return res.status(403).json({ success: false, message: 'Student is not assigned to you.' });
        }

        // Check if a report already exists for this student by this faculty
        const existing = await Report.findOne({ student: studentId, createdBy: req.admin._id });
        if (existing) {
            // Update instead of duplicate
            existing.summary = summary;
            existing.overallRating = overallRating;
            existing.scores = scores || existing.scores;
            existing.recommendation = recommendation;
            existing.completionStatus = completionStatus || existing.completionStatus;
            await existing.save();
            const populated = await existing.populate([
                { path: 'student', select: 'name rollNumber degree assignedCompany' },
                { path: 'createdBy', select: 'name email' }
            ]);
            return res.json({ success: true, message: 'Report updated.', report: populated });
        }

        const report = await Report.create({
            student: studentId,
            createdBy: req.admin._id,
            summary,
            overallRating,
            scores: scores || {},
            recommendation,
            completionStatus: completionStatus || 'ongoing',
        });

        const populated = await report.populate([
            { path: 'student', select: 'name rollNumber degree assignedCompany' },
            { path: 'createdBy', select: 'name email' }
        ]);

        res.status(201).json({ success: true, message: 'Report created.', report: populated });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/faculty/reports — reports created by this faculty admin
const getMyReports = async (req, res) => {
    try {
        const reports = await Report.find({ createdBy: req.admin._id })
            .populate('student', 'name rollNumber degree assignedCompany assignedPosition')
            .sort({ updatedAt: -1 });
        res.json({ success: true, reports });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    getMyStudents,
    getStudentSubmissions,
    gradeSubmission,
    createReport,
    getMyReports,
};
