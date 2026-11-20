/**
 * Firebase Realtime Database Stateless REST Client
 * Optimized specifically for Serverless Environments (Vercel Lambda)
 * - Zero persistent WebSocket leaks
 * - Fast stateless HTTPS requests (<300ms)
 * - Built-in abort timeout with fallback guarantee
 */

const FIREBASE_BASE_URL = (
  process.env.FIREBASE_DATABASE_URL ||
  process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
  'https://maceee-default-rtdb.firebaseio.com'
).replace(/\/$/, '');

/**
 * Read data from Firebase Realtime Database via fast HTTPS REST
 */
export async function readFirebaseData<T>(dbPath: string): Promise<T | null> {
  const cleanPath = dbPath.replace(/^\//, '').replace(/\.json$/, '');
  const url = `${FIREBASE_BASE_URL}/${cleanPath}.json`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500); // 3.5s timeout

    const res = await fetch(url, {
      signal: controller.signal,
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      },
    });
    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`Firebase REST read failed with status ${res.status} for ${cleanPath}`);
      return null;
    }

    const data = await res.json();
    return data as T;
  } catch (error) {
    console.warn(`Firebase REST read error for "${cleanPath}":`, error);
    return null;
  }
}

/**
 * Write data to Firebase Realtime Database via fast HTTPS REST
 */
export async function writeFirebaseData<T>(dbPath: string, data: T): Promise<boolean> {
  const cleanPath = dbPath.replace(/^\//, '').replace(/\.json$/, '');
  const url = `${FIREBASE_BASE_URL}/${cleanPath}.json`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500); // 4.5s timeout

    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      console.error(`Firebase REST write failed with status ${res.status} for ${cleanPath}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Firebase REST write error for "${cleanPath}":`, error);
    return false;
  }
}
