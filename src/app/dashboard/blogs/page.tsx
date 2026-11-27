'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Topbar } from '@/components/Topbar';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { SkeletonTableRow } from '@/components/Skeleton';
import { CustomSelect } from '@/components/CustomSelect';
import { StatusDropdown } from '@/components/StatusDropdown';
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
  ChevronLeft,
  ChevronRight,
  MoreVertical,
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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Action Menu & Alerts State
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);
  const [syncAlert, setSyncAlert] = useState(false);

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
    setCurrentPage(1);
  }, [blogs, activeTab, selectedCategory, searchQuery]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredBlogs.length / pageSize) || 1;
  const paginatedBlogs = filteredBlogs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );



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

  const handleStatusChange = async (blogId: string, newStatus: string) => {
    try {
      setBlogs((prev) =>
        prev.map((b) =>
          b.id === blogId ? { ...b, status: newStatus as 'published' | 'draft' } : b
        )
      );
      const res = await fetch('/api/blogs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: blogId, status: newStatus }),
      });
      if (!res.ok) {
        fetchData();
      }
    } catch {
      fetchData();
    }
  };

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
            <div className="w-44">
              <CustomSelect
                value={selectedCategory}
                onChange={setSelectedCategory}
                options={[
                  { value: 'all', label: 'All Categories' },
                  ...CATEGORIES.map((c) => ({ value: c, label: c })),
                ]}
                placeholder="All Categories"
              />
            </div>

            <Link
              href="/dashboard/blogs/create"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#E30613] hover:bg-[#b80510] text-white text-xs font-semibold shadow-xs transition-all shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Article</span>
            </Link>
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
                ) : paginatedBlogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      No articles found matching criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedBlogs.map((blog) => {
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
                                <Link
                                  href={`/dashboard/blogs/preview/${blog.id}`}
                                  className="font-bold text-[#111827] hover:text-[#E30613] transition-colors truncate font-sans text-[13.5px] block"
                                  title={blog.title}
                                >
                                  {blog.title}
                            </Link>
                          </div>
                        </div>
                      </td>

                        {/* Categories */ }
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

                    {/* Author & Contributors */ }
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">{blog.author}</span>
                        {contribCount > 0 && (
                          <span
                            className="text-[10px] text-slate-500 font-medium inline-flex items-center space-x-1 mt-0.5 cursor-help"
                            title={blog.contributors?.map((c) => `${c.name} (${c.role})`).join(', ')}
                          >
                            <Users className="w-3 h-3" />
                            <span>+{contribCount} contributor{contribCount > 1 ? 's' : ''}</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status */ }
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusDropdown
                        status={blog.status}
                        preset="blog"
                        onChange={(newStatus) => handleStatusChange(blog.id, newStatus)}
                        title="Change Article Status"
                      />
                    </td>

                    {/* Actions: 3-dot dropdown menu */ }
                    <td className="py-3.5 px-4 text-right relative whitespace-nowrap">
                      <button
                        onClick={() =>
                          setActiveActionMenuId(
                            activeActionMenuId === blog.id ? null : blog.id
                          )
                        }
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                        title="Article Actions"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {activeActionMenuId === blog.id && (
                            <div className="absolute right-4 mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-40 text-left animate-fadeIn">
                              <Link
                                href={`/dashboard/blogs/preview/${blog.id}`}
                                onClick={() => setActiveActionMenuId(null)}
                                className="w-full px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                              >
                                <Eye className="w-3.5 h-3.5 text-[#36427D]" />
                                <span>Preview Article</span>
                              </Link>
                              <Link
                                href={`/dashboard/blogs/edit/${blog.id}`}
                                onClick={() => setActiveActionMenuId(null)}
                                className="w-full px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                                <span>Edit Article</span>
                              </Link>
                              <div className="border-t border-slate-100 my-1" />
                              <button
                                onClick={() => {
                                  handleDeleteBlog(blog);
                                  setActiveActionMenuId(null);
                                }}
                                className="w-full px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center space-x-2"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                <span>Delete Article</span>
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
          Showing {filteredBlogs.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}–
          {Math.min(currentPage * pageSize, filteredBlogs.length)} of {filteredBlogs.length} articles
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
            className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-slate-600"
            title="Next page"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
      </div >

  {/* Delete Confirmation Dialog */ }
  <ConfirmDialog
    isOpen={deleteDialog.isOpen}
    onClose={() => setDeleteDialog((prev) => ({ ...prev, isOpen: false }))}
    onConfirm={deleteDialog.onConfirm}
    title={deleteDialog.title}
    description={deleteDialog.description}
    itemName={deleteDialog.itemName}
    isLoading={deleteDialog.isLoading}
  />
    </div >
  );
}
