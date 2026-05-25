import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Share2 } from 'lucide-react';

import { Spinner } from '@/components/ui';
import type { EventDetail } from '@/types/event';
import { EventsService } from '@/services/events-service';

import { EventHero } from '@/components/events/event-hero';
import { EventDateTimeSection } from '@/components/events/event-date-time';
import { EventLocationSection } from '@/components/events/event-location';
import { EventHostSection } from '@/components/events/event-host';
import { EventDescriptionSection } from '@/components/events/event-description';

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [eventDetail, setEventDetail] = useState<EventDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const data = await EventsService.getEventById(Number(id));
        setEventDetail(data);
      } catch (err) {
        console.error('Error fetching event detail:', err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    }
    fetchEvent();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (error || !eventDetail) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-neutral-500">Event not found.</p>
        <button onClick={() => navigate('/events')} className="text-sm underline">
          Back to events
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white max-w-lg mx-auto">
      <EventHero event={eventDetail} onBack={() => navigate(-1)} />

      <div className="px-5 pb-10">
        {/* Title + actions */}
        <div className="flex items-start justify-between gap-4 pt-5 mb-1">
          <h1 className="text-2xl font-bold text-neutral-900 leading-tight flex-1">
            {eventDetail.title}
          </h1>
          <div className="flex items-center gap-3 pt-1 shrink-0">
            <button className="text-neutral-400 hover:text-amber-400 transition-colors">
              <Star size={20} />
            </button>
            <button className="text-neutral-400 hover:text-neutral-700 transition-colors">
              <Share2 size={20} />
            </button>
          </div>
        </div>

        <div className="divide-y divide-neutral-100">
          <EventDateTimeSection event={eventDetail} />
          <EventLocationSection location={eventDetail.location} />
          <EventHostSection brand={eventDetail.brand} />
          <EventDescriptionSection description={eventDetail.description} />
        </div>
      </div>
    </div>
  );
}
