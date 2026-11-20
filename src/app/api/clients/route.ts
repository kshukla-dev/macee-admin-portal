import { NextResponse } from 'next/server';
import { readDataFile, writeDataFile } from '@/lib/storage';
import { syncClientsToWebsite } from '@/lib/syncEngine';

export async function GET() {
  const data = readDataFile('clients.json', {
    certifications: [],
    industries: { title: '', subheading: '', description: '', tags: [] },
    expertise: { title: '', subheading: '', intro: '', prompt: '', items: [] },
    services: [],
  });

  return NextResponse.json({ clients: data });
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const current = readDataFile<any>('clients.json', {});

    const updated = {
      ...current,
      ...body,
    };

    writeDataFile('clients.json', updated);

    // Auto-sync with Macee website
    syncClientsToWebsite(updated);

    return NextResponse.json({ success: true, clients: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update clients data' }, { status: 500 });
  }
}
