const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getDatabase } = require('firebase-admin/database');
const fs = require('fs');

const serviceAccount = JSON.parse(fs.readFileSync('serviceAccountKey.json', 'utf-8'));

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
    databaseURL: 'https://maceee-default-rtdb.firebaseio.com'
  });
}

async function testConnection() {
  console.log('Testing Firebase Admin SDK connection...');
  console.log('Project ID:', serviceAccount.project_id);

  // 1. Test Firestore
  try {
    const db = getFirestore();
    await db.collection('_health').doc('ping').set({
      timestamp: new Date().toISOString(),
      status: 'ok',
      client: 'macee-admin-portal'
    });
    console.log('✓ Firestore is ENABLED and connected successfully!');
  } catch (err) {
    console.log('✕ Firestore test:', err.message);
  }

  // 2. Test Realtime Database
  try {
    const rtdb = getDatabase();
    await rtdb.ref('_health').set({
      timestamp: new Date().toISOString(),
      status: 'ok'
    });
    console.log('✓ Realtime Database is ENABLED and connected successfully!');
  } catch (err) {
    console.log('✕ Realtime Database test:', err.message);
  }
}

testConnection()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  });
