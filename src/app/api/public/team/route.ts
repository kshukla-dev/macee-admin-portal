import { NextResponse } from 'next/server';
import { getStoredData } from '@/lib/storage';

export const dynamic = 'force-dynamic';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET() {
  try {
    const team = await getStoredData<any[]>('team', []);
    const activeMembers = team
      .filter((m) => m.active !== false)
      .sort((a, b) => (a.order || 99) - (b.order || 99));

    return NextResponse.json({ team: activeMembers }, { headers: corsHeaders });
  } catch (err) {
    return NextResponse.json({ team: [] }, { status: 500, headers: corsHeaders });
  }
}
