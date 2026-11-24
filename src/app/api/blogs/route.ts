import { NextResponse } from 'next/server';
import { getStoredData, saveStoredData } from '@/lib/storage';
import { syncBlogsToWebsite } from '@/lib/syncEngine';

export interface BlogContributor {
  personId?: string;
  name: string;
  role: 'Author' | 'Reviewer' | 'Editor' | 'Contributor';
  avatar?: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  coverImageAlt?: string;
  coverImageUrl?: string;
  author: string;
  authorId?: string;
  authorRole?: string;
  authorAvatar?: string;
  contributors?: BlogContributor[];
  category: string;
  categories: string[];
  relatedPosts?: string[];
  estimatedReadingTime?: number;
  readTime: string;
  tags: string[];
  status: 'published' | 'draft';
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
      blogs = blogs.filter(
        (b) =>
          (b.category && b.category.toLowerCase() === category.toLowerCase()) ||
          (b.categories && b.categories.some((c) => c.toLowerCase() === category.toLowerCase()))
      );
    }

    if (search) {
      blogs = blogs.filter(
        (b) =>
          b.title.toLowerCase().includes(search) ||
          b.excerpt.toLowerCase().includes(search) ||
          b.author.toLowerCase().includes(search) ||
          (b.contributors && b.contributors.some((c) => c.name.toLowerCase().includes(search))) ||
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

    const title = (body.title || 'Untitled Post').trim();
    const rawSlug = body.slug ? generateSlug(body.slug) : generateSlug(title);
    const slug = rawSlug.slice(0, 120);

    const categories: string[] = Array.isArray(body.categories) && body.categories.length > 0
      ? body.categories
      : body.category
        ? [body.category]
        : ['General'];

    const primaryCategory = categories[0] || 'General';

    const estimatedReadingTime = typeof body.estimatedReadingTime === 'number'
      ? Math.max(1, Math.round(body.estimatedReadingTime))
      : body.readTime
        ? parseInt(body.readTime, 10) || 4
        : 4;

    const newBlog: BlogPost = {
      id: `blog-${Date.now()}`,
      slug,
      title,
      excerpt: body.excerpt || '',
      content: body.content || '',
      coverImage: body.coverImage || '',
      coverImageAlt: body.coverImageAlt || '',
      coverImageUrl: body.coverImageUrl || '',
      author: body.author || 'Macee Editorial',
      authorId: body.authorId || '',
      authorRole: body.authorRole || '',
      authorAvatar: body.authorAvatar || '',
      contributors: Array.isArray(body.contributors) ? body.contributors : [],
      category: primaryCategory,
      categories,
      relatedPosts: Array.isArray(body.relatedPosts) ? body.relatedPosts.slice(0, 4) : [],
      estimatedReadingTime,
      readTime: `${estimatedReadingTime} min read`,
      tags: Array.isArray(body.tags)
        ? body.tags
        : (body.tags || '')
          .split(',')
          .map((t: string) => t.trim())
          .filter(Boolean),
      status: body.status === 'published' ? 'published' : 'draft',
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

    const categories: string[] = Array.isArray(body.categories) && body.categories.length > 0
      ? body.categories
      : body.category
        ? [body.category]
        : blogs[index].categories || (blogs[index].category ? [blogs[index].category] : ['General']);

    const primaryCategory = categories[0] || blogs[index].category || 'General';

    const estimatedReadingTime = typeof body.estimatedReadingTime === 'number'
      ? Math.max(1, Math.round(body.estimatedReadingTime))
      : body.readTime
        ? parseInt(body.readTime, 10) || blogs[index].estimatedReadingTime || 4
        : blogs[index].estimatedReadingTime || 4;

    const updatedTags = Array.isArray(body.tags)
      ? body.tags
      : typeof body.tags === 'string'
        ? body.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
        : blogs[index].tags;

    const rawSlug = body.slug ? generateSlug(body.slug) : blogs[index].slug;
    const slug = rawSlug.slice(0, 120);

    blogs[index] = {
      ...blogs[index],
      ...body,
      slug,
      tags: updatedTags,
      categories,
      category: primaryCategory,
      estimatedReadingTime,
      readTime: `${estimatedReadingTime} min read`,
      relatedPosts: Array.isArray(body.relatedPosts)
        ? body.relatedPosts.slice(0, 4)
        : blogs[index].relatedPosts || [],
      contributors: Array.isArray(body.contributors)
        ? body.contributors
        : blogs[index].contributors || [],
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
