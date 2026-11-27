'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Topbar } from '@/components/Topbar';
import { Modal } from '@/components/Modal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { SkeletonTableRow } from '@/components/Skeleton';
import { CustomSelect } from '@/components/CustomSelect';
import { StatusDropdown } from '@/components/StatusDropdown';
import {
  Users2,
  Mail,
  Search,
  Download,
  Plus,
  Calendar,
  Briefcase,
  SlidersHorizontal,
  MoreVertical,
  CheckCircle,
  FileSpreadsheet,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Trash2,
  Eye,
  Copy,
  Check,
  MessageSquare,
} from 'lucide-react';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  phone: string;
  topic?: string;
  company?: string;
  message: string;
  status: 'new' | 'in_progress' | 'converted' | 'archived';
  submittedAt: string;
  notes?: string;
}

export default function ContactsManagementPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState('All Services');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All Status');
  const [selectedDateRange, setSelectedDateRange] = useState('Last 30 Days');

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);

  // New Lead Form State
  const [newLeadForm, setNewLeadForm] = useState({
    fullName: '',
    company: '',
    email: '',
    phone: '',
    topic: 'Staffing Solutions',
    message: '',
  });

  const [currentNotes, setCurrentNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const handleCopyEmail = (email: string) => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const formatPhoneNumber = (phoneStr?: string) => {
    if (!phoneStr) return 'Not provided';
    const clean = phoneStr.trim();
    if (clean.includes(' ') || clean.includes('-')) return clean;

    if (clean.startsWith('+31')) {
      const rest = clean.slice(3);
      if (rest.length === 9) {
        return `+31 ${rest.slice(0, 1)} ${rest.slice(1, 5)} ${rest.slice(5)}`;
      }
      return `+31 ${rest}`;
    }
    if (clean.startsWith('+44')) {
      const rest = clean.slice(3);
      if (rest.length === 10) {
        return `+44 ${rest.slice(0, 4)} ${rest.slice(4)}`;
      }
      return `+44 ${rest}`;
    }
    if (clean.startsWith('+1')) {
      const rest = clean.slice(2);
      if (rest.length === 10) {
        return `+1 (${rest.slice(0, 3)}) ${rest.slice(3, 6)}-${rest.slice(6)}`;
      }
      return `+1 ${rest}`;
    }
    if (clean.startsWith('+')) {
      return clean.replace(/(\+\d{2})(\d{3,4})(\d{3,4})/, '$1 $2 $3');
    }
    return clean;
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/contacts');
      const data = await res.json();
      const list: Contact[] = data.contacts || [];
      // Ensure newest enquiries appear at top
      list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      setContacts(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Filter Logic
  useEffect(() => {
    let result = [...contacts];

    // Filter by Service Dropdown
    if (selectedService !== 'All Services') {
      result = result.filter((c) => c.topic === selectedService);
    }

    // Filter by Status Dropdown
    if (selectedStatusFilter !== 'All Status') {
      const mapped =
        selectedStatusFilter === 'New'
          ? 'new'
          : selectedStatusFilter === 'In Progress'
            ? 'in_progress'
            : selectedStatusFilter === 'Converted'
              ? 'converted'
              : 'archived';
      result = result.filter((c) => c.status === mapped);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          (c.fullName && c.fullName.toLowerCase().includes(q)) ||
          c.firstName.toLowerCase().includes(q) ||
          c.lastName.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          (c.company && c.company.toLowerCase().includes(q)) ||
          (c.topic && c.topic.toLowerCase().includes(q))
      );
    }

    setFilteredContacts(result);
    setCurrentPage(1);
  }, [contacts, selectedService, selectedStatusFilter, searchQuery]);

  // Metric counts
  const totalCount = contacts.length > 0 ? contacts.length : 0;
  const newCount = contacts.filter((c) => c.status === 'new').length || 0;
  const inProgressCount = contacts.filter((c) => c.status === 'in_progress').length || 0;
  const convertedCount = contacts.filter((c) => c.status === 'converted').length || 0;

  // Selection handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredContacts.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleStatusChange = async (contactId: string, newStatus: Contact['status']) => {
    try {
      await fetch('/api/contacts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: contactId, status: newStatus }),
      });
      setContacts((prev) =>
        prev.map((c) => (c.id === contactId ? { ...c, status: newStatus } : c))
      );
      if (selectedContact && selectedContact.id === contactId) {
        setSelectedContact((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      setActiveActionMenuId(null);
    } catch (e) {
      console.error(e);
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

  const handleDeleteContact = (contact: Contact) => {
    setActiveActionMenuId(null);
    const contactDisplayName = contact.fullName || `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || contact.email;
    setDeleteDialog({
      isOpen: true,
      title: 'Delete Enquiry',
      description: 'Are you sure you want to remove this client enquiry/lead? This action cannot be undone.',
      itemName: `${contactDisplayName} (${contact.email})`,
      isLoading: false,
      onConfirm: async () => {
        setDeleteDialog((prev) => ({ ...prev, isLoading: true }));
        try {
          await fetch(`/api/contacts?id=${contact.id}`, { method: 'DELETE' });
          setContacts((prev) => prev.filter((c) => c.id !== contact.id));
          if (selectedContact?.id === contact.id) setSelectedContact(null);
          setDeleteDialog((prev) => ({ ...prev, isOpen: false, isLoading: false }));
        } catch (e) {
          console.error(e);
          setDeleteDialog((prev) => ({ ...prev, isLoading: false }));
        }
      },
    });
  };

  const handleSaveNotes = async () => {
    if (!selectedContact) return;
    try {
      setSavingNotes(true);
      await fetch('/api/contacts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedContact.id, notes: currentNotes }),
      });
      setContacts((prev) =>
        prev.map((c) => (c.id === selectedContact.id ? { ...c, notes: currentNotes } : c))
      );
      setSelectedContact((prev) => (prev ? { ...prev, notes: currentNotes } : null));
    } catch (e) {
      alert('Could not save notes');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleAddLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLeadForm),
      });
      const data = await res.json();
      if (data.success && data.contact) {
        setContacts((prev) => [data.contact, ...prev]);
        setIsAddModalOpen(false);
        setNewLeadForm({
          fullName: '',
          company: '',
          email: '',
          phone: '',
          topic: 'Staffing Solutions',
          message: '',
        });
      }
    } catch (err) {
      alert('Failed to add lead');
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Company', 'Email', 'Phone', 'Service', 'Status', 'Date'];
    const rows = filteredContacts.map((c) => [
      c.id,
      `"${c.fullName || `${c.firstName} ${c.lastName}`}"`,
      `"${c.company || ''}"`,
      c.email,
      c.phone || '',
      `"${c.topic || ''}"`,
      c.status,
      c.submittedAt,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `macee_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper date formatter matching screenshot: "Today 10:42", "Yesterday", "12 Nov"
  const formatReceivedDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return `Today ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else {
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      }
    } catch (e) {
      return dateStr;
    }
  };

  // Pagination slice
  const totalPages = Math.ceil(filteredContacts.length / pageSize) || 1;
  const paginatedList = filteredContacts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Topbar matching exact screenshot breadcrumbs */}
      <Topbar
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Contact Leads' },
        ]}
        searchPlaceholder="Search leads..."
        onSearch={(q) => setSearchQuery(q)}
      />

      <div className="p-6 sm:p-8 lg:p-10 max-w-[1440px] mx-auto space-y-6">
        {/* =================================================================
            PAGE HEADER WITH 2 KPI CARDS ON THE RIGHT
            ================================================================= */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-serif text-[#111827] tracking-tight">
              Contact Leads
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Manage enquiries submitted through your website.
            </p>
          </div>

          {/* Right side: 2 KPI Cards in same header line */}
          <div className="flex items-center space-x-3 sm:space-x-4 shrink-0">
            {/* Card 1: Total Leads */}
            <div className="bg-white rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 border border-slate-100 shadow-2xs flex items-center space-x-3 sm:space-x-4 min-w-[160px] sm:min-w-[180px]">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#EAF0FC] text-[#36427D] flex items-center justify-center shrink-0">
                <Users2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] sm:text-xs font-medium text-slate-500">Total Leads</p>
                <div className="flex items-baseline space-x-2 mt-0.5">
                  <span className="text-xl sm:text-2xl font-bold text-[#111827] font-sans">
                    {totalCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: New */}
            <div className="bg-white rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 border border-slate-100 shadow-2xs flex items-center space-x-3 sm:space-x-4 min-w-[160px] sm:min-w-[180px]">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#EAF0FC] text-[#36427D] flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] sm:text-xs font-medium text-slate-500">New</p>
                <div className="mt-0.5">
                  <span className="text-xl sm:text-2xl font-bold text-[#111827] font-sans">
                    {newCount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================================
            TOOLBAR (Dropdown Filters + Search + Export & Add Lead CTAs)
            ================================================================= */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-1">
          {/* Left: Filter Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Date Range Dropdown */}
            <div className="w-auto min-w-[145px]">
              <CustomSelect
                value={selectedDateRange}
                onChange={setSelectedDateRange}
                icon={<Calendar className="w-3.5 h-3.5" />}
                options={['Last 30 Days', 'Last 7 Days', 'This Month', 'All Time']}
                aria-label="Filter by date range"
              />
            </div>

            {/* Services Dropdown */}
            <div className="w-auto min-w-[160px]">
              <CustomSelect
                value={selectedService}
                onChange={setSelectedService}
                icon={<Briefcase className="w-3.5 h-3.5" />}
                options={[
                  'All Services',
                  'Employer of Record',
                  'Payroll Services',
                  'Global Mobility',
                  'Staffing Solutions',
                  'Work Permit Support',
                ]}
                aria-label="Filter by service"
              />
            </div>

            {/* Status Dropdown */}
            <div className="w-auto min-w-[135px]">
              <CustomSelect
                value={selectedStatusFilter}
                onChange={setSelectedStatusFilter}
                icon={<SlidersHorizontal className="w-3.5 h-3.5" />}
                options={['All Status', 'New', 'In Progress', 'Converted', 'Archived']}
                aria-label="Filter by status"
              />
            </div>

            {/* Table Search Input */}
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name, email or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200/90 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#E30613] shadow-2xs"
              />
            </div>
          </div>

          {/* Right: Actions (Export) */}
          <div className="flex items-center space-x-2.5 shrink-0">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-[#0E1726] hover:bg-black text-white text-xs font-semibold shadow-xs transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* =================================================================
            LEADS DATA TABLE (Exact Columns, Checkboxes, Status Pills & ⋮)
            ================================================================= */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold">
                  <th className="py-3 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={
                        selectedIds.length === filteredContacts.length &&
                        filteredContacts.length > 0
                      }
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 text-[#E30613] accent-[#E30613] focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Received</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonTableRow key={i} cols={8} />
                  ))
                ) : paginatedList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No contact leads found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedList.map((contact) => {
                    const isSelected = selectedIds.includes(contact.id);
                    const displayName =
                      contact.fullName || `${contact.firstName} ${contact.lastName}`;

                    return (
                      <tr
                        key={contact.id}
                        className={`hover:bg-slate-50/70 transition-colors ${isSelected ? 'bg-rose-50/30' : ''
                          }`}
                      >
                        {/* Checkbox */}
                        <td className="py-3.5 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectRow(contact.id)}
                            className="rounded border-slate-300 text-[#E30613] accent-[#E30613] focus:ring-0 cursor-pointer"
                          />
                        </td>

                        {/* Name */}
                        <td className="py-3.5 px-4 font-bold text-[#111827]">
                          <button
                            onClick={() => {
                              setSelectedContact(contact);
                              setCurrentNotes(contact.notes || '');
                            }}
                            className="hover:underline text-left"
                          >
                            {displayName}
                          </button>
                        </td>

                        {/* Company */}
                        <td className="py-3.5 px-4 text-slate-600 font-medium">
                          {contact.company || '-'}
                        </td>

                        {/* Email */}
                        <td className="py-3.5 px-4">
                          <a
                            href={`mailto:${contact.email}`}
                            className="text-slate-600 hover:text-[#E30613] hover:underline"
                          >
                            {contact.email}
                          </a>
                        </td>

                        {/* Service */}
                        <td className="py-3.5 px-4 text-slate-700">
                          {contact.topic || 'General Enquiry'}
                        </td>

                        {/* Received */}
                        <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                          {formatReceivedDate(contact.submittedAt)}
                        </td>

                        {/* Status Custom Dropdown */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <StatusDropdown
                            status={contact.status}
                            preset="lead"
                            onChange={(newStatus) => handleStatusChange(contact.id, newStatus as Contact['status'])}
                            title="Change Lead Status"
                          />
                        </td>

                        {/* Action Buttons: View Details & Delete */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => {
                                setSelectedContact(contact);
                                setCurrentNotes(contact.notes || '');
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-[#111827] hover:bg-slate-100 transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteContact(contact)}
                              className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                              title="Delete Enquiry"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer: Pagination matching screenshot */}
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing {filteredContacts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–
              {Math.min(currentPage * pageSize, filteredContacts.length)} of {filteredContacts.length} leads
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
        </div>
      </div>

      {/* =================================================================
          MODAL: VIEW ENQUIRY DETAILS (Exact Match to User Screenshot)
          ================================================================= */}
      {selectedContact && (() => {
        const rawName = (
          selectedContact.fullName ||
          `${selectedContact.firstName || ''} ${selectedContact.lastName || ''}`.trim() ||
          'Elliott Lee'
        );
        const nameParts = rawName.split(' ');
        const firstName = selectedContact.firstName || nameParts[0] || '—';
        const lastName = selectedContact.lastName || nameParts.slice(1).join(' ') || '—';
        const helpReason = selectedContact.topic
          ? selectedContact.topic.toLowerCase().replace(/[^\w]/g, '_').replace(/_+/g, '_')
          : 'general_inquiry';

        return (
          <Modal
            isOpen={true}
            onClose={() => setSelectedContact(null)}
            title="Contact details"
            maxWidth="2xl"
          >
            <div className="space-y-6 pt-1 text-slate-800">
              {/* Row 1: FIRST NAME & LAST NAME */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    FIRST NAME
                  </span>
                  <p className="text-[15px] font-medium text-slate-900 font-sans">
                    {firstName}
                  </p>
                </div>
                <div>
                  <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    LAST NAME
                  </span>
                  <p className="text-[15px] font-medium text-slate-900 font-sans">
                    {lastName}
                  </p>
                </div>
              </div>

              {/* Row 2: WORK EMAIL & PHONE (Side by Side) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    WORK EMAIL
                  </span>
                  <div className="flex items-center space-x-2">
                    <a
                      href={`mailto:${selectedContact.email}`}
                      className="text-[15px] text-[#6938EF] font-medium hover:underline font-sans truncate"
                    >
                      {selectedContact.email}
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopyEmail(selectedContact.email)}
                      className="p-1 rounded text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                      title={copiedEmail ? 'Copied to clipboard!' : 'Copy email'}
                    >
                      {copiedEmail ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    {copiedEmail && (
                      <span className="text-[11px] font-semibold text-emerald-600 shrink-0">
                        Copied!
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    PHONE
                  </span>
                  {selectedContact.phone ? (
                    <a
                      href={`tel:${selectedContact.phone.replace(/\s+/g, '')}`}
                      className="text-[15px] text-[#6938EF] font-medium hover:underline block font-sans"
                    >
                      {formatPhoneNumber(selectedContact.phone)}
                    </a>
                  ) : (
                    <p className="text-[15px] text-slate-400 font-sans">Not provided</p>
                  )}
                </div>
              </div>

              {/* Row 3: COMPANY & HELP REASON (Side by Side) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    COMPANY
                  </span>
                  <p className="text-[15px] font-medium text-slate-900 font-sans">
                    {selectedContact.company || '—'}
                  </p>
                </div>

                <div>
                  <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    HELP REASON
                  </span>
                  <p className="text-[15px] font-medium text-slate-900 font-sans">
                    {helpReason}
                  </p>
                </div>
              </div>

              {/* Row 4: MESSAGE (Full Width) */}
              <div>
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  MESSAGE
                </span>
                <div className="w-full p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] border border-slate-100 text-[14px] text-slate-700 leading-relaxed font-sans">
                  {selectedContact.message || 'No message content provided.'}
                </div>
              </div>
            </div>
          </Modal>
        );
      })()}

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
