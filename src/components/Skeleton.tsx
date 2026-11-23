import React from 'react';

export function Skeleton({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse bg-slate-200/80 rounded-md ${className}`}
      {...props}
    />
  );
}

// 4 KPI Metric Cards Skeleton
export function SkeletonKpiGrid({ count = 4 }: { count?: number }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${count} gap-4 sm:gap-5`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs flex items-center space-x-4 animate-pulse"
        >
          <div className="w-12 h-12 rounded-full bg-slate-200 shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-3 w-24 bg-slate-200 rounded" />
            <div className="flex items-center space-x-2">
              <div className="h-7 w-16 bg-slate-200 rounded" />
              <div className="h-4 w-12 bg-slate-100 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Team Member Card Skeleton
export function SkeletonMemberCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs p-5 animate-pulse flex flex-col justify-between space-y-4">
      <div>
        <div className="flex items-start space-x-3.5">
          <div className="w-14 h-14 rounded-full bg-slate-200 shrink-0" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 w-3/4 bg-slate-200 rounded" />
            <div className="h-3 w-1/2 bg-slate-200 rounded" />
            <div className="h-4 w-20 bg-slate-100 rounded-md" />
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-3.5 h-3.5 rounded-full bg-slate-200 shrink-0" />
            <div className="h-3 w-40 bg-slate-100 rounded" />
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3.5 h-3.5 rounded-full bg-slate-200 shrink-0" />
            <div className="h-3 w-28 bg-slate-100 rounded" />
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
        <div className="h-3 w-16 bg-slate-100 rounded" />
        <div className="flex space-x-2">
          <div className="h-6 w-12 bg-slate-200 rounded-lg" />
          <div className="h-6 w-12 bg-slate-100 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// Table Row Skeleton
export function SkeletonTableRow({ cols = 6 }: { cols?: number }) {
  return (
    <tr className="animate-pulse border-b border-slate-100">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-4 px-4">
          <div
            className="h-3.5 bg-slate-200 rounded"
            style={{ width: `${Math.max(35, 75 - ((i % 4) * 12))}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

// FAQ Accordion List Skeleton
export function SkeletonAccordion({ count = 5 }: { count?: number }) {
  return (
    <div className="divide-y divide-slate-100">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 sm:p-5 animate-pulse flex items-center justify-between gap-4">
          <div className="space-y-2 flex-1 max-w-xl">
            <div className="flex items-center space-x-2.5">
              <div className="h-4 w-16 bg-slate-200 rounded-md" />
              <div className="h-4 w-64 bg-slate-200 rounded" />
            </div>
            <div className="h-3 w-96 max-w-full bg-slate-100 rounded" />
          </div>
          <div className="flex items-center space-x-3 shrink-0">
            <div className="h-6 w-14 bg-slate-100 rounded-full" />
            <div className="w-5 h-5 rounded bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Certification Card Skeleton
export function SkeletonCertCard() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-2xs animate-pulse space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-20 bg-slate-200 rounded-xl" />
          <div className="h-5 w-24 bg-slate-200 rounded-md" />
        </div>
        <div className="flex space-x-2">
          <div className="h-6 w-10 bg-slate-100 rounded-md" />
          <div className="h-6 w-12 bg-slate-100 rounded-md" />
        </div>
      </div>
      <div className="h-5 w-2/3 bg-slate-200 rounded mt-2" />
      <div className="space-y-2">
        <div className="h-3 w-full bg-slate-100 rounded" />
        <div className="h-3 w-4/5 bg-slate-100 rounded" />
      </div>
    </div>
  );
}

// Technical Domain Card Skeleton
export function SkeletonDomainCard() {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-2xs animate-pulse space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-200 shrink-0" />
          <div className="h-4 w-36 bg-slate-200 rounded" />
        </div>
        <div className="flex space-x-2">
          <div className="h-5 w-10 bg-slate-100 rounded-md" />
          <div className="h-5 w-12 bg-slate-100 rounded-md" />
        </div>
      </div>
      <div className="p-3 rounded-xl bg-slate-100/80 space-y-2">
        <div className="h-3 w-full bg-slate-200 rounded" />
        <div className="h-3 w-3/4 bg-slate-200 rounded" />
      </div>
    </div>
  );
}

// Tag Chips Skeleton (for Industry Sectors)
export function SkeletonTagChips({ count = 10 }: { count?: number }) {
  return (
    <div className="flex flex-wrap gap-2.5 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-8 rounded-full bg-slate-200"
          style={{ width: `${70 + (i % 5) * 20}px` }}
        />
      ))}
    </div>
  );
}
