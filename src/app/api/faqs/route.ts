import { NextResponse } from 'next/server';
import { getStoredData, saveStoredData } from '@/lib/storage';
import { syncFaqsToWebsite } from '@/lib/syncEngine';

export interface FaqItem {
  id: string;
  page: 'home' | 'about' | 'clients' | 'professionals' | 'projects' | 'contact' | string;
  pageName: string;
  categoryId: number;
  categoryName: string;
  question: string;
  answer: string;
  question_nl?: string;
  answer_nl?: string;
  tag?: string;
  order?: number;
  active?: boolean;
}

export interface FaqPageDef {
  id: string;
  name: string;
  categoryId: number;
  categoryName: string;
  route: string;
  description: string;
}

export interface FaqCategory {
  id: number;
  key?: string;
  title: string;
  page?: string;
  image?: string;
  desc?: string;
}

export interface FaqData {
  pages: FaqPageDef[];
  categories: FaqCategory[];
  items: FaqItem[];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search')?.toLowerCase() || '';

    const data = await getStoredData<FaqData>('faqs', { pages: [], categories: [], items: [] });
    let items = data.items || [];

    if (page && page !== 'all') {
      items = items.filter((f) => f.page === page || (f as any).categoryKey === page);
    }

    if (categoryId && categoryId !== 'all') {
      items = items.filter((f) => String(f.categoryId) === categoryId);
    }

    if (search) {
      items = items.filter(
        (f) =>
          f.question.toLowerCase().includes(search) ||
          f.answer.toLowerCase().includes(search) ||
          (f.question_nl && f.question_nl.toLowerCase().includes(search)) ||
          (f.answer_nl && f.answer_nl.toLowerCase().includes(search)) ||
          (f.tag && f.tag.toLowerCase().includes(search)) ||
          (f.pageName && f.pageName.toLowerCase().includes(search)) ||
          (f.categoryName && f.categoryName.toLowerCase().includes(search))
      );
    }

    items.sort((a, b) => (a.order || 99) - (b.order || 99));

    return NextResponse.json({
      pages: data.pages || [],
      categories: data.categories || [],
      items,
      total: (data.items || []).length,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch FAQs' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await getStoredData<FaqData>('faqs', { pages: [], categories: [], items: [] });

    const pageKey = body.page || 'home';
    const pageMeta = (data.pages || []).find((p) => p.id === pageKey) || {
      id: pageKey,
      name: pageKey.charAt(0).toUpperCase() + pageKey.slice(1) + ' Page',
      categoryId: 1,
      categoryName: 'General',
      route: `/${pageKey}`,
      description: 'Page FAQs',
    };

    const newItem: FaqItem = {
      id: `faq-${pageKey}-${Date.now()}`,
      page: pageKey,
      pageName: pageMeta.name,
      categoryId: pageMeta.categoryId || Number(body.categoryId) || 1,
      categoryName: pageMeta.categoryName || body.categoryName || 'General',
      question: body.question || 'New Question?',
      answer: body.answer || 'Answer here...',
      question_nl: body.question_nl || body.question || '',
      answer_nl: body.answer_nl || body.answer || '',
      tag: body.tag || 'General',
      order: body.order !== undefined ? Number(body.order) : (data.items?.length || 0) + 1,
      active: body.active !== undefined ? body.active : true,
    };

    if (!data.items) data.items = [];
    data.items.push(newItem);
    await saveStoredData('faqs', data);

    // Auto-sync with local Macee website if in local dev
    try {
      syncFaqsToWebsite(data);
    } catch { }

    return NextResponse.json({ success: true, item: newItem }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add FAQ' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    const data = await getStoredData<FaqData>('faqs', { pages: [], categories: [], items: [] });
    const index = (data.items || []).findIndex((f) => f.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'FAQ item not found' }, { status: 404 });
    }

    let updatedItem = {
      ...data.items[index],
      ...body,
    };

    // If page was modified, update pageName and category
    if (body.page && body.page !== data.items[index].page) {
      const pageMeta = (data.pages || []).find((p) => p.id === body.page);
      if (pageMeta) {
        updatedItem.page = pageMeta.id;
        updatedItem.pageName = pageMeta.name;
        updatedItem.categoryId = pageMeta.categoryId;
        updatedItem.categoryName = pageMeta.categoryName;
      }
    }

    data.items[index] = updatedItem;
    await saveStoredData('faqs', data);

    // Auto-sync with local Macee website if in local dev
    try {
      syncFaqsToWebsite(data);
    } catch { }

    return NextResponse.json({ success: true, item: data.items[index] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update FAQ' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    const data = await getStoredData<FaqData>('faqs', { pages: [], categories: [], items: [] });
    data.items = (data.items || []).filter((f) => f.id !== id);
    await saveStoredData('faqs', data);

    // Auto-sync with local Macee website if in local dev
    try {
      syncFaqsToWebsite(data);
    } catch { }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete FAQ' }, { status: 500 });
  }
}
