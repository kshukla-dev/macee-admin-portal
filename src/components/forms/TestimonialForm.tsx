'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Topbar } from '@/components/Topbar';
import { ImagePicker } from '@/components/ImagePicker';
import { CustomSelect } from '@/components/CustomSelect';
import {
  MessageSquareQuote,
  ArrowLeft,
  Check,
  Quote,
  AlertCircle,
  Loader2,
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

const TAG_OPTIONS = [
  'Client Testimonial',
  'Tech Sector Partner',
  'Compliance Accreditation',
  'Global Mobility Story',
  'Employer of Record Client',
];

interface TestimonialFormProps {
  initialData?: TestimonialItem | null;
  isEdit?: boolean;
}

export function TestimonialForm({ initialData, isEdit = false }: TestimonialFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientsData, setClientsData] = useState<any>(null);

  // Form Fields
  const [title, setTitle] = useState(initialData?.title || '');
  const [tag, setTag] = useState(initialData?.tag || 'Client Testimonial');
  const [text, setText] = useState(initialData?.text || '');
  const [image, setImage] = useState(
    typeof initialData?.image === 'string'
      ? initialData.image
      : (initialData?.image as any)?.src || ''
  );

  // Load clients data to update certifications list
  useEffect(() => {
    fetch('/api/clients')
      .then((res) => res.json())
      .then((data) => setClientsData(data.clients || {}))
      .catch((e) => console.error(e));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Please provide the client or company name.');
      return;
    }
    if (!text.trim()) {
      setError('Please provide the testimonial quote or review.');
      return;
    }

    try {
      setSaving(true);
      const existingList: TestimonialItem[] = Array.isArray(clientsData?.certifications)
        ? [...clientsData.certifications]
        : [];

      const newItem: TestimonialItem = {
        id: initialData?.id || `testimonial-${Date.now()}`,
        title: title.trim(),
        tag: tag.trim() || 'Client Testimonial',
        text: text.trim(),
        image: image.trim(),
        accent: false,
        order: initialData?.order || 1,
      };

      let updatedList: TestimonialItem[];
      if (isEdit && initialData?.id) {
        const idx = existingList.findIndex((i) => i.id === initialData.id);
        if (idx >= 0) {
          existingList[idx] = newItem;
          updatedList = existingList;
        } else {
          updatedList = [newItem, ...existingList];
        }
      } else {
        // New item placed at the very top
        updatedList = [newItem, ...existingList];
      }

      const updatedPayload = {
        ...clientsData,
        certifications: updatedList,
      };

      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPayload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        router.push('/dashboard/clients');
        router.refresh();
      } else {
        setError(data.error || 'Failed to save testimonial.');
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
          { label: 'Testimonials', href: '/dashboard/clients' },
          { label: isEdit ? 'Edit Testimonial' : 'Add Testimonial' },
        ]}
      />

      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-6xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard/clients"
              className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-[#111827] hover:border-slate-300 shadow-2xs transition-all"
              title="Back to Testimonials"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-serif text-[#111827] tracking-tight">
                {isEdit ? 'Edit Testimonial' : 'Add New Testimonial'}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Client reviews, partner quotes, and verified accreditations on macee.com.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <Link
              href="/dashboard/clients"
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
              <span>{saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Save Testimonial'}</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Main Form Body */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left 2 Cols: Content Info */}
            <div className="md:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-2xs p-6 sm:p-7 space-y-5">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                Client & Review Details
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Client / Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Booking.com / ASML Enterprise Desk"
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#E30613] shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Category Tag
                </label>
                <CustomSelect
                  value={tag}
                  onChange={(val) => setTag(val)}
                  options={TAG_OPTIONS}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Testimonial Quote / Story *
                </label>
                <textarea
                  rows={6}
                  required
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste the verified client testimonial or partner quote..."
                  className="w-full p-3.5 text-xs rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-[#E30613] shadow-2xs leading-relaxed"
                />
              </div>
            </div>

            {/* Right 1 Col: Logo / Image & Live Preview */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs p-6 space-y-5 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
                  Company Logo / Badge
                </h3>

                {/* Preview Box */}
                <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-100 mb-4 h-32">
                  {image ? (
                    <img
                      src={image}
                      alt={title || 'Logo'}
                      className="max-h-20 max-w-full object-contain"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/uploads/favicon-96x96.png';
                      }}
                    />
                  ) : (
                    <div className="text-center text-slate-400">
                      <Quote className="w-8 h-8 mx-auto mb-1 opacity-50" />
                      <span className="text-[11px]">No logo uploaded</span>
                    </div>
                  )}
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

              {/* Status info */}
              <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400">
                <span>✓ Automatically synchronized with website trust sections</span>
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="flex items-center justify-between pt-2">
            <Link
              href="/dashboard/clients"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              ← Back to Testimonials
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
              <span>{saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Save Testimonial'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
