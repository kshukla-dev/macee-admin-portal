import { NextResponse } from 'next/server';
import { readDataFile, writeDataFile } from '@/lib/storage';
import { ADMIN_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const admin = readDataFile<{ email: string; password: string; name: string; role: string }>(
      'admin.json',
      {
        email: 'admin@macee.com',
        password: 'admin123',
        name: 'Macee Administrator',
        role: 'Super Admin',
      }
    );

    if (email === admin.email && password === admin.password) {
      // Update last login
      writeDataFile('admin.json', {
        ...admin,
        lastLogin: new Date().toISOString(),
      });

      const response = NextResponse.json({
        success: true,
        user: { email: admin.email, name: admin.name, role: admin.role },
      });

      // Set auth cookie
      response.cookies.set({
        name: ADMIN_COOKIE_NAME,
        value: 'macee_authenticated_session_token_xyz',
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: 'lax',
      });

      return response;
    }

    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
