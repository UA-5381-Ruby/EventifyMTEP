import { useOutletContext } from 'react-router-dom';
import { useEvents } from '@/hooks/use-events';
import type { Brand } from '@/types/brand';
import { Spinner } from '@/components/ui';
import { EventsTable } from '../../components/admin/event/events-table.tsx';

import { useEventsFilters } from '@/hooks/use-events-filters.ts';
import { EventsToolbar } from '../../components/admin/events-toolbar.tsx';
import { EventsPagination } from '../../components/admin/event/events-pagination.tsx';

const EventsPage = () => {
  const { brand } = useOutletContext<{ brand: Brand }>();

  const {
    page,
    setPage,
    search,
    sortField,
    sortOrder,
    perPage,
    queryParams,
    handleSearchChange,
    handleSortChange,
  } = useEventsFilters(brand.id);

  const { events = [], meta, isLoading, error } = useEvents(queryParams);

  const totalPages = (meta?.total_pages ?? Math.ceil((meta?.total || 0) / perPage)) || 1;
  const totalEventsCount = meta?.total ?? events.length;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <EventsToolbar
        search={search}
        sortValue={`${sortField}-${sortOrder}`}
        onSearchChange={handleSearchChange}
        onSortChange={handleSortChange}
      />

      {error && (
        <div className="p-4 bg-red-50 text-red-600 text-sm border border-red-100">{error}</div>
      )}

      <div className="space-y-0 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex justify-center items-center z-10">
            <Spinner />
          </div>
        )}

        <EventsTable events={events} canManage={true} />

        <EventsPagination
          currentCount={events.length}
          totalCount={totalEventsCount}
          page={page}
          totalPages={totalPages}
          isLoading={isLoading}
          perPage={perPage}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
};

export default EventsPage;
