import { useState, useEffect } from 'react';
import { EventsService } from '@/services/events-service';
import { EventLifecycleService } from '@/services/event-lifecycle-service';
import type { EventDetail } from '@/types/event';

interface UseEventDetailResult {
  event: EventDetail | null;
  isLoading: boolean;
  error: string | null;
  isSubmitting: boolean;
  isCancelling: boolean;
  handleSubmitEvent: () => Promise<void>;
  handleCancelEvent: () => Promise<void>;
}

export function useEventDetail(id: number): UseEventDetailResult {
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    EventsService.getEventById(id)
      .then((eventData) => {
        if (!isMounted) return;
        setEvent(eventData);
      })
      .catch(() => {
        if (isMounted) setError('Failed to load event data.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleSubmitEvent = async () => {
    if (!event) return;
    setIsSubmitting(true);
    setError(null);
    try {
      // Використовуємо коректний сервіс, який є в наявності
      const updated = await EventLifecycleService.submitEvent(event.id);
      setEvent(updated as unknown as EventDetail);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submit failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelEvent = async () => {
    if (!event) return;
    setIsCancelling(true);
    setError(null);
    try {
      // Використовуємо коректний сервіс, який є в наявності
      const updated = await EventLifecycleService.cancelEvent(event.id);
      setEvent(updated as unknown as EventDetail);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cancel failed.');
    } finally {
      setIsCancelling(false);
    }
  };

  return {
    event,
    isLoading,
    error,
    isSubmitting,
    isCancelling,
    handleSubmitEvent,
    handleCancelEvent,
  };
}
