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
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className = '' }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

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
      name: 'Client Partners',
      href: '/dashboard/clients',
      icon: Building2,
    },
    {
      name: 'Website Sync & Setup',
      href: '/dashboard/settings',
      icon: Settings,
    },
  ];

  return (
    <aside
      className={`w-72 bg-[#0E1726] text-slate-300 flex flex-col justify-between shrink-0 select-none z-40 border-r border-slate-800/60 ${className}`}
    >
      <div>
        {/* Brand Header with Real Macee Logo */}
        <div className="h-20 flex items-center px-6 sm:px-7 border-b border-slate-800/40">
          <Link href="/dashboard" className="flex items-center group py-1 focus:outline-none">
            <img
              src="/images/macee-logo-white.png"
              alt="Macee External Workforce Solutions"
              className="h-10 sm:h-11 w-auto max-w-[210px] object-contain drop-shadow-sm group-hover:opacity-90 transition-opacity"
            />
          </Link>
        </div>

        {/* Navigation List - Larger fonts, icons and comfortable spacing */}
        <nav className="p-4 sm:p-5 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href);

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
            className="p-1.5 rounded-lg text-slate-500 hover:text-[#E30613] hover:bg-slate-800/50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
