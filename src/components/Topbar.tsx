'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  User,
  LogOut,
  ArrowLeft,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

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

  // Back button only renders when backHref or onBack is explicitly passed (e.g. Add, Edit, or Preview pages)
  const resolvedBackHref = backHref;

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="h-16 bg-white border-b border-slate-100 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30">
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
      {/* Right: User Profile Dropdown + Action Button */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* User Profile (Avatar circle with Macee logo + dropdown arrow) */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
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
