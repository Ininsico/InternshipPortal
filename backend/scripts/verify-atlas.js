require('dotenv').config();
const mongoose = require('mongoose');

async function check() {
    console.log('🔍 Testing connection to:', process.env.MONGO_URI);
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connection Successful!');

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('📂 Remote Collections Found:', collections.map(c => c.name));

        const adminCount = await mongoose.connection.db.collection('admins').countDocuments();
        const studentCount = await mongoose.connection.db.collection('students').countDocuments();

        console.log(`📊 Admin Count: ${adminCount}`);
        console.log(`📊 Student Count: ${studentCount}`);

    } catch (err) {
        console.error('❌ Connection Failed:', err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

check();
