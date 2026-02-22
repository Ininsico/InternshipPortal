/**
 * ============================================================
 *  MEGA SEED — CU Internship Portal
 *  Populates the DB with realistic, large-scale test data:
 *    - 1 super admin
 *    - 10 faculty supervisors
 *    - 5 company admins (5 companies)
 *    - 60 students (multiple sessions, degrees)
 *    - Applications, agreements, internship assignments
 *    - 3-5 tasks per company
 *    - Submissions (with company grades)
 *    - Faculty internship reports
 *
 *  ALL passwords: 12345
 *  Run: node scripts/seed-large.js
 * ============================================================
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Admin = require('../src/models/Admin.model');
const Student = require('../src/models/Student.model');
const Application = require('../src/models/Application.model');
const Agreement = require('../src/models/Agreement.model');
const Task = require('../src/models/Task.model');
const Submission = require('../src/models/Submission.model');
const Report = require('../src/models/Report.model');

const SALT = 10;
const PW = '12345';

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const future = (days) => new Date(Date.now() + days * 86400000);
const past = (days) => new Date(Date.now() - days * 86400000);

// ─────────────────────────────────────────────
//  FACULTY SUPERVISORS (10)
// ─────────────────────────────────────────────
const facultyData = [
    { name: 'Dr. Ahmad Raza', email: 'ahmad.raza@comsats.edu.pk', department: 'CS' },
    { name: 'Prof. Sarah Khan', email: 'sarah.khan@comsats.edu.pk', department: 'SE' },
    { name: 'Dr. Bilal Hussain', email: 'bilal.hussain@comsats.edu.pk', department: 'CS' },
    { name: 'Prof. Nida Fatima', email: 'nida.fatima@comsats.edu.pk', department: 'IT' },
    { name: 'Dr. Usman Tariq', email: 'usman.tariq@comsats.edu.pk', department: 'CS' },
    { name: 'Prof. Ayesha Malik', email: 'ayesha.malik@comsats.edu.pk', department: 'SE' },
    { name: 'Dr. Zafar Iqbal', email: 'zafar.iqbal@comsats.edu.pk', department: 'AI' },
    { name: 'Prof. Hina Tariq', email: 'hina.tariq@comsats.edu.pk', department: 'DS' },
    { name: 'Dr. Kamran Shahid', email: 'kamran.shahid@comsats.edu.pk', department: 'CS' },
    { name: 'Prof. Rabia Noor', email: 'rabia.noor@comsats.edu.pk', department: 'IT' },
];

// ─────────────────────────────────────────────
//  COMPANIES + COMPANY ADMINS (5 each)
// ─────────────────────────────────────────────
const companiesData = [
    {
        admin: { name: 'Ali Hassan', email: 'ali.hassan@systems.pk' },
        company: 'Systems Limited',
        address: 'Plot 23, I-9 Industrial Area, Islamabad',
        siteSupervisor: { name: 'Waqar Ahmed', designation: 'Engineering Manager', email: 'waqar@systems.pk', phone: '0300-1234567' },
    },
    {
        admin: { name: 'Sara Qureshi', email: 'sara.qureshi@netsol.pk' },
        company: 'NetSol Technologies',
        address: 'NSTP, H-11/4, Islamabad',
        siteSupervisor: { name: 'Irfan Malik', designation: 'Senior Developer', email: 'irfan@netsol.pk', phone: '0312-9876543' },
    },
    {
        admin: { name: 'Tariq Aziz', email: 'tariq.aziz@ptcl.pk' },
        company: 'PTCL',
        address: 'G-8/4, Islamabad',
        siteSupervisor: { name: 'Hasan Raza', designation: 'IT Lead', email: 'hasan@ptcl.net.pk', phone: '0321-5554443' },
    },
    {
        admin: { name: 'Zara Ahmed', email: 'zara.ahmed@arpatech.pk' },
        company: 'Arpatech',
        address: 'Gulberg III, Lahore',
        siteSupervisor: { name: 'Kamran Ali', designation: 'Tech Lead', email: 'kamran@arpatech.com', phone: '0333-7778889' },
    },
    {
        admin: { name: 'Omar Farooq', email: 'omar.farooq@trg.pk' },
        company: 'TRG Pakistan',
        address: 'PECHS, Karachi',
        siteSupervisor: { name: 'Sana Siddiqui', 'designation': 'Project Manager', email: 'sana@trg.com.pk', phone: '0345-2223334' },
    },
];

// ─────────────────────────────────────────────
//  STUDENTS — 60 across sessions & degrees
// ─────────────────────────────────────────────
const sessions = ['FA20', 'SP21', 'FA21', 'SP22', 'FA22'];
const degrees = ['BCS', 'BSE', 'BIT', 'MCS', 'MIT'];
const firstNames = [
    'Muhammad', 'Ali', 'Ahmed', 'Omar', 'Bilal', 'Hassan', 'Usman', 'Hamza',
    'Fatima', 'Ayesha', 'Zainab', 'Sara', 'Hina', 'Nida', 'Rabia', 'Sana',
    'Abdullah', 'Talha', 'Saad', 'Asad', 'Zaid', 'Anas', 'Yusuf', 'Ibrahim',
    'Sofia', 'Maria', 'Amna', 'Madiha', 'Laiba', 'Iqra',
];
const lastNames = [
    'Khan', 'Ali', 'Ahmed', 'Raza', 'Malik', 'Hussain', 'Shah', 'Qureshi',
    'Butt', 'Chaudhry', 'Iqbal', 'Aslam', 'Farooq', 'Siddiqui', 'Arshad',
    'Mirza', 'Baig', 'Cheema', 'Nawaz', 'Bashir',
];

function makeStudents() {
    const students = [];
    const usedRolls = new Set();
    let idx = 1;

    for (const session of sessions) {
        for (const degree of degrees) {
            const count = rand(2, 3); // 2-3 students per session+degree combo
            for (let i = 0; i < count; i++) {
                const serial = String(idx).padStart(3, '0');
                const rollNumber = `${session}-${degree}-${serial}`;
                if (usedRolls.has(rollNumber)) continue;
                usedRolls.add(rollNumber);

                const first = pick(firstNames);
                const last = pick(lastNames);
                const name = `${first} ${last}`;
                const emailSlug = `${first.toLowerCase()}.${last.toLowerCase()}${idx}`;

                students.push({
                    rollNumber,
                    session,
                    degree,
                    serialNo: serial,
                    name,
                    email: `${emailSlug}@student.comsats.edu.pk`,
                    passwordHash: PW,
                });
                idx++;
            }
        }
    }
    return students;
}

// ─────────────────────────────────────────────
//  TASKS per company
// ─────────────────────────────────────────────
const taskTemplates = [
    { title: 'API Integration Module', description: 'Implement a RESTful API integration with the existing backend system.', maxMarks: 100 },
    { title: 'Database Schema Design', description: 'Design and document the relational schema for the new product module.', maxMarks: 80 },
    { title: 'Frontend UI Bug Fixes', description: 'Resolve the 15 listed UI bugs in the React dashboard.', maxMarks: 60 },
    { title: 'Weekly Progress Report', description: 'Submit a detailed weekly progress report covering tasks and learnings.', maxMarks: 40 },
    { title: 'Unit Test Coverage', description: 'Achieve 80% unit test coverage for the assigned microservice.', maxMarks: 100 },
    { title: 'Docker Containerisation', description: 'Dockerise the Node.js application and set up docker-compose.', maxMarks: 90 },
    { title: 'CI/CD Pipeline Setup', description: 'Set up GitHub Actions workflow for automated testing and deployment.', maxMarks: 100 },
    { title: 'System Architecture Diagram', description: 'Create a detailed architecture diagram for the current project.', maxMarks: 50 },
    { title: 'Performance Optimisation', description: 'Profile and optimise database queries to reduce response time by 30%.', maxMarks: 100 },
    { title: 'Documentation Update', description: 'Update the API documentation using Swagger for all new endpoints.', maxMarks: 40 },
    { title: 'Security Audit', description: 'Perform a security audit on the REST API and report findings.', maxMarks: 80 },
    { title: 'Mobile Responsiveness Fix', description: 'Ensure all pages are fully responsive on mobile and tablet breakpoints.', maxMarks: 70 },
];

const submissionContents = [
    'Completed the module as required. All endpoints tested with Postman. GitHub PR link: github.com/company/repo/pull/42',
    'Database schema has been designed and documented in the Confluence page. ERD attached.',
    'All 15 UI bugs resolved. Tested across Chrome, Firefox, Safari. Screenshots attached.',
    'Weekly report attached. This week I worked on API integration, wrote 12 unit tests, and attended 2 code reviews.',
    'Achieved 85% unit test coverage. Report generated with Jest. Coverage report in /docs/coverage.',
    'Docker setup complete. docker-compose.yml and Dockerfile included. Tested on local environment.',
    'GitHub Actions workflow set up. Pipeline runs on every PR, includes lint, test, and build stages.',
    'Architecture diagram created using draw.io. File uploaded to project drive.',
    'Query optimisation complete. Average response time reduced from 450ms to 210ms. Profiling report attached.',
    'Swagger documentation updated for all 23 new endpoints. Available at /api-docs.',
];

// ─────────────────────────────────────────────
//  REPORT SUMMARIES
// ─────────────────────────────────────────────
const reportSummaries = [
    'The student demonstrated excellent technical skills throughout the internship. Consistently delivered tasks on time and showed great initiative.',
    'A dedicated intern who actively participated in team meetings and contributed innovative ideas. Technical knowledge is solid with room for growth.',
    'The student showed satisfactory performance. Task completion rate was good, but communication could be improved.',
    'Outstanding performance across all evaluation criteria. Highly recommended for future full-time opportunities.',
    'The intern struggled initially but showed significant improvement over the internship period. Hard working and receptive to feedback.',
    'Good overall performance. The student was punctual, professional, and completed all assigned tasks with minimal supervision.',
    'Exceptional problem-solving skills demonstrated throughout. A very promising young engineer with great potential.',
    'The intern contributed meaningfully to the project. Some delays were observed but quality of work was consistently high.',
];

// ─────────────────────────────────────────────
//  MAIN SEED
// ─────────────────────────────────────────────
async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB\n');

        // ── CLEAR ALL ──────────────────────────
        await Promise.all([
            Admin.deleteMany({}),
            Student.deleteMany({}),
            Application.deleteMany({}),
            Agreement.deleteMany({}),
            Task.deleteMany({}),
            Submission.deleteMany({}),
            Report.deleteMany({}),
        ]);
        console.log('🗑️  Cleared existing data\n');

        // ── SUPER ADMIN ────────────────────────
        const superAdmin = await Admin.create({
            name: 'Super Admin',
            email: 'admin@gmail.com',
            passwordHash: await bcrypt.hash(PW, SALT),
            role: 'super_admin',
            isActive: true,
        });
        console.log(`👑 Super Admin: admin@gmail.com / ${PW}`);

        // Also seed drarslanrathore as super_admin
        await Admin.create({
            name: 'Dr. Arslan Rathore',
            email: 'drarslanrathore@gmail.com',
            passwordHash: await bcrypt.hash(PW, SALT),
            role: 'super_admin',
            isActive: true,
        });
        console.log(`👑 Super Admin: drarslanrathore@gmail.com / ${PW}`);

        // ── FACULTY SUPERVISORS ────────────────
        const faculty = [];
        for (const f of facultyData) {
            const admin = await Admin.create({
                name: f.name,
                email: f.email,
                passwordHash: await bcrypt.hash(PW, SALT),
                role: 'admin',
                isActive: true,
            });
            faculty.push(admin);
            console.log(`🎓 Faculty: ${f.email}`);
        }
        console.log();

        // ── COMPANY ADMINS ─────────────────────
        const companyAdmins = [];
        for (const c of companiesData) {
            const admin = await Admin.create({
                name: c.admin.name,
                email: c.admin.email,
                passwordHash: await bcrypt.hash(PW, SALT),
                role: 'company_admin',
                company: c.company,
                isActive: true,
            });
            companyAdmins.push({ admin, meta: c });
            console.log(`🏢 Company Admin: ${c.admin.email} → ${c.company}`);
        }
        console.log();

        // ── TASKS (3-4 per company) ────────────
        const tasksByCompany = {};
        for (const { admin, meta } of companyAdmins) {
            const taskCount = rand(3, 4);
            const shuffled = [...taskTemplates].sort(() => Math.random() - 0.5).slice(0, taskCount);
            const tasks = [];
            for (const t of shuffled) {
                const task = await Task.create({
                    title: t.title,
                    description: t.description,
                    deadline: future(rand(14, 60)),
                    createdBy: admin._id,
                    company: meta.company,
                    maxMarks: t.maxMarks,
                    status: 'active',
                });
                tasks.push(task);
            }
            tasksByCompany[meta.company] = tasks;
            console.log(`📋 ${meta.company}: ${tasks.length} tasks created`);
        }
        console.log();

        // ── STUDENTS ──────────────────────────
        const studentDefs = makeStudents();
        const students = [];

        for (let i = 0; i < studentDefs.length; i++) {
            const def = studentDefs[i];
            const supervisor = faculty[i % faculty.length];

            // Decide internship status — spread across pipeline stages
            const statusPool = [
                'verified', 'verified', 'verified',        // most students fully verified
                'internship_assigned', 'internship_assigned',
                'agreement_submitted',
                'approved',
                'submitted',
                'none',
            ];
            const internshipStatus = pick(statusPool);

            // Assign to a company (only if verified/assigned)
            let companyMeta = null;
            if (['verified', 'internship_assigned'].includes(internshipStatus)) {
                companyMeta = pick(companiesData);
            }

            const stu = await Student.create({
                ...def,
                passwordHash: await bcrypt.hash(def.passwordHash, SALT),
                supervisorId: supervisor._id,
                internshipStatus,
                ...(companyMeta ? {
                    assignedCompany: companyMeta.company,
                    assignedPosition: pick(['Software Engineer Intern', 'Backend Developer Intern', 'Frontend Developer Intern', 'Data Analyst Intern', 'DevOps Intern', 'QA Engineer Intern']),
                    siteSupervisorName: companyMeta.siteSupervisor.name,
                    siteSupervisorEmail: companyMeta.siteSupervisor.email,
                    siteSupervisorPhone: companyMeta.siteSupervisor.phone,
                } : {}),
            });
            students.push({ stu, supervisor, companyMeta, internshipStatus });
        }
        console.log(`👩‍🎓 Students created: ${students.length}`);

        // ── APPLICATIONS ──────────────────────
        let appCount = 0;
        const applicationsByStudent = {};

        for (const { stu, internshipStatus, companyMeta } of students) {
            // Students that progressed have at least one application
            if (internshipStatus === 'none') continue;

            const numApps = rand(1, 3);
            const apps = [];
            for (let j = 0; j < numApps; j++) {
                const isMainApp = j === 0 && companyMeta;
                const appStatus = isMainApp
                    ? (internshipStatus === 'submitted' ? 'pending' : 'approved')
                    : pick(['pending', 'rejected', 'approved']);

                const app = await Application.create({
                    studentId: stu._id,
                    companyName: isMainApp ? companyMeta.company : pick(['Folio3', 'Techlogix', 'Arbisoft', 'Confiz', 'DevBatch', '10Pearls', 'Contour Software']),
                    position: pick(['Software Intern', 'Web Developer Intern', 'Mobile App Intern', 'Data Science Intern', 'QA Intern', 'Embedded Systems Intern']),
                    internshipType: pick(['Self', 'University Assigned']),
                    duration: pick(['6 Weeks', '8 Weeks', '12 Weeks', '3 Months', '6 Months']),
                    description: `Internship application for the ${j === 0 ? (companyMeta?.company || 'company') : 'company'} role. I am excited to contribute and learn.`,
                    status: appStatus,
                    appliedDate: past(rand(10, 120)),
                });
                apps.push(app);
                appCount++;
            }
            applicationsByStudent[stu._id] = apps;
        }
        console.log(`📄 Applications created: ${appCount}`);

        // ── AGREEMENTS ────────────────────────
        let agreementCount = 0;
        for (const { stu, internshipStatus, companyMeta } of students) {
            if (!['agreement_submitted', 'verified', 'internship_assigned'].includes(internshipStatus)) continue;
            if (!applicationsByStudent[stu._id]) continue;

            const mainApp = applicationsByStudent[stu._id][0];
            if (!mainApp) continue;

            await Agreement.create({
                studentId: stu._id,
                applicationId: mainApp._id,
                sourcingType: pick(['Self', 'University Assigned']),
                phoneNumber: `030${rand(0, 9)}-${rand(1000000, 9999999)}`,
                personalEmail: stu.email.replace('student.comsats', 'gmail'),
                homeAddress: `House ${rand(1, 500)}, Street ${rand(1, 20)}, ${pick(['Islamabad', 'Rawalpindi', 'Lahore', 'Karachi', 'Peshawar'])}`,
                companyAddress: companyMeta?.address || 'N/A',
                supervisorName: companyMeta?.siteSupervisor.name || 'N/A',
                supervisorDesignation: companyMeta?.siteSupervisor.designation || 'N/A',
                supervisorEmail: companyMeta?.siteSupervisor.email || 'N/A',
                supervisorPhone: companyMeta?.siteSupervisor.phone || 'N/A',
                status: internshipStatus === 'verified' ? 'verified' : 'submitted',
            });
            agreementCount++;
        }
        console.log(`📝 Agreements created: ${agreementCount}`);

        // ── SUBMISSIONS ───────────────────────
        let submissionCount = 0;
        for (const { stu, internshipStatus, companyMeta } of students) {
            if (!companyMeta) continue;
            if (!['verified', 'internship_assigned'].includes(internshipStatus)) continue;

            const tasks = tasksByCompany[companyMeta.company] || [];
            for (const task of tasks) {
                // ~75% of verified students have submitted each task
                if (Math.random() > 0.75) continue;

                const hasCompanyGrade = Math.random() > 0.4;
                const companyGradeMarks = hasCompanyGrade ? rand(Math.floor(task.maxMarks * 0.5), task.maxMarks) : null;

                try {
                    await Submission.create({
                        task: task._id,
                        student: stu._id,
                        content: pick(submissionContents),
                        submittedAt: past(rand(1, 30)),
                        status: hasCompanyGrade ? 'graded_by_company' : 'submitted',
                        companyGrade: hasCompanyGrade ? {
                            marks: companyGradeMarks,
                            feedback: pick([
                                'Good work! Clean and well-structured.',
                                'Decent effort, but needs more detail in documentation.',
                                'Excellent submission. Exceeded expectations.',
                                'Task completed. Please improve code comments next time.',
                                'Very good. Minor issues noted in the review.',
                            ]),
                            gradedAt: past(rand(1, 7)),
                            gradedBy: companyAdmins.find(ca => ca.meta.company === companyMeta.company)?.admin._id,
                        } : undefined,
                    });
                    submissionCount++;
                } catch (_) { /* skip duplicate */ }
            }
        }
        console.log(`📤 Submissions created: ${submissionCount}`);

        // ── REPORTS ───────────────────────────
        let reportCount = 0;
        for (const { stu, internshipStatus, supervisor, companyMeta } of students) {
            if (!companyMeta) continue;
            if (!['verified'].includes(internshipStatus)) continue;
            // ~70% of verified students have a report
            if (Math.random() > 0.70) continue;

            const tech = rand(55, 100);
            const comm = rand(50, 100);
            const team = rand(60, 100);
            const punct = rand(65, 100);
            const overall = Math.round((tech + comm + team + punct) / 4);

            const recommendation =
                overall >= 85 ? 'excellent' :
                    overall >= 75 ? 'good' :
                        overall >= 60 ? 'satisfactory' :
                            overall >= 45 ? 'needs_improvement' : 'unsatisfactory';

            await Report.create({
                student: stu._id,
                createdBy: supervisor._id,
                summary: pick(reportSummaries),
                overallRating: overall,
                scores: { technical: tech, communication: comm, teamwork: team, punctuality: punct },
                recommendation,
                completionStatus: pick(['completed', 'completed', 'ongoing']),
            });
            reportCount++;
        }
        console.log(`📊 Reports created: ${reportCount}`);

        // ── SUMMARY ───────────────────────────
        console.log('\n' + '═'.repeat(55));
        console.log('  SEED COMPLETE — Login Credentials (password: 12345)');
        console.log('═'.repeat(55));
        console.log('  SUPER ADMINS:');
        console.log('    admin@gmail.com');
        console.log('    drarslanrathore@gmail.com');
        console.log('\n  FACULTY SUPERVISORS (10):');
        facultyData.forEach(f => console.log(`    ${f.email}`));
        console.log('\n  COMPANY ADMINS (5):');
        companiesData.forEach(c => console.log(`    ${c.admin.email}  →  ${c.company}`));
        console.log('\n  STUDENT LOGIN FORMAT:');
        console.log('    Roll: FA21-BCS-001  (use session, degree, serial)');
        console.log('    Password: 12345');
        console.log('');
        console.log(`  Total students: ${students.length}`);
        console.log(`  Total applications: ${appCount}`);
        console.log(`  Total agreements: ${agreementCount}`);
        console.log(`  Total submissions: ${submissionCount}`);
        console.log(`  Total reports: ${reportCount}`);
        console.log('═'.repeat(55));

    } catch (err) {
        console.error('\n❌ Seed failed:', err.message);
        console.error(err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

seed();
