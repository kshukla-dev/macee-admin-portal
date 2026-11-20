import { NextResponse } from 'next/server';
import { getStoredData, saveStoredData } from '@/lib/storage';
import { syncClientsToWebsite } from '@/lib/syncEngine';

export const dynamic = 'force-dynamic';

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const current = await getStoredData<any>('clients', {
      certifications: [],
      industries: { title: '', subheading: '', description: '', tags: [] },
      expertise: { title: '', subheading: '', intro: '', prompt: '', items: [] },
      services: [],
    });

    // Accept either direct { certifications, industries, ... } or wrapped { clients: { ... } }
    const payload = body?.clients ? body.clients : body;

    const updated = {
      ...current,
      ...payload,
    };

    // Ensure all 4 categories under /clients are preserved
    if (payload.certifications !== undefined) updated.certifications = payload.certifications;
    if (payload.industries !== undefined) updated.industries = payload.industries;
    if (payload.expertise !== undefined) updated.expertise = payload.expertise;
    if (payload.services !== undefined) updated.services = payload.services;

    await saveStoredData('clients', updated);

    // Auto-sync with local Macee website if in local dev
    try {
      syncClientsToWebsite(updated);
    } catch { }

    return NextResponse.json({ success: true, clients: updated }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save clients data' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const current = await getStoredData<any>('clients', {
      certifications: [],
      industries: { title: '', subheading: '', description: '', tags: [] },
      expertise: { title: '', subheading: '', intro: '', prompt: '', items: [] },
      services: [],
    });

    const payload = body?.clients ? body.clients : body;

    const updated = {
      ...current,
      ...payload,
    };

    if (payload.certifications !== undefined) updated.certifications = payload.certifications;
    if (payload.industries !== undefined) updated.industries = payload.industries;
    if (payload.expertise !== undefined) updated.expertise = payload.expertise;
    if (payload.services !== undefined) updated.services = payload.services;

    await saveStoredData('clients', updated);

    // Auto-sync with local Macee website if in local dev
    try {
      syncClientsToWebsite(updated);
    } catch { }

    return NextResponse.json({ success: true, clients: updated }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update clients data' }, { status: 500 });
  }
}
