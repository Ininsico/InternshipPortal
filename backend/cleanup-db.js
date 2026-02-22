const mongoose = require('mongoose');
const Application = require('./src/models/Application.model');
require('dotenv').config();

async function cleanup() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const duplicates = await Application.aggregate([
        {
            $group: {
                _id: '$studentId',
                count: { $sum: 1 },
                ids: { $push: '$_id' }
            }
        },
        {
            $match: {
                count: { $gt: 1 }
            }
        }
    ]);

    console.log(`Found ${duplicates.length} duplicate student applications.`);

    for (const dup of duplicates) {
        // Keep the first one, delete the rest
        const toDelete = dup.ids.slice(1);
        console.log(`Cleaning up duplicates for student ${dup._id}. Keeping ${dup.ids[0]}, deleting ${toDelete.length} others.`);
        await Application.deleteMany({ _id: { $in: toDelete } });
    }

    console.log('Cleanup finished.');
    process.exit(0);
}

cleanup().catch(err => {
    console.error(err);
    process.exit(1);
});
