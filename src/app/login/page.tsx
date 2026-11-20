'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, CheckCircle2, Sparkles, Building2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleQuickFill = () => {
    setEmail('admin@macee.com');
    setPassword('admin123');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111827] relative overflow-hidden px-4 sm:px-6 lg:px-8 selection:bg-[#E30613]/20">
      {/* Top Website Accent Line */}
      <div className="h-[3px] w-full bg-[#E30613] fixed top-0 left-0 z-50 pointer-events-none" />

      {/* Ambient Brand Glows in Macee Red & Periwinkle */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#E30613]/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#8E96CB]/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-md w-full space-y-7 bg-[#111827] border border-slate-800 p-8 sm:p-9 rounded-[20px] shadow-2xl backdrop-blur-xl relative z-10 border-t-[3px] border-t-[#E30613]">
        {/* Brand Header with Real Macee Logo */}
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-1">
            <img
              src="/images/macee-logo-white.png"
              alt="Macee External Workforce Solutions"
              className="h-10 w-auto object-contain drop-shadow-md"
            />
          </div>
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-[6px] bg-[#E30613]/20 border border-[#E30613]/40 text-[#ff5a64] text-[11px] font-bold font-heading mb-1.5 uppercase tracking-wider">
              <span>Management Portal</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight font-heading">
              Enterprise Admin Portal
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              External Workforce, Secondment & Live Website Sync
            </p>
          </div>
        </div>

        {/* Demo Credentials Quick Fill Chip (Periwinkle & Card accents) */}
        <div
          onClick={handleQuickFill}
          className="cursor-pointer group flex items-center justify-between p-3.5 rounded-[10px] bg-[#F0F3FA]/10 border border-[#8E96CB]/30 hover:border-[#8E96CB] hover:bg-[#F0F3FA]/15 transition-all text-xs shadow-inner"
        >
          <div className="flex items-center space-x-2 text-slate-200">
            <CheckCircle2 className="w-4 h-4 text-[#8E96CB] shrink-0" />
            <span className="text-[11px]">
              <strong>Demo Login:</strong> admin@macee.com / admin123
            </span>
          </div>
          <span className="text-[11px] font-bold text-[#ff5a64] group-hover:underline font-heading">
            Auto-fill
          </span>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center space-x-2.5 p-3.5 bg-rose-950/60 border border-rose-800/80 text-rose-200 rounded-[10px] text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 font-heading">
              Work Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@macee.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-[10px] text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#E30613] focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 font-heading">
              Secure Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-[10px] text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#E30613] focus:border-transparent transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full is-btn mt-2 py-3.5 text-xs uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed font-heading"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Macee Portal</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </form>

        {/* Dutch Compliance Footer Accreditations */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-medium">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            SNA NEN 4400-1
          </span>
          <span className="text-[#8E96CB]">IND Recognised Sponsor</span>
          <span>100% WAADI Compliant</span>
        </div>
      </div>
    </div>
  );
}
