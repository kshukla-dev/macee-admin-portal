import { NextResponse } from 'next/server';
import { getStoredData, saveStoredData } from '@/lib/storage';
import { syncClientsToWebsite } from '@/lib/syncEngine';

export const dynamic = 'force-dynamic';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET() {
  try {
    const clients = await getStoredData<any>('clients', {});
    return NextResponse.json({ clients }, { headers: corsHeaders });
  } catch (err) {
    return NextResponse.json({ clients: {} }, { status: 500, headers: corsHeaders });
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

    try {
      syncClientsToWebsite(updated);
    } catch { }

    return NextResponse.json({ success: true, clients: updated }, { headers: corsHeaders, status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update clients' }, { status: 500, headers: corsHeaders });
  }
}

export async function PUT(request: Request) {
  return POST(request);
}
