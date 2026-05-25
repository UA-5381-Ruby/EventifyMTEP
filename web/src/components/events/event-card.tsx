import { useNavigate } from 'react-router-dom';
import { Badge, Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { Event, EventStatus } from '@/types/event';
import { Calendar } from 'lucide-react';
import { STATUS_CONFIG, formatDate, isUpcoming } from '@/constants/event.constants';
import type { BadgeVariant } from '@/constants/event.constants';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const navigate = useNavigate();
  const config = STATUS_CONFIG[event.status as EventStatus] ?? {
    label: event.status,
    variant: 'default' as BadgeVariant,
  };
  const upcoming = event.start_date ? isUpcoming(event.start_date) : false;

  return (
    <article
      className={cn(
        'group relative flex flex-col rounded-xl bg-white border transition-all duration-200',
        'hover:shadow-md hover:border-neutral-200',
        upcoming ? 'border-neutral-200' : 'border-neutral-100'
      )}
    >
      {upcoming && event.status === 'published' && (
        <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl bg-emerald-400" />
      )}

      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-base font-semibold text-neutral-900 leading-snug line-clamp-2 flex-1">
            {event.title}
          </h3>
          <Badge variant={config.variant} className="shrink-0 mt-0.5">
            {config.label}
          </Badge>
        </div>

        <div className="flex items-center gap-1.5 text-sm text-neutral-500 mb-4 flex-1">
          <Calendar size={14} className="text-neutral-400 shrink-0" />
          <span>{event.start_date ? formatDate(event.start_date) : '—'}</span>
          {upcoming && (
            <span className="ml-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
              Upcoming
            </span>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          fullWidth
          onClick={() => navigate(`/events/${event.id}`)}
        >
          View Details
        </Button>
      </div>
    </article>
  );
}

export function EventCardSkeleton() {
  return (
    <div className="flex flex-col rounded-xl bg-white border border-neutral-100 p-5 animate-pulse">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="h-4 bg-neutral-100 rounded w-2/3" />
        <div className="h-5 bg-neutral-100 rounded-full w-16 shrink-0" />
      </div>
      <div className="flex items-center gap-2 mb-4">
        <div className="h-3.5 w-3.5 bg-neutral-100 rounded" />
        <div className="h-3.5 bg-neutral-100 rounded w-24" />
      </div>
      <div className="h-8 bg-neutral-100 rounded-md w-full" />
    </div>
  );
}
