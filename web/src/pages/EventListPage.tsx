import React, { useState } from 'react';
import { PageWrapper, Container } from '../components/layout';
import { Input, Select, Button, Alert } from '../components/ui';
import { EventCard, EventCardSkeleton } from '../components/events/EventCard';
import { useEvents } from '../hooks/useEvents';
import type { EventQueryParams, EventStatus } from '../types/event.types';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'draft_on_review', label: 'In Review' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'archived', label: 'Archived' },
];

const SORT_OPTIONS = [
  { value: 'created_at', label: 'Newest first' },
  { value: 'start_date', label: 'Start date' },
  { value: 'title', label: 'Title A–Z' },
];

const PER_PAGE = 12;

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

export function EventListPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState<EventQueryParams['sort']>('created_at');
  const [page, setPage] = useState(1);

  const params: EventQueryParams = {
    page,
    per_page: PER_PAGE,
    sort,
    order: sort === 'title' ? 'asc' : 'desc',
    ...(search.trim() ? { q: search.trim() } : {}),
    ...(status ? { status: status as EventStatus } : {}),
  };

  const { events, meta, isLoading, error, refetch } = useEvents(params);

  const totalPages = meta ? Math.ceil(meta.total / meta.per_page) : 1;
  const hasEvents = events.length > 0;

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    setPage(1);
  }
  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setStatus(e.target.value);
    setPage(1);
  }
  function handleSortChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSort(e.target.value as EventQueryParams['sort']);
    setPage(1);
  }

  return (
    <PageWrapper>
      <div className="min-h-screen bg-neutral-50">
        <div className="bg-white border-b border-neutral-100">
          <Container>
            <div className="py-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Events</h1>
                <p className="text-neutral-400 mt-1 text-sm">
                  {isLoading
                    ? 'Loading…'
                    : meta
                      ? `${meta.total} event${meta.total !== 1 ? 's' : ''} found`
                      : ''}
                </p>
              </div>

              {(search || status) && (
                <div className="flex flex-wrap gap-2">
                  {search && (
                    <FilterPill
                      onRemove={() => {
                        setSearch('');
                        setPage(1);
                      }}
                    >
                      "{search}"
                    </FilterPill>
                  )}
                  {status && (
                    <FilterPill
                      onRemove={() => {
                        setStatus('');
                        setPage(1);
                      }}
                    >
                      {STATUS_OPTIONS.find((o) => o.value === status)?.label}
                    </FilterPill>
                  )}
                </div>
              )}
            </div>
          </Container>
        </div>

        <Container>
          <div className="py-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
              <Input
                placeholder="Search by title…"
                value={search}
                onChange={handleSearchChange}
                leftIcon={<SearchIcon />}
              />
              <Select options={STATUS_OPTIONS} value={status} onChange={handleStatusChange} />
              <Select
                options={SORT_OPTIONS}
                value={sort ?? 'created_at'}
                onChange={handleSortChange}
              />
            </div>

            {error && (
              <Alert variant="error" title="Could not load events" className="mb-6">
                {error}{' '}
                <button onClick={refetch} className="underline font-medium hover:no-underline">
                  Try again
                </button>
              </Alert>
            )}

            {isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
                {Array.from({ length: 6 }).map((_, i) => (
                  <EventCardSkeleton key={i} />
                ))}
              </div>
            )}

            {!isLoading && !error && !hasEvents && (
              <div className="flex flex-col items-center py-24 text-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-neutral-100 flex items-center justify-center text-2xl">
                  🗓️
                </div>
                <div>
                  <p className="text-neutral-800 font-semibold text-lg">No events found</p>
                  <p className="text-neutral-400 text-sm mt-1">
                    Try adjusting your filters or check back later.
                  </p>
                </div>
                {(search || status) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearch('');
                      setStatus('');
                      setPage(1);
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            )}

            {!isLoading && hasEvents && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}

            {totalPages > 1 && !isLoading && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  ← Prev
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                    .reduce<(number | 'gap')[]>((acc, p, i, arr) => {
                      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('gap');
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((p, i) =>
                      p === 'gap' ? (
                        <span key={`gap-${i}`} className="px-1 text-neutral-300 text-sm">
                          …
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={[
                            'w-8 h-8 rounded-md text-sm font-medium transition-colors',
                            p === page
                              ? 'bg-primary-500 text-white'
                              : 'text-neutral-600 hover:bg-neutral-100',
                          ].join(' ')}
                        >
                          {p}
                        </button>
                      )
                    )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next →
                </Button>
              </div>
            )}
          </div>
        </Container>
      </div>
    </PageWrapper>
  );
}

function FilterPill({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
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
