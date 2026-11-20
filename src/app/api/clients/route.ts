import { NextResponse } from 'next/server';
import { getStoredData, saveStoredData } from '@/lib/storage';
import { syncClientsToWebsite } from '@/lib/syncEngine';

export async function GET() {
  try {
    const data = await getStoredData('clients', {
      certifications: [],
      industries: { title: '', subheading: '', description: '', tags: [] },
      expertise: { title: '', subheading: '', intro: '', prompt: '', items: [] },
      services: [],
    });

    return NextResponse.json({ clients: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch clients data' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const current = await getStoredData<any>('clients', {});

    const updated = {
      ...current,
      ...body,
    };

    await saveStoredData('clients', updated);

    // Auto-sync with local Macee website if in local dev
    try {
      syncClientsToWebsite(updated);
    } catch { }

    return NextResponse.json({ success: true, clients: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update clients data' }, { status: 500 });
  }
}
