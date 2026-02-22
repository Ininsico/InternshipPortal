/**
 * DUMP ALL DATABASE RECORDS TO TXT
 * Run: node scripts/dump-all.js
 * Output: scripts/database-dump.txt
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const Admin = require('../src/models/Admin.model');
const Student = require('../src/models/Student.model');
const Application = require('../src/models/Application.model');
const Agreement = require('../src/models/Agreement.model');
const Task = require('../src/models/Task.model');
const Submission = require('../src/models/Submission.model');
const Report = require('../src/models/Report.model');

const OUT = path.join(__dirname, 'database-dump.txt');

const line = (char = '-', len = 70) => char.repeat(len);
const head = (title) => `\n${line('=')}\n  ${title}\n${line('=')}\n`;
const sub = (title) => `\n  ${line('-', 66)}\n  ${title}\n  ${line('-', 66)}\n`;
const field = (label, value) => `  ${(label + ':').padEnd(26)} ${value ?? 'N/A'}`;

async function dump() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    const lines = [];
    const now = new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' });

    lines.push(line('='));
    lines.push('  CU INTERNSHIP PORTAL — FULL DATABASE DUMP');
    lines.push(`  Generated: ${now}`);
    lines.push(`  ALL TEST ACCOUNT PASSWORD: 12345`);
    lines.push(line('='));

    // ── ADMINS ────────────────────────────────────────────────────
    lines.push(head('SECTION 1 — ADMIN ACCOUNTS'));

    const admins = await Admin.find().sort({ role: 1, name: 1 }).lean();
    lines.push(`  Total admins in DB: ${admins.length}\n`);

    const roleGroups = {};
    for (const a of admins) {
        (roleGroups[a.role] = roleGroups[a.role] || []).push(a);
    }

    for (const [role, group] of Object.entries(roleGroups)) {
        lines.push(`\n  ── ${role.toUpperCase().replace('_', ' ')} (${group.length}) ──`);
        for (const a of group) {
            lines.push('');
            lines.push(field('Name', a.name));
            lines.push(field('Email', a.email));
            lines.push(field('Password', '12345  (hashed in DB)'));
            lines.push(field('Role', a.role));
            lines.push(field('Company', a.company));
            lines.push(field('Active', a.isActive ? 'Yes' : 'No'));
            lines.push(field('Created', new Date(a.createdAt).toLocaleDateString()));
            lines.push(field('MongoDB ID', a._id.toString()));
        }
    }

    // ── STUDENTS ──────────────────────────────────────────────────
    lines.push(head('SECTION 2 — STUDENTS'));

    const students = await Student.find()
        .populate('supervisorId', 'name email')
        .sort({ session: 1, degree: 1, rollNumber: 1 })
        .lean();

    lines.push(`  Total students in DB: ${students.length}\n`);

    // Group by session
    const sessionGroups = {};
    for (const s of students) {
        (sessionGroups[s.session] = sessionGroups[s.session] || []).push(s);
    }

    for (const [session, group] of Object.entries(sessionGroups)) {
        lines.push(sub(`Session: ${session}  (${group.length} students)`));
        for (const s of group) {
            lines.push('');
            lines.push(field('Roll Number', s.rollNumber));
            lines.push(field('Name', s.name));
            lines.push(field('Email', s.email));
            lines.push(field('Password', '12345  (hashed in DB)'));
            lines.push(field('Degree', s.degree));
            lines.push(field('Session', s.session));
            lines.push(field('Internship Status', s.internshipStatus));
            lines.push(field('Faculty Supervisor', s.supervisorId ? `${s.supervisorId.name} (${s.supervisorId.email})` : 'Not assigned'));
            lines.push(field('Assigned Company', s.assignedCompany));
            lines.push(field('Assigned Position', s.assignedPosition));
            lines.push(field('Site Supervisor', s.siteSupervisorName));
            lines.push(field('Site Sup. Email', s.siteSupervisorEmail));
            lines.push(field('Site Sup. Phone', s.siteSupervisorPhone));
            lines.push(field('MongoDB ID', s._id.toString()));
            lines.push('');
        }
    }

    // Status summary
    lines.push(`\n  ── STATUS DISTRIBUTION ──`);
    const statusMap = {};
    for (const s of students) statusMap[s.internshipStatus] = (statusMap[s.internshipStatus] || 0) + 1;
    for (const [k, v] of Object.entries(statusMap)) lines.push(field(k, v));

    // ── APPLICATIONS ──────────────────────────────────────────────
    lines.push(head('SECTION 3 — APPLICATIONS'));

    const applications = await Application.find()
        .populate('studentId', 'name rollNumber')
        .sort({ appliedDate: -1 })
        .lean();

    lines.push(`  Total applications in DB: ${applications.length}\n`);

    for (const app of applications) {
        lines.push('');
        lines.push(field('Student', app.studentId ? `${app.studentId.name} (${app.studentId.rollNumber})` : 'Unknown'));
        lines.push(field('Company', app.companyName));
        lines.push(field('Position', app.position));
        lines.push(field('Type', app.internshipType));
        lines.push(field('Duration', app.duration));
        lines.push(field('Status', app.status));
        lines.push(field('Applied Date', new Date(app.appliedDate).toLocaleDateString()));
        lines.push(field('Description', app.description ? app.description.slice(0, 80) + '...' : 'N/A'));
        lines.push(field('MongoDB ID', app._id.toString()));
    }

    // ── AGREEMENTS ────────────────────────────────────────────────
    lines.push(head('SECTION 4 — INTERNSHIP AGREEMENTS'));

    const agreements = await Agreement.find()
        .populate('studentId', 'name rollNumber')
        .populate('applicationId', 'companyName position')
        .sort({ createdAt: -1 })
        .lean();

    lines.push(`  Total agreements in DB: ${agreements.length}\n`);

    for (const ag of agreements) {
        lines.push('');
        lines.push(field('Student', ag.studentId ? `${ag.studentId.name} (${ag.studentId.rollNumber})` : 'Unknown'));
        lines.push(field('Company', ag.applicationId?.companyName));
        lines.push(field('Position', ag.applicationId?.position));
        lines.push(field('Sourcing Type', ag.sourcingType));
        lines.push(field('Status', ag.status));
        lines.push(field('Phone', ag.phoneNumber));
        lines.push(field('Personal Email', ag.personalEmail));
        lines.push(field('Home Address', ag.homeAddress));
        lines.push(field('Company Address', ag.companyAddress));
        lines.push(field('Supervisor Name', ag.supervisorName));
        lines.push(field('Sup. Designation', ag.supervisorDesignation));
        lines.push(field('Sup. Email', ag.supervisorEmail));
        lines.push(field('Sup. Phone', ag.supervisorPhone));
        lines.push(field('Submitted On', new Date(ag.createdAt).toLocaleDateString()));
        lines.push(field('MongoDB ID', ag._id.toString()));
    }

    // ── TASKS ─────────────────────────────────────────────────────
    lines.push(head('SECTION 5 — COMPANY TASKS'));

    const tasks = await Task.find()
        .populate('createdBy', 'name email company')
        .populate('assignedTo', 'name rollNumber')
        .sort({ company: 1, deadline: 1 })
        .lean();

    lines.push(`  Total tasks in DB: ${tasks.length}\n`);

    const tasksByCompany = {};
    for (const t of tasks) {
        const co = t.company || 'Unknown';
        (tasksByCompany[co] = tasksByCompany[co] || []).push(t);
    }

    for (const [company, cTasks] of Object.entries(tasksByCompany)) {
        lines.push(sub(`Company: ${company}  (${cTasks.length} tasks)`));
        for (const t of cTasks) {
            lines.push('');
            lines.push(field('Title', t.title));
            lines.push(field('Description', t.description.slice(0, 90)));
            lines.push(field('Max Marks', t.maxMarks));
            lines.push(field('Deadline', new Date(t.deadline).toLocaleDateString()));
            lines.push(field('Status', t.status));
            lines.push(field('Created By', t.createdBy ? `${t.createdBy.name} (${t.createdBy.email})` : 'N/A'));
            lines.push(field('Assigned To', t.assignedTo ? `${t.assignedTo.name} (${t.assignedTo.rollNumber})` : 'All company students'));
            lines.push(field('MongoDB ID', t._id.toString()));
        }
    }

    // ── SUBMISSIONS ───────────────────────────────────────────────
    lines.push(head('SECTION 6 — TASK SUBMISSIONS'));

    const submissions = await Submission.find()
        .populate('task', 'title company maxMarks')
        .populate('student', 'name rollNumber')
        .populate('companyGrade.gradedBy', 'name')
        .populate('facultyGrade.gradedBy', 'name')
        .sort({ submittedAt: -1 })
        .lean();

    lines.push(`  Total submissions in DB: ${submissions.length}\n`);

    for (const sub_ of submissions) {
        lines.push('');
        lines.push(field('Student', sub_.student ? `${sub_.student.name} (${sub_.student.rollNumber})` : 'Unknown'));
        lines.push(field('Task', sub_.task ? `${sub_.task.title} [${sub_.task.company}]` : 'Unknown'));
        lines.push(field('Max Marks', sub_.task?.maxMarks));
        lines.push(field('Submitted At', new Date(sub_.submittedAt).toLocaleDateString()));
        lines.push(field('Status', sub_.status));
        lines.push(field('Content', sub_.content.slice(0, 80) + '...'));
        if (sub_.companyGrade?.marks !== null && sub_.companyGrade?.marks !== undefined) {
            lines.push(field('Company Grade', sub_.companyGrade.marks));
            lines.push(field('Company Feedback', sub_.companyGrade.feedback));
            lines.push(field('Graded By', sub_.companyGrade.gradedBy?.name || 'N/A'));
        } else {
            lines.push(field('Company Grade', 'Not graded yet'));
        }
        if (sub_.facultyGrade?.marks !== null && sub_.facultyGrade?.marks !== undefined) {
            lines.push(field('Faculty Grade', sub_.facultyGrade.marks));
            lines.push(field('Faculty Feedback', sub_.facultyGrade.feedback));
        } else {
            lines.push(field('Faculty Grade', 'Not graded yet'));
        }
        lines.push(field('MongoDB ID', sub_._id.toString()));
    }

    // ── REPORTS ───────────────────────────────────────────────────
    lines.push(head('SECTION 7 — FACULTY INTERNSHIP REPORTS'));

    const reports = await Report.find()
        .populate('student', 'name rollNumber degree assignedCompany assignedPosition')
        .populate('createdBy', 'name email')
        .sort({ overallRating: -1 })
        .lean();

    lines.push(`  Total reports in DB: ${reports.length}\n`);

    for (const r of reports) {
        lines.push('');
        lines.push(field('Student', r.student ? `${r.student.name} (${r.student.rollNumber} — ${r.student.degree})` : 'Unknown'));
        lines.push(field('Company', r.student?.assignedCompany));
        lines.push(field('Position', r.student?.assignedPosition));
        lines.push(field('Report By', r.createdBy ? `${r.createdBy.name} (${r.createdBy.email})` : 'Unknown'));
        lines.push(field('Overall Rating', `${r.overallRating}/100`));
        lines.push(field('Recommendation', r.recommendation?.replace('_', ' ').toUpperCase()));
        lines.push(field('Completion Status', r.completionStatus));
        lines.push(field('Technical Score', r.scores?.technical));
        lines.push(field('Communication', r.scores?.communication));
        lines.push(field('Teamwork', r.scores?.teamwork));
        lines.push(field('Punctuality', r.scores?.punctuality));
        lines.push(field('Summary', r.summary.slice(0, 100) + '...'));
        lines.push(field('MongoDB ID', r._id.toString()));
    }

    // ── QUICK REFERENCE ───────────────────────────────────────────
    lines.push(head('QUICK REFERENCE — LOGIN CREDENTIALS'));
    lines.push('  ALL PASSWORDS: 12345\n');

    lines.push('  SUPER ADMINS:');
    for (const a of admins.filter(a => a.role === 'super_admin')) {
        lines.push(`    Email: ${a.email}   Password: 12345`);
    }

    lines.push('\n  FACULTY SUPERVISORS:');
    for (const a of admins.filter(a => a.role === 'admin')) {
        lines.push(`    ${a.name.padEnd(25)} ${a.email}   Password: 12345`);
    }

    lines.push('\n  COMPANY ADMINS:');
    for (const a of admins.filter(a => a.role === 'company_admin')) {
        lines.push(`    ${a.name.padEnd(20)} ${a.company.padEnd(22)} ${a.email}   Password: 12345`);
    }

    lines.push('\n  STUDENTS (Roll Number login):');
    for (const s of students) {
        lines.push(`    ${s.rollNumber.padEnd(18)} ${s.name.padEnd(28)} ${s.internshipStatus.padEnd(22)} Password: 12345`);
    }

    lines.push('\n' + line('='));
    lines.push('  END OF DUMP');
    lines.push(line('=') + '\n');

    // ── WRITE FILE ────────────────────────────────────────────────
    fs.writeFileSync(OUT, lines.join('\n'), 'utf8');
    console.log(`\nDone! File written to:\n  ${OUT}`);
    console.log(`  Lines: ${lines.length}`);
    console.log(`  Size:  ${(fs.statSync(OUT).size / 1024).toFixed(1)} KB`);

    await mongoose.disconnect();
    process.exit(0);
}

dump().catch(err => {
    console.error('Dump failed:', err.message);
    process.exit(1);
});
