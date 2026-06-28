import { useState, useMemo, type ChangeEvent } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useEvents } from '@/hooks/use-events';
import type { Brand } from '@/types/brand';
import type { EventSortField, SortOrder } from '@/types/event';
import { Button, Spinner } from '@/components/ui';
import { EventsTable } from '../../components/admin/event/events-table.tsx';

const EventsPage = () => {
  const { brand } = useOutletContext<{ brand: Brand }>();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<EventSortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const perPage = 10;

  const queryParams = useMemo(
    () => ({
      brand_id: brand.id,
      page: page,
      per_page: perPage,
      sort: sortField,
      order: sortOrder,
      ...(search.trim() ? { q: search.trim(), search: search.trim() } : {}),
    }),
    [brand.id, page, sortField, sortOrder, search]
  );

  const { events, meta, isLoading, error } = useEvents(queryParams);

  const totalPages = (meta?.total_pages ?? Math.ceil((meta?.total || 0) / perPage)) || 1;

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleSortChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const [field, order] = e.target.value.split('-') as [EventSortField, SortOrder];
    setSortField(field);
    setSortOrder(order);
    setPage(1);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-1 flex-col sm:flex-row gap-3 max-w-2xl">
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={handleSearchChange}
            className="flex-1 px-4 py-2 text-xs font-medium border border-neutral-200 bg-white text-neutral-900 rounded-none placeholder-neutral-400 focus:outline-none focus:border-black transition-colors"
          />

          {/* Селект сортування */}
          <select
            value={`${sortField}-${sortOrder}`}
            onChange={handleSortChange}
            className="px-4 py-2 text-xs font-black uppercase tracking-widest border border-neutral-200 bg-white text-neutral-900 rounded-none focus:outline-none focus:border-black cursor-pointer transition-colors"
          >
            <option value="created_at-desc">Newest First</option>
            <option value="created_at-asc">Oldest First</option>
            <option value="title-asc">Title (A-Z)</option>
            <option value="title-desc">Title (Z-A)</option>
            <option value="start_date-asc">Event Date (Soonest)</option>
            <option value="start_date-desc">Event Date (Latest)</option>
          </select>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={() => navigate('/dashboard/events/create')}
            className="bg-black text-white rounded-none px-8 py-2 text-sm font-black uppercase tracking-widest shadow-none border-none whitespace-nowrap"
          >
            Create Event
          </Button>
        </div>
      </div>

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

        <div className="p-4 px-8 border border-t-0 border-neutral-200 flex justify-between items-center bg-white text-[10px] font-black uppercase tracking-widest text-neutral-400">
          <span>
            Showing {events.length} of {meta?.total ?? events.length} events
          </span>
          <div className="flex gap-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
              className="hover:text-black cursor-pointer disabled:opacity-20 transition-colors uppercase"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages || events.length < perPage || isLoading}
              className="hover:text-black cursor-pointer disabled:opacity-20 transition-colors uppercase"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsPage;