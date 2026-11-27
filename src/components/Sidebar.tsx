'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutGrid,
  Mail,
  Users2,
  FileText,
  HelpCircle,
  Building2,
  Settings,
  LogOut,
  ExternalLink,
  MessageSquareQuote,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useSidebar } from '@/context/SidebarContext';

interface SidebarProps {
  className?: string;
}

/**
 * Bulletproof floating tooltip for collapsed sidebar items.
 * Uses React state hover for guaranteed cross-device compatibility (including touch/emulated cursors).
 */
function CollapsedTooltip({
  children,
  text,
}: {
  children: React.ReactNode;
  text: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <div
      className="relative flex justify-center w-full"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}

      {/* Floating Tooltip */}
      <div
        style={{
          opacity: show ? 1 : 0,
          visibility: show ? 'visible' : 'hidden',
          transform: show ? 'translateY(-50%) translateX(0)' : 'translateY(-50%) translateX(-8px)',
          transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className="absolute left-full ml-3.5 px-3 py-1.5 bg-[#0B1320] text-slate-100 text-xs font-semibold tracking-wide rounded-lg shadow-2xl shadow-black/70 border border-slate-700 whitespace-nowrap z-[9999] top-1/2 flex items-center pointer-events-none"
      >
        <span>{text}</span>
        {/* Pointer Arrow */}
        <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#0B1320] border-l border-b border-slate-700 rotate-45" />
      </div>
    </div>
  );
}

export function Sidebar({ className = '' }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isCollapsed, toggleSidebar } = useSidebar();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutGrid,
    },
    {
      name: 'Contact Leads',
      href: '/dashboard/contacts',
      icon: Mail,
    },
    {
      name: 'Team Profiles',
      href: '/dashboard/team',
      icon: Users2,
    },
    {
      name: 'Articles & Blogs',
      href: '/dashboard/blogs',
      icon: FileText,
    },
    {
      name: 'FAQs',
      href: '/dashboard/faqs',
      icon: HelpCircle,
    },
    {
      name: 'Testimonials',
      href: '/dashboard/clients',
      icon: MessageSquareQuote,
    },
    {
      name: 'System Settings',
      href: '/dashboard/settings',
      icon: Settings,
    },
  ];

  return (
    <aside
      className={`relative bg-[#0E1726] text-slate-300 flex flex-col justify-between shrink-0 select-none z-40 border-r border-slate-800/60 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-72'
        } ${className}`}
    >
      {/* Floating Center Expand Button (When Collapsed: Click to Open / Expand) */}
      {isCollapsed && (
        <button
          type="button"
          onClick={toggleSidebar}
          title="Open sidebar"
          aria-label="Open sidebar"
          className="absolute -right-3.5 top-1/2 -translate-y-1/2 z-50 w-7 h-7 rounded-full bg-[#0E1726] border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-[#E30613] hover:scale-110 shadow-lg flex items-center justify-center transition-all cursor-pointer group"
        >
          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#E30613] transition-colors" />
        </button>
      )}
      <div>
        {/* Brand Header */}
        <div
          className={`h-16 flex items-center border-b border-slate-800/40 transition-all ${isCollapsed ? 'justify-center px-2' : 'justify-between px-5 sm:px-6'
            }`}
        >
          {!isCollapsed ? (
            <>
              <Link href="/dashboard" className="flex items-center group py-1 focus:outline-none">
                <img
                  src="/images/macee-logo-white.png"
                  alt="Macee External Workforce Solutions"
                  className="h-9 sm:h-10 w-auto max-w-[170px] object-contain drop-shadow-sm group-hover:opacity-90 transition-opacity"
                />
              </Link>
              <button
                type="button"
                onClick={toggleSidebar}
                title="Collapse sidebar"
                aria-label="Collapse sidebar"
                className="w-7 h-7 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700/60 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </>
          ) : (
            <CollapsedTooltip text="Dashboard">
              <Link
                href="/dashboard"
                aria-label="Macee Dashboard"
                className="flex items-center justify-center p-1 rounded-xl hover:bg-slate-800/60 transition-all focus:outline-none"
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center p-1.5 shadow-2xs hover:scale-105 transition-transform">
                  <img
                    src="/images/macee-icon.png"
                    alt="Macee"
                    className="w-full h-full object-contain drop-shadow-sm"
                  />
                </div>
              </Link>
            </CollapsedTooltip>
          )}
        </div>

        {/* Navigation List */}
        <nav className={`space-y-1.5 mt-2 ${isCollapsed ? 'p-2.5' : 'p-4 sm:p-5'}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href);

            if (isCollapsed) {
              return (
                <CollapsedTooltip key={item.href} text={item.name}>
                  <Link
                    href={item.href}
                    aria-label={item.name}
                    className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-150 ${isActive
                      ? 'bg-slate-800/95 text-[#E30613] shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                  >
                    <Icon
                      className={`w-5 h-5 transition-colors shrink-0 ${isActive ? 'text-[#E30613]' : 'text-slate-400 group-hover:text-white'
                        }`}
                    />
                  </Link>
                </CollapsedTooltip>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center px-4 py-3 rounded-xl text-[14.5px] font-medium transition-all duration-150 ${isActive
                  ? 'bg-slate-800/90 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/45'
                  }`}
              >
                <div className="flex items-center space-x-3.5">
                  <Icon
                    className={`w-5 h-5 transition-colors shrink-0 ${isActive ? 'text-[#E30613]' : 'text-slate-400'
                      }`}
                  />
                  <span className="tracking-wide">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer */}
      {!isCollapsed ? (
        <div className="p-6 sm:p-7 border-t border-slate-800/40">
          <div className="space-y-1">
            <p className="text-xs font-bold tracking-[0.25em] text-slate-400 uppercase font-heading">
              M A C E E
            </p>
            <p className="text-xs text-slate-500 font-serif italic">
              Workforce Solutions. Worldwide.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/50 flex items-center justify-between">
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-slate-400 hover:text-white flex items-center space-x-2 transition-colors font-medium"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span>Open Website</span>
            </a>
            <button
              onClick={handleLogout}
              title="Log out"
              className="p-1.5 rounded-lg text-slate-500 hover:text-[#E30613] hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-3 border-t border-slate-800/40 flex flex-col items-center space-y-2">
          {/* Open Website Tooltip Button */}
          <CollapsedTooltip text="Open Website">
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noreferrer"
              aria-label="Open Website"
              className="w-10 h-10 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 flex items-center justify-center transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </CollapsedTooltip>

          {/* Logout Tooltip Button */}
          <CollapsedTooltip text="Log Out">
            <button
              onClick={handleLogout}
              aria-label="Log Out"
              className="w-10 h-10 rounded-xl text-slate-500 hover:text-[#E30613] hover:bg-slate-800/50 flex items-center justify-center transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </CollapsedTooltip>
        </div>
      )}
    </aside>
  );
}
