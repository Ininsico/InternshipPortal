require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const path = require('path');

// Logic to load models correctly
const Admin = require('../src/models/Admin.model');
const Student = require('../src/models/Student.model');
const Application = require('../src/models/Application.model');
const Agreement = require('../src/models/Agreement.model');
const Submission = require('../src/models/Submission.model');
const Task = require('../src/models/Task.model');
const Report = require('../src/models/Report.model');

const purgeOrphans = async () => {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/internshipportal';
        await mongoose.connect(uri);
        console.log('Connected to MongoDB for purging...');

        // 1. Delete submissions with no student or non-existent student
        const submissions = await Submission.find();
        let purgedSubmissions = 0;
        for (const sub of submissions) {
            const studentExists = await Student.exists({ _id: sub.student });
            if (!sub.student || !studentExists) {
                await Submission.findByIdAndDelete(sub._id);
                purgedSubmissions++;
            }
        }
        console.log(`Purged ${purgedSubmissions} orphaned submissions.`);

        // 2. Delete reports with no student or no creator
        const reports = await Report.find();
        let purgedReports = 0;
        for (const rep of reports) {
            const studentExists = await Student.exists({ _id: rep.student });
            const adminExists = await Admin.exists({ _id: rep.createdBy });
            if (!rep.student || !studentExists || !rep.createdBy || !adminExists) {
                await Report.findByIdAndDelete(rep._id);
                purgedReports++;
            }
        }
        console.log(`Purged ${purgedReports} orphaned reports.`);

        // 3. Delete agreements with no student
        const agreements = await Agreement.find();
        let purgedAgreements = 0;
        for (const ag of agreements) {
            const studentExists = await Student.exists({ _id: ag.studentId });
            if (!ag.studentId || !studentExists) {
                await Agreement.findByIdAndDelete(ag._id);
                purgedAgreements++;
            }
        }
        console.log(`Purged ${purgedAgreements} orphaned agreements.`);

        // 4. Delete applications with no student
        const apps = await Application.find();
        let purgedApps = 0;
        for (const app of apps) {
            const studentExists = await Student.exists({ _id: app.studentId });
            if (!app.studentId || !studentExists) {
                await Application.findByIdAndDelete(app._id);
                purgedApps++;
            }
        }
        console.log(`Purged ${purgedApps} orphaned applications.`);

        console.log('Database cleanup complete.');
        process.exit(0);
    } catch (err) {
        console.error('Purge error:', err);
        process.exit(1);
    }
};

purgeOrphans();
