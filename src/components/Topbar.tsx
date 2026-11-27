'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  User,
  LogOut,
  ArrowLeft,
  Bell,
  Mail,
  CheckCheck,
  ChevronRight,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface NotificationItem {
  id: string;
  name: string;
  email: string;
  topic?: string;
  message: string;
  submittedAt: string;
  status: 'new' | 'in-progress' | 'contacted' | 'closed';
}

function formatTimeAgo(dateStr: string): string {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  } catch {
    return 'Recently';
  }
}

interface TopbarProps {
  backHref?: string;
  onBack?: () => void;
  breadcrumbs?: { label: string; href?: string }[];
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  actionButton?: React.ReactNode;
}

export function Topbar({
  backHref,
  onBack,
  breadcrumbs,
  actionButton,
}: TopbarProps) {
  const router = useRouter();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fetch recent contact leads for live notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/contacts');
      const data = await res.json();
      if (res.ok && Array.isArray(data.contacts)) {
        setNotifications(
          data.contacts.map((c: any) => ({
            id: c.id,
            name: c.fullName || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Visitor',
            email: c.email || '',
            topic: c.topic || 'Website Inquiry',
            message: c.message || '',
            submittedAt: c.submittedAt || new Date().toISOString(),
            status: c.status || 'new',
          }))
        );
      }
    } catch {
      // silent fallback
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Back button only renders when backHref or onBack is explicitly passed (e.g. Add, Edit, or Preview pages)
  const resolvedBackHref = backHref;

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const unreadCount = notifications.filter((n) => n.status === 'new').length;

  const handleMarkAllAsRead = async () => {
    const newItems = notifications.filter((n) => n.status === 'new');
    setNotifications((prev) =>
      prev.map((n) => (n.status === 'new' ? { ...n, status: 'contacted' } : n))
    );
    for (const item of newItems) {
      try {
        await fetch('/api/contacts', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: item.id, status: 'contacted' }),
        });
      } catch {}
    }
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    setNotifOpen(false);
    if (notif.status === 'new') {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, status: 'contacted' } : n))
      );
      try {
        await fetch('/api/contacts', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: notif.id, status: 'contacted' }),
        });
      } catch {}
    }
    router.push('/dashboard/contacts');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Back Button (For subpages, forms, and preview pages) */}
      <div className="flex items-center">
        {resolvedBackHref ? (
          <Link
            href={resolvedBackHref}
            title="Go back"
            aria-label="Go back"
            className="w-9 h-9 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-600 hover:text-[#111827] shadow-2xs flex items-center justify-center transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
        ) : onBack ? (
          <button
            type="button"
            onClick={onBack}
            title="Go back"
            aria-label="Go back"
            className="w-9 h-9 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-600 hover:text-[#111827] shadow-2xs flex items-center justify-center transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        ) : null}
      </div>

      {/* Right: Notifications + User Profile Dropdown + Action Button */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => {
              setNotifOpen(!notifOpen);
              setUserMenuOpen(false);
            }}
            title="Notifications"
            aria-label="Notifications"
            className={`w-9 h-9 rounded-xl border transition-all flex items-center justify-center relative cursor-pointer ${
              notifOpen
                ? 'bg-slate-100 border-slate-300 text-[#111827]'
                : 'border-slate-200/90 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-600 hover:text-[#111827] shadow-2xs'
            }`}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#E30613] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200/90 z-50 overflow-hidden animate-fadeIn">
              {/* Dropdown Header */}
              <div className="p-3.5 px-4 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h4 className="text-xs font-bold text-[#111827] uppercase tracking-wider font-heading">
                    Notifications
                  </h4>
                  {unreadCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E30613] text-white">
                      {unreadCount} new
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-200/70 text-slate-600">
                      All caught up
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    className="text-[11px] font-semibold text-[#E30613] hover:text-[#b80510] cursor-pointer transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-2">
                      <CheckCheck className="w-5 h-5 text-slate-400" />
                    </div>
                    <p className="text-xs font-bold text-slate-700">No notifications yet</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      New contact inquiries and website leads will appear here.
                    </p>
                  </div>
                ) : (
                  notifications.slice(0, 6).map((notif) => {
                    const isNew = notif.status === 'new';
                    return (
                      <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif)}
                        className={`p-3.5 hover:bg-slate-50/80 transition-colors cursor-pointer flex items-start space-x-3 ${
                          isNew ? 'bg-rose-50/30' : ''
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            isNew
                              ? 'bg-rose-100 text-[#E30613]'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <Mail className="w-4 h-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p
                              className={`text-xs truncate ${
                                isNew ? 'font-bold text-[#111827]' : 'font-semibold text-slate-700'
                              }`}
                            >
                              {notif.name}
                            </p>
                            <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                              {formatTimeAgo(notif.submittedAt)}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {notif.topic}
                          </p>

                          {notif.message && (
                            <p className="text-[11px] text-slate-600 line-clamp-1 mt-0.5 italic">
                              "{notif.message}"
                            </p>
                          )}

                          {isNew && (
                            <div className="mt-1.5 flex items-center space-x-1.5">
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#E30613]" />
                              <span className="text-[10px] font-bold text-[#E30613] uppercase tracking-wider">
                                New Lead
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="p-2.5 px-4 bg-slate-50 border-t border-slate-100 text-center">
                <Link
                  href="/dashboard/contacts"
                  onClick={() => setNotifOpen(false)}
                  className="text-xs font-semibold text-slate-700 hover:text-[#E30613] inline-flex items-center space-x-1.5 transition-colors"
                >
                  <span>View All Contact Leads</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile (Avatar circle with Macee logo + dropdown arrow) */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => {
              setUserMenuOpen(!userMenuOpen);
              setNotifOpen(false);
            }}
            className="flex items-center space-x-2 pl-2 text-xs font-semibold text-slate-700 hover:text-slate-900 focus:outline-none cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-[#0E1726] border border-slate-700/60 shadow-2xs flex items-center justify-center p-1 shrink-0 overflow-hidden">
              <img
                src="/images/macee-icon.png"
                alt="Macee"
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.onerror = null;
                  target.src = '/favicon.png';
                }}
              />
            </div>
            <span className="hidden md:inline font-semibold text-slate-800">Admin</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-50 animate-fadeIn">
              <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-full bg-[#0E1726] border border-slate-700/60 p-0.5 shrink-0 overflow-hidden flex items-center justify-center">
                  <img
                    src="/images/macee-icon.png"
                    alt="Macee"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#111827] truncate">Macee Administrator</p>
                  <p className="text-[10px] text-slate-400 font-mono truncate">admin@macee.com</p>
                </div>
              </div>
              <Link
                href="/dashboard/settings"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center space-x-2 px-3.5 py-2 text-xs text-slate-600 hover:bg-slate-50 hover:text-[#111827]"
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Account Settings</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2 px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 text-left cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-500" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>

        {actionButton && <div>{actionButton}</div>}
      </div>
    </header>
  );
}
