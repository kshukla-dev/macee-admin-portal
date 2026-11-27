'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Topbar } from '@/components/Topbar';
import { CustomSelect } from '@/components/CustomSelect';
import {
  HelpCircle,
  ArrowLeft,
  Check,
  Globe,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export interface FaqItem {
  id: string;
  page: string;
  pageName?: string;
  tag?: string;
  order?: number;
  active?: boolean;
  question: string;
  answer: string;
  question_nl?: string;
  answer_nl?: string;
}

const PAGE_OPTIONS = [
  { value: 'home', label: 'Homepage' },
  { value: 'services', label: 'Services' },
  { value: 'about', label: 'About Us' },
  { value: 'employers', label: 'For Employers' },
  { value: 'projects', label: 'Job Seekers' },
  { value: 'contact', label: 'Contact Page' },
];

const SUGGESTED_TAGS: Record<string, string[]> = {
  home: ['SNA NEN 4400-1', 'Contractor Onboarding', 'Recruitment Speed', 'Direct Payroll Desk', 'General'],
  services: ['Full Employer Liability Shield', '30% Tax Ruling Support', 'Flexible Talent Deployments', 'Direct G-Account Guarantee', 'General'],
  about: ['Licensed IND Sponsor', 'Direct Dutch Leadership', 'Zero Compliance Fines', 'General'],
  employers: ['Compliant Hiring', 'Rate Transparency', 'Risk Mitigation', 'General'],
  projects: ['PDF / DOCX Recommended', '24 - 48 Hour Recruiter Review', 'Job Alerts', 'General'],
  contact: ['Response Within 24 Business Hours', 'Emergency Staffing Desk', 'General'],
};

interface FaqFormProps {
  initialData?: FaqItem | null;
  isEdit?: boolean;
}

export function FaqForm({ initialData, isEdit = false }: FaqFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'en' | 'nl'>('en');

  // Fields
  const [formPage, setFormPage] = useState<string>(initialData?.page || 'home');
  const [formTag, setFormTag] = useState<string>(initialData?.tag || 'General');
  const [formOrder, setFormOrder] = useState<number>(initialData?.order || 1);
  const [formActive, setFormActive] = useState<boolean>(
    initialData?.active !== undefined ? initialData.active : true
  );
  const [formQuestion, setFormQuestion] = useState<string>(initialData?.question || '');
  const [formAnswer, setFormAnswer] = useState<string>(initialData?.answer || '');
  const [formQuestionNl, setFormQuestionNl] = useState<string>(initialData?.question_nl || '');
  const [formAnswerNl, setFormAnswerNl] = useState<string>(initialData?.answer_nl || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formQuestion.trim()) {
      setError('Please provide the English question.');
      setTab('en');
      return;
    }
    if (!formAnswer.trim()) {
      setError('Please provide the English answer.');
      setTab('en');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        id: initialData?.id || undefined,
        page: formPage,
        tag: formTag.trim() || 'General',
        order: Number(formOrder) || 1,
        active: formActive,
        question: formQuestion.trim(),
        answer: formAnswer.trim(),
        question_nl: formQuestionNl.trim() || formQuestion.trim(),
        answer_nl: formAnswerNl.trim() || formAnswer.trim(),
      };

      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch('/api/faqs', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        router.push('/dashboard/faqs');
        router.refresh();
      } else {
        setError(data.error || 'Failed to save FAQ item.');
      }
    } catch (err) {
      setError('An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const currentTags = SUGGESTED_TAGS[formPage] || ['General'];

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <Topbar backHref="/dashboard/faqs" />

      <div className="p-6 sm:p-8 lg:p-10 max-w-[1440px] mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif text-[#111827] tracking-tight">
              {isEdit ? 'Edit FAQ Question' : 'Add New FAQ Question'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Bilingual Dutch & English question and answer configuration for macee.com.
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <Link
              href="/dashboard/faqs"
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
              <span>{saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Save FAQ'}</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Classification & Settings */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs p-6 sm:p-7 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Placement & Tagging
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Website Page Section *
                </label>
                <CustomSelect
                  value={formPage}
                  onChange={(val) => {
                    setFormPage(val);
                    if (SUGGESTED_TAGS[val]?.[0]) {
                      setFormTag(SUGGESTED_TAGS[val][0]);
                    }
                  }}
                  options={PAGE_OPTIONS}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Category Tag
                </label>
                <input
                  type="text"
                  value={formTag}
                  onChange={(e) => setFormTag(e.target.value)}
                  placeholder="e.g. SNA NEN 4400-1"
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#E30613]"
                />
                {/* Suggestions */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {currentTags.slice(0, 3).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setFormTag(st)}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium"
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Display Order
                </label>
                <input
                  type="number"
                  min="1"
                  value={formOrder}
                  onChange={(e) => setFormOrder(Number(e.target.value))}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#E30613]"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="rounded border-slate-300 accent-[#E30613] text-[#E30613] focus:ring-[#E30613] w-4.5 h-4.5 cursor-pointer"
                />
                <span className="text-xs font-semibold text-slate-800">
                  Active & Displayed on Website
                </span>
              </label>
            </div>
          </div>

          {/* Section 2: Bilingual Question & Answer */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden">
            {/* Language Tabs */}
            <div className="flex border-b border-slate-100 bg-slate-50/70 p-2 gap-2">
              <button
                type="button"
                onClick={() => setTab('en')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all ${tab === 'en'
                  ? 'bg-white text-[#111827] shadow-2xs border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                <span>English Content (Default)</span>
              </button>
              <button
                type="button"
                onClick={() => setTab('nl')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all ${tab === 'nl'
                  ? 'bg-white text-[#111827] shadow-2xs border border-slate-200/80'
                  : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                <span>Nederlands (Dutch Translation)</span>
              </button>
            </div>

            <div className="p-6 sm:p-7 space-y-5">
              {tab === 'en' ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Question *
                    </label>
                    <input
                      type="text"
                      required
                      value={formQuestion}
                      onChange={(e) => setFormQuestion(e.target.value)}
                      placeholder="e.g. How does Macee ensure 100% compliance with Dutch SNA NEN 4400-1?"
                      className="w-full p-3.5 text-xs font-medium rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-[#E30613] shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Answer *
                    </label>
                    <textarea
                      rows={6}
                      required
                      value={formAnswer}
                      onChange={(e) => setFormAnswer(e.target.value)}
                      placeholder="Provide the full, authoritative answer..."
                      className="w-full p-3.5 text-xs rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-[#E30613] shadow-2xs leading-relaxed"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Vraag
                    </label>
                    <input
                      type="text"
                      value={formQuestionNl}
                      onChange={(e) => setFormQuestionNl(e.target.value)}
                      placeholder="e.g. Hoe garandeert Macee 100% naleving van de Nederlandse SNA NEN 4400-1?"
                      className="w-full p-3.5 text-xs font-medium rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-[#E30613] shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      Antwoord
                    </label>
                    <textarea
                      rows={6}
                      value={formAnswerNl}
                      onChange={(e) => setFormAnswerNl(e.target.value)}
                      placeholder="Voer het volledige Nederlandse antwoord in..."
                      className="w-full p-3.5 text-xs rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:border-[#E30613] shadow-2xs leading-relaxed"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="flex items-center justify-between pt-2">
            <Link
              href="/dashboard/faqs"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              ← Back to FAQs
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
              <span>{saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Save FAQ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
