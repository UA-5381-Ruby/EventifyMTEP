import React from 'react';
import { Select, Badge, SearchInput, Tabs } from '@/components/ui';
import { SORT_OPTIONS, STATUS_TABS } from '@/constants/event.constants';

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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SearchInput placeholder="Search by title…" value={search} onChange={onSearchChange} />
        <Select options={SORT_OPTIONS} value={sort} onChange={onSortChange} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Tabs tabs={STATUS_TABS} activeValue={status} onChange={onStatusChange} />

        {pendingCount > 0 && (
          <Badge variant="warning" className="text-[10px]">
            {pendingCount} pending review
          </Badge>
        )}
      </div>
    </div>
  );
}
