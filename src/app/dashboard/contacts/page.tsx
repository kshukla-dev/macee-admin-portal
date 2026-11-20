'use client';

import React, { useEffect, useState } from 'react';
import { Topbar } from '@/components/Topbar';
import { Modal } from '@/components/Modal';
import {
  Users2,
  Mail,
  Clock,
  Check,
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
  ExternalLink,
  Trash2,
  Eye,
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
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'in_progress' | 'converted'>('all');
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
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await fetch('/api/contacts');
      const data = await res.json();
      const list: Contact[] = data.contacts || [];

      // If dataset is small demo list, ensure rich preview data matching screenshot
      if (list.length < 5) {
        const seedData: Contact[] = [];

        // Merge with existing list without duplicates
        const existingEmails = new Set(list.map((c) => c.email));
        const combined = [...list];
        for (const seed of seedData) {
          if (!existingEmails.has(seed.email)) {
            combined.push(seed);
          }
        }
        setContacts(combined);
      } else {
        setContacts(list);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Filter Logic
  useEffect(() => {
    let result = [...contacts];

    // Filter by Tab
    if (activeTab !== 'all') {
      result = result.filter((c) => c.status === activeTab);
    }

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
  }, [contacts, activeTab, selectedService, selectedStatusFilter, searchQuery]);

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

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm('Are you sure you want to remove this enquiry?')) return;
    try {
      await fetch(`/api/contacts?id=${contactId}`, { method: 'DELETE' });
      setContacts((prev) => prev.filter((c) => c.id !== contactId));
      if (selectedContact?.id === contactId) setSelectedContact(null);
      setActiveActionMenuId(null);
    } catch (e) {
      console.error(e);
    }
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
            PAGE HEADER (Exact Editorial Serif Typography from Screenshot)
            ================================================================= */}
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-serif text-[#111827] tracking-tight">
            Contact Leads
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage enquiries submitted through your website.
          </p>
        </div>

        {/* =================================================================
            ROW OF 4 KPI METRIC CARDS (Exact Match to Screenshot)
            ================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Card 1: Total Leads */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-[#EAF0FC] text-[#36427D] flex items-center justify-center shrink-0">
              <Users2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total Leads</p>
              <div className="flex items-baseline space-x-2 mt-0.5">
                <span className="text-2xl sm:text-3xl font-bold text-[#111827] font-sans">
                  {totalCount}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: New */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-[#EAF0FC] text-[#36427D] flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">New</p>
              <div className="mt-0.5">
                <span className="text-2xl sm:text-3xl font-bold text-[#111827] font-sans">
                  {newCount}
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: In Progress */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-[#EAF0FC] text-[#36427D] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">In Progress</p>
              <div className="mt-0.5">
                <span className="text-2xl sm:text-3xl font-bold text-[#111827] font-sans">
                  {inProgressCount}
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: Converted */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-[#EAF0FC] text-[#36427D] flex items-center justify-center shrink-0">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Converted</p>
              <div className="mt-0.5">
                <span className="text-2xl sm:text-3xl font-bold text-[#111827] font-sans">
                  {convertedCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================================
            STATUS TABS (All Leads | New | In Progress | Converted)
            ================================================================= */}
        <div className="flex items-center space-x-6 border-b border-slate-200 text-xs font-medium pt-2">
          {[
            { id: 'all', label: 'All Leads' },
            { id: 'new', label: 'New' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'converted', label: 'Converted' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 transition-colors relative ${isActive
                  ? 'font-bold text-[#111827] border-b-2 border-[#E30613]'
                  : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* =================================================================
            TOOLBAR (Dropdown Filters + Search + Export & Add Lead CTAs)
            ================================================================= */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-1">
          {/* Left: Filter Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Date Range Dropdown */}
            <div className="relative">
              <select
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value)}
                className="appearance-none bg-white border border-slate-200/90 text-slate-700 text-xs font-medium rounded-xl pl-8 pr-7 py-2.5 focus:outline-none focus:border-[#E30613] shadow-2xs"
              >
                <option>Last 30 Days</option>
                <option>Last 7 Days</option>
                <option>This Month</option>
                <option>All Time</option>
              </select>
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
                ▼
              </div>
            </div>

            {/* Services Dropdown */}
            <div className="relative">
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="appearance-none bg-white border border-slate-200/90 text-slate-700 text-xs font-medium rounded-xl pl-8 pr-7 py-2.5 focus:outline-none focus:border-[#E30613] shadow-2xs"
              >
                <option>All Services</option>
                <option>Employer of Record</option>
                <option>Payroll Services</option>
                <option>Global Mobility</option>
                <option>Staffing Solutions</option>
                <option>Work Permit Support</option>
              </select>
              <Briefcase className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
                ▼
              </div>
            </div>

            {/* Status Dropdown */}
            <div className="relative">
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="appearance-none bg-white border border-slate-200/90 text-slate-700 text-xs font-medium rounded-xl pl-8 pr-7 py-2.5 focus:outline-none focus:border-[#E30613] shadow-2xs"
              >
                <option>All Status</option>
                <option>New</option>
                <option>In Progress</option>
                <option>Converted</option>
                <option>Archived</option>
              </select>
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
                ▼
              </div>
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

          {/* Right: Actions (Export & Add Lead) */}
          <div className="flex items-center space-x-2.5 shrink-0">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-[#0E1726] hover:bg-black text-white text-xs font-semibold shadow-xs transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-[#E30613] hover:bg-[#b80510] text-white text-xs font-semibold shadow-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Lead</span>
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
                      className="rounded border-slate-300 text-[#E30613] focus:ring-0 cursor-pointer"
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
                {paginatedList.length === 0 ? (
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
                            className="rounded border-slate-300 text-[#E30613] focus:ring-0 cursor-pointer"
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
                          {contact.company || '—'}
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

                        {/* Status (Exact styled pill from screenshot) */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {contact.status === 'new' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                              <span>New</span>
                            </span>
                          )}
                          {contact.status === 'in_progress' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              <span>In Progress</span>
                            </span>
                          )}
                          {contact.status === 'converted' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>Converted</span>
                            </span>
                          )}
                          {contact.status === 'archived' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                              <span>Archived</span>
                            </span>
                          )}
                        </td>

                        {/* Action ⋮ Menu */}
                        <td className="py-3.5 px-4 text-right relative">
                          <button
                            onClick={() =>
                              setActiveActionMenuId(
                                activeActionMenuId === contact.id ? null : contact.id
                              )
                            }
                            className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeActionMenuId === contact.id && (
                            <div className="absolute right-4 mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-40 text-left animate-fadeIn">
                              <button
                                onClick={() => {
                                  setSelectedContact(contact);
                                  setCurrentNotes(contact.notes || '');
                                  setActiveActionMenuId(null);
                                }}
                                className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-400" />
                                <span>View Details</span>
                              </button>
                              <div className="border-t border-slate-100 my-1" />
                              <button
                                onClick={() => handleStatusChange(contact.id, 'new')}
                                className="w-full px-3 py-1.5 text-xs text-sky-700 hover:bg-sky-50 flex items-center space-x-2"
                              >
                                <span>Set as New</span>
                              </button>
                              <button
                                onClick={() => handleStatusChange(contact.id, 'in_progress')}
                                className="w-full px-3 py-1.5 text-xs text-amber-700 hover:bg-amber-50 flex items-center space-x-2"
                              >
                                <span>Set In Progress</span>
                              </button>
                              <button
                                onClick={() => handleStatusChange(contact.id, 'converted')}
                                className="w-full px-3 py-1.5 text-xs text-emerald-700 hover:bg-emerald-50 flex items-center space-x-2"
                              >
                                <span>Set Converted</span>
                              </button>
                              <div className="border-t border-slate-100 my-1" />
                              <button
                                onClick={() => handleDeleteContact(contact.id)}
                                className="w-full px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center space-x-2"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                <span>Delete Enquiry</span>
                              </button>
                            </div>
                          )}
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
              Showing {filteredContacts.length === 0 ? 0 : 1}–
              {Math.min(filteredContacts.length, pageSize)} of {filteredContacts.length} leads
            </div>

            <div className="flex items-center space-x-1">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${currentPage === page
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
                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================
          MODAL: VIEW & MANAGE LEAD DETAILS
          ================================================================= */}
      {selectedContact && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedContact(null)}
          title={`Enquiry: ${selectedContact.fullName || `${selectedContact.firstName} ${selectedContact.lastName}`}`}
          subtitle={`Submitted on ${new Date(selectedContact.submittedAt).toLocaleString()}`}
          maxWidth="2xl"
        >
          <div className="space-y-5">
            {/* Quick Status Bar */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-medium text-slate-500">Current Status:</span>
                <span className="capitalize font-bold text-xs text-[#111827]">
                  {selectedContact.status.replace('_', ' ')}
                </span>
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => handleStatusChange(selectedContact.id, 'new')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${selectedContact.status === 'new'
                    ? 'bg-sky-600 text-white'
                    : 'bg-white border text-slate-700 hover:bg-slate-100'
                    }`}
                >
                  New
                </button>
                <button
                  onClick={() => handleStatusChange(selectedContact.id, 'in_progress')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${selectedContact.status === 'in_progress'
                    ? 'bg-amber-500 text-white'
                    : 'bg-white border text-slate-700 hover:bg-slate-100'
                    }`}
                >
                  In Progress
                </button>
                <button
                  onClick={() => handleStatusChange(selectedContact.id, 'converted')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${selectedContact.status === 'converted'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white border text-slate-700 hover:bg-slate-100'
                    }`}
                >
                  Converted
                </button>
              </div>
            </div>

            {/* Contact Information Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Email</span>
                <a
                  href={`mailto:${selectedContact.email}`}
                  className="font-bold text-[#E30613] hover:underline block mt-0.5"
                >
                  {selectedContact.email}
                </a>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Phone</span>
                <span className="font-bold text-[#111827] block mt-0.5">
                  {selectedContact.phone || 'Not provided'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Company</span>
                <span className="font-bold text-[#111827] block mt-0.5">
                  {selectedContact.company || 'Direct Individual'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Requested Service</span>
                <span className="font-bold text-[#111827] block mt-0.5">
                  {selectedContact.topic || 'General Enquiry'}
                </span>
              </div>
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1.5">
                Client Message:
              </label>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                {selectedContact.message}
              </div>
            </div>

            {/* Internal Notes */}
            <div>
              <label className="block text-xs font-bold text-[#111827] mb-1.5">
                Internal Team Notes:
              </label>
              <textarea
                rows={3}
                value={currentNotes}
                onChange={(e) => setCurrentNotes(e.target.value)}
                placeholder="Add internal notes about calls, quotes sent, or next steps..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#E30613]"
              />
              <div className="mt-2 flex justify-end">
                <button
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="is-btn py-2 px-4 text-xs font-semibold"
                >
                  {savingNotes ? 'Saving...' : 'Save Notes'}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* =================================================================
          MODAL: ADD NEW LEAD (+ Add Lead Button)
          ================================================================= */}
      {isAddModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsAddModalOpen(false)}
          title="Add New Lead"
          subtitle="Manually create a prospective client or workforce enquiry"
          maxWidth="lg"
        >
          <form onSubmit={handleAddLeadSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={newLeadForm.fullName}
                onChange={(e) => setNewLeadForm({ ...newLeadForm, fullName: e.target.value })}
                placeholder="e.g. Olivia Martin"
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#E30613]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Company</label>
                <input
                  type="text"
                  value={newLeadForm.company}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, company: e.target.value })}
                  placeholder="e.g. Northstar BV"
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#E30613]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newLeadForm.email}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                  placeholder="olivia@northstar.com"
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#E30613]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={newLeadForm.phone}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                  placeholder="+31 6 12345678"
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#E30613]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Service Required</label>
                <select
                  value={newLeadForm.topic}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, topic: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#E30613]"
                >
                  <option>Employer of Record</option>
                  <option>Payroll Services</option>
                  <option>Global Mobility</option>
                  <option>Staffing Solutions</option>
                  <option>Work Permit Support</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Message / Requirements *</label>
              <textarea
                required
                rows={3}
                value={newLeadForm.message}
                onChange={(e) => setNewLeadForm({ ...newLeadForm, message: e.target.value })}
                placeholder="Describe lead requirement or notes from phone call..."
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#E30613]"
              />
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button type="submit" className="is-btn py-2 px-5 text-xs font-semibold">
                Save & Add Lead
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
