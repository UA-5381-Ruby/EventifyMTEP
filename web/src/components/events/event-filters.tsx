import React from 'react';
import { Button, Input, Select, Badge } from '@/components/ui';
import { SORT_OPTIONS } from '@/constants/event.constants';
import type { EventStatus } from '@/types/event';

export type EventTabStatus = 'All' | 'Active' | 'Drafts' | 'Archived' | 'Cancelled';

export const TAB_TO_STATUS: Record<EventTabStatus, string> = {
  All: '',
  Active: 'published',
  Drafts: 'draft',
  Archived: 'archived',
  Cancelled: 'cancelled',
};

export const STATUS_TO_TAB: Record<string, EventTabStatus> = {
  '': 'All',
  published: 'Active',
  draft: 'Drafts',
  archived: 'Archived',
  cancelled: 'Cancelled',
};

// ─── Internal ─────────────────────────────────────────────────────────────────

const STATUS_TABS: { value: EventStatus | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'published', label: 'Active' },
  { value: 'draft', label: 'Drafts' },
  { value: 'archived', label: 'Archived' },
  { value: 'cancelled', label: 'Cancelled' },
];

interface EventFiltersProps {
  search: string;
  status: string;
  sort: string;
  pendingCount?: number;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStatusChange: (value: string) => void;
  onSortChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export function EventFilters({
  search,
  status,
  sort,
  pendingCount = 0,
  onSearchChange,
  onStatusChange,
  onSortChange,
}: EventFiltersProps) {
  return (
    <div className="flex flex-col gap-3 mb-8">
      {/* Search + Sort */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          placeholder="Search by title…"
          value={search}
          onChange={onSearchChange}
          leftIcon={<SearchIcon />}
        />
        <Select options={SORT_OPTIONS} value={sort} onChange={onSortChange} />
      </div>

      {/* Status Tabs + pending badge */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1 bg-neutral-50 p-1 rounded-xl w-fit" role="tablist">
          {STATUS_TABS.map((tab) => {
            const isActive = status === tab.value;
            return (
              <Button
                key={tab.value}
                size="sm"
                variant={isActive ? 'outline' : 'ghost'}
                onClick={() => onStatusChange(tab.value)}
                className={`text-xs px-4 py-1.5 h-auto font-medium rounded-lg transition-all duration-200 ${
                  !isActive && 'text-neutral-400 hover:text-neutral-600 hover:bg-transparent'
                }`}
              >
                {tab.label}
              </Button>
            );
          })}
        </div>

        {pendingCount > 0 && (
          <Badge variant="warning" className="text-[10px]">
            {pendingCount} pending review
          </Badge>
        )}
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="6.5" cy="6.5" r="4.5" />
      <path d="M10.5 10.5L14 14" strokeLinecap="round" />
    </svg>
  );
}
