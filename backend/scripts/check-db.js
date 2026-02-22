require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Admin = require('../src/models/Admin.model');

async function check() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const adminCount = await Admin.countDocuments();
        const admins = await Admin.find({});
        console.log(`Total Admins: ${adminCount}`);
        admins.forEach(a => console.log(`- ${a.email} (Active: ${a.isActive}, Role: ${a.role})`));
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

check();
