const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Admin = require('../src/models/Admin.model');
const Student = require('../src/models/Student.model');
const Application = require('../src/models/Application.model');
const Agreement = require('../src/models/Agreement.model');
const Task = require('../src/models/Task.model');
const Submission = require('../src/models/Submission.model');
const Report = require('../src/models/Report.model');

async function exportData() {
    let output = '';

    function log(text) {
        output += text + '\n';
        console.log(text);
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        log('================================================================');
        log('INTERNSHIP PORTAL - COMPLETE DATABASE EXPORT');
        log(`Timestamp: ${new Date().toLocaleString()}`);
        log('================================================================');

        // 1. ADMINS
        const admins = await Admin.find().lean();
        log(`\n[ADMINS / STAFF] Total: ${admins.length}`);
        log('----------------------------------------------------------------');
        admins.forEach(a => {
            log(`- ${a.name.padEnd(25)} | Email: ${a.email.padEnd(30)} | Role: ${a.role.padEnd(15)} | Active: ${a.isActive}`);
            if (a.company) log(`  Company: ${a.company}`);
        });

        // 2. STUDENTS
        const students = await Student.find().populate('supervisorId', 'name').lean();
        log(`\n[STUDENTS] Total: ${students.length}`);
        log('----------------------------------------------------------------');
        students.forEach(s => {
            log(`- ${s.name.padEnd(25)} | Roll: ${s.rollNumber.padEnd(15)} | Degree: ${s.degree.padEnd(5)} | Status: ${s.internshipStatus.padEnd(20)}`);
            log(`  Email: ${s.email} | Supervisor: ${s.supervisorId?.name || 'Not Assigned'}`);
            if (s.assignedCompany) log(`  Assigned: ${s.assignedCompany} (${s.assignedPosition})`);
        });

        // 3. APPLICATIONS
        const apps = await Application.find().populate('studentId', 'rollNumber name').lean();
        log(`\n[INTERNSHIP APPLICATIONS] Total: ${apps.length}`);
        log('----------------------------------------------------------------');
        apps.forEach(app => {
            log(`- ${app.studentId?.name || 'Deleted Student'} (${app.studentId?.rollNumber}) -> ${app.companyName}`);
            log(`  Position: ${app.position.padEnd(20)} | Type: ${app.internshipType.padEnd(10)} | Status: ${app.status}`);
        });

        // 4. AGREEMENTS
        const agreements = await Agreement.find().populate('studentId', 'name rollNumber').lean();
        log(`\n[STUDENT AGREEMENTS / CONTRACTS] Total: ${agreements.length}`);
        log('----------------------------------------------------------------');
        agreements.forEach(agr => {
            log(`- ${agr.studentId?.name} (${agr.studentId?.rollNumber}) | Sourcing: ${agr.sourcingType}`);
            log(`  Contact: ${agr.phoneNumber} | Address: ${agr.homeAddress}`);
            log(`  CNIC: ${agr.cnic} | Status: ${agr.status}`);
        });

        // 5. TASKS
        const tasks = await Task.find().populate('createdBy', 'name company').lean();
        log(`\n[TASKS CREATED BY COMPANIES] Total: ${tasks.length}`);
        log('----------------------------------------------------------------');
        tasks.forEach(t => {
            log(`- ${t.title} | Company: ${t.company || (t.createdBy?.company) || 'Unknown'}`);
            log(`  Deadline: ${new Date(t.deadline).toLocaleDateString()} | Created: ${new Date(t.createdAt).toLocaleDateString()}`);
        });

        // 6. SUBMISSIONS
        const subs = await Submission.find().populate('student', 'name rollNumber').populate('task', 'title').lean();
        log(`\n[STUDENT SUBMISSIONS] Total: ${subs.length}`);
        log('----------------------------------------------------------------');
        subs.forEach(sub => {
            log(`- ${sub.student?.name || 'Deleted Student'} (${sub.student?.rollNumber}) -> Task: ${sub.task?.title || 'Deleted Task'}`);
            log(`  Status: ${sub.status.padEnd(10)} | Date: ${new Date(sub.createdAt).toLocaleDateString()}`);
        });

        // 7. REPORTS
        const reports = await Report.find().populate('student', 'name rollNumber').populate('createdBy', 'name').lean();
        log(`\n[FACULTY INTERNSHIP REPORTS] Total: ${reports.length}`);
        log('----------------------------------------------------------------');
        reports.forEach(r => {
            log(`- ${r.student?.name} (${r.student?.rollNumber}) | Rating: ${r.overallRating}/100 | Recommendation: ${r.recommendation}`);
            log(`  By: ${r.createdBy?.name} | Status: ${r.completionStatus}`);
        });

        log('\n================================================================');
        log('EXPORT COMPLETE');
        log('================================================================');

        const dumpPath = path.join(__dirname, 'database_dump.txt');
        fs.writeFileSync(dumpPath, output);
        console.log(`\nData successfully exported to: ${dumpPath}`);

        process.exit(0);
    } catch (err) {
        console.error('Export failed:', err);
        process.exit(1);
    }
}

exportData();
