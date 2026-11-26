'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { TeamMemberForm, TeamMember } from '@/components/forms/TeamMemberForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function EditTeamMemberPage() {
  const params = useParams();
  const id = params?.id as string;
  const [member, setMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch('/api/team')
      .then((res) => res.json())
      .then((data) => {
        const found = (data.team || []).find((m: TeamMember) => m.id === id);
        if (found) {
          setMember(found);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#E30613] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Loading team member...</p>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-8">
        <div className="text-center space-y-3 max-w-md bg-white p-8 rounded-2xl border border-slate-100 shadow-2xs">
          <h2 className="text-base font-bold text-slate-900">Member Not Found</h2>
          <p className="text-xs text-slate-500">The team specialist profile you are looking for does not exist or has been removed.</p>
          <Link
            href="/dashboard/team"
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#0E1726] text-white text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Team</span>
          </Link>
        </div>
      </div>
    );
  }

  return <TeamMemberForm initialData={member} isEdit={true} />;
}
