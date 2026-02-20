/**
 * db.js — In-memory seed database (replace with a real DB / Prisma later)
 *
 * Passwords are pre-hashed with bcrypt (cost factor 10).
 * Plain-text equivalents are listed in comments for development.
 *
 * To generate a new hash:  node -e "const b=require('bcryptjs');b.hash('yourpassword',10).then(console.log)"
 */

const bcrypt = require('bcryptjs');

// Pre-hash passwords synchronously once at startup (for the in-memory seed)
const SALT_ROUNDS = 10;

const students = [
    {
        id: 'stu-001',
        rollNumber: 'FA21-BCS-001',
        name: 'Ali Raza',
        email: 'ali.raza@student.comsats.edu.pk',
        // password: 12345
        passwordHash: bcrypt.hashSync('12345', SALT_ROUNDS),
    },
    {
        id: 'stu-002',
        rollNumber: 'FA22-BSE-042',
        name: 'Sara Khan',
        email: 'sara.khan@student.comsats.edu.pk',
        // password: 12345
        passwordHash: bcrypt.hashSync('12345', SALT_ROUNDS),
    },
];

const admins = [
    {
        id: 'adm-001',
        name: 'Super Admin',
        email: 'admin@gmail.com',
        role: 'super_admin',
        // password: 12345
        passwordHash: bcrypt.hashSync('12345', SALT_ROUNDS),
    },
];

const db = { students, admins };

module.exports = { db };
