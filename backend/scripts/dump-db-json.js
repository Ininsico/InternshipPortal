require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Admin = require('../src/models/Admin.model');
const Student = require('../src/models/Student.model');
const Application = require('../src/models/Application.model');
const Agreement = require('../src/models/Agreement.model');

async function dumpAll() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const admins = await Admin.find({}).lean();
        const students = await Student.find({}).lean();
        const applications = await Application.find({}).lean();
        const agreements = await Agreement.find({}).lean();

        console.log('--- DATABASE DATA START ---');
        console.log(JSON.stringify({
            admins: admins.map(a => ({ email: a.email, role: a.role, isActive: a.isActive, name: a.name })),
            students: students.map(s => ({ name: s.name, rollNumber: s.rollNumber, internshipStatus: s.internshipStatus, email: s.email, supervisor: s.supervisorId })),
            applications: applications.map(app => ({ company: app.companyName, position: app.position, status: app.status, student: app.studentId })),
            agreements: agreements.map(agr => ({ student: agr.studentId, type: agr.sourcingType, phone: agr.phoneNumber, email: agr.personalEmail }))
        }, null, 2));
        console.log('--- DATABASE DATA END ---');

    } catch (err) {
        console.error('ERROR:', err.message);
    } finally {
        await mongoose.disconnect();
    }
}

dumpAll();
