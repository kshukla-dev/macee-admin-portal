import { NextResponse } from 'next/server';
import { readDataFile } from '@/lib/storage';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET() {
  const team = readDataFile<any[]>('team.json', []);
  const activeMembers = team
    .filter((m) => m.active !== false)
    .sort((a, b) => (a.order || 99) - (b.order || 99));

  return NextResponse.json({ team: activeMembers }, { headers: corsHeaders });
}
