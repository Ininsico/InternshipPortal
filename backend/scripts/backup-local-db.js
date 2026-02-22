const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const LOCAL_URI = 'mongodb://127.0.0.1:27017/internshipportal';
const BACKUP_DIR = path.join(__dirname, '..', 'db_backup');

async function backup() {
    console.log('📦 Creating Local JSON Backup...');

    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR);
    }

    let conn;
    try {
        conn = await mongoose.createConnection(LOCAL_URI).asPromise();
        const collections = await conn.db.listCollections().toArray();

        for (const col of collections) {
            const name = col.name;
            console.log(`📡 Exporting ${name}...`);
            const data = await conn.db.collection(name).find({}).toArray();
            fs.writeFileSync(path.join(BACKUP_DIR, `${name}.json`), JSON.stringify(data, null, 2));
        }

        console.log(`✅ Backup complete! Files saved in: ${BACKUP_DIR}`);
    } catch (err) {
        console.error('❌ Backup failed:', err);
    } finally {
        if (conn) await conn.close();
        process.exit(0);
    }
}

backup();
