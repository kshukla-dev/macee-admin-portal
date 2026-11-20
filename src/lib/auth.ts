import { cookies } from 'next/headers';
import { readDataFile } from './storage';

export const ADMIN_COOKIE_NAME = 'macee_admin_session';

export interface AdminUser {
  email: string;
  name: string;
  role: string;
}

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (!token) return null;

    const admin = readDataFile<{ email: string; name: string; role: string }>('admin.json', {
      email: 'admin@macee.com',
      name: 'Macee Administrator',
      role: 'Super Admin',
    });

    // In production with JWT or simple token:
    if (token === 'macee_authenticated_session_token_xyz') {
      return {
        email: admin.email,
        name: admin.name,
        role: admin.role,
      };
    }
    return null;
  } catch (err) {
    return null;
  }
}
