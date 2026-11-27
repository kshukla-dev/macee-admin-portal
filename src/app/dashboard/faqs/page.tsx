'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { Topbar } from '@/components/Topbar';
import { Modal } from '@/components/Modal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { SkeletonAccordion } from '@/components/Skeleton';
import { CustomSelect } from '@/components/CustomSelect';
import {
  HelpCircle,
  Plus,
  Search,
  Tag,
  Edit2,
  Trash2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  BookOpen,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Globe,
  Building2,
  Briefcase,
  Users,
  FolderGit2,
  PhoneCall,
  Languages,
  Check,
  Layers,
  FileCode2,
} from 'lucide-react';

export interface FaqItem {
  id: string;
  page: string;
  pageName: string;
  categoryId: number;
  categoryName: string;
  question: string;
  answer: string;
  question_nl?: string;
  answer_nl?: string;
  tag?: string;
  order?: number;
  active?: boolean;
}

export interface FaqPageDef {
  id: string;
  name: string;
  categoryId: number;
  categoryName: string;
  route: string;
  description: string;
}

interface PageMeta {
  id: string;
  name: string;
  label: string;
  icon: any;
  route: string;
  constName: string;
  color: string;
  bgLight: string;
  borderLight: string;
  description: string;
}

const PAGE_TABS: PageMeta[] = [
  {
    id: 'all',
    name: 'All Pages',
    label: 'All Pages',
    icon: Globe,
    route: '/faqs',
    constName: 'ALL_FAQS_EN',
    color: 'text-slate-800',
    bgLight: 'bg-slate-100',
    borderLight: 'border-slate-200',
    description: 'Complete centralized FAQ directory across all website pages and services.',
  },
  {
    id: 'home',
    name: 'Home',
    label: 'Home',
    icon: Building2,
    route: '/',
    constName: 'HOME_FAQS',
    color: 'text-[#E30613]',
    bgLight: 'bg-rose-50',
    borderLight: 'border-rose-200',
    description: 'Workforce Desk, SLA models, compliance accreditations and fast deployment.',
  },
  {
    id: 'about',
    name: 'About Us',
    label: 'About Us',
    icon: BookOpen,
    route: '/about',
    constName: 'ABOUT_FAQS',
    color: 'text-[#36427D]',
    bgLight: 'bg-[#EAF0FC]',
    borderLight: 'border-slate-200',
    description: '30+ years experience, Arnhem HQ, SNA NEN 4400-1 chain liability protection.',
  },
  {
    id: 'clients',
    name: 'Clients',
    label: 'Clients',
    icon: Briefcase,
    route: '/clients',
    constName: 'CLIENTS_FAQS',
    color: 'text-amber-700',
    bgLight: 'bg-amber-50',
    borderLight: 'border-amber-200',
    description: '48-72h candidate delivery SLA, quality replacement guarantee, MSP desks.',
  },
  {
    id: 'professionals',
    name: 'Professionals',
    label: 'Professionals',
    icon: Users,
    route: '/professionals',
    constName: 'PROFESSIONALS_FAQS',
    color: 'text-emerald-700',
    bgLight: 'bg-emerald-50',
    borderLight: 'border-emerald-200',
    description: '30% tax ruling application support, secondment, family settling & fast pay cycles.',
  },
  {
    id: 'projects',
    name: 'Projects',
    label: 'Projects',
    icon: FolderGit2,
    route: '/projects',
    constName: 'PROJECTS_FAQS',
    color: 'text-[#36427D]',
    bgLight: 'bg-[#F0F3FA]',
    borderLight: 'border-slate-200',
    description: 'CV format guidelines, OTYS applicant review workflows, hybrid & remote policies.',
  },
  {
    id: 'contact',
    name: 'Contact',
    label: 'Contact',
    icon: PhoneCall,
    route: '/contact',
    constName: 'CONTACT_FAQS',
    color: 'text-[#E30613]',
    bgLight: 'bg-rose-50',
    borderLight: 'border-rose-200',
    description: '24-hour response SLAs, Arnhem office visits, and urgent emergency placements.',
  },
];

