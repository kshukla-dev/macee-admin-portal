import { NextResponse } from 'next/server';
import { readDataFile, writeDataFile } from '@/lib/storage';
import { ContactSubmission } from '@/app/api/contacts/route';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.email || (!body.firstName && !body.fullName && !body.name)) {
      return NextResponse.json(
        { error: 'Email and Name are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const contacts = readDataFile<ContactSubmission[]>('contacts.json', []);

    const firstName = body.firstName || (body.name ? body.name.split(' ')[0] : 'Visitor');
    const lastName = body.lastName || (body.name ? body.name.split(' ').slice(1).join(' ') : '');
    const fullName = body.fullName || `${firstName} ${lastName}`.trim();

    const newContact: ContactSubmission = {
      id: `lead-${Date.now()}`,
      firstName,
      lastName,
      fullName,
      email: body.email,
      phone: body.phone || '',
      topic: body.topic || body.service || 'Website Get in Touch Form',
      company: body.company || body.organisation || '',
      message: body.message || body.notes || 'Inquiry submitted from website.',
      status: 'new',
      submittedAt: new Date().toISOString(),
      notes: `Source: Macee Website Form (${new Date().toLocaleString()})`,
    };

    contacts.unshift(newContact);
    writeDataFile('contacts.json', contacts);

    return NextResponse.json(
      {
        success: true,
        message: 'Inquiry successfully received by Macee CRM',
        leadId: newContact.id,
      },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    console.error('Error handling public contact POST:', error);
    return NextResponse.json(
      { error: 'Server error processing submission' },
      { status: 500, headers: corsHeaders }
    );
  }
}
