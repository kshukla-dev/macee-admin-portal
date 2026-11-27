'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface StatusOption {
  value: string;
  label: string;
  pill: string;
  dot: string;
  hover: string;
}

export const STATUS_PRESETS: Record<string, Record<string, StatusOption>> = {
  lead: {
    new: {
      value: 'new',
      label: 'New',
      pill: 'bg-rose-50 text-[#E30613] border-rose-200 hover:bg-rose-100/80',
      dot: 'bg-[#E30613]',
      hover: 'hover:bg-rose-50 hover:text-[#E30613]',
    },
    in_progress: {
      value: 'in_progress',
      label: 'In Progress',
      pill: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/80',
      dot: 'bg-amber-500',
      hover: 'hover:bg-amber-50 hover:text-amber-700',
    },
    'in-progress': {
      value: 'in_progress',
      label: 'In Progress',
      pill: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/80',
      dot: 'bg-amber-500',
      hover: 'hover:bg-amber-50 hover:text-amber-700',
    },
    converted: {
      value: 'converted',
      label: 'Converted',
      pill: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/80',
      dot: 'bg-emerald-500',
      hover: 'hover:bg-emerald-50 hover:text-emerald-700',
    },
    contacted: {
      value: 'converted',
      label: 'Converted',
      pill: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/80',
      dot: 'bg-emerald-500',
      hover: 'hover:bg-emerald-50 hover:text-emerald-700',
    },
    archived: {
      value: 'archived',
      label: 'Archived',
      pill: 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200/80',
      dot: 'bg-slate-400',
      hover: 'hover:bg-slate-100 hover:text-slate-700',
    },
    closed: {
      value: 'archived',
      label: 'Archived',
      pill: 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200/80',
      dot: 'bg-slate-400',
      hover: 'hover:bg-slate-100 hover:text-slate-700',
    },
  },
  blog: {
    published: {
      value: 'published',
      label: 'Published',
      pill: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/80',
      dot: 'bg-emerald-500',
      hover: 'hover:bg-emerald-50 hover:text-emerald-700',
    },
    draft: {
      value: 'draft',
      label: 'Draft',
      pill: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/80',
      dot: 'bg-amber-500',
      hover: 'hover:bg-amber-50 hover:text-amber-700',
    },
  },
  active: {
    active: {
      value: 'active',
      label: 'Active',
      pill: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/80',
      dot: 'bg-emerald-500',
      hover: 'hover:bg-emerald-50 hover:text-emerald-700',
    },
    inactive: {
      value: 'inactive',
      label: 'Inactive',
      pill: 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200/80',
      dot: 'bg-slate-400',
      hover: 'hover:bg-slate-100 hover:text-slate-700',
    },
  },
};

const DEFAULT_OPTIONS_BY_PRESET: Record<string, StatusOption[]> = {
  lead: [
    STATUS_PRESETS.lead.new,
    STATUS_PRESETS.lead.in_progress,
    STATUS_PRESETS.lead.converted,
    STATUS_PRESETS.lead.archived,
  ],
  blog: [
    STATUS_PRESETS.blog.published,
    STATUS_PRESETS.blog.draft,
  ],
  active: [
    STATUS_PRESETS.active.active,
    STATUS_PRESETS.active.inactive,
  ],
};

export interface StatusDropdownProps {
  status: string;
  onChange?: (newStatus: string) => void | Promise<void>;
  options?: StatusOption[];
  preset?: 'lead' | 'blog' | 'active';
  disabled?: boolean;
  align?: 'left' | 'right';
  className?: string;
  title?: string;
}

export function StatusDropdown({
  status,
  onChange,
  options,
  preset = 'lead',
  disabled = false,
  align = 'left',
  className = '',
  title = 'Change Status',
}: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const norm = (status || '').toLowerCase().trim();
  const presetConfig = STATUS_PRESETS[preset] || STATUS_PRESETS.lead;
  const currentConfig: StatusOption =
    presetConfig[norm] ||
    options?.find((o) => o.value === norm) || {
      value: status,
      label: status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown',
      pill: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200/80',
      dot: 'bg-slate-400',
      hover: 'hover:bg-slate-100 hover:text-slate-800',
    };

  const availableOptions: StatusOption[] =
    options && options.length > 0
      ? options
      : DEFAULT_OPTIONS_BY_PRESET[preset] || DEFAULT_OPTIONS_BY_PRESET.lead;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (newStatus: string) => {
    if (disabled || !onChange) return;
    onChange(newStatus);
    setIsOpen(false);
  };

  const canEdit = !disabled && Boolean(onChange);

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      <button
        type="button"
        disabled={!canEdit}
        onClick={() => canEdit && setIsOpen((prev) => !prev)}
        className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
          canEdit ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#E30613]/25' : 'cursor-default'
        } ${currentConfig.pill}`}
        title={canEdit ? title : currentConfig.label}
      >
        <span>{currentConfig.label}</span>
        {canEdit && (
          <ChevronDown
            className={`w-3 h-3 transition-transform duration-150 shrink-0 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        )}
      </button>

      {isOpen && canEdit && (
        <div
          className={`absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } top-full mt-1.5 w-36 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-fadeIn`}
        >
          {availableOptions.map((opt) => {
            const isSelected =
              opt.value === currentConfig.value ||
              opt.value === norm ||
              opt.label.toLowerCase() === norm;

            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                className={`w-full px-3 py-1.5 text-xs text-left flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? 'font-bold bg-slate-50 text-slate-900'
                    : `text-slate-700 ${opt.hover}`
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#E30613] shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default StatusDropdown;