const SUGGESTED_TAGS_BY_PAGE: Record<string, string[]> = {
  home: [
    'Turnkey Workforce Management',
    'SNA NEN 4400-1 Certified',
    'Flexible Engagement Models',
    'Specialized Domain Verticals',
    'Rapid 48-72h Deployment',
  ],
  about: [
    '30+ Years Industry Experience',
    'Chain Liability Protection',
    'Arnhem Headquarters & National Reach',
    'Dedicated Account Managers',
  ],
  clients: [
    '48 - 72 Hour Turnaround',
    'Placement & Quality Guarantee',
    'Wet DBA & Fiscal Risk Elimination',
    'MSP & Vendor Consolidation',
    'Transparent Milestone Pricing',
  ],
  professionals: [
    'Onboarding & Relocation Guidance',
    '30% Tax Ruling Support',
    'Family Relocation Assistance',
    'Flexible Contracting Choices',
    'Guaranteed On-Time Invoicing',
  ],
  projects: [
    'PDF / DOCX Recommended',
    '24 - 48 Hour Recruiter Review',
    'Flexible Hybrid Options',
    'Job Alerts & Open Registration',
    'Live OTYS Desk Synchronization',
  ],
  contact: [
    'Response Within 24 Business Hours',
    'Willemsplein 44, Arnhem',
    'Emergency Staffing Desk',
    'Free & Confidential Assessment',
  ],
};

