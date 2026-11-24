'use client';

import React, { useEffect, useState } from 'react';
import { Topbar } from '@/components/Topbar';
import { Modal } from '@/components/Modal';
import { ImagePicker } from '@/components/ImagePicker';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { SkeletonKpiGrid, SkeletonTableRow } from '@/components/Skeleton';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  Tag,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Sparkles,
  TrendingUp,
  MoreVertical,
} from 'lucide-react';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  coverImage?: string;
  tags: string[];
  status: 'published' | 'draft';
  readTime: string;
  publishedAt: string;
}

const CATEGORIES = [
  'Compliance & Legal',
  'Immigration & Visas',
  'Workforce Strategy',
  'Market Insights',
  'Recruitment Best Practices',
];

export default function BlogManagementPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [previewBlog, setPreviewBlog] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [syncAlert, setSyncAlert] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [author, setAuthor] = useState('Macee Editorial');
  const [coverImage, setCoverImage] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [readTime, setReadTime] = useState('4 min read');

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/blogs');
      const data = await res.json();
      setBlogs(data.blogs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = [...blogs];

    if (activeTab !== 'all') {
      result = result.filter((b) => b.status === activeTab);
    }

    if (selectedCategory !== 'all') {
      result = result.filter((b) => b.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.excerpt.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q)
      );
    }

    setFilteredBlogs(result);
  }, [blogs, activeTab, selectedCategory, searchQuery]);

  const handleOpenAdd = () => {
    setEditingBlog(null);
    setTitle('');
    setSlug('');
    setCategory(CATEGORIES[0]);
    setAuthor('Macee Editorial');
    setCoverImage('');
    setExcerpt('');
    setContent('');
    setTags('Netherlands, Compliance, Workforce');
    setStatus('published');
    setReadTime('4 min read');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (blog: BlogPost) => {
    setEditingBlog(blog);
    setTitle(blog.title);
    setSlug(blog.slug);
    setCategory(blog.category || CATEGORIES[0]);
    setAuthor(blog.author || 'Macee Editorial');
    setCoverImage(blog.coverImage || '');
    setExcerpt(blog.excerpt || '');
    setContent(blog.content || '');
    setTags((blog.tags || []).join(', '));
    setStatus(blog.status || 'published');
    setReadTime(blog.readTime || '4 min read');
    setIsModalOpen(true);
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const parsedTags = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const generatedSlug =
        slug.trim() ||
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');

      const payload = {
        id: editingBlog ? editingBlog.id : undefined,
        title,
        slug: generatedSlug,
        category,
        author,
        coverImage,
        excerpt,
        content,
        tags: parsedTags,
        status,
        readTime,
      };

      const method = editingBlog ? 'PUT' : 'POST';
      const res = await fetch('/api/blogs', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchBlogs();
        setSyncAlert(true);
        setTimeout(() => setSyncAlert(false), 3000);
      }
    } catch (e) {
      alert('Failed to save article');
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

  const handleDeleteBlog = (blog: BlogPost) => {
    setDeleteDialog({
      isOpen: true,
      title: 'Delete Article',
      description: 'Are you sure you want to delete this article? This action cannot be undone.',
      itemName: blog.title,
      isLoading: false,
      onConfirm: async () => {
        setDeleteDialog((prev) => ({ ...prev, isLoading: true }));
        try {
          const res = await fetch(`/api/blogs?id=${blog.id}`, { method: 'DELETE' });
          const data = await res.json();
          if (data.success) {
            setBlogs((prev) => prev.filter((b) => b.id !== blog.id));
            setDeleteDialog((prev) => ({ ...prev, isOpen: false, isLoading: false }));
          } else {
            alert('Failed to delete blog');
            setDeleteDialog((prev) => ({ ...prev, isLoading: false }));
          }
        } catch (e) {
          alert('Failed to delete blog');
          setDeleteDialog((prev) => ({ ...prev, isLoading: false }));
        }
      },
    });
  };

  const publishedCount = blogs.filter((b) => b.status === 'published').length || 0;
  const draftCount = blogs.filter((b) => b.status === 'draft').length || 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Topbar
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Articles & Blogs' },
        ]}
        searchPlaceholder="Search articles..."
        onSearch={(q) => setSearchQuery(q)}
      />

      <div className="p-6 sm:p-8 lg:p-10 max-w-[1440px] mx-auto space-y-6">
        {/* Page Header (Editorial Serif) */}
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-serif text-[#111827] tracking-tight">
            Articles & Blogs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Draft, edit, and publish thought leadership articles for macee.com.
          </p>
        </div>

        {/* 4 KPI Metric Cards */}
        {loading ? (
          <SkeletonKpiGrid count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-[#EAF0FC] text-[#36427D] flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Total Articles</p>
                <div className="flex items-baseline space-x-2 mt-0.5">
                  <span className="text-2xl sm:text-3xl font-bold text-[#111827] font-sans">
                    {blogs.length > 0 ? blogs.length : 0}
                  </span>
                  <span className="text-xs font-semibold text-emerald-600">Active</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-[#EAF0FC] text-[#36427D] flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Published on Web</p>
                <div className="mt-0.5">
                  <span className="text-2xl sm:text-3xl font-bold text-[#111827] font-sans">
                    {publishedCount}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-[#EAF0FC] text-[#36427D] flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Drafts</p>
                <div className="mt-0.5">
                  <span className="text-2xl sm:text-3xl font-bold text-[#111827] font-sans">
                    {draftCount}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-[#EAF0FC] text-[#36427D] flex items-center justify-center shrink-0">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Topic Categories</p>
                <div className="mt-0.5">
                  <span className="text-2xl sm:text-3xl font-bold text-[#111827] font-sans">
                    {new Set(blogs.map((b) => b.category).filter(Boolean)).size}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Tabs */}
        <div className="flex items-center space-x-6 border-b border-slate-200 text-xs font-medium pt-2">
          {[
            { id: 'all', label: 'All Articles' },
            { id: 'published', label: 'Published' },
            { id: 'draft', label: 'Drafts' },
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

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white border border-slate-200/90 text-slate-700 text-xs font-medium rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#E30613] shadow-2xs"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search articles by title or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200/90 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#E30613] shadow-2xs"
              />
            </div>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-[#E30613] hover:bg-[#b80510] text-white text-xs font-semibold shadow-xs transition-all shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Article</span>
          </button>
        </div>

        {syncAlert && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between animate-fadeIn">
            <span>✓ Article saved and synchronized with website blogs!</span>
          </div>
        )}

        {/* Articles Table Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold">
                  <th className="py-3 px-4">Title & Excerpt</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4">Read Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonTableRow key={i} cols={6} />
                  ))
                ) : filteredBlogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No articles found.
                    </td>
                  </tr>
                ) : (
                  filteredBlogs.map((blog) => (
                    <tr key={blog.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 max-w-md">
                        <p className="font-bold text-[#111827] truncate font-sans">
                          {blog.title}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {blog.excerpt}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-semibold bg-[#F0F3FA] text-[#36427D]">
                          {blog.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium whitespace-nowrap">
                        {blog.author}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {blog.readTime}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {blog.status === 'published' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span>Published</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <span>Draft</span>
                          </span>
                        )}
                      </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => handleOpenEdit(blog)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-[#111827] hover:bg-slate-100 transition-colors"
                              title="Edit article"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteBlog(blog)}
                              className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                              title="Delete article"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit/Create Modal */}
      {isModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsModalOpen(false)}
          title={editingBlog ? 'Edit Article' : 'Create New Article'}
          subtitle="Articles will display on macee.com/blogs and synchronize automatically."
          maxWidth="2xl"
        >
          <form onSubmit={handleSaveBlog} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Article Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Navigating European Labor Regulations in 2026"
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#E30613]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#E30613]"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#E30613]"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            <ImagePicker
              value={coverImage}
              onChange={(newUrl) => setCoverImage(newUrl)}
              label="Article Cover Image"
              helperText="Paste direct image URL. (Direct photo upload requires plan upgrade)."
              previewShape="rounded"
              aspect="wide"
            />

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Short Excerpt *</label>
              <textarea
                required
                rows={2}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Brief summary appearing on blog listing cards..."
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#E30613]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Article Content</label>
              <textarea
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write the complete article content..."
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#E30613]"
              />
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button type="submit" disabled={saving} className="is-btn py-2 px-5 text-xs font-semibold">
                {saving ? 'Saving...' : 'Save & Publish'}
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
