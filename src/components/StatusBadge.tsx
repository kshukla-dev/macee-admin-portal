'use client';

import React from 'react';
import { StatusDropdown } from './StatusDropdown';

export type LeadStatus = 'new' | 'in-progress' | 'contacted' | 'closed';

export interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
  onChange?: (newStatus: string) => void | Promise<void>;
  preset?: 'lead' | 'blog' | 'active';
  align?: 'left' | 'right';
  className?: string;
}

export function StatusBadge({
  status,
  onChange,
  preset = 'lead',
  align = 'left',
  className,
}: StatusBadgeProps) {
  return (
    <StatusDropdown
      status={status}
      onChange={onChange}
      preset={preset}
      align={align}
      className={className}
    />
  );
}

export default StatusBadge;
