import { Button, Alert } from '@/components/ui';
import { EventCard, EventCardSkeleton } from '@/components/events/event-card.tsx';
import type { Event } from '@/types/event';

interface EventGridProps {
  events: Event[];
  isLoading: boolean;
  error: string | null;
  hasActiveFilters: boolean;
  onRetry: () => void;
  onClearFilters: () => void;
}

export function EventGrid({
  events,
  isLoading,
  error,
  hasActiveFilters,
  onRetry,
  onClearFilters,
}: EventGridProps) {
  if (error) {
    return (
      <Alert variant="error" title="Could not load events" className="mb-6">
        {error}{' '}
        <button onClick={onRetry} className="underline font-medium hover:no-underline">
          Try again
        </button>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        {Array.from({ length: 6 }).map((_, i) => (
          <EventCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
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
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={onClearFilters}>
            Clear filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
