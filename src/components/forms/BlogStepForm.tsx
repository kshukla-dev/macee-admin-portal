'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Topbar } from '@/components/Topbar';
import { ImagePicker } from '@/components/ImagePicker';
import { CustomSelect } from '@/components/CustomSelect';
import { RichTextEditor } from '@/components/RichTextEditor';
import { formatArticleHtml } from '@/lib/formatArticleHtml';
import {
  FileText,
  Image as ImageIcon,
  Tag,
  UserCheck,
  ArrowLeft,
  ArrowRight,
  Check,
  Save,
  Clock,
  Sparkles,
  Eye,
  Code,
  Type,
  Plus,
  Trash2,
  Edit2,
  X,
  Calendar,
  AlertCircle,
  ExternalLink,
  Loader2,
} from 'lucide-react';

export interface BlogContributor {
  personId?: string;
  name: string;
  role: 'Author' | 'Reviewer' | 'Editor' | 'Contributor';
  avatar?: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  coverImageAlt?: string;
  coverImageUrl?: string;
  author: string;
  authorId?: string;
  authorRole?: string;
  authorAvatar?: string;
  contributors?: BlogContributor[];
  category: string;
  categories: string[];
  relatedPosts?: string[];
  estimatedReadingTime?: number;
  readTime: string;
  tags: string[];
  status: 'published' | 'draft';
  publishedAt: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  image?: string;
}

const DEFAULT_CATEGORIES = [
  'Compliance & Legal',
  'Immigration & Visas',
  'Workforce Strategy',
  'Market Insights',
  'Recruitment Best Practices',
];

function formatCategoryTitleCase(value: string): string {
  return value.replace(/(^|\s|[&/\-])([a-z])/g, (_, sep, char) => sep + char.toUpperCase());
}

const CONTRIBUTOR_ROLES: Array<'Author' | 'Reviewer' | 'Editor' | 'Contributor'> = [
  'Author',
  'Reviewer',
  'Editor',
  'Contributor',
];

interface BlogStepFormProps {
  initialData?: BlogPost | null;
  isEdit?: boolean;
}

