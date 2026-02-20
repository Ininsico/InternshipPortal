require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../src/models/Admin.model');
const Student = require('../src/models/Student.model');

const SALT = 10;

const admins = [
    {
        name: 'Super Admin',
        email: 'admin@gmail.com',
        passwordHash: '12345',
        role: 'super_admin',
        isActive: true,
    },
];

const students = [
    {
        rollNumber: 'FA21-BCS-001',
        session: 'FA21',
        degree: 'BCS',
        serialNo: '001',
        name: 'Ali Raza',
        email: 'ali.raza@student.comsats.edu.pk',
        passwordHash: '12345',
        isActive: true,
    },
    {
        rollNumber: 'FA22-BSE-042',
        session: 'FA22',
        degree: 'BSE',
        serialNo: '042',
        name: 'Sara Khan',
        email: 'sara.khan@student.comsats.edu.pk',
        passwordHash: '12345',
        isActive: true,
    },
    {
        rollNumber: 'SP23-BCS-015',
        session: 'SP23',
        degree: 'BCS',
        serialNo: '015',
        name: 'Hamza Ahmed',
        email: 'hamza.ahmed@student.comsats.edu.pk',
        passwordHash: '12345',
        isActive: true,
    },
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        for (const data of admins) {
            const exists = await Admin.findOne({ email: data.email });
            if (exists) {
                console.log(`Admin already exists: ${data.email} — skipping`);
                continue;
            }
            const hash = await bcrypt.hash(data.passwordHash, SALT);
            await Admin.create({ ...data, passwordHash: hash });
            console.log(`Admin seeded: ${data.email}`);
        }

        for (const data of students) {
            const exists = await Student.findOne({ rollNumber: data.rollNumber });
            if (exists) {
                console.log(`Student already exists: ${data.rollNumber} — skipping`);
                continue;
            }
            const hash = await bcrypt.hash(data.passwordHash, SALT);
            await Student.create({ ...data, passwordHash: hash });
            console.log(`Student seeded: ${data.rollNumber} (${data.name})`);
        }

        console.log('\nSeed complete!');
        console.log('Admin   ->  admin@gmail.com  /  12345');
        console.log('Student ->  FA21-BCS-001     /  12345');

    } catch (err) {
        console.error('Seed failed:', err.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

seed();
