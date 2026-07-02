const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const BACKUP_DIR = path.join(__dirname, 'backups');

async function backupAll() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 30000 });
  console.log('Connected!');

  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  const dateStr = new Date().toISOString().split('T')[0];
  const dateDir = path.join(BACKUP_DIR, dateStr);

  if (!fs.existsSync(dateDir)) {
    fs.mkdirSync(dateDir, { recursive: true });
  }

  for (const col of collections) {
    const name = col.name;
    const docs = await db.collection(name).find({}).toArray();
    const filePath = path.join(dateDir, `backup_${name}.json`);
    fs.writeFileSync(filePath, JSON.stringify(docs, null, 2));
    console.log(`  ${name}: ${docs.length} records -> ${filePath}`);
  }

  // Cleanup: keep last 7 days
  const allDirs = fs.readdirSync(BACKUP_DIR).filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort();
  while (allDirs.length > 7) {
    const old = allDirs.shift();
    fs.rmSync(path.join(BACKUP_DIR, old), { recursive: true, force: true });
    console.log(`  Cleaned old backup: ${old}`);
  }

  mongoose.disconnect();
  console.log('\nBackup complete!');
}

backupAll().catch(e => {
  console.error('Backup failed:', e.message);
  process.exit(1);
});