export function BlogStepForm({ initialData, isEdit = false }: BlogStepFormProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [isCustomSlug, setIsCustomSlug] = useState(Boolean(initialData?.slug));
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [contentViewMode, setContentViewMode] = useState<'rich' | 'code' | 'preview'>('rich');
  const codeTextareaRef = useRef<HTMLTextAreaElement>(null);

  const insertCodeSnippet = (before: string, after = '', placeholderText = 'text') => {
    const textarea = codeTextareaRef.current;
    if (!textarea) {
      setContent((prev) => `${prev}${before}${placeholderText}${after}`);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.slice(start, end) || placeholderText;
    const nextValue = content.slice(0, start) + before + selected + after + content.slice(end);
    setContent(nextValue);
    requestAnimationFrame(() => {
      textarea.focus();
      const cursorStart = start + before.length;
      const cursorEnd = cursorStart + selected.length;
      textarea.setSelectionRange(cursorStart, cursorEnd);
    });
  };

  // Media
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || '');
  const [coverImageAlt, setCoverImageAlt] = useState(initialData?.coverImageAlt || '');
  const [estimatedReadingTime, setEstimatedReadingTime] = useState<number>(
    initialData?.estimatedReadingTime || 4
  );

  // Categories & Tags
  const [availableCategories, setAvailableCategories] = useState<string[]>(() => {
    const initial = [...DEFAULT_CATEGORIES];
    const existing = Array.isArray(initialData?.categories)
      ? initialData.categories
      : initialData?.category
        ? [initialData.category]
        : [];
    for (const c of existing) {
      if (c && !initial.some((item) => item.toLowerCase() === c.toLowerCase())) {
        initial.push(c);
      }
    }
    return initial;
  });
  const [isAddingCustomCategory, setIsAddingCustomCategory] = useState(false);
  const [editingCategoryOriginal, setEditingCategoryOriginal] = useState<string | null>(null);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [categories, setCategories] = useState<string[]>(
    initialData?.categories && initialData.categories.length > 0
      ? initialData.categories
      : initialData?.category
        ? [initialData.category]
        : ['Compliance & Legal']
  );
  const [tags, setTags] = useState<string>(
    Array.isArray(initialData?.tags) ? initialData.tags.join(', ') : ''
  );

  // Author & Contributors
  const [author, setAuthor] = useState(initialData?.author || '');
  const [authorId, setAuthorId] = useState(initialData?.authorId || '');
  const [authorRole, setAuthorRole] = useState(initialData?.authorRole || '');
  const [authorAvatar, setAuthorAvatar] = useState(initialData?.authorAvatar || '');
  const [contributors, setContributors] = useState<BlogContributor[]>(
    initialData?.contributors || []
  );

  // Contributor Add Temp State
  const [newContribPersonId, setNewContribPersonId] = useState('');
  const [newContribCustomName, setNewContribCustomName] = useState('');
  const [newContribRole, setNewContribRole] = useState<'Author' | 'Reviewer' | 'Editor' | 'Contributor'>('Reviewer');

  // Status
  const [status, setStatus] = useState<'published' | 'draft'>(
    initialData?.status || 'published'
  );

  // Load team members for author dropdown
  useEffect(() => {
    fetch('/api/team')
      .then((res) => res.json())
      .then((data) => {
        const team: TeamMember[] = data.team || [];
        setTeamMembers(team);
        if (!author && team.length > 0 && !isEdit) {
          setAuthor(team[0].name);
          setAuthorId(team[0].id);
          setAuthorRole(team[0].role);
          setAuthorAvatar(team[0].image || '');
        }
      })
      .catch((e) => console.error(e));
  }, []);

  // Load persisted topic categories from /api/blog-categories
  useEffect(() => {
    let mounted = true;
    fetch('/api/blog-categories')
      .then((res) => res.json())
      .then((data) => {
        if (!mounted || !Array.isArray(data.categories)) return;
        const loaded: string[] = [...data.categories];
        const existing = Array.isArray(initialData?.categories)
          ? initialData.categories
          : initialData?.category
            ? [initialData.category]
            : [];
        for (const c of existing) {
          if (c && !loaded.some((item) => item.toLowerCase() === c.toLowerCase())) {
            loaded.push(c);
          }
        }
        setAvailableCategories(loaded);
      })
      .catch(() => { });
    return () => {
      mounted = false;
    };
  }, [initialData?.categories, initialData?.category]);

  const isDefaultCategory = (cat: string) =>
    DEFAULT_CATEGORIES.some((def) => def.toLowerCase() === cat.toLowerCase());

  const handleSaveCustomCategory = async () => {
    const formatted = formatCategoryTitleCase(customCategoryInput.trim());
    if (!formatted) return;

    if (editingCategoryOriginal) {
      const oldName = editingCategoryOriginal;
      const hasNewAlready = availableCategories.some(
        (c) => c.toLowerCase() === formatted.toLowerCase() && c.toLowerCase() !== oldName.toLowerCase()
      );
      const updated = availableCategories
        .map((c) => (c.toLowerCase() === oldName.toLowerCase() ? (hasNewAlready ? null : formatted) : c))
        .filter((c): c is string => Boolean(c));

      setAvailableCategories(updated);
      setCategories((prev) =>
        Array.from(
          new Set(
            prev.map((c) => (c.toLowerCase() === oldName.toLowerCase() ? formatted : c))
          )
        )
      );

      try {
        await fetch('/api/blog-categories', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ oldName, newName: formatted }),
        });
      } catch { }
    } else {
      const existing = availableCategories.find(
        (c) => c.toLowerCase() === formatted.toLowerCase()
      );
      if (existing) {
        if (!categories.includes(existing)) {
          setCategories((prev) => [...prev, existing]);
        }
      } else {
        setAvailableCategories((prev) => [...prev, formatted]);
        setCategories((prev) => [...prev, formatted]);
        try {
          await fetch('/api/blog-categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: formatted }),
          });
        } catch { }
      }
    }

    setCustomCategoryInput('');
    setEditingCategoryOriginal(null);
    setIsAddingCustomCategory(false);
  };

  const handleEditCategoryOption = (cat: string) => {
    setEditingCategoryOriginal(cat);
    setCustomCategoryInput(cat);
    setIsAddingCustomCategory(true);
  };

  const handleDeleteCategoryOption = async (cat: string) => {
    setAvailableCategories((prev) =>
      prev.filter((c) => c.toLowerCase() !== cat.toLowerCase())
    );
    setCategories((prev) =>
      prev.filter((c) => c.toLowerCase() !== cat.toLowerCase())
    );
    try {
      await fetch(`/api/blog-categories?name=${encodeURIComponent(cat)}`, {
        method: 'DELETE',
      });
    } catch { }
  };

  // Helper to generate slug from title
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 120);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isCustomSlug) {
      setSlug(generateSlug(val));
    }
  };

  // Auto calculate reading time when content changes
  useEffect(() => {
    if (content.trim()) {
      const words = content.trim().split(/\s+/).length;
      const calculated = Math.max(1, Math.ceil(words / 180));
      if (!initialData || estimatedReadingTime === 4) {
        setEstimatedReadingTime(calculated);
      }
    }
  }, [content]);

  // Step Validation
  const validateStep = (step: number): boolean => {
    setValidationError(null);
    if (step === 1) {
      if (!title.trim()) {
        setValidationError('Please enter an article title.');
        return false;
      }
      if (!excerpt.trim()) {
        setValidationError('Please enter a brief excerpt or summary for the article.');
        return false;
      }
      if (!content.trim()) {
        setValidationError('Please enter the full article content.');
        return false;
      }
    } else if (step === 3) {
      if (categories.length === 0) {
        setValidationError('Please select at least one topic category.');
        return false;
      }
    } else if (step === 4) {
      if (!author.trim()) {
        setValidationError('Please specify or select an author for this article.');
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(4, prev + 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setValidationError(null);
    setCurrentStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleCategory = (cat: string) => {
    setCategories((prev) => {
      if (prev.includes(cat)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter((c) => c !== cat);
      } else {
        return [...prev, cat];
      }
    });
  };

  const handleSelectAuthor = (memberId: string) => {
    if (memberId === 'custom') {
      setAuthorId('');
      setAuthor('');
      setAuthorRole('');
      setAuthorAvatar('');
      return;
    }
    const member = teamMembers.find((m) => m.id === memberId);
    if (member) {
      setAuthorId(member.id);
      setAuthor(member.name);
      setAuthorRole(member.role);
      setAuthorAvatar(member.image || '');
    }
  };

  const handleAddContributor = () => {
    if (newContribPersonId) {
      const member = teamMembers.find((m) => m.id === newContribPersonId);
      if (member) {
        setContributors((prev) => [
          ...prev,
          {
            personId: member.id,
            name: member.name,
            role: newContribRole,
            avatar: member.image,
          },
        ]);
        setNewContribPersonId('');
        return;
      }
    }
    if (newContribCustomName.trim()) {
      setContributors((prev) => [
        ...prev,
        {
          name: newContribCustomName.trim(),
          role: newContribRole,
        },
      ]);
      setNewContribCustomName('');
    }
  };

  const handleRemoveContributor = (index: number) => {
    setContributors((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveArticle = async (forcedStatus?: 'published' | 'draft') => {
    const finalStatus = forcedStatus || status;

    if (!title.trim()) {
      setCurrentStep(1);
      setValidationError('Title is required before saving.');
      return;
    }

    try {
      setSaving(true);
      const parsedTags = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        id: initialData?.id || undefined,
        title: title.trim(),
        slug: (slug.trim() || generateSlug(title)).slice(0, 120),
        excerpt: excerpt.trim(),
        content: content.trim(),
        coverImage: coverImage.trim() || undefined,
        coverImageAlt: coverImageAlt.trim() || title.trim(),
        author: author.trim() || 'Macee Editorial Desk',
        authorId: authorId || undefined,
        authorRole: authorRole.trim() || 'Workforce Specialist',
        authorAvatar: authorAvatar || undefined,
        contributors,
        category: categories[0] || 'Compliance & Legal',
        categories: categories.length > 0 ? categories : ['Compliance & Legal'],
        tags: parsedTags,
        estimatedReadingTime: Number(estimatedReadingTime) || 4,
        readTime: `${estimatedReadingTime} min read`,
        status: finalStatus,
        publishedAt: initialData?.publishedAt || new Date().toISOString(),
      };

      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch('/api/blogs', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        router.push('/dashboard/blogs');
        router.refresh();
      } else {
        alert(data.error || 'Failed to save blog post');
      }
    } catch (e) {
      alert('Error saving blog post');
    } finally {
      setSaving(false);
    }
  };

  const STEPS = [
    { number: 1, title: 'Content & Essentials', desc: 'Title, slug, excerpt & text', icon: FileText },
    { number: 2, title: 'Media & Reading Time', desc: 'Cover photo & read duration', icon: ImageIcon },
    { number: 3, title: 'Categories & Tags', desc: 'Topics, classifications & SEO', icon: Tag },
    { number: 4, title: 'Author & Publish', desc: 'Contributors & live status', icon: UserCheck },
  ];

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <Topbar backHref="/dashboard/blogs" />

      <div className="p-6 sm:p-8 lg:p-10 max-w-[1440px] mx-auto space-y-6">
        {/* Top Header with Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif text-[#111827] tracking-tight">
              {isEdit ? 'Edit Article' : 'Create New Article'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Thought leadership articles, compliance news, and labor market guides for macee.com
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSaveArticle('draft')}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>Save as Draft</span>
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={() => handleSaveArticle()}
              className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-[#E30613] hover:bg-[#b80510] text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>{saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Publish Article'}</span>
            </button>
          </div>
        </div>

        {/* Step Indicator Wizard Bar */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs p-4 sm:p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {STEPS.map((s) => {
              const isCurrent = currentStep === s.number;
              const isCompleted = currentStep > s.number;
              const Icon = s.icon;

              return (
                <button
                  key={s.number}
                  type="button"
                  onClick={() => {
                    if (s.number < currentStep || validateStep(currentStep)) {
                      setCurrentStep(s.number);
                    }
                  }}
                  className={`flex items-center space-x-3 p-3 rounded-xl text-left transition-all ${isCurrent
                    ? 'bg-rose-50/80 border border-[#E30613]/30 ring-1 ring-[#E30613]/20 shadow-2xs'
                    : isCompleted
                      ? 'bg-slate-50 border border-slate-200/80 hover:bg-slate-100/80'
                      : 'border border-transparent hover:bg-slate-50 opacity-60'
                    }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs transition-colors ${isCurrent
                      ? 'bg-[#E30613] text-white shadow-xs'
                      : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-500'
                      }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : s.number}
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`text-xs font-bold truncate ${isCurrent ? 'text-[#E30613]' : 'text-slate-800'
                        }`}
                    >
                      {s.title}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate hidden sm:block">
                      {s.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span className="font-semibold">{validationError}</span>
          </div>
        )}

        {/* Form Content Steps Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs p-6 sm:p-8 space-y-6">
          {/* ==============================================================
              STEP 1: CONTENT & ESSENTIALS
              ============================================================== */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base font-bold text-[#111827] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#E30613]" />
                  <span>Step 1: Article Content & Story</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Write the main headline, SEO slug, teaser excerpt, and article body.
                </p>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Navigating Dutch DBA Regulations in 2026: What Hirers and Contractors Must Know"
                  className="w-full p-3.5 text-sm font-semibold rounded-xl border border-slate-200/90 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#E30613] focus:ring-2 focus:ring-[#E30613]/20 shadow-2xs"
                />
              </div>

              {/* URL Slug */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    URL Slug
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomSlug(!isCustomSlug)}
                    className="text-[11px] font-semibold text-[#E30613] hover:underline"
                  >
                    {isCustomSlug ? '✓ Reset to Auto Slug' : '✎ Edit Custom Slug'}
                  </button>
                </div>
                <div className="flex items-center rounded-xl border border-slate-200/90 bg-slate-50/70 overflow-hidden text-xs text-slate-500 shadow-2xs">
                  <span className="px-3.5 py-3 font-mono text-[11px] border-r border-slate-200 bg-slate-100/80 text-slate-500 select-none">
                    macee.com/blogs/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    readOnly={!isCustomSlug}
                    onChange={(e) => setSlug(generateSlug(e.target.value))}
                    className="flex-1 p-3 bg-transparent text-slate-900 font-mono text-xs focus:outline-none"
                    placeholder="navigating-dutch-dba-regulations-2026"
                  />
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Short Excerpt / Teaser *
                </label>
                <textarea
                  rows={3}
                  required
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="A concise 1-2 sentence preview shown on article listing cards and Google search snippets..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-200/90 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#E30613] focus:ring-2 focus:ring-[#E30613]/20 shadow-2xs"
                />
              </div>

              {/* Content Body */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <label className="text-xs font-bold text-slate-800">
                      Article Full Content *
                    </label>
                    <span className="px-2 py-0.5 rounded-md text-[10.5px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      HTML & Markdown Supported
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-[11px] text-slate-400 font-mono">
                      {(() => {
                        const plain = content.replace(/<[^>]*>/g, ' ').trim();
                        return plain ? plain.split(/\s+/).length : 0;
                      })()}{' '}
                      words
                    </span>

                    {/* Mode Toggle Tabs */}
                    <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                      <button
                        type="button"
                        onClick={() => setContentViewMode('rich')}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center space-x-1 ${contentViewMode === 'rich'
                          ? 'bg-white text-slate-900 shadow-2xs font-bold'
                          : 'text-slate-500 hover:text-slate-900'
                          }`}
                      >
                        <span>Text</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setContentViewMode('code')}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center space-x-1 ${contentViewMode === 'code'
                          ? 'bg-white text-slate-900 shadow-2xs font-bold'
                          : 'text-slate-500 hover:text-slate-900'
                          }`}
                      >
                        <Code className="w-3.5 h-3.5" />
                        <span>HTML / Markdown</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setContentViewMode('preview')}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center space-x-1 ${contentViewMode === 'preview'
                          ? 'bg-white text-slate-900 shadow-2xs font-bold'
                          : 'text-slate-500 hover:text-slate-900'
                          }`}
                      >
                        <Eye className="w-3.5 h-3.5 text-[#E30613]" />
                        <span>Live Preview</span>
                      </button>
                    </div>
                  </div>
                </div>

                {contentViewMode === 'rich' ? (
                  <RichTextEditor
                    value={content}
                    onChange={setContent}
                    placeholder="Write and format your article content here..."
                  />
                ) : contentViewMode === 'code' ? (
                  <div className="rounded-xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden focus-within:border-[#E30613] focus-within:ring-2 focus-within:ring-[#E30613]/20">
                    {/* Quick Formatting Tag Bar */}
                    <div className="bg-slate-50/90 border-b border-slate-200/80 px-3 py-2 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10.5px] font-semibold text-slate-400 mr-1">
                        Insert Tag:
                      </span>
                      {[
                        { label: 'H2', before: '<h2>', after: '</h2>', sample: 'Section Heading' },
                        { label: 'H3', before: '<h3>', after: '</h3>', sample: 'Subheading' },
                        { label: 'P', before: '<p>', after: '</p>', sample: 'Paragraph text' },
                        { label: 'Bold', before: '<strong>', after: '</strong>', sample: 'bold text' },
                        { label: 'Italic', before: '<em>', after: '</em>', sample: 'italic text' },
                        { label: 'Link', before: '<a href="https://">', after: '</a>', sample: 'Link Text' },
                        { label: 'Quote', before: '<blockquote><p>', after: '</p></blockquote>', sample: 'Quoted text' },
                        { label: 'UL', before: '<ul>\n  <li>', after: '</li>\n</ul>', sample: 'List item' },
                        { label: 'OL', before: '<ol>\n  <li>', after: '</li>\n</ol>', sample: 'Step 1' },
                        { label: 'MD ##', before: '\n## ', after: '\n', sample: 'Markdown Heading' },
                        { label: 'MD **', before: '**', after: '**', sample: 'bold' },
                      ].map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => insertCodeSnippet(item.before, item.after, item.sample)}
                          className="px-2 py-1 rounded-md bg-white border border-slate-200/90 hover:border-[#E30613] hover:text-[#E30613] text-[11px] font-mono font-semibold text-slate-600 transition-colors cursor-pointer"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                    <textarea
                      ref={codeTextareaRef}
                      rows={14}
                      required
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write or paste your article HTML (e.g. <h2>Title</h2>, <p>Paragraph with <strong>bold</strong> text</p>, <ul><li>List items</li></ul>) or Markdown here..."
                      className="w-full p-4 text-xs font-mono text-slate-800 placeholder-slate-400 focus:outline-none leading-relaxed resize-y"
                    />
                  </div>
                ) : (
                  <div className="min-h-[350px] p-6 rounded-xl border border-slate-200 bg-white shadow-2xs overflow-y-auto max-h-[500px]">
                    {content.trim() ? (
                      <div
                        className="article-content"
                        dangerouslySetInnerHTML={{ __html: formatArticleHtml(content) }}
                      />
                    ) : (
                      <div className="h-48 flex flex-col items-center justify-center text-slate-400 text-xs italic">
                        <FileText className="w-8 h-8 text-slate-300 mb-2 stroke-1" />
                        <span>No content entered yet. Type or paste HTML in the editor tab to preview it here.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==============================================================
              STEP 2: MEDIA & READING TIME
              ============================================================== */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base font-bold text-[#111827] flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-[#E30613]" />
                  <span>Step 2: Cover Media & Reading Time</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Add high-resolution article imagery and customize calculated reading time.
                </p>
              </div>

              {/* Cover Image Picker */}
              <div>
                <ImagePicker
                  value={coverImage}
                  onChange={(val) => setCoverImage(val)}
                  label="Cover Image"
                  previewShape="rounded"
                  helperText=""
                />
              </div>

              {/* Image Alt Text */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Image Alt Text (SEO & Accessibility)
                </label>
                <input
                  type="text"
                  value={coverImageAlt}
                  onChange={(e) => setCoverImageAlt(e.target.value)}
                  placeholder="e.g. Dutch labor court and corporate contract documents"
                  className="w-full p-3 text-xs rounded-xl border border-slate-200/90 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#E30613] shadow-2xs"
                />
              </div>

              {/* Estimated Reading Time */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs">
                    <Clock className="w-5 h-5 text-[#E30613]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Estimated Reading Time</h4>
                    <p className="text-[11px] text-slate-500">
                      Calculated at ~180 words per minute. Readers will see "{estimatedReadingTime} min read".
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setEstimatedReadingTime((p) => Math.max(1, p - 1))}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-200 font-bold text-sm text-slate-700 hover:bg-slate-100 flex items-center justify-center shadow-2xs"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-xs font-bold text-slate-900">
                    {estimatedReadingTime} min
                  </span>
                  <button
                    type="button"
                    onClick={() => setEstimatedReadingTime((p) => p + 1)}
                    className="w-8 h-8 rounded-lg bg-white border border-slate-200 font-bold text-sm text-slate-700 hover:bg-slate-100 flex items-center justify-center shadow-2xs"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==============================================================
              STEP 3: CATEGORIES & TAGS
              ============================================================== */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base font-bold text-[#111827] flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#E30613]" />
                  <span>Step 3: Categories & Classification Tags</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Assign official categories and keyword tags for filtering on macee.com/blogs.
                </p>
              </div>

              {/* Categories */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Topic Categories * (Select one or more)
                  </label>
                  {!isAddingCustomCategory && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategoryOriginal(null);
                        setIsAddingCustomCategory(true);
                        setCustomCategoryInput('');
                      }}
                      className="inline-flex items-center space-x-1 text-[11px] font-semibold text-[#E30613] hover:text-[#b80510] transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add New</span>
                    </button>
                  )}
                </div>

                {isAddingCustomCategory && (
                  <div className="flex items-center space-x-2 mb-3">
                    <input
                      type="text"
                      autoFocus
                      value={customCategoryInput}
                      onChange={(e) =>
                        setCustomCategoryInput(formatCategoryTitleCase(e.target.value))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSaveCustomCategory();
                        } else if (e.key === 'Escape') {
                          e.preventDefault();
                          setIsAddingCustomCategory(false);
                          setEditingCategoryOriginal(null);
                          setCustomCategoryInput('');
                        }
                      }}
                      placeholder={
                        editingCategoryOriginal
                          ? 'Rename category...'
                          : 'e.g. Global Mobility & Tax'
                      }
                      className="flex-1 p-2.5 text-xs rounded-xl border border-[#E30613] bg-white focus:outline-none focus:ring-2 focus:ring-[#E30613]/25 shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={handleSaveCustomCategory}
                      disabled={!customCategoryInput.trim()}
                      className="px-3.5 py-2.5 rounded-xl bg-[#E30613] hover:bg-[#b80510] text-white text-xs font-semibold shadow-2xs transition-all disabled:opacity-40 cursor-pointer shrink-0"
                    >
                      {editingCategoryOriginal ? 'Save' : 'Add'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingCustomCategory(false);
                        setEditingCategoryOriginal(null);
                        setCustomCategoryInput('');
                      }}
                      title="Cancel"
                      aria-label="Cancel category edit"
                      className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 transition-all cursor-pointer shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {availableCategories.map((cat) => {
                    const isSelected = categories.includes(cat);
                    const isCustom = !isDefaultCategory(cat);
                    return (
                      <div
                        key={cat}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleToggleCategory(cat)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleToggleCategory(cat);
                          }
                        }}
                        className={`p-3.5 rounded-xl border text-xs font-semibold text-left flex items-center justify-between transition-all cursor-pointer ${isSelected
                          ? 'bg-rose-50/80 border-[#E30613] text-[#b80510] shadow-2xs'
                          : 'bg-white border-slate-200/90 text-slate-700 hover:border-slate-300'
                          }`}
                      >
                        <span className="truncate pr-2">{cat}</span>
                        <div className="flex items-center space-x-1 shrink-0">
                          {isSelected && <Check className="w-4 h-4 text-[#E30613]" />}
                          {isCustom && (
                            <>
                              <button
                                type="button"
                                title={`Edit ${cat}`}
                                aria-label={`Edit ${cat}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditCategoryOption(cat);
                                }}
                                className="p-1 rounded-md text-slate-400 hover:text-[#111827] hover:bg-slate-200/70 transition-colors cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                title={`Remove ${cat}`}
                                aria-label={`Remove ${cat}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCategoryOption(cat);
                                }}
                                className="p-1 rounded-md text-slate-400 hover:text-[#E30613] hover:bg-rose-100/80 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tags Input */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Search & SEO Tags
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Netherlands, IND Visa, DBA Law, IT Contractors, Compliance"
                  className="w-full p-3 text-xs rounded-xl border border-slate-200/90 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#E30613] shadow-2xs"
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Separate tags with commas. These help website visitors find this article via search.
                </p>

                {/* Tags Preview Pills */}
                {tags.trim() && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {tags
                      .split(',')
                      .map((t) => t.trim())
                      .filter(Boolean)
                      .map((tag, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ==============================================================
              STEP 4: AUTHOR & PUBLISHING
              ============================================================== */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base font-bold text-[#111827] flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#E30613]" />
                  <span>Step 4: Author Credentials & Publishing Status</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Assign primary author, optional contributors, and set whether this article goes live.
                </p>
              </div>

              {/* Author Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Primary Author from Team Profiles *
                  </label>
                  <CustomSelect
                    value={authorId || 'custom'}
                    onChange={handleSelectAuthor}
                    options={[
                      ...teamMembers.map((m) => ({
                        value: m.id,
                        label: `${m.name} (${m.role})`,
                      })),
                      { value: 'custom', label: 'Custom Author Name...' },
                    ]}
                    placeholder="Select Team Member Author"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Author Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g. Maarten Koekebakker"
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200/90 text-slate-800 focus:outline-none focus:border-[#E30613] shadow-2xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Author Job Role / Title
                  </label>
                  <input
                    type="text"
                    value={authorRole}
                    onChange={(e) => setAuthorRole(e.target.value)}
                    placeholder="e.g. Founder & Managing Director, Macee BV"
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200/90 text-slate-800 focus:outline-none focus:border-[#E30613] shadow-2xs"
                  />
                </div>
              </div>

              {/* Co-Contributors Section */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Co-Authors & Contributors</h4>
                    <p className="text-[11px] text-slate-500">
                      Add reviewers, editors, or legal compliance contributors.
                    </p>
                  </div>
                </div>

                {contributors.length > 0 && (
                  <div className="space-y-2">
                    {contributors.map((c, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-slate-900">{c.name}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EAF0FC] text-[#36427D]">
                            {c.role}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveContributor(idx)}
                          className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Contributor Input */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newContribCustomName}
                    onChange={(e) => setNewContribCustomName(e.target.value)}
                    placeholder="Contributor Name..."
                    className="flex-1 p-2 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                  <div className="w-40">
                    <CustomSelect
                      value={newContribRole}
                      onChange={(val) => setNewContribRole(val as any)}
                      options={CONTRIBUTOR_ROLES}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddContributor}
                    className="px-3.5 py-2 rounded-lg bg-[#0E1726] hover:bg-black text-white text-xs font-semibold shrink-0"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Publication Status Toggle Cards */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  Publication Status
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setStatus('published')}
                    className={`p-4 rounded-xl border text-left transition-all ${status === 'published'
                      ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-800">Published (Live)</span>
                      {status === 'published' && <Check className="w-4 h-4 text-emerald-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Immediately visible to public website visitors on macee.com/blogs.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('draft')}
                    className={`p-4 rounded-xl border text-left transition-all ${status === 'draft'
                      ? 'bg-amber-50/80 border-amber-500 ring-2 ring-amber-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-800">Draft (Private)</span>
                      {status === 'draft' && <Check className="w-4 h-4 text-amber-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Saved safely in admin portal for editorial review without public release.
                    </p>
                  </button>
                </div>
              </div>

              {/* Summary Review Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 text-xs space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Quick Summary Review
                </span>
                <p className="font-bold text-slate-900 text-[13px]">{title || 'Untitled Article'}</p>
                <p className="text-slate-600 text-xs italic">"{excerpt || 'No excerpt provided.'}"</p>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                  <span>Author: <strong className="text-slate-800">{author || 'Macee Desk'}</strong></span>
                  <span>•</span>
                  <span>Category: <strong className="text-slate-800">{categories.join(', ')}</strong></span>
                  <span>•</span>
                  <span>Read Time: <strong className="text-slate-800">{estimatedReadingTime} min</strong></span>
                </div>
              </div>
            </div>
          )}

          {/* Step Navigation Bottom Toolbar */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous Step</span>
              </button>
            ) : (
              <Link
                href="/dashboard/blogs"
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold shadow-2xs transition-all"
              >
                <span>Cancel</span>
              </Link>
            )}

            <div className="flex items-center space-x-2">
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-[#0E1726] hover:bg-black text-white text-xs font-semibold shadow-xs transition-all"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSaveArticle()}
                  className="inline-flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-[#E30613] hover:bg-[#b80510] text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>{saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Publish Article'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
