import React from 'react';

export type LeadStatus = 'new' | 'in-progress' | 'contacted' | 'closed';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const norm = status ? status.toLowerCase() : 'new';

  const config: Record<string, { label: string; bg: string; text: string; border: string; dot: string }> = {
    new: {
      label: 'New Lead',
      bg: 'bg-red-50',
      text: 'text-[#E30613]',
      border: 'border-red-200',
      dot: 'bg-[#E30613] animate-pulse',
    },
    'in-progress': {
      label: 'In Progress',
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200',
      dot: 'bg-amber-500',
    },
    contacted: {
      label: 'Contacted',
      bg: 'bg-[#F0F3FA]',
      text: 'text-[#36427D]',
      border: 'border-[#8E96CB]/40',
      dot: 'bg-[#36427D]',
    },
    closed: {
      label: 'Closed',
      bg: 'bg-slate-100',
      text: 'text-slate-600',
      border: 'border-slate-200',
      dot: 'bg-slate-400',
    },
    published: {
      label: 'Published',
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200',
      dot: 'bg-emerald-600',
    },
    draft: {
      label: 'Draft',
      bg: 'bg-[#F0F3FA]',
      text: 'text-[#111827]',
      border: 'border-slate-200',
      dot: 'bg-slate-400',
    },
  };

  const current = config[norm] || {
    label: status,
    bg: 'bg-[#F0F3FA]',
    text: 'text-[#111827]',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
  };

  const sizeClasses = size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center space-x-1.5 rounded-full font-bold border ${current.bg} ${current.text} ${current.border} ${sizeClasses} font-heading tracking-tight`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
      <span>{current.label}</span>
    </span>
  );
}
