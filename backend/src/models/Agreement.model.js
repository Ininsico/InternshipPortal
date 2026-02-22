const mongoose = require('mongoose');

const AgreementSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: true,
            unique: true,
        },
        applicationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Application',
            required: true,
        },
        sourcingType: {
            type: String,
            enum: ['Self', 'University Assigned'],
            required: true,
        },
        // Personal Details
        phoneNumber: {
            type: String,
            required: true,
            trim: true,
        },
        personalEmail: {
            type: String,
            required: true,
            trim: true,
        },
        homeAddress: {
            type: String,
            required: true,
            trim: true,
        },
        // Company & Supervisor Details (Required if 'Self')
        companyAddress: {
            type: String,
            trim: true,
        },
        supervisorName: {
            type: String,
            trim: true,
        },
        supervisorDesignation: {
            type: String,
            trim: true,
        },
        supervisorEmail: {
            type: String,
            trim: true,
        },
        supervisorPhone: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ['submitted', 'verified'],
            default: 'submitted',
        }
    },
    { timestamps: true }
);

const Agreement = mongoose.model('Agreement', AgreementSchema);
module.exports = Agreement;
