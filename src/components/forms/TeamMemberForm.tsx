'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Topbar } from '@/components/Topbar';
import { ImagePicker } from '@/components/ImagePicker';
import { CustomSelect } from '@/components/CustomSelect';
import {
  Users2,
  ArrowLeft,
  Check,
  User,
  Mail,
  Phone,
  Linkedin,
  Briefcase,
  AlertCircle,
  Save,
  Loader2,
} from 'lucide-react';

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

interface TeamMemberFormProps {
  initialData?: TeamMember | null;
  isEdit?: boolean;
}

const DESK_OPTIONS = [
  'Management',
  'Consultants',
  'Recruitment',
  'Operations',
];

export function TeamMemberForm({ initialData, isEdit = false }: TeamMemberFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState(initialData?.name || '');
  const [role, setRole] = useState(initialData?.role || '');
  const [desk, setDesk] = useState(initialData?.desk || 'Management');
  const [email, setEmail] = useState(initialData?.email || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [linkedin, setLinkedin] = useState(initialData?.linkedin || '');
  const [image, setImage] = useState(initialData?.image || '');
  const [order, setOrder] = useState<number>(initialData?.order || 1);
  const [active, setActive] = useState<boolean>(
    initialData?.active !== undefined ? initialData.active : true
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please provide the specialist\'s full name.');
      return;
    }
    if (!role.trim()) {
      setError('Please provide the specialist\'s job title.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        id: initialData?.id || undefined,
        name: name.trim(),
        role: role.trim(),
        desk: desk.trim() || 'Management',
        email: email.trim(),
        phone: phone.trim(),
        linkedin: linkedin.trim(),
        image: image.trim(),
        order: Number(order) || 1,
        active,
      };

      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch('/api/team', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        router.push('/dashboard/team');
        router.refresh();
      } else {
        setError(data.error || 'Failed to save team member.');
      }
    } catch (err) {
      setError('An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Topbar
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Team Profiles', href: '/dashboard/team' },
          { label: isEdit ? 'Edit Member' : 'Add Member' },
        ]}
      />

      <div className="p-6 sm:p-8 lg:p-10 max-w-[1440px] mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard/team"
              className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[#111827] hover:border-slate-300 shadow-2xs transition-all"
              title="Back to Team"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif text-[#111827] tracking-tight">
                {isEdit ? 'Edit Team Member' : 'Add New Team Member'}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Profiles and credentials published on the Macee public About Us team showcase.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <Link
              href="/dashboard/team"
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all"
            >
              <span>Cancel</span>
            </Link>

            <button
              type="button"
              disabled={saving}
              onClick={handleSubmit}
              className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-[#E30613] hover:bg-[#b80510] text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>{saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Save Member'}</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Main Form Form Body */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Main Info */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-2xs p-5 sm:p-6 space-y-5">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                Specialist Information
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maarten Koekebakker"
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#E30613] shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Founder / Owner"
                    className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#E30613] shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Department / Desk
                  </label>
                  <CustomSelect
                    value={desk}
                    onChange={(val) => setDesk(val)}
                    options={DESK_OPTIONS}
                    placeholder="Select Department..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="info@macee.com"
                    className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#E30613] shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+31 (0)26 744 0024"
                    className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#E30613] shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  LinkedIn Profile URL or Handle
                </label>
                <input
                  type="text"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/username or username"
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#E30613] shadow-2xs"
                />
              </div>
            </div>

            {/* Right 1 Col: Photo & Status Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs p-5 sm:p-6 space-y-5 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
                  Profile Photo & Status
                </h3>

                {/* Avatar Preview */}
                <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-100 mb-4">
                  {image ? (
                    <img
                      src={image}
                      alt={name || 'Preview'}
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/uploads/favicon-96x96.png';
                      }}
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-[#EAF0FC] text-[#36427D] border-4 border-white shadow-md flex items-center justify-center font-bold text-2xl">
                      {name ? name.charAt(0).toUpperCase() : <User className="w-10 h-10 text-slate-400" />}
                    </div>
                  )}
                  <p className="text-xs font-bold text-slate-900 mt-2">{name || 'Specialist Name'}</p>
                  <p className="text-[11px] text-[#E30613] font-medium">{role || 'Job Title'}</p>
                </div>

                <div>
                  <ImagePicker
                    value={image}
                    onChange={(val) => setImage(val)}
                    hideLabel={true}
                    hidePreviewThumbnail={true}
                    helperText=""
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="pt-4 border-t border-slate-100">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="rounded border-slate-300 accent-[#E30613] text-[#E30613] focus:ring-[#E30613] w-4.5 h-4.5 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-slate-800">
                    Active & Published on Website
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="flex items-center justify-between pt-2">
            <Link
              href="/dashboard/team"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              ← Back to Team Profiles
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-[#E30613] hover:bg-[#b80510] text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>{saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Save Member'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
