import { renderHook, waitFor, act } from '@testing-library/react';
import { useEvents } from '@/hooks/use-events';
import { EventsService } from '@/services/events-service';
import type { EventStatus } from '@/types/event';

jest.mock('@/services/events-service');

const mockGetEvents = jest.mocked(EventsService.getEvents);

const defaultParams = {
  page: 1,
  per_page: 12,
  sort: 'created_at' as const,
  order: 'desc' as const,
};

const mockResponse = {
  data: [
    {
      id: 1,
      title: 'Test Event',
      start_date: '2026-01-01',
      status: 'published' as EventStatus,
      brand_id: 1,
    },
  ],
  meta: { page: 1, per_page: 12, total: 1, total_pages: 1 },
};

describe('useEvents', () => {
  beforeEach(() => jest.clearAllMocks());

  it('starts with isLoading true', () => {
    mockGetEvents.mockResolvedValue(mockResponse);
    const { result } = renderHook(() => useEvents(defaultParams));
    expect(result.current.isLoading).toBe(true);
  });

  it('returns events and meta on success', async () => {
    mockGetEvents.mockResolvedValue(mockResponse);
    const { result } = renderHook(() => useEvents(defaultParams));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.events).toEqual(mockResponse.data);
    expect(result.current.meta).toEqual(mockResponse.meta);
    expect(result.current.error).toBeNull();
  });

  it('sets error message on failure', async () => {
    mockGetEvents.mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useEvents(defaultParams));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('Network error');
    expect(result.current.events).toEqual([]);
  });

  it('sets fallback error message when error is not an Error instance', async () => {
    mockGetEvents.mockRejectedValue('unknown');
    const { result } = renderHook(() => useEvents(defaultParams));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('Failed to load events. Please try again.');
  });

  it('refetches when refetch is called', async () => {
    mockGetEvents.mockResolvedValue(mockResponse);
    const { result } = renderHook(() => useEvents(defaultParams));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(mockGetEvents).toHaveBeenCalledTimes(1);

    act(() => result.current.refetch());

    await waitFor(() => expect(mockGetEvents).toHaveBeenCalledTimes(2));
  });

  it('refetches when params change', async () => {
    mockGetEvents.mockResolvedValue(mockResponse);
    const { result, rerender } = renderHook((params) => useEvents(params), {
      initialProps: defaultParams,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    rerender({ ...defaultParams, page: 2 });

    await waitFor(() => expect(mockGetEvents).toHaveBeenCalledTimes(2));
    expect(mockGetEvents).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 }));
  });
});