export default function FaqManagementPage() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(true);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Accordion Expand State
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Tabs scroll container
  const tabsContainerRef = useRef<HTMLDivElement>(null);

  const handleScrollTabs = (direction: 'left' | 'right') => {
    if (tabsContainerRef.current) {
      tabsContainerRef.current.scrollBy({
        left: direction === 'left' ? -260 : 260,
        behavior: 'smooth',
      });
    }
  };

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FaqItem | null>(null);
  const [modalTab, setModalTab] = useState<'en' | 'nl'>('en');
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [formPage, setFormPage] = useState<string>('home');
  const [formTag, setFormTag] = useState<string>('');
  const [formOrder, setFormOrder] = useState<number>(1);
  const [formActive, setFormActive] = useState<boolean>(true);
  const [formQuestion, setFormQuestion] = useState<string>('');
  const [formAnswer, setFormAnswer] = useState<string>('');
  const [formQuestionNl, setFormQuestionNl] = useState<string>('');
  const [formAnswerNl, setFormAnswerNl] = useState<string>('');

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/faqs');
      const data = await res.json();
      setItems(data.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Counts per page
  const pageCounts = useMemo(() => {
    const counts: Record<string, number> = { all: items.length };
    PAGE_TABS.forEach((tab) => {
      if (tab.id !== 'all') {
        counts[tab.id] = items.filter((i) => i.page === tab.id).length;
      }
    });
    return counts;
  }, [items]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Tab filter
      if (activeTab !== 'all' && item.page !== activeTab) {
        return false;
      }

      // Status filter
      if (statusFilter === 'active' && item.active === false) return false;
      if (statusFilter === 'inactive' && item.active !== false) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuestion = item.question.toLowerCase().includes(q);
        const matchesAnswer = item.answer.toLowerCase().includes(q);
        const matchesTag = item.tag ? item.tag.toLowerCase().includes(q) : false;
        const matchesNl = item.question_nl ? item.question_nl.toLowerCase().includes(q) : false;
        const matchesPage = item.pageName ? item.pageName.toLowerCase().includes(q) : false;
        if (!matchesQuestion && !matchesAnswer && !matchesTag && !matchesNl && !matchesPage) {
          return false;
        }
      }

      return true;
    });
  }, [items, activeTab, statusFilter, searchQuery]);

  const currentTabMeta = useMemo(() => {
    return PAGE_TABS.find((t) => t.id === activeTab) || PAGE_TABS[0];
  }, [activeTab]);

  // Reset pagination on filter or tab change
  useEffect(() => {
    setCurrentPage(1);
    setExpandedId(null);
  }, [activeTab, statusFilter, searchQuery]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

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

  const handleDeleteFaq = (id: string, questionTitle: string) => {
    setDeleteDialog({
      isOpen: true,
      title: 'Delete FAQ',
      description: 'Are you sure you want to delete this FAQ? This action cannot be undone and will update the live Macee website.',
      itemName: questionTitle,
      isLoading: false,
      onConfirm: async () => {
        setDeleteDialog((prev) => ({ ...prev, isLoading: true }));
        try {
          const res = await fetch(`/api/faqs?id=${id}`, { method: 'DELETE' });
          const data = await res.json();
          if (data.success) {
            setItems((prev) => prev.filter((item) => item.id !== id));
            setSyncMessage('✓ FAQ deleted and updated on Macee website.');
            setTimeout(() => setSyncMessage(null), 4000);
            setDeleteDialog((prev) => ({ ...prev, isOpen: false, isLoading: false }));
          } else {
            alert('Failed to delete FAQ');
            setDeleteDialog((prev) => ({ ...prev, isLoading: false }));
          }
        } catch (e) {
          alert('Failed to delete FAQ');
          setDeleteDialog((prev) => ({ ...prev, isLoading: false }));
        }
      },
    });
  };

  const handleToggleActive = async (item: FaqItem) => {
    try {
      const updatedStatus = item.active === false ? true : false;
      const res = await fetch('/api/faqs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, active: updatedStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, active: updatedStatus } : i))
        );
        setSyncMessage(`✓ Question status set to ${updatedStatus ? 'Active' : 'Inactive'} and synced.`);
        setTimeout(() => setSyncMessage(null), 3500);
      }
    } catch (e) {
      alert('Failed to update status');
    }
  };

  const getPageMeta = (pageKey: string) => {
    return PAGE_TABS.find((t) => t.id === pageKey) || PAGE_TABS[1];
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Topbar
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'FAQs' },
        ]}
        searchPlaceholder="Search questions across all pages..."
        onSearch={(q) => setSearchQuery(q)}
      />

      <div className="p-6 sm:p-8 lg:p-10 max-w-[1440px] mx-auto space-y-6">
        {/* Page Header */}
        <div className="pb-2 border-b border-slate-200/80">
          <h1 className="text-3xl sm:text-4xl font-serif text-[#111827] tracking-tight">
            FAQs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage page-specific FAQs for Home, About Us, Clients, Professionals, Projects, and Contact with instant website sync.
          </p>
        </div>

        {/* Sync Toast / Banner */}
        {syncMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between shadow-2xs animate-fadeIn">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{syncMessage}</span>
            </div>
            <button onClick={() => setSyncMessage(null)} className="text-emerald-700 hover:text-emerald-900 text-xs font-bold px-2 py-0.5">
              Dismiss
            </button>
          </div>
        )}

        {/* PAGE FILTER TABS BAR WITH SCROLL CONTROLS */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs p-2 relative flex items-center">
          {/* Scroll Left Button */}
          <button
            type="button"
            onClick={() => handleScrollTabs('left')}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors shrink-0 mr-1"
            title="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Scrollable Tabs Container */}
          <div
            ref={tabsContainerRef}
            className="flex items-center space-x-2 overflow-x-auto scroll-smooth py-1 px-1 flex-1 scrollbar-thin"
            style={{ scrollbarWidth: 'thin' }}
          >
            {PAGE_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const count = pageCounts[tab.id] || 0;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap shrink-0 ${isActive
                    ? 'bg-[#111827] text-white shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-[#111827] hover:bg-slate-100/80'
                    }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200/70 text-slate-600'
                      }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Scroll Right Button */}
          <button
            type="button"
            onClick={() => handleScrollTabs('right')}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors shrink-0 ml-1"
            title="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Page Context Banner */}
        {activeTab !== 'all' && (
          <div className={`p-4 rounded-2xl border ${currentTabMeta.borderLight} ${currentTabMeta.bgLight} flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn`}>
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-xl bg-white shadow-2xs ${currentTabMeta.color}`}>
                {React.createElement(currentTabMeta.icon, { className: 'w-4 h-4' })}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-[#111827]">
                    {currentTabMeta.name} Questions
                  </h3>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/80 border border-slate-200/60 text-slate-700">
                    export const {currentTabMeta.constName}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  {currentTabMeta.description} Live Route: <span className="font-semibold text-slate-800">{currentTabMeta.route}</span>
                </p>
              </div>
            </div>

            <Link
              href="/dashboard/faqs/create"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 text-slate-800 text-xs font-semibold shadow-2xs hover:bg-slate-50 transition-all shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5 text-[#E30613]" />
              <span>Add to {currentTabMeta.label}</span>
            </Link>
          </div>
        )}

        {/* Secondary Filter & Search Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Left: Status Filter Buttons + Add FAQ Button */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={`Search ${activeTab === 'all' ? 'all' : currentTabMeta.label} questions, tags, or answers...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200/90 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#E30613] shadow-2xs"
            />
          </div>

          {/* Right: Search Input */}


          <div className="flex items-center space-x-2.5 shrink-0">
            <div className="flex items-center space-x-1 bg-white border border-slate-200/90 rounded-xl p-1 shadow-2xs text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${statusFilter === 'all' ? 'bg-[#111827] text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                All Status
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${statusFilter === 'active' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Active Only
              </button>
              <button
                onClick={() => setStatusFilter('inactive')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${statusFilter === 'inactive' ? 'bg-slate-700 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Draft / Inactive
              </button>
            </div>

            <Link
              href="/dashboard/faqs/create"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#E30613] hover:bg-[#b80510] text-white text-xs font-semibold shadow-xs transition-all shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add FAQ</span>
            </Link>
          </div>
        </div>

        {/* FAQs LIST / TABLE (Editorial Style) */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden">
          {loading ? (
            <SkeletonAccordion count={6} />
          ) : filteredItems.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <HelpCircle className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500 font-medium">
                No questions found for the current filter.
              </p>
              <Link
                href="/dashboard/faqs/create"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#E30613] text-white text-xs font-semibold shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add First Question</span>
              </Link>
            </div>
          ) : (
            <>
              <div className="divide-y divide-slate-100">
                {paginatedItems.map((item, idx) => {
                  const isExpanded = expandedId === item.id;
                  const pageMeta = getPageMeta(item.page);

                  return (
                    <div
                      key={item.id}
                      className={`transition-colors ${isExpanded ? 'bg-slate-50/70' : 'hover:bg-slate-50/40'}`}
                    >
                      <div className="p-5 flex items-start justify-between gap-4">
                        {/* Left: Expand button & Question Info */}
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : item.id)}
                          className="flex-1 text-left flex items-start space-x-3.5 group cursor-pointer"
                        >
                          <div className="mt-1 text-slate-400 group-hover:text-[#E30613] transition-colors shrink-0">
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-[#E30613]" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </div>

                          <div className="space-y-1 flex-1 min-w-0">
                            {/* Question Title */}
                            <h4 className="text-sm sm:text-base font-bold text-[#111827] group-hover:text-[#E30613] transition-colors font-serif">
                              {item.question}
                            </h4>

                            {/* Short preview if not expanded */}
                            {!isExpanded && (
                              <p className="text-xs text-slate-500 line-clamp-1 pr-6 font-normal">
                                {item.answer}
                              </p>
                            )}
                          </div>
                        </button>

                        {/* Right: Actions */}
                        <div className="flex items-center space-x-1 shrink-0 pt-1">
                          <button
                            onClick={() => handleToggleActive(item)}
                            className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${item.active !== false
                              ? 'text-slate-500 hover:text-amber-600 hover:bg-amber-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                              }`}
                            title={item.active !== false ? 'Deactivate Question' : 'Activate Question'}
                          >
                            {item.active !== false ? 'Deactivate' : 'Publish'}
                          </button>

                          <Link
                            href={`/dashboard/faqs/edit/${item.id}`}
                            className="inline-flex items-center text-slate-500 hover:text-[#111827] p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Edit FAQ"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            onClick={() => handleDeleteFaq(item.id, item.question)}
                            className="inline-flex items-center text-xs font-semibold text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Delete FAQ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* EXPANDED ACCORDION VIEW */}
                      {isExpanded && (
                        <div className="px-6 pb-6 pt-2 border-t border-slate-100 space-y-4 animate-fadeIn">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* English Answer Box */}
                            <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                                  English Answer (macee.com)
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">Default</span>
                              </div>
                              <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
                                {item.answer}
                              </div>
                            </div>

                            {/* Dutch Translation Box */}
                            <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-2xs space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                                  Nederlands (NL Vertaling)
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">Dutch</span>
                              </div>
                              {item.question_nl && (
                                <p className="text-xs font-bold text-[#111827] font-serif border-b border-slate-100 pb-1.5">
                                  {item.question_nl}
                                </p>
                              )}
                              <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
                                {item.answer_nl || item.answer}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Pagination Controls Footer */}
              {filteredItems.length > 0 && (
                <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 bg-white">
                  <div>
                    Showing {(currentPage - 1) * pageSize + 1}–
                    {Math.min(currentPage * pageSize, filteredItems.length)} of {filteredItems.length} questions
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      disabled={currentPage <= 1}
                      onClick={() => {
                        setCurrentPage((p) => Math.max(1, p - 1));
                      }}
                      className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-600"
                      title="Previous page"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => {
                          setCurrentPage(page);
                        }}
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
                      onClick={() => {
                        setCurrentPage((p) => Math.min(totalPages, p + 1));
                      }}
                      className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-600"
                      title="Next page"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

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
