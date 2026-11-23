'use client';

import React, { useState, useRef } from 'react';
import {
  Upload,
  Link2,
  X,
  CheckCircle2,
  User,
  Lock,
  Sparkles,
} from 'lucide-react';

interface ImagePickerProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  helperText?: string;
  aspect?: 'square' | 'wide';
  previewShape?: 'circle' | 'rounded';
}

export function ImagePicker({
  value,
  onChange,
  label = 'Profile Photo',
  helperText = 'Enter an image URL. Direct file upload requires a plan upgrade.',
  aspect = 'square',
  previewShape = 'circle',
}: ImagePickerProps) {
  // Default to 'url' mode since direct upload is gated
  const [mode, setMode] = useState<'upload' | 'url'>('url');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  // Reset imgError whenever value changes
  React.useEffect(() => {
    setImgError(false);
  }, [value]);

  const handleBlockedUpload = () => {
    setUploadError('Need to upgrade the plan to upload photos directly. Please use Image URL.');
  };

  const handleDropBlocked = (e: React.DragEvent) => {
    e.preventDefault();
    setUploadError('Need to upgrade the plan to upload photos directly. Please use Image URL.');
  };

  const handleRemove = () => {
    onChange('');
    setUploadError(null);
  };

  return (
    <div className="space-y-2">
      {/* Label & Mode Switcher */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700">
          {label}
        </label>
        <div className="inline-flex p-0.5 rounded-lg bg-slate-100 border border-slate-200/80 text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('url');
              setUploadError(null);
            }}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-all ${
              mode === 'url'
                ? 'bg-white text-[#111827] shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Link2 className="w-3 h-3 text-[#E30613]" />
            <span>Image URL</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md transition-all ${
              mode === 'upload'
                ? 'bg-white text-slate-800 shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Lock className="w-3 h-3 text-amber-500" />
            <span>Upload Photo</span>
            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200/70">
              PRO
            </span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-slate-50/80 rounded-2xl border border-slate-200/90 p-3.5 space-y-3">
        {/* Top: Current Image Preview + Actions */}
        <div className="flex items-center space-x-3.5">
          {/* Avatar / Thumbnail Preview */}
          <div className="relative shrink-0 group">
            {value && !imgError ? (
              <img
                src={value}
                alt="Preview"
                className={`object-cover bg-white border-2 border-white shadow-xs ${
                  previewShape === 'circle'
                    ? 'w-14 h-14 rounded-full'
                    : 'w-18 h-14 rounded-xl'
                }`}
                onError={() => setImgError(true)}
              />
            ) : (
              <div
                className={`bg-slate-200 text-slate-400 flex items-center justify-center border-2 border-white shadow-xs ${
                  previewShape === 'circle'
                    ? 'w-14 h-14 rounded-full'
                    : 'w-18 h-14 rounded-xl'
                }`}
              >
                <User className="w-6 h-6" />
              </div>
            )}
          </div>

          {/* Details & Actions */}
          <div className="flex-1 min-w-0">
            {value ? (
              <div className="space-y-1">
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-xs font-semibold text-slate-800">
                    Photo Selected
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate max-w-[240px]">
                  {value}
                </p>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline"
                >
                  Remove Photo
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                No photo selected yet. Paste an image URL below.
              </p>
            )}
          </div>
        </div>

        {/* Bottom Input Area based on Mode */}
        {mode === 'upload' ? (
          /* Blocked Upload Section */
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDropBlocked}
            className="border-2 border-dashed border-amber-300/80 bg-gradient-to-b from-amber-50/70 to-orange-50/40 rounded-xl p-4 sm:p-5 text-center relative overflow-hidden"
          >
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-amber-100 border border-amber-200 text-amber-600 flex items-center justify-center shadow-2xs">
                <Lock className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="inline-flex items-center space-x-1 text-amber-700 font-bold text-xs bg-amber-100/80 px-2 py-0.5 rounded-md">
                  <Sparkles className="w-3 h-3" />
                  <span>Feature Locked</span>
                </div>
                <p className="text-sm font-bold text-slate-800 pt-1">
                  Need to upgrade the plan
                </p>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Direct image upload from your device is not available on your current plan. Please use the <strong>Image URL</strong> option to add photos, or upgrade your plan.
                </p>
              </div>

              <div className="pt-1.5 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('url');
                    setUploadError(null);
                  }}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-[#E30613] hover:bg-[#b80510] text-white text-xs font-semibold transition-all shadow-xs"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Use Image URL Instead</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Active Image URL Section */
          <div className="space-y-1.5">
            <div className="relative">
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="https://www.macee.com/uploads/... or any direct image URL"
                className="w-full bg-white p-2.5 pr-8 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#E30613]"
              />
              {value && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <p className="text-[10px] text-slate-400 flex items-center justify-between">
              <span>Paste direct image link from website, CDN, Unsplash, or media library.</span>
              <span className="text-emerald-600 font-semibold text-[10px]">✓ Active & Supported</span>
            </p>
          </div>
        )}

        {/* Error notification */}
        {uploadError && (
          <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold flex items-center space-x-1.5">
            <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {helperText && (
        <p className="text-[10px] text-slate-400 px-1">{helperText}</p>
      )}
    </div>
  );
}
