'use client';

import React, { useState, useRef } from 'react';
import {
  Upload,
  Link2,
  X,
  Image as ImageIcon,
  CheckCircle2,
  RefreshCw,
  User,
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
  helperText = 'Upload a photo from your computer or enter an image URL.',
  aspect = 'square',
  previewShape = 'circle',
}: ImagePickerProps) {
  // Determine initial mode: if value starts with http or /uploads, default to appropriate or upload
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    try {
      setUploading(true);
      setUploadError(null);

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      onChange(data.url);
    } catch (err: any) {
      console.error('Upload error:', err);
      setUploadError(err.message || 'Failed to upload photo');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      await uploadFile(file);
    }
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
            onClick={() => setMode('upload')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-all ${
              mode === 'upload'
                ? 'bg-white text-[#111827] shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-3 h-3" />
            <span>Upload Photo</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-all ${
              mode === 'url'
                ? 'bg-white text-[#111827] shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Link2 className="w-3 h-3" />
            <span>Image URL</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-slate-50/80 rounded-2xl border border-slate-200/90 p-3.5 space-y-3">
        {/* Top: Current Image Preview + Actions */}
        <div className="flex items-center space-x-3.5">
          {/* Avatar / Thumbnail Preview */}
          <div className="relative shrink-0 group">
            {value ? (
              <img
                src={value}
                alt="Preview"
                className={`object-cover bg-white border-2 border-white shadow-xs ${
                  previewShape === 'circle'
                    ? 'w-14 h-14 rounded-full'
                    : 'w-18 h-14 rounded-xl'
                }`}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face';
                }}
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

            {uploading && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <RefreshCw className="w-4 h-4 text-white animate-spin" />
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
                No photo selected yet. Choose an option below.
              </p>
            )}
          </div>
        </div>

        {/* Bottom Input Area based on Mode */}
        {mode === 'upload' ? (
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
              className="hidden"
            />
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer border-2 border-dashed rounded-xl p-4 text-center transition-all ${
                dragOver
                  ? 'border-[#E30613] bg-red-50/50'
                  : 'border-slate-300 hover:border-slate-400 bg-white'
              }`}
            >
              <div className="flex flex-col items-center justify-center space-y-1.5">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700">
                    {uploading ? 'Uploading image...' : 'Click to upload or drag & drop'}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    PNG, JPG, WEBP, or GIF (max 10MB)
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="relative">
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="https://www.macee.com/uploads/... or full image URL"
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
            <p className="text-[10px] text-slate-400">
              Paste direct image link from website, CDN, or media library.
            </p>
          </div>
        )}

        {/* Error notification */}
        {uploadError && (
          <p className="text-[11px] font-semibold text-rose-600">
            ✕ {uploadError}
          </p>
        )}
      </div>

      {helperText && (
        <p className="text-[10px] text-slate-400 px-1">{helperText}</p>
      )}
    </div>
  );
}
