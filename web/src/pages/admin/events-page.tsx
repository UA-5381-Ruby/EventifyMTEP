import { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useEvents } from '@/hooks/use-events';
import type { Brand } from '@/types/brand';
import { Button, Spinner } from '@/components/ui';
import { EventsTable } from '../../components/admin/event/events-table.tsx';

const EventsPage = () => {
  const { brand } = useOutletContext<{ brand: Brand }>();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { events, meta, isLoading, error } = useEvents({
    brand_id: brand.id,
    page: page,
    per_page: 10,
    sort: 'created_at',
    order: 'desc',
  });

  if (isLoading && events.length === 0) {
    return (
      <div className="flex justify-center pt-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-end">
        <Button
          onClick={() => navigate('/dashboard/events/create')}
          className="bg-black text-white rounded-none px-8 py-2 text-sm font-black uppercase tracking-widest shadow-none border-none"
        >
          Create Event
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 text-sm border border-red-100">{error}</div>
      )}

      <div className="space-y-0">
        <EventsTable events={events} canManage={true} />

        <div className="p-4 px-8 border border-t-0 border-neutral-200 flex justify-between items-center bg-white text-[10px] font-black uppercase tracking-widest text-neutral-400">
          <span>
            Showing {events.length} of {meta?.total || 0} events
          </span>
          <div className="flex gap-6">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="hover:text-black cursor-pointer disabled:opacity-20 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={events.length < 10}
              className="hover:text-black cursor-pointer disabled:opacity-20 transition-colors"
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
