import { Calendar, Clock, Ticket, Users } from 'lucide-react';
import { formatDate, formatTimeRange } from '@/utils/date';
import type { EventDetail } from '@/types/event';

interface EventDateTimeSectionProps {
  event: EventDetail;
}

export function EventDateTimeSection({ event }: EventDateTimeSectionProps) {
  const timeRange = formatTimeRange(event.start_date, event.end_date);

  return (
    <div className="flex gap-4 py-6">
      <div className="flex-1">
        <p className="text-sm font-semibold text-neutral-800 mb-2">Date and Time</p>
        <div className="flex items-center gap-2 text-sm text-neutral-600 mb-1">
          <Calendar size={14} className="shrink-0 text-neutral-400" />
          <span>{formatDate(event.start_date)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-neutral-600 mb-2">
          <Clock size={14} className="shrink-0 text-neutral-400" />
          <span>{timeRange}</span>
        </div>
        <button className="text-xs text-amber-500 font-medium hover:underline">
          + Add to Calendar
        </button>
      </div>

      <div className="flex flex-col items-end gap-2 shrink-0">
        <button className="flex items-center gap-2 bg-amber-400 hover:bg-amber-500 transition-colors text-white font-semibold text-sm px-5 py-2.5 rounded-lg shadow-sm">
          <Ticket size={14} />
          Buy Tickets
        </button>
        <div className="flex items-center gap-1.5 text-xs text-neutral-500">
          <Users size={12} />
          <span>210/300 tickets</span>
        </div>
      </div>
    </div>
  );
}
