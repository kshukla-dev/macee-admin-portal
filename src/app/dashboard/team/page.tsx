'use client';

import React, { useEffect, useState } from 'react';
import { Topbar } from '@/components/Topbar';
import { Modal } from '@/components/Modal';
import { ImagePicker } from '@/components/ImagePicker';
import {
  Users2,
  Plus,
  Mail,
  Phone,
  Edit2,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Search,
  Filter,
  UserCheck,
  Building,
  ShieldCheck,
  Download,
} from 'lucide-react';

interface TeamMember {
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

const DEFAULT_AVATARS = [
  'https://www.macee.com/media/cache/square_crop_center/rc/sMzvFzco/uploads/Bredere%20foto.png',
  'https://www.macee.com/media/cache/square_crop_center/rc/IAJ6bXf8/uploads/maarten-koekebakker.jpeg%20%281%29.jpg',
  'https://www.macee.com/media/cache/square_crop_center/rc/k8LJpK7C/uploads/adam-nichols.jpeg.jpg',
  'https://www.macee.com/media/cache/square_crop_center/rc/WALuDQhd/uploads/michael-siep.png',
  'https://www.macee.com/media/cache/square_crop_center/rc/2JLI5vyn/uploads/amin-david.jpeg.jpg',
  'https://www.macee.com/media/cache/square_crop_center/rc/sjXS1wcB/uploads/Nicky%20.jpg',
];

export default function TeamManagementPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [syncedAlert, setSyncedAlert] = useState(false);
  const [activeTab, setActiveTab] = useState('All Members');
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [image, setImage] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [desk, setDesk] = useState('');
  const [order, setOrder] = useState<number>(1);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/team');
      const data = await res.json();
      setTeam(data.team || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingMember(null);
    setName('');
    setRole('');
    setImage(DEFAULT_AVATARS[0]);
    setEmail('');
    setPhone('');
    setLinkedin('');
    setDesk('Management');
    setOrder(team.length + 1);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (member: TeamMember) => {
    setEditingMember(member);
    setName(member.name);
    setRole(member.role);
    setImage(member.image || DEFAULT_AVATARS[0]);
    setEmail(member.email || '');
    setPhone(member.phone || '');
    setLinkedin(member.linkedin || '');
    setDesk(member.desk || 'Staff');
    setOrder(member.order || 1);
    setIsModalOpen(true);
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        id: editingMember ? editingMember.id : undefined,
        name,
        role,
        image,
        email,
        phone,
        linkedin,
        desk,
        order: Number(order),
        active: true,
      };

      const method = editingMember ? 'PUT' : 'POST';
      const res = await fetch('/api/team', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchTeam();
        setSyncedAlert(true);
        setTimeout(() => setSyncedAlert(false), 3000);
      }
    } catch (e) {
      alert('Failed to save team member');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;
    try {
      const res = await fetch(`/api/team?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setTeam(team.filter((m) => m.id !== id));
      }
    } catch (e) {
      alert('Failed to delete member');
    }
  };

  // Filtered members
  const filteredTeam = team.filter((m) => {
    const matchesSearch =
      !searchQuery.trim() ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.desk && m.desk.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (activeTab === 'All Members') return true;
    if (activeTab === 'Management') return m.desk === 'Management' || m.role.toLowerCase().includes('director') || m.role.toLowerCase().includes('founder');
    if (activeTab === 'Consultants') return m.desk === 'Consultants' || m.role.toLowerCase().includes('consultant');
    if (activeTab === 'Recruitment') return m.desk === 'Recruitment' || m.role.toLowerCase().includes('specialist');
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Topbar
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Team Profiles' },
        ]}
        searchPlaceholder="Search team members..."
        onSearch={(q) => setSearchQuery(q)}
      />

      <div className="p-6 sm:p-8 lg:p-10 max-w-[1440px] mx-auto space-y-6">
        {/* Page Header (Editorial Serif) */}
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-serif text-[#111827] tracking-tight">
            Team Profiles
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage consultants, recruitment specialists, and public leadership profiles.
          </p>
        </div>

        {/* 4 KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-[#EAF0FC] text-[#36427D] flex items-center justify-center shrink-0">
              <Users2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total Specialists</p>
              <div className="flex items-baseline space-x-2 mt-0.5">
                <span className="text-2xl sm:text-3xl font-bold text-[#111827] font-sans">
                  {team.length > 0 ? team.length : 32}
                </span>
                <span className="text-xs font-semibold text-emerald-600">Active</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-[#EAF0FC] text-[#36427D] flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Public on Website</p>
              <div className="mt-0.5">
                <span className="text-2xl sm:text-3xl font-bold text-[#111827] font-sans">
                  {team.length > 0 ? team.length : 30}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-[#EAF0FC] text-[#36427D] flex items-center justify-center shrink-0">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Departments</p>
              <div className="mt-0.5">
                <span className="text-2xl sm:text-3xl font-bold text-[#111827] font-sans">
                  6 Desks
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-[#EAF0FC] text-[#36427D] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Compliance</p>
              <div className="mt-0.5">
                <span className="text-2xl sm:text-3xl font-bold text-[#111827] font-sans">
                  100%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center space-x-6 border-b border-slate-200 text-xs font-medium pt-2">
          {['All Members', 'Management', 'Consultants', 'Recruitment'].map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 transition-colors relative ${isActive
                    ? 'font-bold text-[#111827] border-b-2 border-[#E30613]'
                    : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search team by name, title or desk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200/90 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#E30613] shadow-2xs"
            />
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-[#E30613] hover:bg-[#b80510] text-white text-xs font-semibold shadow-xs transition-all shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Member</span>
          </button>
        </div>

        {syncedAlert && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between animate-fadeIn">
            <span>✓ Team profile updated and synced with website!</span>
          </div>
        )}

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTeam.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-2xs p-5 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start space-x-3.5">
                  <img
                    src={member.image || DEFAULT_AVATARS[0]}
                    alt={member.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-slate-100 shrink-0"
                  />
                  <div className="overflow-hidden">
                    <h4 className="text-sm font-bold text-[#111827] truncate font-sans">
                      {member.name}
                    </h4>
                    <p className="text-xs text-[#E30613] font-medium truncate mt-0.5">
                      {member.role}
                    </p>
                    <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#F0F3FA] text-[#36427D]">
                      {member.desk || 'Specialist'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                  {member.email && (
                    <div className="flex items-center space-x-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </div>
                  )}
                  {member.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{member.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleOpenEdit(member)}
                  className="text-xs font-semibold text-slate-600 hover:text-[#111827] flex items-center space-x-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
                <button
                  onClick={() => handleDeleteMember(member.id)}
                  className="text-xs font-semibold text-rose-500 hover:text-rose-700 flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsModalOpen(false)}
          title={editingMember ? 'Edit Team Member' : 'Add New Team Member'}
          subtitle="Updates will reflect automatically on the Macee About Us page."
          maxWidth="lg"
        >
          <form onSubmit={handleSaveMember} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Maarten Koekebakker"
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#E30613]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Managing Partner"
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#E30613]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Department / Desk</label>
                <select
                  value={desk}
                  onChange={(e) => setDesk(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#E30613]"
                >
                  <option>Management</option>
                  <option>Consultants</option>
                  <option>Recruitment</option>
                  <option>Operations</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="m.koekebakker@macee.com"
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#E30613]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+31 6 12345678"
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#E30613]"
                />
              </div>
            </div>

            <ImagePicker
              value={image}
              onChange={(newUrl) => setImage(newUrl)}
              label="Profile Photo"
              helperText="Upload a portrait photo or enter an image URL."
              previewShape="circle"
            />

            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button type="submit" disabled={saving} className="is-btn py-2 px-5 text-xs font-semibold">
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
