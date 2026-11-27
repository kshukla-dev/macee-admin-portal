'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Sparkles,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
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
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white selection:bg-[#E30613]/20">
      {/* Top Accent Line in Macee Red */}
      <div className="h-[3px] w-full bg-[#E30613] fixed top-0 left-0 z-50 pointer-events-none" />

      {/* =================================================================
          LEFT COLUMN: SIGN IN FORM (Clean White Editorial Canvas)
          ================================================================= */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:py-10 lg:pl-10 xl:pl-14 lg:pr-14 xl:pr-20 bg-white min-h-screen">
        {/* Top: Macee Brand Logo (Top-Left Corner, Enlarged Size) */}
        <div className="w-full flex items-center justify-start">
          <img
            src="/images/macee-logo.png"
            alt="Macee External Workforce Solutions"
            className="h-10 sm:h-12 lg:h-14 xl:h-16 w-auto object-contain"
            onError={(e) => {
              // Fallback to white logo if dark logo is missing
              const target = e.currentTarget as HTMLImageElement;
              target.onerror = null;
              target.src = '/uploads/Macee-landscape-tricolore.png';
            }}
          />
        </div>

        {/* Middle: Sign In Form Box (Balanced Spacing Near Center Divider) */}
        <div className="w-full max-w-[420px] mx-auto lg:ml-auto lg:mr-0 my-8 lg:my-auto py-4 space-y-6">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] font-heading tracking-tight">
              Sign in
            </h1>
          </div>

          {/* Quick Demo Credentials Chip */}
          <div
            onClick={handleQuickFill}
            className="cursor-pointer group flex items-center justify-between p-3 rounded-xl bg-[#F0F3FA] border border-[#8E96CB]/30 hover:border-[#8E96CB] hover:bg-[#EAF0FC] transition-all text-xs"
            title="Click to auto-fill administrative credentials"
          >
            <div className="flex items-center space-x-2 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-[#36427D] shrink-0" />
              <span className="text-[11px] truncate">
                <strong>Demo:</strong> admin@macee.com / admin123
              </span>
            </div>
            <span className="text-[11px] font-bold text-[#E30613] group-hover:underline shrink-0 pl-2">
              Auto-fill
            </span>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="flex items-center space-x-2.5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email address*
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@macee.com"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:border-[#E30613] focus:ring-1 focus:ring-[#E30613] transition-all shadow-2xs"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password*
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full pl-3.5 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:border-[#E30613] focus:ring-1 focus:ring-[#E30613] transition-all shadow-2xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Quick Forgot / Demo Fill */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center space-x-2 text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4.5 h-4.5 rounded border-slate-300 accent-[#E30613] text-[#E30613] focus:ring-0 cursor-pointer"
                />
                <span className="font-medium">Remember me</span>
              </label>

              <button
                type="button"
                onClick={handleQuickFill}
                className="text-xs font-semibold text-[#E30613] hover:text-[#b80510] hover:underline transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Sign In Primary Button in Macee Brand Red */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#E30613] hover:bg-[#b80510] text-white font-semibold text-xs transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-heading tracking-wide"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>
        </div>


      </div>

      {/* =================================================================
          RIGHT COLUMN: BRAND HERO (Deep Macee Dark Canvas & Visuals)
          ================================================================= */}
      <div className="w-full lg:w-1/2 bg-[#0E1726] relative overflow-hidden flex flex-col justify-between p-6 sm:p-10 lg:py-10 lg:pl-14 xl:pl-20 lg:pr-10 xl:pr-14 text-white min-h-[460px] lg:min-h-screen">
        {/* Ambient Brand Atmospheric Lighting */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#8E96CB]/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#E30613]/20 rounded-full blur-[140px] pointer-events-none" />

        {/* Subtle Decorative Dot-Matrix Grid (matching reference UI) */}
        <svg
          className="absolute top-8 right-8 w-36 h-36 text-slate-700/35 pointer-events-none"
          fill="currentColor"
          viewBox="0 0 120 120"
        >
          <pattern
            id="dot-grid"
            x="0"
            y="0"
            width="15"
            height="15"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1.5" />
          </pattern>
          <rect width="120" height="120" fill="url(#dot-grid)" />
        </svg>

        {/* Concentric Aesthetic Circles in Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-slate-800/30 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] rounded-full border border-slate-800/15 pointer-events-none" />

        {/* Top Header Badge */}
        <div className="relative z-10 w-full flex items-center justify-start">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-xs font-semibold text-slate-200">
            <span>Macee Management Portal</span>
          </div>
        </div>

        {/* Middle: Big Hero Messaging (Aligned Near Center Divider) */}
        <div className="relative z-10 w-full max-w-[480px] mx-auto lg:mr-auto lg:ml-0 my-8 lg:my-auto py-4 space-y-6">
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl xl:text-5xl font-bold tracking-tight text-white font-heading leading-tight">
              Welcome to <br />
              <span className="text-white">Macee Workforce</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md font-sans">
              Macee empowers international organisations to manage staffing workflows, compliance, and talent deployment effortlessly with precision tools. Connect with verified specialists and streamline your operations today!
            </p>
          </div>


        </div>


      </div>
    </div>
  );
}
