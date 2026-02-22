const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Application = require('../src/models/Application.model');
const Student = require('../src/models/Student.model');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/internship-portal';

async function cleanup() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB for cleanup...');

        const approvedStudents = await Student.find({ internshipStatus: 'approved' });
        console.log(`Found ${approvedStudents.length} approved students.`);

        for (const student of approvedStudents) {
            const result = await Application.deleteMany({
                studentId: student._id,
                status: 'pending'
            });
            if (result.deletedCount > 0) {
                console.log(`- Cleaned up ${result.deletedCount} pending apps for student: ${student.name} (${student.rollNumber})`);
            }
        }

        console.log('\nCleanup complete.');
        process.exit(0);
    } catch (err) {
        console.error('Cleanup failed:', err);
        process.exit(1);
    }
}

cleanup();
