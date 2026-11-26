'use client';

import React from 'react';
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
  ChevronRight,
  LogOut,
  ExternalLink,
  Menu,
  MessageSquareQuote,
} from 'lucide-react';
import { useSidebar } from '@/context/SidebarContext';

interface SidebarProps {
  className?: string;
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
      className={`bg-[#0E1726] text-slate-300 flex flex-col justify-between shrink-0 select-none z-40 border-r border-slate-800/60 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-72'
      } ${className}`}
    >
      <div>
        {/* Brand Header with Toggle Hamburger Button */}
        <div className={`h-20 flex items-center border-b border-slate-800/40 ${isCollapsed ? 'justify-center px-2' : 'justify-between px-5 sm:px-6'}`}>
          {!isCollapsed ? (
            <>
              <Link href="/dashboard" className="flex items-center group py-1 focus:outline-none">
                <img
                  src="/images/macee-logo-white.png"
                  alt="Macee External Workforce Solutions"
                  className="h-10 sm:h-11 w-auto max-w-[175px] object-contain drop-shadow-sm group-hover:opacity-90 transition-opacity"
                />
              </Link>
              <button
                type="button"
                onClick={toggleSidebar}
                title="Collapse sidebar (Show icons only)"
                aria-label="Collapse sidebar"
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={toggleSidebar}
              title="Expand sidebar (Show full menu)"
              aria-label="Expand sidebar"
              className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer group flex items-center justify-center"
            >
              <Menu className="w-5 h-5 text-slate-300 group-hover:text-white" />
            </button>
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
                <div key={item.href} className="relative group flex justify-center">
                  <Link
                    href={item.href}
                    aria-label={item.name}
                    className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-150 ${
                      isActive
                        ? 'bg-slate-800/95 text-[#E30613] shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 transition-colors shrink-0 ${
                        isActive ? 'text-[#E30613]' : 'text-slate-400 group-hover:text-white'
                      }`}
                    />
                  </Link>

                  {/* Sleek Right Hover Tooltip */}
                  <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#1F2937] text-white text-xs font-semibold rounded-lg shadow-xl border border-slate-700 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 top-1/2 -translate-y-1/2">
                    {item.name}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 -mr-1 border-4 border-transparent border-r-[#1F2937]" />
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center justify-between px-4 py-3 rounded-xl text-[14.5px] font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-slate-800/90 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/45'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <Icon
                    className={`w-5 h-5 transition-colors shrink-0 ${
                      isActive ? 'text-[#E30613]' : 'text-slate-400'
                    }`}
                  />
                  <span className="tracking-wide">{item.name}</span>
                </div>

                {isActive && (
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                )}
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
          <div className="relative group">
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noreferrer"
              aria-label="Open Website"
              className="w-10 h-10 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 flex items-center justify-center transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#1F2937] text-white text-xs font-semibold rounded-lg shadow-xl border border-slate-700 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 top-1/2 -translate-y-1/2">
              Open Website
              <div className="absolute right-full top-1/2 -translate-y-1/2 -mr-1 border-4 border-transparent border-r-[#1F2937]" />
            </div>
          </div>

          {/* Logout Tooltip Button */}
          <div className="relative group">
            <button
              onClick={handleLogout}
              aria-label="Log Out"
              className="w-10 h-10 rounded-xl text-slate-500 hover:text-[#E30613] hover:bg-slate-800/50 flex items-center justify-center transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
            <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#1F2937] text-rose-400 text-xs font-semibold rounded-lg shadow-xl border border-slate-700 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 top-1/2 -translate-y-1/2">
              Log Out
              <div className="absolute right-full top-1/2 -translate-y-1/2 -mr-1 border-4 border-transparent border-r-[#1F2937]" />
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
