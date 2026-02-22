const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema(
    {
        task: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task',
            required: true,
        },
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: true,
        },
        // Text body or link to submitted work
        content: {
            type: String,
            required: [true, 'Submission content is required'],
            trim: true,
        },
        // List of uploaded files
        attachments: [
            {
                filename: { type: String, required: true },
                originalname: { type: String, required: true },
                path: { type: String, required: true },
                mimetype: { type: String, required: true },
                size: { type: Number, required: true },
                url: { type: String, required: true }
            }
        ],
        submittedAt: {
            type: Date,
            default: Date.now,
        },
        // Grade given by company admin
        companyGrade: {
            marks: { type: Number, default: null },
            feedback: { type: String, default: null },
            gradedAt: { type: Date, default: null },
            gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
        },
        // Grade given by faculty supervisor
        facultyGrade: {
            marks: { type: Number, default: null },
            feedback: { type: String, default: null },
            gradedAt: { type: Date, default: null },
            gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
        },
        status: {
            type: String,
            enum: ['submitted', 'graded_by_company', 'graded_by_faculty', 'fully_graded'],
            default: 'submitted',
        },
    },
    { timestamps: true }
);

// Ensure one submission per student per task
SubmissionSchema.index({ task: 1, student: 1 }, { unique: true });

const Submission = mongoose.model('Submission', SubmissionSchema);
module.exports = Submission;
