import { act, renderHook, waitFor } from '@testing-library/react';
import { useEventCategories } from '@/hooks/useEventCategories';
import { eventCategoriesService } from '@/services/eventCategoriesService';
import type { Category } from '@/types/categories';

jest.mock('@/services/eventCategoriesService', () => ({
  eventCategoriesService: {
    getEventCategories: jest.fn(),
    linkCategoryToEvent: jest.fn(),
    unlinkCategoryFromEvent: jest.fn(),
  },
}));

const categoryA: Category = { id: 'cat-1', name: 'Tech', slug: 'tech' };
const categoryB: Category = { id: 'cat-2', name: 'Music', slug: 'music' };

describe('useEventCategories', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads categories on mount when autoFetch is enabled', async () => {
    (eventCategoriesService.getEventCategories as jest.Mock).mockResolvedValue([categoryA, categoryB]);

    const { result } = renderHook(() => useEventCategories('event-1'));

    await waitFor(() => {
      expect(result.current.categories).toEqual([categoryA, categoryB]);
    });
  });

  it('supports optimistic unlink and keeps updated state on success', async () => {
    (eventCategoriesService.getEventCategories as jest.Mock).mockResolvedValue([categoryA, categoryB]);
    (eventCategoriesService.unlinkCategoryFromEvent as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useEventCategories('event-1'));

    await waitFor(() => {
      expect(result.current.categories).toHaveLength(2);
    });

    await act(async () => {
      await result.current.unlinkCategory('cat-1');
    });

    expect(result.current.categories).toEqual([categoryB]);
    expect(result.current.error).toBeNull();
  });

  it('rolls back optimistic unlink and shows permission error for 403', async () => {
    (eventCategoriesService.getEventCategories as jest.Mock).mockResolvedValue([categoryA, categoryB]);
    (eventCategoriesService.unlinkCategoryFromEvent as jest.Mock).mockRejectedValue({ status: 403 });

    const { result } = renderHook(() => useEventCategories('event-1'));

    await waitFor(() => {
      expect(result.current.categories).toHaveLength(2);
    });

    await act(async () => {
      await result.current.unlinkCategory('cat-1');
    });

    expect(result.current.categories).toEqual([categoryA, categoryB]);
    expect(result.current.error).toBe('You do not have permission to modify event categories.');
  });

  it('returns conflict error for 409 and compatibility 422 on link', async () => {
    (eventCategoriesService.getEventCategories as jest.Mock).mockResolvedValue([categoryA]);
    (eventCategoriesService.linkCategoryToEvent as jest.Mock).mockRejectedValueOnce({ status: 409 }).mockRejectedValueOnce({ status: 422 });

    const { result } = renderHook(() => useEventCategories('event-1'));

    await waitFor(() => {
      expect(result.current.categories).toEqual([categoryA]);
    });

    await act(async () => {
      await result.current.linkCategory('cat-2');
    });

    expect(result.current.error).toBe('Category update conflict detected. Please refresh and try again.');

    await act(async () => {
      await result.current.linkCategory('cat-2');
    });

    expect(result.current.error).toBe('Category update conflict detected. Please refresh and try again.');
  });

  it('returns not-found error for 404 on unlink', async () => {
    (eventCategoriesService.getEventCategories as jest.Mock).mockResolvedValue([categoryA]);
    (eventCategoriesService.unlinkCategoryFromEvent as jest.Mock).mockRejectedValue({ status: 404 });

    const { result } = renderHook(() => useEventCategories('event-1'));

    await waitFor(() => {
      expect(result.current.categories).toEqual([categoryA]);
    });

    await act(async () => {
      await result.current.unlinkCategory('cat-1');
    });

    expect(result.current.error).toBe('Event category relationship was not found.');
    expect(result.current.categories).toEqual([categoryA]);
  });

  it('can refetch after successful unlink when requested', async () => {
    (eventCategoriesService.getEventCategories as jest.Mock)
      .mockResolvedValueOnce([categoryA, categoryB])
      .mockResolvedValueOnce([categoryB]);
    (eventCategoriesService.unlinkCategoryFromEvent as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useEventCategories('event-1'));

    await waitFor(() => {
      expect(result.current.categories).toEqual([categoryA, categoryB]);
    });

    await act(async () => {
      await result.current.unlinkCategory('cat-1', { refetch: true });
    });

    expect(eventCategoriesService.getEventCategories).toHaveBeenCalledTimes(2);
    expect(result.current.categories).toEqual([categoryB]);
  });
});
