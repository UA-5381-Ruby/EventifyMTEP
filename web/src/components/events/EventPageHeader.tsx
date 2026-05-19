import React from 'react';
import { Container } from '@/components/layout';
import { STATUS_OPTIONS } from './EventFilters';

interface FilterPillProps {
  children: React.ReactNode;
  onRemove: () => void;
}

function FilterPill({ children, onRemove }: FilterPillProps) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-primary-50 text-primary-700 border border-primary-200 rounded-full px-3 py-1">
      {children}
      <button
        onClick={onRemove}
        className="text-primary-400 hover:text-primary-600 transition-colors"
        aria-label="Remove filter"
      >
        ✕
      </button>
    </span>
  );
}

interface EventPageHeaderProps {
  total: number | null;
  isLoading: boolean;
  search: string;
  status: string;
  onRemoveSearch: () => void;
  onRemoveStatus: () => void;
}

export function EventPageHeader({
  total,
  isLoading,
  search,
  status,
  onRemoveSearch,
  onRemoveStatus,
}: EventPageHeaderProps) {
  const subtitle = isLoading
    ? 'Loading…'
    : total !== null
      ? `${total} event${total !== 1 ? 's' : ''} found`
      : '';

  const hasActivePills = search || status;

  return (
    <div className="bg-white border-b border-neutral-100">
      <Container>
        <div className="py-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Events</h1>
            <p className="text-neutral-400 mt-1 text-sm">{subtitle}</p>
          </div>

          {hasActivePills && (
            <div className="flex flex-wrap gap-2">
              {search && (
                <FilterPill onRemove={onRemoveSearch}>"{search}"</FilterPill>
              )}
              {status && (
                <FilterPill onRemove={onRemoveStatus}>
                  {STATUS_OPTIONS.find((o) => o.value === status)?.label}
                </FilterPill>
              )}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}