import { NextResponse } from 'next/server';
import { readDataFile } from '@/lib/storage';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  const blogs = readDataFile<any[]>('blogs.json', []);
  const published = blogs.filter((b) => b.status === 'published');

  if (slug) {
    const post = published.find((b) => b.slug === slug);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404, headers: corsHeaders });
    }
    return NextResponse.json({ blog: post }, { headers: corsHeaders });
  }

  return NextResponse.json({ blogs: published }, { headers: corsHeaders });
}
