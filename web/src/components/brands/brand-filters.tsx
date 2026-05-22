import React from 'react';
import { Input, Select } from '@/components/ui';

// Опції сортування, оформлені як в константах івентів
const BRAND_SORT_OPTIONS = [
  { value: 'created_at', label: 'Newest' },
  { value: 'name', label: 'Name (A–Z)' },
  { value: 'events_count', label: 'Most events' },
];

interface BrandFiltersProps {
  search: string;
  sort: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSortChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export function BrandFilters({ search, sort, onSearchChange, onSortChange }: BrandFiltersProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
      <Input
        placeholder="Search brands…"
        value={search}
        onChange={onSearchChange}
        leftIcon={<SearchIcon />}
      />

      <Select options={BRAND_SORT_OPTIONS} value={sort} onChange={onSortChange} />
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
