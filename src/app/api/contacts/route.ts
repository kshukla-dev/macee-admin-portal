import { NextResponse } from 'next/server';
import { readDataFile, writeDataFile } from '@/lib/storage';

export interface ContactSubmission {
  id: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  phone: string;
  topic?: string;
  company?: string;
  message: string;
  status: 'new' | 'in-progress' | 'contacted' | 'closed';
  submittedAt: string;
  notes?: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const search = searchParams.get('search')?.toLowerCase() || '';

  let contacts = readDataFile<ContactSubmission[]>('contacts.json', []);

  // Filter by status if provided
  if (status && status !== 'all') {
    contacts = contacts.filter((c) => c.status === status);
  }

  // Filter by search query
  if (search) {
    contacts = contacts.filter(
      (c) =>
        (c.fullName && c.fullName.toLowerCase().includes(search)) ||
        c.firstName.toLowerCase().includes(search) ||
        c.lastName.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search) ||
        (c.company && c.company.toLowerCase().includes(search)) ||
        (c.topic && c.topic.toLowerCase().includes(search)) ||
        c.message.toLowerCase().includes(search)
    );
  }

  // Sort newest first
  contacts.sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );

  return NextResponse.json({ contacts });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const contacts = readDataFile<ContactSubmission[]>('contacts.json', []);

    const newContact: ContactSubmission = {
      id: `lead-${Date.now()}`,
      firstName: body.firstName || '',
      lastName: body.lastName || '',
      fullName: `${body.firstName || ''} ${body.lastName || ''}`.trim(),
      email: body.email || '',
      phone: body.phone || '',
      topic: body.topic || 'General Inquiry',
      company: body.company || '',
      message: body.message || '',
      status: 'new',
      submittedAt: new Date().toISOString(),
      notes: body.notes || '',
    };

    contacts.unshift(newContact);
    writeDataFile('contacts.json', contacts);

    return NextResponse.json({ success: true, contact: newContact }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create submission' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status, notes } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    const contacts = readDataFile<ContactSubmission[]>('contacts.json', []);
    const index = contacts.findIndex((c) => c.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    if (status) contacts[index].status = status;
    if (notes !== undefined) contacts[index].notes = notes;

    writeDataFile('contacts.json', contacts);

    return NextResponse.json({ success: true, contact: contacts[index] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    let contacts = readDataFile<ContactSubmission[]>('contacts.json', []);
    contacts = contacts.filter((c) => c.id !== id);
    writeDataFile('contacts.json', contacts);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete contact' }, { status: 500 });
  }
}
