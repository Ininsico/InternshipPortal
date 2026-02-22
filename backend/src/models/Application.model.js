const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: true,
        },
        companyName: {
            type: String,
            required: true,
            trim: true,
        },
        position: {
            type: String,
            required: true,
            trim: true,
        },
        internshipType: {
            type: String,
            required: true,
            trim: true,
        },
        duration: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'in_progress', 'completed'],
            default: 'pending',
        },
        appliedDate: {
            type: Date,
            default: Date.now,
        },
        documents: [
            {
                name: String,
                url: String,
                type: String,
                uploadedAt: { type: Date, default: Date.now },
            }
        ],
        feedback: {
            type: String,
            trim: true,
        },
        supervisorFeedback: {
            type: String,
            trim: true,
        }
    },
    { timestamps: true }
);

const Application = mongoose.model('Application', ApplicationSchema);
module.exports = Application;
