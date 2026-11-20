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
    const data = await getStoredData<any>('faqs', { categories: [], items: [] });
    const activeItems = (data.items || []).filter((f: any) => f.active !== false);

    return NextResponse.json(
      {
        pages: data.pages || [],
        categories: data.categories || [],
        items: activeItems,
      },
      { headers: corsHeaders }
    );
  } catch (err) {
    return NextResponse.json({ items: [] }, { status: 500, headers: corsHeaders });
  }
}
