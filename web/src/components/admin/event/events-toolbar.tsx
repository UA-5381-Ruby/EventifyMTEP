import { type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';
interface EventsToolbarProps {
  search: string;
  sortValue: string;
  onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSortChange: (e: ChangeEvent<HTMLSelectElement>) => void;
}

export const EventsToolbar = ({
  search,
  sortValue,
  onSearchChange,
  onSortChange,
}: EventsToolbarProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex flex-1 flex-col sm:flex-row gap-3 max-w-2xl">
        <input
          type="text"
          placeholder="Search events..."
          value={search}
          onChange={onSearchChange}
          className="flex-1 px-4 py-2 text-xs font-medium border border-neutral-200 bg-white text-neutral-900 rounded-none placeholder-neutral-400 focus:outline-none focus:border-black transition-colors"
        />

        <select
          value={sortValue}
          onChange={onSortChange}
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
  );
};
