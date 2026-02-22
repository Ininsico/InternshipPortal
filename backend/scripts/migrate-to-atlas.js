const mongoose = require('mongoose');

const LOCAL_URI = 'mongodb://127.0.0.1:27017/internshipportal';
const REMOTE_URI = 'mongodb+srv://ininsico_db_user:4dCuve4pmYqove4K@ininsico.lgmaryq.mongodb.net/internshipportal?appName=internshipportal';

async function migrate() {
    console.log('🚀 Starting Data Migration...');

    let localConn, remoteConn;

    try {
        console.log('🔗 Connecting to local database...');
        localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
        console.log('✅ Local connection established.');

        console.log('🔗 Connecting to remote Atlas database...');
        remoteConn = await mongoose.createConnection(REMOTE_URI).asPromise();
        console.log('✅ Remote connection established.');

        const collections = await localConn.db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);

        console.log(`📂 Collections to migrate: ${collectionNames.join(', ')}`);

        for (const name of collectionNames) {
            console.log(`\n📦 Migrating collection: ${name}...`);

            const localColl = localConn.db.collection(name);
            const remoteColl = remoteConn.db.collection(name);

            const documents = await localColl.find({}).toArray();
            console.log(`📄 Found ${documents.length} documents in ${name}.`);

            if (documents.length > 0) {
                console.log(`🗑️ Clearing remote collection: ${name}...`);
                await remoteColl.deleteMany({});

                console.log(`📥 Inserting documents into remote ${name}...`);
                await remoteColl.insertMany(documents);
                console.log(`✅ ${name} migration complete.`);
            } else {
                console.log(`⚠️ skipping empty collection: ${name}`);
            }
        }

        console.log('\n✨ MIGRATION SUCCESSFUL! All data is now on MongoDB Atlas.');

    } catch (err) {
        console.error('\n❌ Migration failed:', err);
    } finally {
        if (localConn) await localConn.close();
        if (remoteConn) await remoteConn.close();
        process.exit(0);
    }
}

migrate();
