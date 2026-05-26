import { useState, useEffect } from 'react';
import { EventsService } from '@/services/events-service';
import type { Event, PaginationMeta, EventQueryParams } from '@/types/event';

interface UseEventsState {
  events: Event[];
  meta: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
}

export function useEvents(params: EventQueryParams) {
  const [state, setState] = useState<UseEventsState>({
    events: [],
    meta: null,
    isLoading: true,
    error: null,
  });
  const [refetchIndex, setRefetchIndex] = useState(0);

  const { page, per_page, sort, order, q, status, brand_id, category_id, search } = params;

  useEffect(() => {
    let isMounted = true;

    async function startFetching() {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const response = await EventsService.getEvents({
          page,
          per_page,
          sort,
          order,
          q,
          status,
          brand_id,
          category_id,
          search,
        });

        if (isMounted) {
          setState({ events: response.data, meta: response.meta, isLoading: false, error: null });
        }
      } catch (err: unknown) {
        if (isMounted) {
          const errorMessage =
            err instanceof Error ? err.message : 'Failed to load events. Please try again.';
          setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
        }
      }
    }

    startFetching();

    return () => {
      isMounted = false;
    };
  }, [page, per_page, sort, order, q, status, brand_id, category_id, search, refetchIndex]);

  return {
    ...state,
    refetch: () => setRefetchIndex((prev) => prev + 1),
  };
}
