const mongoose = require('mongoose');

const WeeklyUpdateSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: true,
        },
        weekNumber: {
            type: Number,
            required: true,
            min: 1,
        },
        // What they worked on this week
        workSummary: {
            type: String,
            required: true,
            trim: true,
        },
        // Freelancer platforms used / links to work done
        platformLinks: [
            {
                platform: { type: String, trim: true }, // e.g. Upwork, Fiverr, Toptal
                url: { type: String, trim: true },
                description: { type: String, trim: true },
            }
        ],
        // Hours worked
        hoursWorked: {
            type: Number,
            default: 0,
        },
        // Technologies / tools used
        technologiesUsed: {
            type: String,
            trim: true,
        },
        // Challenges faced
        challenges: {
            type: String,
            trim: true,
        },
        // Faculty review
        facultyRemarks: {
            type: String,
            trim: true,
            default: null,
        },
        facultyReviewedAt: {
            type: Date,
            default: null,
        },
        facultyReviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
            default: null,
        },
        status: {
            type: String,
            enum: ['submitted', 'reviewed'],
            default: 'submitted',
        },
    },
    { timestamps: true }
);

WeeklyUpdateSchema.index({ studentId: 1, weekNumber: 1 }, { unique: true });
WeeklyUpdateSchema.index({ status: 1 });
WeeklyUpdateSchema.index({ createdAt: -1 });

const WeeklyUpdate = mongoose.model('WeeklyUpdate', WeeklyUpdateSchema);
module.exports = WeeklyUpdate;
