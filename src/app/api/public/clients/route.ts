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
  const clients = readDataFile<any>('clients.json', {});
  return NextResponse.json({ clients }, { headers: corsHeaders });
}
