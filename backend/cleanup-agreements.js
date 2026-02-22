const mongoose = require('mongoose');
const Agreement = require('./src/models/Agreement.model');
require('dotenv').config();

async function cleanup() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const duplicates = await Agreement.aggregate([
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

    console.log(`Found ${duplicates.length} duplicate student agreements.`);

    for (const dup of duplicates) {
        const toDelete = dup.ids.slice(1);
        console.log(`Cleaning up duplicates for student ${dup._id}. Keeping ${dup.ids[0]}, deleting ${toDelete.length} others.`);
        await Agreement.deleteMany({ _id: { $in: toDelete } });
    }

    console.log('Cleanup finished.');
    process.exit(0);
}

cleanup().catch(err => {
    console.error(err);
    process.exit(1);
});
