'use client';

import React, { useState } from 'react';
import { Topbar } from '@/components/Topbar';
import { Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function SecuritySettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility toggles
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Status and feedback
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!currentPassword) {
      setErrorMsg('Please enter your current password.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirm password do not match.');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg('Your password has been updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setSuccessMsg(''), 5000);
      } else {
        setErrorMsg(data.error || 'Failed to update password.');
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Topbar
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'System Settings' },
        ]}
        searchPlaceholder="Search settings..."
      />

      <div className="p-6 sm:p-8 lg:p-10 max-w-[1440px] mx-auto space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#111827] tracking-tight">
            Security
          </h1>
        </div>

        {/* Change Password Card (Matches reference mockup layout in brand red theme) */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-2xs max-w-xl">
          <h2 className="text-lg sm:text-xl font-bold text-[#111827] font-sans">
            Change your password
          </h2>

          {/* Feedback alerts */}
          {successMsg && (
            <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center space-x-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center space-x-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {/* Current Password Field */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-[#111827] mb-1.5">
                Current password*
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-11 rounded-xl sm:rounded-2xl border border-slate-200/90 text-sm text-[#111827] placeholder-slate-400 focus:outline-none focus:border-[#E30613] focus:ring-1 focus:ring-[#E30613] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 transition-colors"
                  aria-label={showCurrent ? 'Hide password' : 'Show password'}
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password Field */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-[#111827] mb-1.5">
                New password*
              </label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-11 rounded-xl sm:rounded-2xl border border-slate-200/90 text-sm text-[#111827] placeholder-slate-400 focus:outline-none focus:border-[#E30613] focus:ring-1 focus:ring-[#E30613] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 transition-colors"
                  aria-label={showNew ? 'Hide password' : 'Show password'}
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-2 font-normal">
                Minimum 8 characters. Must include numbers, letters and special characters.
              </p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-[#111827] mb-1.5">
                Confirm password*
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-11 rounded-xl sm:rounded-2xl border border-slate-200/90 text-sm text-[#111827] placeholder-slate-400 focus:outline-none focus:border-[#E30613] focus:ring-1 focus:ring-[#E30613] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 transition-colors"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Save Button (Pill shaped, right aligned, Macee brand red theme) */}
            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 rounded-full bg-[#E30613] hover:bg-[#b80510] text-white text-xs sm:text-sm font-semibold shadow-xs transition-all disabled:opacity-50 cursor-pointer inline-flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Password</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
