import { NextResponse } from 'next/server';

export async function POST(_request: Request) {
  return NextResponse.json(
    {
      success: false,
      error: 'Need to upgrade the plan to upload photos directly. Please use Image URL.',
      code: 'UPGRADE_REQUIRED',
    },
    { status: 403 }
  );
}
