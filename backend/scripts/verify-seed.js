require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Admin = require('../src/models/Admin.model');
const Student = require('../src/models/Student.model');
const Application = require('../src/models/Application.model');
const Agreement = require('../src/models/Agreement.model');
const Task = require('../src/models/Task.model');
const Submission = require('../src/models/Submission.model');
const Report = require('../src/models/Report.model');

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const [admins, students, apps, agreements, tasks, subs, reports] = await Promise.all([
        Admin.countDocuments(),
        Student.countDocuments(),
        Application.countDocuments(),
        Agreement.countDocuments(),
        Task.countDocuments(),
        Submission.countDocuments(),
        Report.countDocuments(),
    ]);

    console.log('=== DATABASE RECORD COUNTS ===');
    console.log('Admins:      ', admins);
    console.log('Students:    ', students);
    console.log('Applications:', apps);
    console.log('Agreements:  ', agreements);
    console.log('Tasks:       ', tasks);
    console.log('Submissions: ', subs);
    console.log('Reports:     ', reports);

    const byRole = await Admin.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]);
    console.log('\nAdmins by role:');
    byRole.forEach(r => console.log(`  ${r._id}: ${r.count}`));

    const byStatus = await Student.aggregate([{ $group: { _id: '$internshipStatus', count: { $sum: 1 } } }]);
    console.log('\nStudents by internship status:');
    byStatus.forEach(s => console.log(`  ${s._id}: ${s.count}`));

    await mongoose.disconnect();
    process.exit(0);
});
