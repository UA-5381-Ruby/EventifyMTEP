import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../../apiClient';
import EventsService from '../../eventsService';
import type {
  Event,
  EventDetail,
  EventQueryParams,
  PaginatedResponse,
} from '../../../types/event.types';

vi.mock('../../apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockedGet = vi.mocked(apiClient.get);
const mockedPost = vi.mocked(apiClient.post);

const mockEvent: Event = {
  id: 'evt-1',
  title: 'Tech Summit 2026',
  start_date: '2026-09-01T09:00:00.000Z',
  status: 'draft',
  brand_id: 'brand-42',
};

const mockEventDetail: EventDetail = {
  ...mockEvent,
  description: 'Annual technology conference.',
  location: 'Kyiv, Ukraine',
  end_date: '2026-09-03T18:00:00.000Z',
  categories: [{ id: 'cat-1', name: 'Technology' }],
  brand: { id: 'brand-42', name: 'Acme Corp' },
};

const mockPaginatedResponse: PaginatedResponse<Event> = {
  data: [mockEvent],
  meta: { page: 1, per_page: 20, total: 1 },
};

describe('EventsService', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('getEvents', () => {
    it('calls GET /api/v1/events and returns paginated data', async () => {
      mockedGet.mockResolvedValueOnce({ data: mockPaginatedResponse });
      const result = await EventsService.getEvents();
      expect(mockedGet).toHaveBeenCalledOnce();
      expect(mockedGet).toHaveBeenCalledWith('/api/v1/events', { params: {} });
      expect(result.data).toEqual([mockEvent]);
    });

    it('forwards all 9 supported query parameters', async () => {
      mockedGet.mockResolvedValueOnce({ data: mockPaginatedResponse });
      const params: EventQueryParams = {
        page: 2,
        per_page: 10,
        sort: 'start_date',
        order: 'desc',
        q: 'summit',
        from: '2026-01-01T00:00:00.000Z',
        to: '2026-12-31T23:59:59.000Z',
        brand_id: 'brand-42',
        status: 'published',
        category_id: 'cat-1',
      };
      await EventsService.getEvents(params);
      expect(mockedGet).toHaveBeenCalledWith('/api/v1/events', { params });
    });

    it('returns meta with page / per_page / total — no last_page', async () => {
      mockedGet.mockResolvedValueOnce({
        data: { data: [mockEvent], meta: { page: 3, per_page: 5, total: 50 } },
      });
      const result = await EventsService.getEvents({ page: 3, per_page: 5 });
      expect(result.meta.page).toBe(3);
      expect(result.meta.total).toBe(50);
      expect(result.meta).not.toHaveProperty('last_page');
    });

    it('works with no params (uses empty defaults)', async () => {
      mockedGet.mockResolvedValueOnce({ data: mockPaginatedResponse });
      await expect(EventsService.getEvents()).resolves.not.toThrow();
    });

    it('propagates network errors', async () => {
      mockedGet.mockRejectedValueOnce(new Error('Network Error'));
      await expect(EventsService.getEvents()).rejects.toThrow('Network Error');
    });
  });

  describe('getEventById', () => {
    it('calls GET /api/v1/events/:id', async () => {
      mockedGet.mockResolvedValueOnce({ data: mockEventDetail });
      await EventsService.getEventById('evt-1');
      expect(mockedGet).toHaveBeenCalledWith('/api/v1/events/evt-1');
    });

    it('returns categories as an array', async () => {
      mockedGet.mockResolvedValueOnce({ data: mockEventDetail });
      const result = await EventsService.getEventById('evt-1');
      expect(Array.isArray(result.categories)).toBe(true);
      expect(result.categories).toHaveLength(1);
    });

    it('returns nested brand with id and name', async () => {
      mockedGet.mockResolvedValueOnce({ data: mockEventDetail });
      const result = await EventsService.getEventById('evt-1');
      expect(result.brand).toEqual({ id: 'brand-42', name: 'Acme Corp' });
    });

    it('propagates 404 with error message from backend', async () => {
      mockedGet.mockRejectedValueOnce(
        Object.assign(new Error('404'), {
          response: { status: 404, data: { error: 'Event not found' } },
        }),
      );
      await expect(EventsService.getEventById('nonexistent')).rejects.toThrow('404');
    });
  });

  describe('createEvent', () => {
    const createPayload = {
      title: 'New Event',
      location: 'Kyiv',
      start_date: '2026-10-15T10:00:00.000Z',
      brand_id: 'brand-42',
    };

    it('wraps payload in { event: ... }', async () => {
      mockedPost.mockResolvedValueOnce({ data: mockEvent });
      await EventsService.createEvent(createPayload);
      expect(mockedPost).toHaveBeenCalledWith('/api/v1/events', { event: createPayload });
    });
  });

  describe('Transitions', () => {
    it('submitEvent calls correct endpoint', async () => {
      mockedPost.mockResolvedValueOnce({ data: { ...mockEvent, status: 'draft_on_review' } });
      const result = await EventsService.submitEvent('evt-1');
      expect(mockedPost).toHaveBeenCalledWith('/api/v1/events/evt-1/submit');
      expect(result.status).toBe('draft_on_review');
    });

    it('rejectEvent supports optional reason', async () => {
      mockedPost.mockResolvedValueOnce({ data: { ...mockEvent, status: 'rejected' } });
      await EventsService.rejectEvent('evt-1', { reason: 'No photo' });
      expect(mockedPost).toHaveBeenCalledWith('/api/v1/events/evt-1/reject', { reason: 'No photo' });
    });
  });
});