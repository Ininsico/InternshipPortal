require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../src/models/Admin.model');
const Student = require('../src/models/Student.model');
const Application = require('../src/models/Application.model');

const SALT = 10;

const admins = [
    {
        name: 'Super Admin',
        email: 'admin@gmail.com',
        passwordHash: '12345',
        role: 'super_admin',
    },
    {
        name: 'Dr. Ahmad',
        email: 'ahmad@comsats.edu.pk',
        passwordHash: '12345',
        role: 'admin',
    },
    {
        name: 'Prof. Sarah',
        email: 'sarah@comsats.edu.pk',
        passwordHash: '12345',
        role: 'admin',
    }
];

const studentData = [
    {
        rollNumber: 'FA21-BCS-001',
        session: 'FA21',
        degree: 'BCS',
        serialNo: '001',
        name: 'Arslan Ali',
        email: 'arslan@student.comsats.edu.pk',
        passwordHash: '12345',
    },
    {
        rollNumber: 'FA21-BCS-002',
        session: 'FA21',
        degree: 'BCS',
        serialNo: '002',
        name: 'Zainab Bibi',
        email: 'zainab@student.comsats.edu.pk',
        passwordHash: '12345',
    }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        await Admin.deleteMany({});
        await Student.deleteMany({});
        await Application.deleteMany({});
        console.log('Cleared existing data');

        const createdAdmins = [];
        for (const data of admins) {
            const hash = await bcrypt.hash(data.passwordHash, SALT);
            const admin = await Admin.create({ ...data, passwordHash: hash });
            createdAdmins.push(admin);
            console.log(`Admin seeded: ${data.email} (${data.role})`);
        }

        const faculty1 = createdAdmins.find(a => a.email === 'ahmad@comsats.edu.pk');

        for (const data of studentData) {
            const hash = await bcrypt.hash(data.passwordHash, SALT);
            await Student.create({
                ...data,
                passwordHash: hash,
                supervisorId: faculty1._id
            });
            console.log(`Student seeded: ${data.rollNumber} (Assigned to ${faculty1.name})`);
        }

        console.log('\nSeed complete!');
        console.log('Super Admin: admin@gmail.com / 12345');
        console.log('Faculty:     ahmad@comsats.edu.pk / 12345');
        console.log('Student:     FA21-BCS-001 / 12345');

    } catch (err) {
        console.error('Seed failed:', err.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

seed();
