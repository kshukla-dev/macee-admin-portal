import { NextResponse } from 'next/server';
import { getStoredData, saveStoredData } from '@/lib/storage';
import { syncTeamToWebsite } from '@/lib/syncEngine';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  desk?: string;
  active?: boolean;
  order?: number;
}

export async function GET() {
  try {
    const team = await getStoredData<TeamMember[]>('team', []);
    team.sort((a, b) => (a.order || 99) - (b.order || 99));
    return NextResponse.json({ team });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch team' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const team = await getStoredData<TeamMember[]>('team', []);

    const newMember: TeamMember = {
      id: `team-${Date.now()}`,
      name: body.name || 'Unnamed Specialist',
      role: body.role || 'Workforce Specialist',
      image: body.image || '/images/team-room.jpg',
      email: body.email || '',
      phone: body.phone || '',
      linkedin: body.linkedin || '',
      desk: body.desk || 'Macee Desk',
      active: body.active !== undefined ? body.active : true,
      order: body.order || team.length + 1,
    };

    team.push(newMember);
    await saveStoredData('team', team);

    // Auto-sync with local Macee website if in local dev
    try {
      syncTeamToWebsite(team);
    } catch { }

    return NextResponse.json({ success: true, member: newMember }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add team member' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    const team = await getStoredData<TeamMember[]>('team', []);
    const index = team.findIndex((m) => m.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    team[index] = {
      ...team[index],
      ...body,
    };

    await saveStoredData('team', team);

    // Auto-sync with local Macee website if in local dev
    try {
      syncTeamToWebsite(team);
    } catch { }

    return NextResponse.json({ success: true, member: team[index] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update member' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    let team = await getStoredData<TeamMember[]>('team', []);
    team = team.filter((m) => m.id !== id);
    await saveStoredData('team', team);

    // Auto-sync with local Macee website if in local dev
    try {
      syncTeamToWebsite(team);
    } catch { }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete member' }, { status: 500 });
  }
}
