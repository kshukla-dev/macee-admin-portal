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
    const clients = await getStoredData<any>('clients', {});
    return NextResponse.json({ clients }, { headers: corsHeaders });
  } catch (err) {
    return NextResponse.json({ clients: {} }, { status: 500, headers: corsHeaders });
  }
}
