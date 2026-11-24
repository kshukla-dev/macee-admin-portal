'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Home,
  ChevronRight,
  Search,
  Bell,
  ChevronDown,
  User,
  LogOut,
  RefreshCw,
  Menu,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSidebar } from '@/context/SidebarContext';

interface TopbarProps {
  breadcrumbs?: { label: string; href?: string }[];
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  actionButton?: React.ReactNode;
}

export function Topbar({
  breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Overview' },
  ],
  searchPlaceholder = 'Search leads...',
  onSearch,
  actionButton,
}: TopbarProps) {
  const router = useRouter();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const [searchValue, setSearchValue] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="h-16 bg-white border-b border-slate-100 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Breadcrumbs (Exact match to screenshot: 🏠 > Section / Page) */}
      <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
        <button
          type="button"
          onClick={toggleSidebar}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label="Toggle sidebar"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors mr-1 cursor-pointer"
        >
          <Menu className="w-4 h-4" />
        </button>

        <Link
          href="/dashboard"
          className="text-slate-400 hover:text-slate-600 transition-colors p-1"
        >
          <Home className="w-3.5 h-3.5" />
        </Link>

        {breadcrumbs.map((crumb, idx) => {
          const isLast = idx === breadcrumbs.length - 1;
          return (
            <React.Fragment key={idx}>
              <span className="text-slate-300">
                {idx === 0 ? '>' : '/'}
              </span>
              {isLast ? (
                <span className="font-bold text-[#111827]">{crumb.label}</span>
              ) : crumb.href ? (
                <Link
                  href={crumb.href}
                  className="hover:text-slate-800 transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span>{crumb.label}</span>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Right: Search + Notification Bell + User Profile Dropdown */}
      <div className="flex items-center space-x-3 sm:space-x-4">


        {/* User Profile (Avatar circle with Macee logo + dropdown arrow) */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center space-x-2 pl-2 text-xs font-semibold text-slate-700 hover:text-slate-900 focus:outline-none cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center p-1 shrink-0 overflow-hidden">
              <img
                src="/favicon.png"
                alt="Macee"
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.onerror = null;
                  target.src = '/uploads/favicon-96x96.png';
                }}
              />
            </div>
            <span className="hidden md:inline font-semibold text-slate-800">Admin</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-50 animate-fadeIn">
              <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-full bg-white border border-slate-200 p-0.5 shrink-0 overflow-hidden">
                  <img
                    src="/favicon.png"
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
