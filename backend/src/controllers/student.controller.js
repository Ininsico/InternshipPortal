const Student = require('../models/Student.model');
const Application = require('../models/Application.model');

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
        const { companyName, position, description } = req.body;

        const application = await Application.create({
            studentId: req.user.id,
            companyName,
            position,
            description
        });

        res.status(201).json({ success: true, message: 'Application submitted successfully', application });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    getStudentProfile,
    getStudentApplications,
    createApplication
};
