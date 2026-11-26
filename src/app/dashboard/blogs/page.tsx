'use client';

import React, { useEffect, useState } from 'react';
import { Topbar } from '@/components/Topbar';
import { Modal } from '@/components/Modal';
import { ImagePicker } from '@/components/ImagePicker';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { SkeletonTableRow } from '@/components/Skeleton';
import {
  FileText,
  Plus,
  Search,
  Clock,
  Tag,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  BookOpen,
  Sparkles,
  Users,
  UserPlus,
  Link2,
  Check,
  X,
  ExternalLink,
  ChevronDown,
  Layers,
  Info,
  Calendar,
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

const CATEGORIES = [
  'Compliance & Legal',
  'Immigration & Visas',
  'Workforce Strategy',
  'Market Insights',
  'Recruitment Best Practices',
];

const CONTRIBUTOR_ROLES: Array<'Author' | 'Reviewer' | 'Editor' | 'Contributor'> = [
  'Author',
  'Reviewer',
  'Editor',
  'Contributor',
];

export default function BlogManagementPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewBlog, setPreviewBlog] = useState<BlogPost | null>(null);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [syncAlert, setSyncAlert] = useState(false);

  // Form Fields (All 10 required fields + content/tags/status)
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isCustomSlug, setIsCustomSlug] = useState(false);
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [coverImageAlt, setCoverImageAlt] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [author, setAuthor] = useState('');
  const [authorId, setAuthorId] = useState('');
  const [authorRole, setAuthorRole] = useState('');
  const [contributors, setContributors] = useState<BlogContributor[]>([]);
  const [categories, setCategories] = useState<string[]>(['Compliance & Legal']);
  const [relatedPosts, setRelatedPosts] = useState<string[]>([]);
  const [estimatedReadingTime, setEstimatedReadingTime] = useState<number>(4);
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('published');

  // Contributor Add Temp State
  const [newContribPersonId, setNewContribPersonId] = useState('');
  const [newContribCustomName, setNewContribCustomName] = useState('');
  const [newContribRole, setNewContribRole] = useState<'Author' | 'Reviewer' | 'Editor' | 'Contributor'>('Reviewer');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [blogsRes, teamRes] = await Promise.all([
        fetch('/api/blogs'),
        fetch('/api/team'),
      ]);
      const blogsData = await blogsRes.json();
      const teamData = await teamRes.json();

      setBlogs(blogsData.blogs || []);
      setTeamMembers(teamData.team || []);
    } catch (e) {
      console.error('Failed to load blog page data:', e);
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
      result = result.filter(
        (b) =>
          b.category === selectedCategory ||
          (b.categories && b.categories.includes(selectedCategory))
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.excerpt.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          (b.tags && b.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    setFilteredBlogs(result);
  }, [blogs, activeTab, selectedCategory, searchQuery]);

  // Helper to generate slug from title (Max 120 chars)
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 120);
  };

  // Auto-calculate reading time from content
  const calculateReadingTime = (text: string) => {
    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
    return Math.max(1, Math.ceil(wordCount / 200));
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isCustomSlug && !editingBlog) {
      setSlug(generateSlug(val));
    }
  };

  const handleOpenAdd = () => {
    setEditingBlog(null);
    setTitle('');
    setSlug('');
    setIsCustomSlug(false);
    setExcerpt('');
    setCoverImage('');
    setCoverImageAlt('');
    setCoverImageUrl('');

    const defaultMember = teamMembers[0];
    if (defaultMember) {
      setAuthor(defaultMember.name);
      setAuthorId(defaultMember.id);
      setAuthorRole(defaultMember.role);
    } else {
      setAuthor('Macee Editorial');
      setAuthorId('');
      setAuthorRole('Editor');
    }

    setContributors([]);
    setCategories(['Compliance & Legal']);
    setRelatedPosts([]);
    setEstimatedReadingTime(4);
    setContent('');
    setTags('Netherlands, Compliance, Workforce');
    setStatus('published');
    setNewContribPersonId('');
    setNewContribCustomName('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (blog: BlogPost) => {
    setEditingBlog(blog);
    setTitle(blog.title);
    setSlug(blog.slug);
    setIsCustomSlug(true);
    setExcerpt(blog.excerpt || '');
    setCoverImage(blog.coverImage || '');
    setCoverImageAlt(blog.coverImageAlt || '');
    setCoverImageUrl(blog.coverImageUrl || '');
    setAuthor(blog.author || 'Macee Editorial');
    setAuthorId(blog.authorId || '');
    setAuthorRole(blog.authorRole || '');
    setContributors(blog.contributors || []);
    setCategories(
      blog.categories && blog.categories.length > 0
        ? blog.categories
        : blog.category
          ? [blog.category]
          : ['Compliance & Legal']
    );
    setRelatedPosts(blog.relatedPosts || []);
    setEstimatedReadingTime(blog.estimatedReadingTime || parseInt(blog.readTime, 10) || 4);
    setContent(blog.content || '');
    setTags((blog.tags || []).join(', '));
    setStatus(blog.status || 'published');
    setNewContribPersonId('');
    setNewContribCustomName('');
    setIsModalOpen(true);
  };

  const handleAuthorSelect = (personId: string) => {
    if (personId === 'custom') {
      setAuthorId('');
      setAuthorRole('Author');
      return;
    }
    const member = teamMembers.find((m) => m.id === personId);
    if (member) {
      setAuthor(member.name);
      setAuthorId(member.id);
      setAuthorRole(member.role);
    }
  };

  const handleAddContributor = () => {
    let name = '';
    let personId = '';
    let avatar = '';

    if (newContribPersonId === 'custom' || !newContribPersonId) {
      if (!newContribCustomName.trim()) return;
      name = newContribCustomName.trim();
    } else {
      const member = teamMembers.find((m) => m.id === newContribPersonId);
      if (!member) return;
      name = member.name;
      personId = member.id;
      avatar = member.image || '';
    }

    // Check duplicate
    if (contributors.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      alert('This contributor is already added.');
      return;
    }

    setContributors([
      ...contributors,
      {
        personId,
        name,
        role: newContribRole,
        avatar,
      },
    ]);

    setNewContribPersonId('');
    setNewContribCustomName('');
  };

  const handleRemoveContributor = (index: number) => {
    setContributors(contributors.filter((_, i) => i !== index));
  };

  const toggleCategory = (cat: string) => {
    if (categories.includes(cat)) {
      if (categories.length === 1) {
        alert('At least one category is required.');
        return;
      }
      setCategories(categories.filter((c) => c !== cat));
    } else {
      setCategories([...categories, cat]);
    }
  };

  const toggleRelatedPost = (postId: string) => {
    if (relatedPosts.includes(postId)) {
      setRelatedPosts(relatedPosts.filter((id) => id !== postId));
    } else {
      if (relatedPosts.length >= 4) {
        alert('You can select a maximum of 4 related posts.');
        return;
      }
      setRelatedPosts([...relatedPosts, postId]);
    }
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Article Title is required.');
      return;
    }

    try {
      setSaving(true);
      const parsedTags = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const generatedSlug = (slug.trim() || generateSlug(title)).slice(0, 120);

      const payload = {
        id: editingBlog ? editingBlog.id : undefined,
        title: title.trim(),
        slug: generatedSlug,
        excerpt: excerpt.trim(),
        content: content.trim(),
        coverImage,
        coverImageAlt: coverImageAlt.trim(),
        coverImageUrl: coverImageUrl.trim(),
        author: author.trim() || 'Macee Editorial',
        authorId,
        authorRole,
        contributors,
        category: categories[0] || 'Compliance & Legal',
        categories,
        relatedPosts,
        estimatedReadingTime: Number(estimatedReadingTime) || 4,
        readTime: `${estimatedReadingTime || 4} min read`,
        tags: parsedTags,
        status,
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
        fetchData();
        setSyncAlert(true);
        setTimeout(() => setSyncAlert(false), 3000);
      } else {
        alert(data.error || 'Failed to save article');
      }
    } catch (e) {
      alert('An error occurred while saving article');
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
        try {
          setDeleteDialog((prev) => ({ ...prev, isLoading: true }));
          const res = await fetch(`/api/blogs?id=${blog.id}`, { method: 'DELETE' });
          if (res.ok) {
            setDeleteDialog((prev) => ({ ...prev, isOpen: false }));
            fetchData();
          } else {
            alert('Failed to delete blog article');
          }
        } catch {
          alert('Error deleting article');
        } finally {
          setDeleteDialog((prev) => ({ ...prev, isLoading: false }));
        }
      },
    });
  };

  const publishedCount = blogs.filter((b) => b.status === 'published').length;
  const draftCount = blogs.filter((b) => b.status === 'draft').length;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Topbar
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Articles & Blogs' },
        ]}
        searchPlaceholder="Search articles by title, author, tag..."
        onSearch={(q) => setSearchQuery(q)}
      />

      <div className="p-6 sm:p-8 lg:p-10 max-w-[1440px] mx-auto space-y-6">
        {/* Page Header (Editorial Serif) with 2 KPI Metric Cards on the Right */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-serif text-[#111827] tracking-tight">
              Articles & Blogs
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Manage articles with SEO titles, slugs, contributors, multiple categories, related posts, and reading times.
            </p>
          </div>

          {/* Right side: 2 KPI Cards in same header line */}
          <div className="flex items-center space-x-3 sm:space-x-4 shrink-0">
            {/* Card 1: Total Articles */}
            <div className="bg-white rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 border border-slate-100 shadow-2xs flex items-center space-x-3 sm:space-x-4 min-w-[160px] sm:min-w-[180px]">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#EAF0FC] text-[#36427D] flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] sm:text-xs font-medium text-slate-500">Total Articles</p>
                <div className="flex items-baseline space-x-2 mt-0.5">
                  <span className="text-xl sm:text-2xl font-bold text-[#111827] font-sans">
                    {blogs.length}
                  </span>
                  <span className="text-[10px] sm:text-xs font-semibold text-emerald-600">Active</span>
                </div>
              </div>
            </div>

            {/* Card 2: Published Posts */}
            <div className="bg-white rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 border border-slate-100 shadow-2xs flex items-center space-x-3 sm:space-x-4 min-w-[160px] sm:min-w-[180px]">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#EAF0FC] text-[#36427D] flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] sm:text-xs font-medium text-slate-500">Published Posts</p>
                <div className="mt-0.5">
                  <span className="text-xl sm:text-2xl font-bold text-[#111827] font-sans">
                    {publishedCount}
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
              <span>Article saved and website sync files updated successfully!</span>
            </div>
          </div>
        )}

        {/* Tab Filters & Search Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
            {(['all', 'published', 'draft'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all ${activeTab === tab
                    ? 'bg-[#111827] text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100'
                  }`}
              >
                {tab === 'all' ? 'All Articles' : tab}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2.5">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="p-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:border-[#E30613]"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#E30613] hover:bg-[#b80510] text-white text-xs font-semibold shadow-xs transition-all shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Article</span>
            </button>
          </div>
        </div>

        {/* Articles Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 font-medium">
                  <th className="py-3 px-4">Article</th>
                  <th className="py-3 px-4">Categories</th>
                  <th className="py-3 px-4">Author & Contributors</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonTableRow key={i} cols={5} />
                  ))
                ) : filteredBlogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      No articles found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredBlogs.map((blog) => {
                    const postCategories =
                      blog.categories && blog.categories.length > 0
                        ? blog.categories
                        : blog.category
                          ? [blog.category]
                          : ['General'];

                    const contribCount = blog.contributors?.length || 0;

                    return (
                      <tr key={blog.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Article Title */}
                        <td className="py-3.5 px-4 max-w-sm">
                          <div className="flex items-center space-x-3">
                            {blog.coverImage ? (
                              <img
                                src={blog.coverImage}
                                alt={blog.coverImageAlt || blog.title}
                                className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-11 h-11 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-400">
                                <FileText className="w-5 h-5" />
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="font-bold text-[#111827] truncate font-sans text-[13.5px]" title={blog.title}>
                                {blog.title}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Categories */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1 max-w-[180px]">
                            {postCategories.map((cat, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#F0F3FA] text-[#36427D] whitespace-nowrap"
                              >
                                {cat}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Author & Contributors */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-800">{blog.author}</span>
                            {contribCount > 0 && (
                              <span
                                className="text-[10px] text-indigo-600 font-medium inline-flex items-center space-x-1 mt-0.5 cursor-help"
                                title={blog.contributors?.map((c) => `${c.name} (${c.role})`).join(', ')}
                              >
                                <Users className="w-3 h-3" />
                                <span>+{contribCount} contributor{contribCount > 1 ? 's' : ''}</span>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {blog.status === 'published' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              Draft
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => setPreviewBlog(blog)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Preview Article details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
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
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewBlog && (
        <Modal
          isOpen={true}
          onClose={() => setPreviewBlog(null)}
          title={previewBlog.title}
          subtitle={`Slug: /${previewBlog.slug} • ${previewBlog.status.toUpperCase()}`}
          maxWidth="2xl"
        >
          <div className="space-y-5 text-xs">
            {previewBlog.coverImage && (
              <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                <img
                  src={previewBlog.coverImage}
                  alt={previewBlog.coverImageAlt || previewBlog.title}
                  className="w-full h-48 object-cover"
                />
                {previewBlog.coverImageAlt && (
                  <p className="p-2 text-[11px] text-slate-500 bg-slate-50 border-t border-slate-200 italic">
                    Alt Text: {previewBlog.coverImageAlt}
                  </p>
                )}
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">Primary Author:</span>
                <span className="font-semibold text-[#111827]">{previewBlog.author} ({previewBlog.authorRole || 'Author'})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">Estimated Reading Time:</span>
                <span>{previewBlog.estimatedReadingTime || 4} minutes</span>
              </div>
              <div className="flex items-start justify-between">
                <span className="font-bold text-slate-700">Categories:</span>
                <div className="flex flex-wrap gap-1 justify-end max-w-xs">
                  {(previewBlog.categories || [previewBlog.category]).map((c, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-[10px]">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {previewBlog.contributors && previewBlog.contributors.length > 0 && (
              <div>
                <h4 className="font-bold text-slate-800 mb-2">Contributors & Reviewers:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {previewBlog.contributors.map((contrib, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{contrib.name}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                        {contrib.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="font-bold text-slate-800 mb-1">Excerpt Summary:</h4>
              <p className="text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                {previewBlog.excerpt}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 mb-1">Content Body:</h4>
              <div className="text-slate-700 bg-white p-3 rounded-xl border border-slate-200 max-h-60 overflow-y-auto whitespace-pre-line">
                {previewBlog.content}
              </div>
            </div>

            {previewBlog.relatedPosts && previewBlog.relatedPosts.length > 0 && (
              <div>
                <h4 className="font-bold text-slate-800 mb-1">Linked Related Posts:</h4>
                <div className="flex flex-wrap gap-1.5">
                  {previewBlog.relatedPosts.map((rId) => {
                    const match = blogs.find((b) => b.id === rId);
                    return (
                      <span key={rId} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium text-[11px] border border-slate-200">
                        {match ? match.title : rId}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Add / Edit Article Modal (All 10 Fields) */}
      {isModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsModalOpen(false)}
          title={editingBlog ? 'Edit Article' : 'Create New Article'}
          subtitle="Articles will display on macee.com/blogs and synchronize automatically."
          maxWidth="3xl"
        >
          <form onSubmit={handleSaveBlog} className="space-y-5">
            {/* Section 1: Title & SEO URL Slug */}
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#E30613]" />
                <span>Title & URL Slug</span>
              </h3>

              {/* 1. Title */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800">
                    Article Title *
                  </label>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${title.length >= 40 && title.length <= 60
                        ? 'bg-emerald-100 text-emerald-800'
                        : title.length > 60
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                  >
                    {title.length} / 60 chars {title.length >= 40 && title.length <= 60 ? '(SEO Optimal)' : '(40-60 ideal)'}
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Navigating Dutch DBA Regulations in 2026: Employer Guide"
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#E30613] font-medium"
                />
              </div>

              {/* 2. Slug */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800">
                    URL Slug (Max 120 chars) *
                  </label>
                  <span className="text-[10.5px] text-slate-400 font-mono">
                    {slug.length}/120
                  </span>
                </div>
                <div className="flex items-center rounded-xl border border-slate-200 bg-white overflow-hidden focus-within:border-[#E30613]">
                  <span className="px-3 py-2 text-xs font-mono text-slate-400 bg-slate-100 border-r border-slate-200 select-none">
                    macee.com/blogs/
                  </span>
                  <input
                    type="text"
                    required
                    maxLength={120}
                    value={slug}
                    onChange={(e) => {
                      setIsCustomSlug(true);
                      setSlug(generateSlug(e.target.value));
                    }}
                    placeholder="navigating-dutch-dba-regulations-2026"
                    className="w-full p-2 text-xs font-mono focus:outline-none bg-transparent"
                  />
                </div>
              </div>

              {/* 3. Excerpt */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-800">
                    Short Excerpt (Blog Card Summary) *
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {excerpt.length} characters
                  </span>
                </div>
                <textarea
                  required
                  rows={2}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Concise 1-2 sentence preview summary shown on blog cards..."
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#E30613]"
                />
              </div>
            </div>

            {/* Section 2: Media & Feature Image */}
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                <Link2 className="w-3.5 h-3.5 text-[#36427D]" />
                <span>Feature Image & Alt Text</span>
              </h3>

              {/* 4. coverImage */}
              <ImagePicker
                value={coverImage}
                onChange={(newUrl) => setCoverImage(newUrl)}
                label="Feature Cover Image (Media / Image)"
                helperText="Paste direct image URL or choose preloaded Macee asset."
                previewShape="rounded"
                aspect="wide"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* coverImageAlt */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Image Alt Text (SEO & Accessibility)
                  </label>
                  <input
                    type="text"
                    value={coverImageAlt}
                    onChange={(e) => setCoverImageAlt(e.target.value)}
                    placeholder="e.g. Modern office meeting discussing Dutch labor laws"
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#E30613]"
                  />
                </div>

                {/* 5. coverImageUrl (Fallback) */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Fallback External Image URL
                  </label>
                  <input
                    type="url"
                    value={coverImageUrl}
                    onChange={(e) => setCoverImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#E30613]"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Authorship & Multi-Author Contributors */}
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5 text-purple-600" />
                <span>Author & Contributors</span>
              </h3>

              {/* 6. Primary Author */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Primary Author (Person Relation) *
                  </label>
                  <select
                    value={authorId || 'custom'}
                    onChange={(e) => handleAuthorSelect(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#E30613] font-medium"
                  >
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} - {m.role}
                      </option>
                    ))}
                    <option value="custom">Custom Author Name</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Author Display Name
                  </label>
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Author Name"
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#E30613]"
                  />
                </div>
              </div>

              {/* 7. Contributors (Repeater) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Multi-Author Contributors (Repeater / Array)
                </label>

                {/* List of existing contributors */}
                {contributors.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {contributors.map((contrib, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 text-xs shadow-2xs"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-slate-800">{contrib.name}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                            {contrib.role}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveContributor(idx)}
                          className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Remove contributor"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add new contributor row */}
                <div className="flex flex-col sm:flex-row items-center gap-2 bg-slate-100/70 p-2.5 rounded-xl border border-slate-200">
                  <select
                    value={newContribPersonId}
                    onChange={(e) => setNewContribPersonId(e.target.value)}
                    className="w-full sm:w-1/2 p-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none"
                  >
                    <option value="">Select Team Member...</option>
                    {teamMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.role})
                      </option>
                    ))}
                    <option value="custom">Other / Custom Name</option>
                  </select>

                  {newContribPersonId === 'custom' && (
                    <input
                      type="text"
                      value={newContribCustomName}
                      onChange={(e) => setNewContribCustomName(e.target.value)}
                      placeholder="Contributor name..."
                      className="w-full sm:w-1/3 p-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none"
                    />
                  )}

                  <select
                    value={newContribRole}
                    onChange={(e) => setNewContribRole(e.target.value as any)}
                    className="w-full sm:w-1/3 p-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none"
                  >
                    {CONTRIBUTOR_ROLES.map((r) => (
                      <option key={r} value={r}>
                        Role: {r}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleAddContributor}
                    className="w-full sm:w-auto px-3 py-2 rounded-lg bg-[#36427D] hover:bg-[#283261] text-white text-xs font-semibold whitespace-nowrap transition-colors flex items-center justify-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Section 4: Categories & Related Posts */}
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>Categories, Related Posts & Reading Time</span>
              </h3>

              {/* 8. Categories Multi-Select */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Categories (Multi-Select) *
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => {
                    const isSelected = categories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${isSelected
                            ? 'bg-[#36427D] text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
                          }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                        <span>{cat}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 9. Related Posts (Max 4) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    Related Blog Posts (Max 4)
                  </label>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    Selected: {relatedPosts.length} / 4 max
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-white rounded-xl border border-slate-200">
                  {blogs
                    .filter((b) => !editingBlog || b.id !== editingBlog.id)
                    .map((otherBlog) => {
                      const isSelected = relatedPosts.includes(otherBlog.id);
                      return (
                        <button
                          key={otherBlog.id}
                          type="button"
                          onClick={() => toggleRelatedPost(otherBlog.id)}
                          className={`p-2 rounded-lg text-left text-xs transition-colors flex items-start space-x-2 ${isSelected
                              ? 'bg-blue-50 border border-blue-300 text-blue-900 font-semibold'
                              : 'hover:bg-slate-50 border border-transparent text-slate-700'
                            }`}
                        >
                          <div
                            className={`w-4 h-4 rounded mt-0.5 border flex items-center justify-center shrink-0 ${isSelected
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'border-slate-300 bg-white'
                              }`}
                          >
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                          <span className="line-clamp-1">{otherBlog.title}</span>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* 10. Estimated Reading Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-800">
                      Estimated Reading Time (Minutes) *
                    </label>
                    <button
                      type="button"
                      onClick={() => setEstimatedReadingTime(calculateReadingTime(content))}
                      className="text-[10px] text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-1"
                      title="Calculate from word count"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Auto-Calculate</span>
                    </button>
                  </div>
                  <input
                    type="number"
                    min="1"
                    required
                    value={estimatedReadingTime}
                    onChange={(e) => setEstimatedReadingTime(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#E30613]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Publication Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#E30613] font-medium"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft (Unpublished)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 5: Article Body & Tags */}
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-600" />
                <span>Article Body & Tags</span>
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Full Article Content (Markdown / Text)
                </label>
                <textarea
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write complete article with markdown headings, lists, and paragraphs..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#E30613] font-mono leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Tags (Comma-Separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Compliance, Labor Law, Wet DBA, Recruitment"
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#E30613]"
                />
              </div>
            </div>

            {/* Form Footer Actions */}
            <div className="pt-2 flex items-center justify-end space-x-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-[#E30613] hover:bg-[#b80510] text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingBlog ? 'Update Article' : 'Save & Publish Article'}
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
