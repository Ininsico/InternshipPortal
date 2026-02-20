const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const StudentSchema = new mongoose.Schema(
    {
        rollNumber: {
            type: String,
            required: [true, 'Roll number is required'],
            unique: true,
            uppercase: true,
            trim: true,
            match: [/^[A-Z]{2}\d{2}-[A-Z]{2,3}-\d+$/, 'Invalid roll number format'],
        },
        session: {
            type: String,
            required: true,
            uppercase: true,
            trim: true,
        },
        degree: {
            type: String,
            required: true,
            uppercase: true,
            trim: true,
        },
        serialNo: {
            type: String,
            required: true,
            trim: true,
        },
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        passwordHash: {
            type: String,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        resetPasswordToken: String,
        resetPasswordExpire: Date,
        supervisorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
            default: null,
        },
    },
    { timestamps: true }
);

StudentSchema.pre('save', async function (next) {
    if (!this.isModified('passwordHash')) return next();
    if (!this.passwordHash.startsWith('$2')) {
        this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
    }
    next();
});

StudentSchema.methods.comparePassword = function (plain) {
    return bcrypt.compare(plain, this.passwordHash);
};

const Student = mongoose.model('Student', StudentSchema);
module.exports = Student;
