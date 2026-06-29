import { useState, useEffect } from 'react';
import { EventsService } from '@/services/events-service';
import { EventLifecycleService } from '@/services/event-lifecycle-service';
import type { EventDetail, CreateEventRequest } from '@/types/event';

interface UseEventDetailResult {
  event: EventDetail | null;
  isLoading: boolean;
  error: string | null;
  isSubmitting: boolean;
  isCancelling: boolean;
  isSaving: boolean;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  handleSubmitEvent: () => Promise<void>;
  handleCancelEvent: () => Promise<void>;
  handleUpdateEvent: (payload: Partial<CreateEventRequest>) => Promise<void>;
}

export function useEventDetail(id: number): UseEventDetailResult {
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

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
      const updated = await EventLifecycleService.cancelEvent(event.id);
      setEvent(updated as unknown as EventDetail);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cancel failed.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleUpdateEvent = async (payload: Partial<CreateEventRequest>) => {
    if (!id) return;
    setIsSaving(true);
    setError(null);
    try {
      const updated = await EventsService.updateEvent(id, payload);
      setEvent(updated);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save updates.');
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    event,
    isLoading,
    error,
    isSubmitting,
    isCancelling,
    isSaving,
    isEditing,
    setIsEditing,
    handleSubmitEvent,
    handleCancelEvent,
    handleUpdateEvent,
  };
}
