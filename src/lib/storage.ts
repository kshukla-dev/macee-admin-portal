import fs from 'fs';
import path from 'path';
import { readFirebaseData, writeFirebaseData } from './firebaseAdmin';

export function getDataDir(): string {
  // Check exact admin portal folder first
  const fixedAdminPath = path.resolve('d:/J&F/Maceee/macee-admin-portal/data');
  if (fs.existsSync(fixedAdminPath)) {
    return fixedAdminPath;
  }

  // Fallback to process.cwd()/data
  const cwdPath = path.join(process.cwd(), 'data');
  if (!fs.existsSync(cwdPath)) {
    try {
      fs.mkdirSync(cwdPath, { recursive: true });
    } catch { }
  }
  return cwdPath;
}

/**
 * Synchronous local read (for fallback or initial build)
 */
export function readDataFile<T>(filename: string, defaultValue: T): T {
  try {
    const dir = getDataDir();
    const filePath = path.join(dir, filename);
    if (!fs.existsSync(filePath)) {
      return defaultValue;
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`Error reading local ${filename}:`, error);
    return defaultValue;
  }
}

/**
 * Synchronous local write (writes to local disk if writable)
 */
export function writeDataFile<T>(filename: string, data: T): boolean {
  try {
    const dir = getDataDir();
    const filePath = path.join(dir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    // On Vercel serverless, filesystem is read-only, so this is expected to fail gracefully
    console.warn(`Local file write not available for ${filename} (normal on Vercel):`, error);
    return false;
  }
}

/**
 * Cloud-First Read with Local Fallback:
 * 1. Read from Firebase Realtime Database
 * 2. If Firebase is empty/fails/offline, fallback to local JSON file
 */
export async function getStoredData<T>(key: string, defaultValue: T): Promise<T> {
  const cleanKey = key.replace('.json', '');
  try {
    const cloudData = await readFirebaseData<T>(cleanKey);
    if (cloudData !== null && cloudData !== undefined) {
      return cloudData;
    }
  } catch (err) {
    console.warn(`Could not read ${cleanKey} from Firebase, falling back to local file.`, err);
  }

  // Fallback to local file
  return readDataFile<T>(`${cleanKey}.json`, defaultValue);
}

/**
 * Cloud-First Write with Local Sync:
 * 1. Write to Firebase Realtime Database (persists on Vercel)
 * 2. Write to local JSON file if running in local environment
 */
export async function saveStoredData<T>(key: string, data: T): Promise<boolean> {
  const cleanKey = key.replace('.json', '');
  let cloudSuccess = false;

  try {
    cloudSuccess = await writeFirebaseData<T>(cleanKey, data);
  } catch (err) {
    console.error(`Firebase save failed for ${cleanKey}:`, err);
  }

  // Attempt local file write (works locally, gracefully fails on Vercel read-only FS)
  try {
    writeDataFile<T>(`${cleanKey}.json`, data);
  } catch { }

  return cloudSuccess;
}
