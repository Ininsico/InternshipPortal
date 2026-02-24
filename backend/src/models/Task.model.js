const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Task title is required'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Task description is required'],
            trim: true,
        },
        deadline: {
            type: Date,
            required: [true, 'Deadline is required'],
        },
        // The company admin who created this task
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
            required: true,
        },
        // The company this task belongs to (denormalised from createdBy.company for fast queries)
        company: {
            type: String,
            required: true,
            trim: true,
        },
        // Optionally target a specific student; if null it applies to all students at this company
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            default: null,
        },
        maxMarks: {
            type: Number,
            default: 100,
        },
        status: {
            type: String,
            enum: ['active', 'closed'],
            default: 'active',
        },
    },
    { timestamps: true }
);

// Performance Optimization Indexes
TaskSchema.index({ company: 1, status: 1 });
TaskSchema.index({ assignedTo: 1 });
TaskSchema.index({ createdAt: -1 });

const Task = mongoose.model('Task', TaskSchema);
module.exports = Task;
