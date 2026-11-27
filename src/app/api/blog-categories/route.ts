import { NextResponse } from 'next/server';
import { getStoredData, saveStoredData } from '@/lib/storage';
import type { BlogPost } from '@/components/forms/BlogStepForm';

const DEFAULT_CATEGORIES = [
  'Compliance & Legal',
  'Immigration & Visas',
  'Workforce Strategy',
  'Market Insights',
  'Recruitment Best Practices',
];

async function getInitialCategories(): Promise<string[]> {
  const stored = await getStoredData<string[] | null>('blogCategories', null);
  if (Array.isArray(stored)) {
    return stored;
  }

  // First-time seed from defaults + any categories on existing blogs
  const blogs = await getStoredData<BlogPost[]>('blogs', []);
  const seeded = [...DEFAULT_CATEGORIES];
  for (const blog of blogs) {
    const cats = Array.isArray(blog.categories) && blog.categories.length > 0
      ? blog.categories
      : blog.category
      ? [blog.category]
      : [];
    for (const c of cats) {
      const trimmed = c?.trim();
      if (trimmed && !seeded.some((item) => item.toLowerCase() === trimmed.toLowerCase())) {
        seeded.push(trimmed);
      }
    }
  }
  await saveStoredData('blogCategories', seeded);
  return seeded;
}

export async function GET() {
  try {
    const categories = await getInitialCategories();
    return NextResponse.json({ categories });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const categories = await getInitialCategories();
    const exists = categories.some((c) => c.toLowerCase() === name.toLowerCase());
    if (!exists) {
      categories.push(name);
      await saveStoredData('blogCategories', categories);
    }

    return NextResponse.json({ success: true, categories });
  } catch {
    return NextResponse.json({ error: 'Failed to add category' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const oldName = typeof body.oldName === 'string' ? body.oldName.trim() : '';
    const newName = typeof body.newName === 'string' ? body.newName.trim() : '';
    if (!oldName || !newName) {
      return NextResponse.json({ error: 'Both oldName and newName are required' }, { status: 400 });
    }

    const isDefault = DEFAULT_CATEGORIES.some(
      (c) => c.toLowerCase() === oldName.toLowerCase()
    );
    if (isDefault) {
      return NextResponse.json({ error: 'Default categories cannot be edited' }, { status: 400 });
    }

    const categories = await getInitialCategories();
    const hasNewAlready = categories.some(
      (c) => c.toLowerCase() === newName.toLowerCase() && c.toLowerCase() !== oldName.toLowerCase()
    );

    const updated = categories
      .map((c) => (c.toLowerCase() === oldName.toLowerCase() ? (hasNewAlready ? null : newName) : c))
      .filter((c): c is string => Boolean(c));

    await saveStoredData('blogCategories', updated);

    // Update any blogs currently using the renamed category
    const blogs = await getStoredData<BlogPost[]>('blogs', []);
    let blogsChanged = false;
    const updatedBlogs = blogs.map((blog) => {
      let changed = false;
      let nextCategory = blog.category;
      if (blog.category?.trim().toLowerCase() === oldName.toLowerCase()) {
        nextCategory = newName;
        changed = true;
      }
      let nextCategories = blog.categories;
      if (Array.isArray(blog.categories)) {
        const mapped = blog.categories.map((c) => {
          if (c.trim().toLowerCase() === oldName.toLowerCase()) {
            changed = true;
            return newName;
          }
          return c;
        });
        nextCategories = Array.from(new Set(mapped));
      }
      if (changed) {
        blogsChanged = true;
        return { ...blog, category: nextCategory, categories: nextCategories };
      }
      return blog;
    });

    if (blogsChanged) {
      await saveStoredData('blogs', updatedBlogs);
    }

    return NextResponse.json({ success: true, categories: updated });
  } catch {
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name')?.trim() || '';
    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const isDefault = DEFAULT_CATEGORIES.some(
      (c) => c.toLowerCase() === name.toLowerCase()
    );
    if (isDefault) {
      return NextResponse.json({ error: 'Default categories cannot be removed' }, { status: 400 });
    }

    const categories = await getInitialCategories();
    const updated = categories.filter((c) => c.toLowerCase() !== name.toLowerCase());
    await saveStoredData('blogCategories', updated);

    return NextResponse.json({ success: true, categories: updated });
  } catch {
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
