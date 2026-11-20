const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const fs = require('fs');
const path = require('path');

const serviceAccount = require('../serviceAccountKey.json');

const app = getApps().length === 0 ? initializeApp({
  credential: cert(serviceAccount),
  databaseURL: 'https://maceee-default-rtdb.firebaseio.com'
}) : getApps()[0];

const db = getDatabase(app);

async function seed() {
  const dataDir = path.join(__dirname, '..', 'data');
  const files = ['team.json', 'faqs.json', 'clients.json', 'blogs.json', 'contacts.json'];

  for (const file of files) {
    const key = file.replace('.json', '');
    const filePath = path.join(dataDir, file);
    if (fs.existsSync(filePath)) {
      try {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        await db.ref(key).set(content);
        console.log(`✓ Seeded ${key} to Firebase successfully!`);
      } catch (e) {
        console.error(`Failed to seed ${key}:`, e.message);
      }
    }
  }

  console.log('All data seeded to Firebase Realtime Database successfully!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
