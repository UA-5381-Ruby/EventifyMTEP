import { useMemo } from 'react';
import { PageWrapper, Container } from '@/components/layout';
import { Pagination } from '@/components/ui';
import { EventPageHeader } from '@/components/events/event-page-header.tsx';
import { EventFilters } from '@/components/events/event-filters.tsx';
import { EventGrid } from '@/components/events/event-grid.tsx';
import { useEvents } from '@/hooks/use-events.ts';
import type { EventQueryParams, EventStatus } from '@/types/event';
import { PER_PAGE } from '@/constants/ui.constants';
import { STATUS_TABS, STATUS_CONFIG, STATUS_TO_TAB } from '@/constants/event.constants';
import { useReduxState } from '@/hooks/use-redux-state';

export function EventListPage() {
  const [search, setSearch] = useReduxState('');
  const [status, setStatus] = useReduxState('');
  const [sort, setSort] = useReduxState<EventQueryParams['sort']>('created_at');
  const [page, setPage] = useReduxState(1);

  const params: EventQueryParams = {
    page,
    per_page: PER_PAGE,
    sort,
    order: sort === 'title' ? 'asc' : 'desc',
    ...(search.trim() ? { q: search.trim() } : {}),
    ...(status ? { status: status as EventStatus } : {}),
  };

  const { events, meta, isLoading, error, refetch, allStatuses } = useEvents(params);

  const availableTabs = useMemo(() => {
    if (allStatuses === null) return [];
    if (!allStatuses.length) return STATUS_TABS;

    const presentGroups = new Set(allStatuses.map((s) => STATUS_CONFIG[s]?.group));
    return STATUS_TABS.filter(
      (tab) => tab.value === '' || presentGroups.has(STATUS_TO_TAB[tab.value])
    );
  }, [allStatuses]);

  const totalPages = meta?.total_pages ?? 1;

  function resetPage() {
    setPage(1);
  }

  function clearFilters() {
    setSearch('');
    setStatus('');
    setPage(1);
  }

  return (
    <PageWrapper>
      <div className="min-h-screen bg-neutral-50">
        <EventPageHeader
          total={meta?.total ?? null}
          isLoading={isLoading}
          search={search}
          status={status}
          onRemoveSearch={() => {
            setSearch('');
            resetPage();
          }}
          onRemoveStatus={() => {
            setStatus('');
            resetPage();
          }}
        />

        <Container>
          <div className="py-8">
            <EventFilters
              search={search}
              status={status}
              sort={sort ?? 'created_at'}
              tabs={availableTabs}
              onSearchChange={(e) => {
                setSearch(e.target.value);
                resetPage();
              }}
              onStatusChange={(value) => {
                setStatus(value);
                resetPage();
              }}
              onSortChange={(e) => {
                setSort(e.target.value as EventQueryParams['sort']);
                resetPage();
              }}
            />

            <EventGrid
              events={events}
              isLoading={isLoading}
              error={error}
              hasActiveFilters={!!(search || status)}
              onRetry={refetch}
              onClearFilters={clearFilters}
            />

            {!isLoading && (
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            )}
          </div>
        </Container>
      </div>
    </PageWrapper>
  );
}
