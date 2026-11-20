import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getDatabase, Database } from 'firebase-admin/database';
import fs from 'fs';
import path from 'path';

let dbInstance: Database | null = null;

export function getFirebaseAdmin() {
  if (getApps().length > 0) {
    return getApp();
  }

  // 1. Check environment variables (Vercel production)
  const projectId = process.env.FIREBASE_PROJECT_ID || 'maceee';
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk-fbsvc@maceee.iam.gserviceaccount.com';
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const databaseURL = process.env.FIREBASE_DATABASE_URL || 'https://maceee-default-rtdb.firebaseio.com';

  if (privateKey) {
    // Handle escaped newlines from environment variables
    privateKey = privateKey.replace(/\\n/g, '\n');
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      databaseURL,
    });
  }

  // 2. Check local serviceAccountKey.json (Local development)
  const serviceAccountPaths = [
    path.resolve(process.cwd(), 'serviceAccountKey.json'),
    path.resolve('d:/J&F/Maceee/macee-admin-portal/serviceAccountKey.json'),
  ];

  for (const sPath of serviceAccountPaths) {
    if (fs.existsSync(sPath)) {
      try {
        const raw = fs.readFileSync(sPath, 'utf-8');
        const serviceAccount = JSON.parse(raw);
        return initializeApp({
          credential: cert(serviceAccount),
          databaseURL,
        });
      } catch (err) {
        console.error('Error loading serviceAccountKey.json from', sPath, err);
      }
    }
  }

  // Fallback default init if credentials unavailable
  return initializeApp({
    projectId,
    databaseURL,
  });
}

export function getFirebaseDb(): Database | null {
  try {
    if (!dbInstance) {
      const app = getFirebaseAdmin();
      dbInstance = getDatabase(app);
    }
    return dbInstance;
  } catch (error) {
    console.warn('Firebase Database not initialized:', error);
    return null;
  }
}

/**
 * Read data from Firebase Realtime Database
 */
export async function readFirebaseData<T>(dbPath: string): Promise<T | null> {
  try {
    const db = getFirebaseDb();
    if (!db) return null;
    const snapshot = await db.ref(dbPath).once('value');
    if (snapshot.exists()) {
      return snapshot.val() as T;
    }
    return null;
  } catch (error) {
    console.warn(`Firebase read error at "${dbPath}":`, error);
    return null;
  }
}

/**
 * Write data to Firebase Realtime Database
 */
export async function writeFirebaseData<T>(dbPath: string, data: T): Promise<boolean> {
  try {
    const db = getFirebaseDb();
    if (!db) return false;
    await db.ref(dbPath).set(data);
    return true;
  } catch (error) {
    console.error(`Firebase write error at "${dbPath}":`, error);
    return false;
  }
}
