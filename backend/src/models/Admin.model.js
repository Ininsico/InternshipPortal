const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AdminSchema = new mongoose.Schema(
    {
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
        role: {
            type: String,
            enum: ['admin', 'company_admin', 'super_admin'],
            default: 'admin',
        },
        company: {
            type: String,   // Only set for company_admin role
            trim: true,
            default: null,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        resetPasswordToken: String,
        resetPasswordExpire: Date,
        invitationToken: String,
        invitationExpire: Date,
    },
    { timestamps: true }
);

AdminSchema.pre('save', async function (next) {
    if (!this.isModified('passwordHash')) return next();
    if (!this.passwordHash.startsWith('$2')) {
        this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
    }
    next();
});

AdminSchema.methods.comparePassword = function (plain) {
    return bcrypt.compare(plain, this.passwordHash);
};

const Admin = mongoose.model('Admin', AdminSchema);
module.exports = Admin;
