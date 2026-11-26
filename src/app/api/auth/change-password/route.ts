import { NextResponse } from 'next/server';
import { readDataFile, writeDataFile, getStoredData, saveStoredData } from '@/lib/storage';

export async function POST(request: Request) {
  try {
    const { currentPassword, newPassword, confirmPassword } = await request.json();

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: 'All fields are required.' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'New password and confirmation do not match.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    // Get current admin record
    const admin = await getStoredData<any>('admin', {
      email: 'admin@macee.com',
      password: 'admin123',
      name: 'Macee Administrator',
      role: 'Super Admin',
    });

    // Verify current password
    if (admin.password !== currentPassword) {
      return NextResponse.json(
        { error: 'Current password is incorrect.' },
        { status: 400 }
      );
    }

    // Update password
    const updatedAdmin = {
      ...admin,
      password: newPassword,
      lastPasswordChange: new Date().toISOString(),
    };

    await saveStoredData('admin', updatedAdmin);
    writeDataFile('admin.json', updatedAdmin);

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update password.' },
      { status: 500 }
    );
  }
}
