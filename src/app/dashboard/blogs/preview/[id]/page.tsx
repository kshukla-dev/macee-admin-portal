'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Topbar } from '@/components/Topbar';
import { StatusDropdown } from '@/components/StatusDropdown';
import { BlogPost } from '@/components/forms/BlogStepForm';
import { formatArticleHtml, isHtmlContent } from '@/lib/formatArticleHtml';
import {
  ArrowLeft,
  Edit2,
  Calendar,
  Clock,
  User,
  Users,
  Tag,
  Share2,
  ExternalLink,
  BookOpen,
  FileText,
  CheckCircle2,
  AlertCircle,
  Eye,
  Check,
  ChevronRight,
} from 'lucide-react';

export default function ArticlePreviewPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [allBlogs, setAllBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch('/api/blogs')
      .then((res) => res.json())
      .then((data) => {
        const blogsList = data.blogs || [];
        setAllBlogs(blogsList);
        const found = blogsList.find((b: BlogPost) => b.id === id);
        if (found) {
          setBlog(found);
        }
      })
      .catch((e) => console.error('Failed to load article:', e))
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!blog) return;
    try {
      setBlog((prev) => (prev ? { ...prev, status: newStatus as 'published' | 'draft' } : null));
      await fetch('/api/blogs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: blog.id, status: newStatus }),
      });
    } catch (e) {
      console.error('Failed to update status:', e);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <Topbar
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Articles & Blogs', href: '/dashboard/blogs' },
            { label: 'Article Preview' },
          ]}
        />
        <div className="flex items-center justify-center py-24">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-4 border-[#E30613] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Loading article preview...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <Topbar
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Articles & Blogs', href: '/dashboard/blogs' },
            { label: 'Article Not Found' },
          ]}
        />
        <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-2xl border border-slate-100 shadow-2xs text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-[#E30613] flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 font-sans">Article Not Found</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            The article you are trying to preview does not exist or may have been deleted.
          </p>
          <Link
            href="/dashboard/blogs"
            className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-[#0E1726] hover:bg-black text-white text-xs font-semibold shadow-xs transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Articles</span>
          </Link>
        </div>
      </div>
    );
  }

  const categories =
    Array.isArray(blog.categories) && blog.categories.length > 0
      ? blog.categories
      : blog.category
        ? [blog.category]
        : ['Industry Insights'];

  const formattedDate = blog.publishedAt
    ? new Date(blog.publishedAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Recent Post';

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Topbar
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Articles & Blogs', href: '/dashboard/blogs' },
          { label: blog.title },
        ]}
      />

      <div className="p-6 sm:p-8 lg:p-10 max-w-[1440px] mx-auto space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-2xl p-4 sm:px-6 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard/blogs"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Articles</span>
            </Link>

            <div className="h-4 w-px bg-slate-200" />

            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">Status:</span>
              <StatusDropdown
                status={blog.status}
                preset="blog"
                onChange={handleStatusChange}
                title="Change Article Status"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer"
              title="Copy preview link"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Share Preview</span>
                </>
              )}
            </button>

            <Link
              href={`/dashboard/blogs/edit/${blog.id}`}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#E30613] hover:bg-[#b80510] text-white text-xs font-semibold shadow-xs transition-all"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Article</span>
            </Link>
          </div>
        </div>

        {/* Live Reader Simulation Banner */}
        <div className="p-3.5 sm:px-5 rounded-2xl bg-[#0E1726] text-white text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shadow-sm">
          <div className="flex items-center space-x-2.5">
            <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold font-sans">Full Article Preview</span>
            <span className="text-slate-400 font-mono text-[11px] hidden md:inline">
              (macee.com/blogs/{blog.slug})
            </span>
          </div>
          <div className="text-slate-300 text-[11px] flex items-center space-x-3">
            <span>Estimated Read: {blog.estimatedReadingTime || 4} mins</span>
            <span>•</span>
            <span className="capitalize">{blog.status} Mode</span>
          </div>
        </div>

        {/* Article Paper Reader View */}
        <article className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
          {/* Cover Hero Image */}
          {blog.coverImage ? (
            <div className="w-full bg-slate-100 border-b border-slate-200 relative overflow-hidden max-h-[500px]">
              <img
                src={blog.coverImage}
                alt={blog.coverImageAlt || blog.title}
                className="w-full h-full max-h-[500px] object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
              {blog.coverImageAlt && (
                <div className="p-2 text-center text-xs text-slate-500 bg-white/90 backdrop-blur-xs border-t border-slate-200/80 italic">
                  {blog.coverImageAlt}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-32 bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200 flex items-center justify-center text-slate-400">
              <BookOpen className="w-10 h-10 stroke-1 text-slate-300" />
            </div>
          )}

          {/* Article Main Content Body */}
          <div className="p-6 sm:p-10 lg:p-14 max-w-4xl mx-auto space-y-8">
            {/* Categories Pills */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#EAF0FC] text-[#36427D] border border-slate-200/60"
                >
                  {cat}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#111827] leading-[1.18] tracking-tight">
              {blog.title}
            </h1>

            {/* Author, Contributors & Date Meta Bar */}
            <div className="py-4 border-y border-slate-200/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
              <div className="flex items-center space-x-3.5">
                {blog.authorAvatar ? (
                  <img
                    src={blog.authorAvatar}
                    alt={blog.author}
                    className="w-11 h-11 rounded-full object-cover border-2 border-slate-200"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-[#EAF0FC] text-[#36427D] border-2 border-slate-200 flex items-center justify-center font-bold text-sm">
                    {blog.author ? blog.author.charAt(0).toUpperCase() : 'M'}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-[#111827] text-sm font-sans">{blog.author}</h4>
                  <p className="text-slate-500 text-xs">{blog.authorRole || 'Editorial Specialist'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 sm:space-x-6 text-slate-500 font-medium">
                <div className="flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{blog.estimatedReadingTime || 4} min read</span>
                </div>
              </div>
            </div>

            {/* Excerpt / Lead Paragraph */}
            {blog.excerpt && (
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border-l-4 border-[#E30613] text-slate-700 text-base sm:text-lg italic font-normal leading-relaxed">
                {isHtmlContent(blog.excerpt) ? (
                  <div
                    className="article-content italic"
                    dangerouslySetInnerHTML={{ __html: formatArticleHtml(blog.excerpt) }}
                  />
                ) : (
                  `"${blog.excerpt}"`
                )}
              </div>
            )}

            {/* Full Content Body (Rich Semantic HTML Rendering) */}
            <div
              className="article-content text-slate-800 text-base sm:text-lg leading-relaxed font-sans"
              dangerouslySetInnerHTML={{ __html: formatArticleHtml(blog.content) }}
            />

            {/* Tags Footer */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="pt-6 border-t border-slate-200 space-y-2.5">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Article Tags</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Contributors & Reviewers Section */}
            {blog.contributors && blog.contributors.length > 0 && (
              <div className="pt-6 border-t border-slate-200 space-y-3">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-[#36427D]" />
                  <h3 className="font-bold text-slate-900 text-sm font-sans">
                    Contributors & Reviewers
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {blog.contributors.map((contrib, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-[#EAF0FC] text-[#36427D] flex items-center justify-center font-bold text-xs border border-slate-200">
                          {contrib.name ? contrib.name.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 text-xs block font-sans">
                            {contrib.name}
                          </span>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white text-slate-700 border border-slate-200 shadow-2xs">
                        {contrib.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related Articles Section */}
            {blog.relatedPosts && blog.relatedPosts.length > 0 && (
              <div className="pt-6 border-t border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-900 text-sm font-sans flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-[#E30613]" />
                  <span>Linked Related Articles</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {blog.relatedPosts.map((rId) => {
                    const match = allBlogs.find((b) => b.id === rId);
                    if (!match) return null;
                    return (
                      <Link
                        key={rId}
                        href={`/dashboard/blogs/preview/${match.id}`}
                        className="p-4 rounded-xl border border-slate-200 hover:border-[#E30613] hover:shadow-xs transition-all bg-white group flex flex-col justify-between"
                      >
                        <h4 className="font-bold text-slate-900 text-xs group-hover:text-[#E30613] transition-colors line-clamp-2">
                          {match.title}
                        </h4>
                        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                          <span>{match.readTime || '4 min read'}</span>
                          <span className="font-semibold text-[#E30613] group-hover:translate-x-0.5 transition-transform">
                            Read Preview →
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bottom Actions Footer */}
            <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link
                href="/dashboard/blogs"
                className="text-xs font-semibold text-slate-600 hover:text-[#111827] flex items-center space-x-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Articles & Blogs</span>
              </Link>

              <div className="flex items-center space-x-3">
                <Link
                  href={`/dashboard/blogs/edit/${blog.id}`}
                  className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-[#E30613] hover:bg-[#b80510] text-white text-xs font-semibold shadow-xs transition-all"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit This Article</span>
                </Link>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
