import React from 'react';
import { Input, Select } from '@/components/ui';

export const STATUS_OPTIONS = [
  { value: '',                 label: 'All statuses' },
  { value: 'published',        label: 'Published'    },
  { value: 'draft',            label: 'Draft'        },
  { value: 'draft_on_review',  label: 'In Review'    },
  { value: 'cancelled',        label: 'Cancelled'    },
  { value: 'archived',         label: 'Archived'     },
];

export const SORT_OPTIONS = [
  { value: 'created_at', label: 'Newest first' },
  { value: 'start_date', label: 'Start date'   },
  { value: 'title',      label: 'Title A–Z'    },
];

interface EventFiltersProps {
  search: string;
  status: string;
  sort: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStatusChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onSortChange:   (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export function EventFilters({
  search,
  status,
  sort,
  onSearchChange,
  onStatusChange,
  onSortChange,
}: EventFiltersProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
      <Input
        placeholder="Search by title…"
        value={search}
        onChange={onSearchChange}
        leftIcon={<SearchIcon />}
      />
      <Select
        options={STATUS_OPTIONS}
        value={status}
        onChange={onStatusChange}
      />
      <Select
        options={SORT_OPTIONS}
        value={sort}
        onChange={onSortChange}
      />
    </div>
  );
}

function SearchIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="6.5" cy="6.5" r="4.5" />
      <path d="M10.5 10.5L14 14" strokeLinecap="round" />
    </svg>
  );
}