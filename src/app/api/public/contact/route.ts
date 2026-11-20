import { NextResponse } from 'next/server';
import { getStoredData, saveStoredData } from '@/lib/storage';
import { ContactSubmission } from '@/app/api/contacts/route';

export const dynamic = 'force-dynamic';

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

    const contacts = await getStoredData<ContactSubmission[]>('contacts', []);

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
      company: body.company || body.companyName || body.organisation || '',
      message: body.message || body.remark || body.notes || 'Inquiry submitted from website.',
      status: 'new',
      submittedAt: new Date().toISOString(),
      notes: `Source: Macee Website Form (${new Date().toLocaleString()})`,
    };

    contacts.unshift(newContact);
    await saveStoredData('contacts', contacts);

    return NextResponse.json(
      {
        success: true,
        message: 'Your inquiry has been successfully delivered to our team desk.',
        id: newContact.id,
      },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process inquiry' },
      { status: 500, headers: corsHeaders }
    );
  }
}
