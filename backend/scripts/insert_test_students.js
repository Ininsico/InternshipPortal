require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('../src/models/Student.model');

const studentsToInsert = [
    {
        rollNumber: 'FA23-BCS-013',
        name: 'test1',
        email: 'fa23-bcs-013@student.comsats.edu.pk',
        password: 'Megamix@123'
    },
    {
        rollNumber: 'FA23-BCS-001',
        name: 'test2',
        email: 'fa23-bcs-001@student.comsats.edu.pk',
        password: 'Megamix@123'
    },
    {
        rollNumber: 'FA23-BCS-003',
        name: 'test3',
        email: 'fa23-bcs-003@student.comsats.edu.pk',
        password: 'Megamix@123'
    }
];

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected for seeding...');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    }
};

const seedStudents = async () => {
    await connectDB();

    for (const data of studentsToInsert) {
        try {
            // Check if already exists
            const existing = await Student.findOne({ rollNumber: data.rollNumber });
            if (existing) {
                console.log(`Student ${data.rollNumber} already exists. Skipping.`);
                continue;
            }

            // session: FA23
            // degree: BCS
            // serialNo: 013
            const parts = data.rollNumber.split('-');
            const session = parts[0];
            const degree = parts[1];
            const serialNo = parts[2];

            const newStudent = new Student({
                rollNumber: data.rollNumber,
                session,
                degree,
                serialNo,
                name: data.name,
                email: data.email,
                passwordHash: data.password, // Will be hashed by pre-save hook
                isEmailVerified: true,
                isActive: true,
                internshipStatus: 'none'
            });

            await newStudent.save();
            console.log(`Successfully inserted student: ${data.rollNumber}`);
        } catch (error) {
            console.error(`Error inserting student ${data.rollNumber}:`, error.message);
        }
    }

    console.log('Seeding complete.');
    mongoose.connection.close();
};

seedStudents();
