import { useCallback, useEffect, useState } from 'react';
import type { Category } from '@/types/categories';
import { eventCategoriesService } from '@/services/eventCategoriesService';

interface UseEventCategoriesOptions {
  autoFetch?: boolean;
  refetchAfterUnlink?: boolean;
}

interface UnlinkOptions {
  refetch?: boolean;
}

interface ApiStatusError {
  status?: number;
}

const DEFAULT_ERROR_MESSAGE = 'Unable to update event categories right now.';

function getErrorStatus(error: unknown): number | null {
  if (typeof error !== 'object' || error === null) {
    return null;
  }

  const maybeStatus = (error as ApiStatusError).status;
  return typeof maybeStatus === 'number' ? maybeStatus : null;
}

function getMutationErrorMessage(status: number | null, fallback: string): string {
  switch (status) {
    case 403:
      return 'You do not have permission to modify event categories.';
    case 404:
      return 'Event category relationship was not found.';
    case 409:
    case 422:
      return 'Category update conflict detected. Please refresh and try again.';
    default:
      return fallback;
  }
}

export function useEventCategories(eventId: string, options: UseEventCategoriesOptions = {}) {
  const { autoFetch = true, refetchAfterUnlink = false } = options;
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await eventCategoriesService.getEventCategories(eventId);
      setCategories(data);
    } catch {
      setError('Unable to load event categories.');
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  const linkCategory = useCallback(
    async (categoryId: string) => {
      setIsSubmitting(true);
      setError(null);

      try {
        await eventCategoriesService.linkCategoryToEvent(eventId, categoryId);
        const data = await eventCategoriesService.getEventCategories(eventId);
        setCategories(data);
        return true;
      } catch (errorValue) {
        setError(getMutationErrorMessage(getErrorStatus(errorValue), DEFAULT_ERROR_MESSAGE));
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [eventId]
  );

  const unlinkCategory = useCallback(
    async (categoryId: string, unlinkOptions: UnlinkOptions = {}) => {
      setIsSubmitting(true);
      setError(null);

      const previousCategories = categories;
      setCategories((current) => current.filter((item) => item.id !== categoryId));

      try {
        await eventCategoriesService.unlinkCategoryFromEvent(eventId, categoryId);

        if (unlinkOptions.refetch ?? refetchAfterUnlink) {
          const data = await eventCategoriesService.getEventCategories(eventId);
          setCategories(data);
        }

        return true;
      } catch (errorValue) {
        setCategories(previousCategories);
        setError(getMutationErrorMessage(getErrorStatus(errorValue), DEFAULT_ERROR_MESSAGE));
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [categories, eventId, refetchAfterUnlink]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (!autoFetch) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchCategories();
  }, [autoFetch, fetchCategories]);

  return {
    categories,
    isLoading,
    isSubmitting,
    error,
    fetchCategories,
    linkCategory,
    unlinkCategory,
    clearError,
  };
}

export default useEventCategories;
