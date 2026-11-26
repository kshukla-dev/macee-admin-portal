'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Topbar } from '@/components/Topbar';
import { Modal } from '@/components/Modal';
import { ImagePicker } from '@/components/ImagePicker';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { SkeletonCertCard } from '@/components/Skeleton';
import {
  MessageSquareQuote,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Search,
  Sparkles,
  Quote,
  Star,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export interface TestimonialItem {
  id: string;
  tag: string;
  title: string;
  text: string;
  image?: string;
  accent?: boolean;
  order?: number;
}

export default function TestimonialsManagementPage() {
  const [clientsData, setClientsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [syncAlert, setSyncAlert] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [itemTag, setItemTag] = useState('');
  const [itemTitle, setItemTitle] = useState('');
  const [itemText, setItemText] = useState('');
  const [itemImage, setItemImage] = useState('');
  const [itemAccent, setItemAccent] = useState(false);

  // Delete Confirmation Dialog state
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    itemName?: string;
    onConfirm: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => { },
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/clients');
      const data = await res.json();
      setClientsData(data.clients || {});
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const testimonialsList: TestimonialItem[] = useMemo(() => {
    if (!clientsData?.certifications || !Array.isArray(clientsData.certifications)) {
      return [];
    }
    return clientsData.certifications;
  }, [clientsData]);

  // Filtered Testimonials
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return testimonialsList;
    const q = searchQuery.toLowerCase();
    return testimonialsList.filter((item) => {
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchText = item.text?.toLowerCase().includes(q);
      const matchTag = item.tag?.toLowerCase().includes(q);
      return matchTitle || matchText || matchTag;
    });
  }, [testimonialsList, searchQuery]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1;
  const paginatedTestimonials = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  const featuredCount = useMemo(() => {
    return testimonialsList.filter((i) => i.accent).length;
  }, [testimonialsList]);

  const handleSaveAll = async (updatedData: any) => {
    try {
      setSaving(true);
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setClientsData(data.clients || updatedData);
        setSyncAlert(true);
        setTimeout(() => setSyncAlert(false), 3000);
      } else {
        alert(data.error || 'Failed to save testimonials data');
      }
    } catch (e) {
      alert('Failed to save testimonials data');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingIndex(null);
    setItemTag('Client Testimonial');
    setItemTitle('');
    setItemText('');
    setItemImage('');
    setItemAccent(false);
    setModalOpen(true);
  };

  const handleOpenEdit = (index: number) => {
    const item = testimonialsList[index];
    if (!item) return;
    setEditingIndex(index);
    setItemTag(item.tag || 'Client Testimonial');
    setItemTitle(item.title || '');
    setItemText(item.text || '');
    const imgVal = typeof item.image === 'string' ? item.image : (item.image as any)?.src || '';
    setItemImage(imgVal || '');
    setItemAccent(!!item.accent);
    setModalOpen(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedList = [...testimonialsList];
    const existing = editingIndex !== null ? updatedList[editingIndex] : null;

    const newItem: TestimonialItem = {
      id: existing?.id || `testimonial-${Date.now()}`,
      tag: itemTag.trim() || 'Client Testimonial',
      title: itemTitle.trim(),
      text: itemText.trim(),
      image: itemImage.trim(),
      accent: itemAccent,
      order: existing?.order || updatedList.length + 1,
    };

    if (editingIndex !== null) {
      updatedList[editingIndex] = newItem;
    } else {
      updatedList.push(newItem);
    }

    const updatedData = { ...clientsData, certifications: updatedList };
    handleSaveAll(updatedData);
    setModalOpen(false);
  };

  const handleDeleteItem = (index: number) => {
    const item = testimonialsList[index];
    setDeleteDialog({
      isOpen: true,
      title: 'Delete Testimonial',
      description: 'Are you sure you want to delete this testimonial? This action cannot be undone and will update the live website.',
      itemName: item?.title || 'Testimonial',
      onConfirm: () => {
        const updatedList = testimonialsList.filter((_, i) => i !== index);
        const updatedData = { ...clientsData, certifications: updatedList };
        handleSaveAll(updatedData);
        setDeleteDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Topbar
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Testimonials' },
        ]}
        searchPlaceholder="Search testimonials by client or quote..."
        onSearch={(q) => setSearchQuery(q)}
      />

      <div className="p-6 sm:p-8 lg:p-10 max-w-[1440px] mx-auto space-y-6">
        {/* =================================================================
            PAGE HEADER WITH 2 KPI CARDS ON THE RIGHT (Streamlined Layout)
            ================================================================= */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-serif text-[#111827] tracking-tight">
              Testimonials
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Manage client testimonials, partner quotes, and verified accreditations on macee.com.
            </p>
          </div>

          {/* Right side: 2 KPI Cards in same header line */}
          <div className="flex items-center space-x-3 sm:space-x-4 shrink-0">
            {/* Card 1: Total Testimonials */}
            <div className="bg-white rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 border border-slate-100 shadow-2xs flex items-center space-x-3 sm:space-x-4 min-w-[170px] sm:min-w-[190px]">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#EAF0FC] text-[#36427D] flex items-center justify-center shrink-0">
                <MessageSquareQuote className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] sm:text-xs font-medium text-slate-500">Total Stories</p>
                <div className="flex items-baseline space-x-2 mt-0.5">
                  <span className="text-xl sm:text-2xl font-bold text-[#111827] font-sans">
                    {testimonialsList.length}
                  </span>
                  <span className="text-[10px] sm:text-xs font-semibold text-emerald-600">Active</span>
                </div>
              </div>
            </div>

            {/* Card 2: Featured */}
            <div className="bg-white rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 border border-slate-100 shadow-2xs flex items-center space-x-3 sm:space-x-4 min-w-[170px] sm:min-w-[190px]">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Star className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] sm:text-xs font-medium text-slate-500">Featured</p>
                <div className="mt-0.5">
                  <span className="text-xl sm:text-2xl font-bold text-[#111827] font-sans">
                    {featuredCount}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sync Toast Alert */}
        {syncAlert && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between shadow-2xs animate-fadeIn">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>✓ Testimonial changes saved and synchronized with website files!</span>
            </div>
          </div>
        )}

        {/* =================================================================
            TOOLBAR (Search Bar on Left + Add Testimonial on Right)
            ================================================================= */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search testimonials by client, tag, or quote..."
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
            <span>Add Testimonial</span>
          </button>
        </div>

        {/* =================================================================
            TESTIMONIALS CARDS GRID
            ================================================================= */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCertCard key={i} />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs p-12 text-center text-slate-400 text-xs">
            {searchQuery ? 'No testimonials match your search.' : 'No testimonials added yet.'}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {paginatedTestimonials.map((item, idx) => {
                const realIndex = (currentPage - 1) * pageSize + idx;
                const imgSrc = typeof item.image === 'string' ? item.image : (item.image as any)?.src;
                return (
                  <div
                    key={item.id || realIndex}
                    className={`bg-white rounded-2xl p-6 border shadow-2xs transition-all relative flex flex-col justify-between ${
                      item.accent
                        ? 'border-[#E30613]/50 ring-1 ring-[#E30613]/20'
                        : 'border-slate-100'
                    }`}
                  >
                    <div>
                      {/* Top Header: Logo, Tag & Action Buttons */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center space-x-3 min-w-0">
                          {imgSrc ? (
                            <div className="h-12 w-20 bg-slate-50 border border-slate-200/80 rounded-xl p-1.5 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                              <img
                                src={imgSrc}
                                alt={item.title}
                                className="max-h-full max-w-full object-contain"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = '/uploads/favicon-96x96.png';
                                }}
                              />
                            </div>
                          ) : (
                            <div className="h-12 w-12 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center shrink-0 text-slate-400">
                              <Quote className="w-5 h-5 text-slate-400" />
                            </div>
                          )}
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#F0F3FA] text-[#36427D] truncate">
                            {item.tag || 'Testimonial'}
                          </span>
                        </div>

                        <div className="flex items-center space-x-1 shrink-0">
                          <button
                            onClick={() => handleOpenEdit(realIndex)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#111827] hover:bg-slate-100 transition-colors"
                            title="Edit Testimonial"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(realIndex)}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                            title="Delete Testimonial"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Client / Title */}
                      <h4 className="text-base font-bold text-[#111827] mt-3.5 font-sans flex items-center gap-1.5">
                        <span>{item.title}</span>
                        {item.accent && (
                          <span className="text-[10px] font-semibold text-[#E30613] bg-rose-50 px-2 py-0.5 rounded-md shrink-0">
                            Featured
                          </span>
                        )}
                      </h4>

                      {/* Testimonial Quote */}
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                        "{item.text}"
                      </p>
                    </div>

                    {imgSrc && (
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="truncate max-w-[260px] font-mono text-[10px] text-slate-500">
                          {imgSrc}
                        </span>
                        <span className="text-emerald-600 font-semibold text-[10px]">
                          ✓ Image Attached
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls Footer matching screenshot */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <div>
                Showing {filteredItems.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–
                {Math.min(currentPage * pageSize, filteredItems.length)} of {filteredItems.length} testimonials
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

        {/* =================================================================
            ADD / EDIT TESTIMONIAL MODAL
            ================================================================= */}
        {modalOpen && (
          <Modal
            isOpen={true}
            onClose={() => setModalOpen(false)}
            title={editingIndex !== null ? 'Edit Testimonial' : 'Add New Testimonial'}
            subtitle="Updates will sync live with Macee's client trust and testimonial sections."
            maxWidth="lg"
          >
            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Client / Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={itemTitle}
                  onChange={(e) => setItemTitle(e.target.value)}
                  placeholder="e.g. Maarten Koekebakker, Fintech Enterprise Lead"
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#E30613]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tag / Designation / Industry
                </label>
                <input
                  type="text"
                  value={itemTag}
                  onChange={(e) => setItemTag(e.target.value)}
                  placeholder="e.g. Banking & Fintech, SNA Labour Partner..."
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#E30613]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Testimonial Quote / Review Text *
                </label>
                <textarea
                  required
                  rows={4}
                  value={itemText}
                  onChange={(e) => setItemText(e.target.value)}
                  placeholder="Quote from client about Macee's workforce solutions and service delivery..."
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#E30613] leading-relaxed"
                />
              </div>

              <div>
                <ImagePicker
                  value={itemImage}
                  onChange={(newUrl) => setItemImage(newUrl)}
                  label="Client Logo / Avatar Image"
                  helperText="Upload or enter image URL for client avatar or corporate logo."
                  previewShape="rounded"
                  aspect="wide"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="itemAccent"
                  checked={itemAccent}
                  onChange={(e) => setItemAccent(e.target.checked)}
                  className="rounded border-slate-300 text-[#E30613] focus:ring-0"
                />
                <label htmlFor="itemAccent" className="text-xs text-slate-700 font-medium">
                  Highlight as Featured Testimonial (Brand Accent)
                </label>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="is-btn py-2 px-5 text-xs font-semibold"
                >
                  {saving ? 'Saving...' : 'Save Testimonial'}
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
        />
      </div>
    </div>
  );
}
