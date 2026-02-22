require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Application = require('../src/models/Application.model');

async function removeApps() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const appsToRemove = [
            { companyName: 'CodeMatics', position: 'FullStackWebDeveloper', status: 'pending' },
            { companyName: 'Codematics', position: 'FullStack', status: 'pending' },
            { companyName: 'codematics', position: 'Fullstack', status: 'pending' }
        ];

        console.log('Searching for applications to remove...');

        for (const criteria of appsToRemove) {
            const result = await Application.deleteMany(criteria);
            console.log(`Removed ${result.deletedCount} apps matching:`, criteria);
        }

        console.log('Cleanup complete.');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await mongoose.disconnect();
    }
}

removeApps();
