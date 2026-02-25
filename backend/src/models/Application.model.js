const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: true,
            unique: true,
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
        semester: {
            type: String,
            trim: true,
        },
        contactNumber: {
            type: String,
            trim: true,
        },
        internshipCategory: {
            type: String,
            enum: ['university_assigned', 'self_found', 'freelancer'],
            default: 'university_assigned',
        },
        workMode: {
            type: String,
            enum: ['onsite', 'remote', null],
            default: null,
        },
        internshipField: {
            type: String,
            trim: true,
            default: null,
        },
        selfFoundSupervisor: {
            name: { type: String, trim: true, default: null },
            email: { type: String, trim: true, default: null },
            phone: { type: String, trim: true, default: null },
            designation: { type: String, trim: true, default: null },
            companyAddress: { type: String, trim: true, default: null },
        },
        freelancerAccounts: [
            {
                platform: { type: String, trim: true },
                profileUrl: { type: String, trim: true },
                username: { type: String, trim: true },
            }
        ],

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
        },

        companyDomain: {
            type: String,
            trim: true,
        },
        professionalSummary: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
);

ApplicationSchema.index({ status: 1 });
ApplicationSchema.index({ createdAt: -1 });
ApplicationSchema.index({ internshipCategory: 1 });

const Application = mongoose.model('Application', ApplicationSchema);
module.exports = Application;
