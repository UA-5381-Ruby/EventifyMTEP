import React from 'react';
import { SearchInput, Select } from '@/components/ui';
import { BRAND_SORT_OPTIONS } from '@/constants/brand.constants';

interface BrandFiltersProps {
  search: string;
  sort: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSortChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export function BrandFilters({ search, sort, onSearchChange, onSortChange }: BrandFiltersProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
      <SearchInput placeholder="Search brands…" value={search} onChange={onSearchChange} />
      <Select options={BRAND_SORT_OPTIONS} value={sort} onChange={onSortChange} />
    </div>
  );
}
