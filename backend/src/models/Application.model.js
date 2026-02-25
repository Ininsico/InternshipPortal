const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: true,
            unique: true,
        },
        // ─── Core Fields ───────────────────────────────────────────────────────────
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

        // ─── NEW: Internship Category ──────────────────────────────────────────────
        // 'university_assigned' => university picked the company
        // 'self_found'          => student found the company themselves
        // 'freelancer'          => no company, working freelance
        internshipCategory: {
            type: String,
            enum: ['university_assigned', 'self_found', 'freelancer'],
            default: 'university_assigned',
        },

        // ─── NEW: Work Mode (for university_assigned and self_found) ───────────────
        workMode: {
            type: String,
            enum: ['onsite', 'remote', null],
            default: null,
        },

        // ─── NEW: Field of Work ────────────────────────────────────────────────────
        // Student selects their domain: Web Dev, Mobile App, AI/ML, Data Science, etc.
        internshipField: {
            type: String,
            trim: true,
            default: null,
        },

        // ─── NEW: Self-Found Supervisor Details ────────────────────────────────────
        // Required only when internshipCategory === 'self_found'
        selfFoundSupervisor: {
            name: { type: String, trim: true, default: null },
            email: { type: String, trim: true, default: null },
            phone: { type: String, trim: true, default: null },
            designation: { type: String, trim: true, default: null },
            companyAddress: { type: String, trim: true, default: null },
        },

        // ─── NEW: Freelancer Account Links ────────────────────────────────────────
        // Required only when internshipCategory === 'freelancer'
        freelancerAccounts: [
            {
                platform: { type: String, trim: true },   // e.g. Upwork, Fiverr, Freelancer.com
                profileUrl: { type: String, trim: true },
                username: { type: String, trim: true },
            }
        ],

        // ─── Status & Workflow ─────────────────────────────────────────────────────
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

        // ─── Company Domain & Professional Summary (legacy) ───────────────────────
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
