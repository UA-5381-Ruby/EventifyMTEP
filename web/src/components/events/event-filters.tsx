import React from 'react';
import { Button, Select, Badge, SearchInput } from '@/components/ui';
import { SORT_OPTIONS, STATUS_TABS } from '@/constants/event.constants'; // ← from constants

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
