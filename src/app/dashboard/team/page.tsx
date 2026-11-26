'use client';

import React, { useEffect, useState } from 'react';
import { Topbar } from '@/components/Topbar';
import { Modal } from '@/components/Modal';
import { ImagePicker } from '@/components/ImagePicker';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { SkeletonMemberCard } from '@/components/Skeleton';
import { CustomSelect } from '@/components/CustomSelect';
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
  Download,
  Linkedin,
  User,
  ChevronLeft,
  ChevronRight,
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

export default function TeamManagementPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [syncedAlert, setSyncedAlert] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 6;

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
    setImage('');
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
    setImage(member.image || '');
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

  // Delete Confirmation Dialog state
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    itemName?: string;
    isLoading?: boolean;
    onConfirm: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => { },
  });

  const handleDeleteMember = (member: TeamMember) => {
    setDeleteDialog({
      isOpen: true,
      title: 'Delete Team Member',
      description: 'Are you sure you want to remove this team member from the directory? This action cannot be undone.',
      itemName: `${member.name} (${member.role})`,
      isLoading: false,
      onConfirm: async () => {
        setDeleteDialog((prev) => ({ ...prev, isLoading: true }));
        try {
          const res = await fetch(`/api/team?id=${member.id}`, { method: 'DELETE' });
          const data = await res.json();
          if (data.success) {
            setTeam((prev) => prev.filter((m) => m.id !== member.id));
            setDeleteDialog((prev) => ({ ...prev, isOpen: false, isLoading: false }));
          } else {
            alert('Failed to delete member');
            setDeleteDialog((prev) => ({ ...prev, isLoading: false }));
          }
        } catch (e) {
          alert('Failed to delete member');
          setDeleteDialog((prev) => ({ ...prev, isLoading: false }));
        }
      },
    });
  };

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Filtered members
  const filteredTeam = team.filter((m) => {
    return (
      !searchQuery.trim() ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.desk && m.desk.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredTeam.length / pageSize) || 1;
  const paginatedTeam = filteredTeam.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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
        {/* Page Header with 2 KPI Metric Cards on the Right */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-serif text-[#111827] tracking-tight">
              Team Profiles
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Manage consultants, recruitment specialists, and public leadership profiles.
            </p>
          </div>

          {/* Right side: 2 KPI Cards in same header line */}
          <div className="flex items-center space-x-3 sm:space-x-4 shrink-0">
            <div className="bg-white rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 border border-slate-100 shadow-2xs flex items-center space-x-3 sm:space-x-4 min-w-[170px] sm:min-w-[190px]">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#EAF0FC] text-[#36427D] flex items-center justify-center shrink-0">
                <Users2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] sm:text-xs font-medium text-slate-500">Total Specialists</p>
                <div className="flex items-baseline space-x-2 mt-0.5">
                  <span className="text-xl sm:text-2xl font-bold text-[#111827] font-sans">
                    {team.length > 0 ? team.length : 0}
                  </span>
                  <span className="text-[10px] sm:text-xs font-semibold text-emerald-600">Active</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 border border-slate-100 shadow-2xs flex items-center space-x-3 sm:space-x-4 min-w-[170px] sm:min-w-[190px]">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#EAF0FC] text-[#36427D] flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] sm:text-xs font-medium text-slate-500">Public on Website</p>
                <div className="mt-0.5">
                  <span className="text-xl sm:text-2xl font-bold text-[#111827] font-sans">
                    {team.length > 0 ? team.length : 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
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
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonMemberCard key={i} />
            ))}
          </div>
        ) : filteredTeam.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs p-12 text-center text-slate-400 text-xs">
            No team members found matching your criteria.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedTeam.map((member) => (
                <div
                  key={member.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-2xs p-5 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start space-x-3.5">
                      {member.image ? (
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-slate-100 shrink-0"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-[#EAF0FC] text-[#36427D] border-2 border-slate-100 flex items-center justify-center font-bold text-sm shrink-0">
                          {member.name ? member.name.charAt(0).toUpperCase() : <User className="w-5 h-5 text-slate-400" />}
                        </div>
                      )}
                      <div className="overflow-hidden">
                        <h4 className="text-sm font-bold text-[#111827] truncate font-sans">
                          {member.name}
                        </h4>
                        <p className="text-xs text-[#E30613] font-medium truncate mt-0.5">
                          {member.role}
                        </p>
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
                      {member.linkedin && (
                        <div className="flex items-center space-x-2 truncate">
                          <Linkedin className="w-3.5 h-3.5 text-[#0A66C2] shrink-0" />
                          <a
                            href={member.linkedin}
                            target="_blank"
                            rel="noreferrer"
                            className="truncate text-[#0A66C2] hover:underline"
                            title={member.linkedin}
                          >
                            {member.linkedin.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '').replace(/\/$/, '') || 'LinkedIn Profile'}
                          </a>
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
                      onClick={() => handleDeleteMember(member)}
                      className="text-xs font-semibold text-rose-500 hover:text-rose-700 flex items-center space-x-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls Footer matching screenshot */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div>
                Showing {filteredTeam.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–
                {Math.min(currentPage * pageSize, filteredTeam.length)} of {filteredTeam.length} specialists
              </div>

              <div className="flex items-center space-x-1">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-600"
                  title="Previous page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                      currentPage === page
                        ? 'bg-[#0E1726] text-white shadow-2xs'
                        : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-600"
                  title="Next page"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
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
                <CustomSelect
                  value={desk}
                  onChange={(val) => setDesk(val)}
                  options={['Management', 'Consultants', 'Recruitment', 'Operations']}
                  placeholder="Select Department / Desk"
                />
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

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">LinkedIn Profile URL</label>
              <div className="relative">
                <Linkedin className="w-3.5 h-3.5 text-[#0A66C2] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="url"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://www.linkedin.com/in/username"
                  className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#E30613]"
                />
              </div>
            </div>

            <ImagePicker
              value={image}
              onChange={(newUrl) => setImage(newUrl)}
              label="Profile Photo"
              helperText="Paste direct portrait photo URL. (Direct upload requires plan upgrade)."
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={deleteDialog.onConfirm}
        title={deleteDialog.title}
        description={deleteDialog.description}
        itemName={deleteDialog.itemName}
        isLoading={deleteDialog.isLoading}
      />
    </div>
  );
}
