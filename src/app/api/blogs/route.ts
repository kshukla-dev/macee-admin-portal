import { NextResponse } from 'next/server';
import { getStoredData, saveStoredData } from '@/lib/storage';
import { syncBlogsToWebsite } from '@/lib/syncEngine';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  coverImage?: string;
  tags: string[];
  status: 'published' | 'draft';
  readTime: string;
  publishedAt: string;
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const search = searchParams.get('search')?.toLowerCase() || '';

    let blogs = await getStoredData<BlogPost[]>('blogs', []);

    if (status && status !== 'all') {
      blogs = blogs.filter((b) => b.status === status);
    }

    if (category && category !== 'all') {
      blogs = blogs.filter((b) => b.category.toLowerCase() === category.toLowerCase());
    }

    if (search) {
        blogs = blogs.filter(
          (b) =>
            b.title.toLowerCase().includes(search) ||
            b.excerpt.toLowerCase().includes(search) ||
            b.author.toLowerCase().includes(search) ||
            b.tags.some((t) => t.toLowerCase().includes(search))
        );
      }

      blogs.sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );

      return NextResponse.json({ blogs });
    } catch (error) {
      return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
    }
  }

export async function POST(request: Request) {
    try {
      const body = await request.json();
      const blogs = await getStoredData<BlogPost[]>('blogs', []);

      const title = body.title || 'Untitled Post';
      const slug = body.slug ? generateSlug(body.slug) : generateSlug(title);

      const newBlog: BlogPost = {
        id: `blog-${Date.now()}`,
        slug,
        title,
        excerpt: body.excerpt || '',
        content: body.content || '',
        category: body.category || 'General',
        author: body.author || 'Macee Editorial',
        coverImage: body.coverImage || '/uploads/people-working-dsk.jpg',
        tags: Array.isArray(body.tags)
          ? body.tags
          : (body.tags || '')
            .split(',')
            .map((t: string) => t.trim())
            .filter(Boolean),
        status: body.status === 'published' ? 'published' : 'draft',
        readTime: body.readTime || '4 min read',
        publishedAt: body.publishedAt || new Date().toISOString(),
      };

      blogs.unshift(newBlog);
      await saveStoredData('blogs', blogs);

      // Auto-sync with local Macee website if in local dev
      try {
        syncBlogsToWebsite(blogs);
      } catch { }

      return NextResponse.json({ success: true, blog: newBlog }, { status: 201 });
    } catch (error) {
      return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 });
    }
  }

  export async function PUT(request: Request) {
    try {
      const body = await request.json();
      const { id } = body;
      if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

      const blogs = await getStoredData<BlogPost[]>('blogs', []);
      const index = blogs.findIndex((b) => b.id === id);

      if (index === -1) {
        return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
      }

      const updatedTags = Array.isArray(body.tags)
        ? body.tags
        : typeof body.tags === 'string'
          ? body.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
          : blogs[index].tags;

      blogs[index] = {
        ...blogs[index],
        ...body,
        tags: updatedTags,
        slug: body.slug ? generateSlug(body.slug) : blogs[index].slug,
      };

      await saveStoredData('blogs', blogs);

      // Auto-sync with local Macee website if in local dev
      try {
        syncBlogsToWebsite(blogs);
      } catch { }

      return NextResponse.json({ success: true, blog: blogs[index] });
    } catch (error) {
      return NextResponse.json({ error: 'Failed to update blog' }, { status: 500 });
    }
  }

  export async function DELETE(request: Request) {
    try {
      const { searchParams } = new URL(request.url);
      const id = searchParams.get('id');
      if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

      let blogs = await getStoredData<BlogPost[]>('blogs', []);
      blogs = blogs.filter((b) => b.id !== id);
      await saveStoredData('blogs', blogs);

      // Auto-sync with local Macee website if in local dev
      try {
        syncBlogsToWebsite(blogs);
      } catch { }

      return NextResponse.json({ success: true });
    } catch (error) {
      return NextResponse.json({ error: 'Failed to delete blog' }, { status: 500 });
    }
  }
