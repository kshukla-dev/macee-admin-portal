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
  const data = readDataFile<any>('faqs.json', { categories: [], items: [] });
  const activeItems = (data.items || []).filter((f: any) => f.active !== false);

  return NextResponse.json(
    {
      categories: data.categories,
      items: activeItems,
    },
    { headers: corsHeaders }
  );
}
