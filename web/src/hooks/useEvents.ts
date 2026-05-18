import { useState, useEffect, useCallback } from 'react';
import { EventsService } from '../services/eventsService';
import type { Event, EventQueryParams, PaginationMeta } from '../types/event.types';

interface UseEventsState {
  events: Event[];
  meta: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
}

interface UseEventsReturn extends UseEventsState {
  refetch: () => void;
}

export function useEvents(params: EventQueryParams): UseEventsReturn {
  const [state, setState] = useState<UseEventsState>({
    events: [],
    meta: null,
    isLoading: true,
    error: null,
  });

  const fetchEvents = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await EventsService.getEvents(params);
      setState({ events: response.data, meta: response.meta, isLoading: false, error: null });
    } catch {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load events. Please try again.',
      }));
    }
  }, [JSON.stringify(params)]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return { ...state, refetch: fetchEvents };
}