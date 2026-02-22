require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Admin = require('../src/models/Admin.model');
const Student = require('../src/models/Student.model');
const Application = require('../src/models/Application.model');
const Agreement = require('../src/models/Agreement.model');

async function dumpAll() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('\n--- MONGODB DUMP ---\n');

        const admins = await Admin.find({}).lean();
        console.log(`[ADMINS] (${admins.length})`);
        console.table(admins.map(a => ({ email: a.email, role: a.role, active: a.isActive })));

        const students = await Student.find({}).lean();
        console.log(`\n[STUDENTS] (${students.length})`);
        console.table(students.map(s => ({
            name: s.name,
            roll: s.rollNumber,
            status: s.internshipStatus,
            supervisor: s.supervisorId ? 'Set' : 'None'
        })));

        const applications = await Application.find({}).populate('studentId').lean();
        console.log(`\n[APPLICATIONS] (${applications.length})`);
        console.table(applications.map(app => ({
            company: app.companyName,
            position: app.position,
            status: app.status,
            student: app.studentId?.rollNumber || 'Unknown'
        })));

        const agreements = await Agreement.find({}).populate('studentId').lean();
        console.log(`\n[AGREEMENTS] (${agreements.length})`);
        console.table(agreements.map(agr => ({
            student: agr.studentId?.rollNumber || 'Unknown',
            type: agr.sourcingType,
            phone: agr.phoneNumber,
            company: agr.companyAddress ? 'Provided' : 'N/A'
        })));

        console.log('\n--- END OF DUMP ---');
    } catch (err) {
        console.error('Error during dump:', err);
    } finally {
        await mongoose.disconnect();
    }
}

dumpAll();
