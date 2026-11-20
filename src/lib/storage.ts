import fs from 'fs';
import path from 'path';

export function getDataDir(): string {
  // Check exact admin portal folder first
  const fixedAdminPath = path.resolve('d:/J&F/Maceee/macee-admin-portal/data');
  if (fs.existsSync(fixedAdminPath)) {
    return fixedAdminPath;
  }

  // Fallback to process.cwd()/data
  const cwdPath = path.join(process.cwd(), 'data');
  if (!fs.existsSync(cwdPath)) {
    fs.mkdirSync(cwdPath, { recursive: true });
  }
  return cwdPath;
}

export function readDataFile<T>(filename: string, defaultValue: T): T {
  try {
    const dir = getDataDir();
    const filePath = path.join(dir, filename);
    if (!fs.existsSync(filePath)) {
      writeDataFile(filename, defaultValue);
      return defaultValue;
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return defaultValue;
  }
}

export function writeDataFile<T>(filename: string, data: T): boolean {
  try {
    const dir = getDataDir();
    const filePath = path.join(dir, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    return false;
  }
}
