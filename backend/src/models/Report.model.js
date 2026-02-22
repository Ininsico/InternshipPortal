const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: true,
        },
        // Faculty admin who created this report
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
            required: true,
        },
        // Summary / evaluation written by faculty
        summary: {
            type: String,
            required: [true, 'Report summary is required'],
            trim: true,
        },
        // Overall performance rating
        overallRating: {
            type: Number,
            min: 0,
            max: 100,
            required: true,
        },
        // Detailed scoring areas
        scores: {
            technical: { type: Number, min: 0, max: 100, default: null },
            communication: { type: Number, min: 0, max: 100, default: null },
            teamwork: { type: Number, min: 0, max: 100, default: null },
            punctuality: { type: Number, min: 0, max: 100, default: null },
        },
        // Recommendation
        recommendation: {
            type: String,
            enum: ['excellent', 'good', 'satisfactory', 'needs_improvement', 'unsatisfactory'],
            required: true,
        },
        // Whether the student has completed internship
        completionStatus: {
            type: String,
            enum: ['completed', 'incomplete', 'ongoing'],
            default: 'ongoing',
        },
    },
    { timestamps: true }
);

const Report = mongoose.model('Report', ReportSchema);
module.exports = Report;
