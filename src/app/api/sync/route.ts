import { NextResponse } from 'next/server';
import { executeFullSync, getWebsiteDir } from '@/lib/syncEngine';

export async function POST() {
  const result = executeFullSync();
  return NextResponse.json(result);
}

export async function GET() {
  return NextResponse.json({
    status: 'ready',
    websitePath: getWebsiteDir(),
  });
}
