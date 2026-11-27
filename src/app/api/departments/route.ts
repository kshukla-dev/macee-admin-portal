import { NextResponse } from 'next/server';
import { getStoredData, saveStoredData } from '@/lib/storage';
import { syncTeamToWebsite } from '@/lib/syncEngine';
import type { TeamMember } from '../team/route';

const DEFAULT_DEPARTMENTS = [
  'Management',
  'Consultants',
  'Recruitment',
  'Operations',
];

async function getInitialDepartments(): Promise<string[]> {
  const stored = await getStoredData<string[] | null>('departments', null);
  if (Array.isArray(stored)) {
    return stored;
  }

  // First-time seed from defaults + existing team members
  const team = await getStoredData<TeamMember[]>('team', []);
  const seeded = [...DEFAULT_DEPARTMENTS];
  for (const member of team) {
    const d = member.desk?.trim();
    if (d && !seeded.some((item) => item.toLowerCase() === d.toLowerCase())) {
      seeded.push(d);
    }
  }
  await saveStoredData('departments', seeded);
  return seeded;
}

export async function GET() {
  try {
    const departments = await getInitialDepartments();
    return NextResponse.json({ departments });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name) {
      return NextResponse.json({ error: 'Department name is required' }, { status: 400 });
    }

    const departments = await getInitialDepartments();
    const exists = departments.some((d) => d.toLowerCase() === name.toLowerCase());
    if (!exists) {
      departments.push(name);
      await saveStoredData('departments', departments);
    }

    return NextResponse.json({ success: true, departments });
  } catch {
    return NextResponse.json({ error: 'Failed to add department' }, { status: 500 });
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

    const departments = await getInitialDepartments();
    const hasNewAlready = departments.some(
      (d) => d.toLowerCase() === newName.toLowerCase() && d.toLowerCase() !== oldName.toLowerCase()
    );

    const updated = departments
      .map((d) => (d.toLowerCase() === oldName.toLowerCase() ? (hasNewAlready ? null : newName) : d))
      .filter((d): d is string => Boolean(d));

    await saveStoredData('departments', updated);

    // Update any team members currently using the renamed department
    const team = await getStoredData<TeamMember[]>('team', []);
    let teamChanged = false;
    const updatedTeam = team.map((member) => {
      if (member.desk?.trim().toLowerCase() === oldName.toLowerCase()) {
        teamChanged = true;
        return { ...member, desk: newName };
      }
      return member;
    });

    if (teamChanged) {
      await saveStoredData('team', updatedTeam);
      try {
        syncTeamToWebsite(updatedTeam);
      } catch {}
    }

    return NextResponse.json({ success: true, departments: updated });
  } catch {
    return NextResponse.json({ error: 'Failed to update department' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name')?.trim() || '';
    if (!name) {
      return NextResponse.json({ error: 'Department name is required' }, { status: 400 });
    }

    const isDefault = DEFAULT_DEPARTMENTS.some(
      (d) => d.toLowerCase() === name.toLowerCase()
    );
    if (isDefault) {
      return NextResponse.json({ error: 'Default departments cannot be removed' }, { status: 400 });
    }

    const departments = await getInitialDepartments();
    const updated = departments.filter((d) => d.toLowerCase() !== name.toLowerCase());
    await saveStoredData('departments', updated);

    return NextResponse.json({ success: true, departments: updated });
  } catch {
    return NextResponse.json({ error: 'Failed to delete department' }, { status: 500 });
  }
}
