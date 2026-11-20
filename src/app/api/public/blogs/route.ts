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
        const blogs = await getStoredData<any[]>('blogs', []);
        const published = blogs.filter((b) => b.status === 'published');
        return NextResponse.json({ blogs: published }, { headers: corsHeaders });
      } catch (err) {
        return NextResponse.json({ blogs: [] }, { status: 500, headers: corsHeaders });
      }
    }
