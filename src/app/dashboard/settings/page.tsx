'use client';

import React, { useEffect, useState } from 'react';
import { Topbar } from '@/components/Topbar';
import {
  Settings,
  RefreshCw,
  FolderGit2,
  Key,
  ShieldCheck,
  CheckCircle2,
  Download,
  ExternalLink,
  Code2,
  Server,
  Database,
  Lock,
} from 'lucide-react';

export default function SettingsPage() {
  const [websitePath, setWebsitePath] = useState('');
  const [syncStatus, setSyncStatus] = useState<any>(null);
  const [syncing, setSyncing] = useState(false);
  const [adminEmail, setAdminEmail] = useState('admin@macee.com');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');

  useEffect(() => {
    fetch('/api/sync')
      .then((res) => res.json())
      .then((data) => {
        if (data.websitePath) setWebsitePath(data.websitePath);
      })
      .catch(() => {});
  }, []);

  const handleFullSync = async () => {
    try {
      setSyncing(true);
      const res = await fetch('/api/sync', { method: 'POST' });
      const data = await res.json();
      setSyncStatus(data);
    } catch (e) {
      alert('Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleBackupDownload = async () => {
    const [team, contacts, blogs, faqs, clients] = await Promise.all([
      fetch('/api/team').then((r) => r.json()),
      fetch('/api/contacts').then((r) => r.json()),
      fetch('/api/blogs').then((r) => r.json()),
      fetch('/api/faqs').then((r) => r.json()),
      fetch('/api/clients').then((r) => r.json()),
    ]);

    const backupData = {
      backupDate: new Date().toISOString(),
      team: team.team,
      contacts: contacts.contacts,
      blogs: blogs.blogs,
      faqs: faqs.items,
      clients: clients.clients,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `macee_complete_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Topbar
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Website Sync & Setup' },
        ]}
        searchPlaceholder="Search system settings..."
      />

      <div className="p-6 sm:p-8 lg:p-10 max-w-[1440px] mx-auto space-y-6">
        {/* Page Header (Editorial Serif) */}
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-serif text-[#111827] tracking-tight">
            Website Sync & Setup
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Control automated two-way file synchronization with the live Macee website.
          </p>
        </div>

        {/* 4 KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-[#EAF0FC] text-[#36427D] flex items-center justify-center shrink-0">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Target Folder</p>
              <div className="flex items-baseline space-x-2 mt-0.5">
                <span className="text-base font-bold text-[#111827] font-mono truncate max-w-[140px]">
                  macee-_update
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-[#EAF0FC] text-[#36427D] flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Sync Status</p>
              <div className="mt-0.5">
                <span className="text-2xl sm:text-3xl font-bold text-[#111827] font-sans">
                  Live Active
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-[#EAF0FC] text-[#36427D] flex items-center justify-center shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Synced Modules</p>
              <div className="mt-0.5">
                <span className="text-2xl sm:text-3xl font-bold text-[#111827] font-sans">
                  5 Files
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-[#EAF0FC] text-[#36427D] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Security Gate</p>
              <div className="mt-0.5">
                <span className="text-2xl sm:text-3xl font-bold text-[#111827] font-sans">
                  Verified
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Sync Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Live Website Synchronization */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs p-6 sm:p-7 space-y-5">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#EAF0FC] text-[#36427D] flex items-center justify-center">
                <FolderGit2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#111827] font-sans">
                  Website Synchronization Engine
                </h3>
                <p className="text-xs text-slate-500">
                  Transfers team, blogs, FAQs, and clients data directly to your website.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Configured Website Path</span>
              <p className="font-mono text-[11px] text-[#111827] mt-0.5 break-all">
                {websitePath || 'd:\\J&F\\Maceee\\macee-_update_contant'}
              </p>
            </div>

            {syncStatus && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-1 animate-fadeIn">
                <p className="font-bold flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Files Synced Successfully</span>
                </p>
                <p className="text-[11px] font-mono">
                  {syncStatus.filesSynced ? syncStatus.filesSynced.join(', ') : 'All data files'}
                </p>
              </div>
            )}

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={handleFullSync}
                disabled={syncing}
                className="is-btn py-2.5 px-5 text-xs font-semibold flex items-center space-x-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                <span>{syncing ? 'Synchronizing Files...' : 'Run Full Sync'}</span>
              </button>

              <button
                onClick={handleBackupDownload}
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-[#0E1726] hover:bg-black text-white text-xs font-semibold shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Backup</span>
              </button>
            </div>
          </div>

          {/* Card 2: Security & Admin Credentials */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs p-6 sm:p-7 space-y-5">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#EAF0FC] text-[#36427D] flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#111827] font-sans">
                  Admin Credentials
                </h3>
                <p className="text-xs text-slate-500">
                  Current portal operator authentication settings.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Admin Email</label>
                <input
                  type="email"
                  disabled
                  value={adminEmail}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Role & Authority</label>
                <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-[#36427D]">
                  Super Admin (Full Website & Data Access)
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
              To update password or add secondary admin accounts, configure `data/admin.json`.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
