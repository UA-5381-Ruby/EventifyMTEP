import apiClient from '@/lib/api-client';
import { EventsService } from '@/services/events-service';
import type {
  Event,
  EventDetail,
  EventQueryParams,
  PaginatedResponse,
  CreateEventRequest,
} from '@/types/event.ts';

jest.mock('@/lib/api-client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockedGet = apiClient.get as jest.Mock;
const mockedPost = apiClient.post as jest.Mock;

const mockEvent: Event = {
  id: 1,
  title: 'Tech Summit 2026',
  start_date: '2026-09-01T09:00:00.000Z',
  status: 'draft',
  brand_id: 42,
};

const mockEventDetail: EventDetail = {
  ...mockEvent,
  description: 'Annual technology conference.',
  location: 'Kyiv, Ukraine',
  end_date: '2026-09-03T18:00:00.000Z',
  brand: { id: 42, name: 'Acme Corp' },
  categories: [{ id: 5, name: 'Technology' }],
  price_cents: 150000,
  available_tickets_count: 100,
};

const mockPaginatedResponse: PaginatedResponse<Event> = {
  data: [mockEvent],
  meta: { page: 1, per_page: 20, total: 1, total_pages: 3 },
};

describe('EventsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getEvents', () => {
    it('calls GET /api/v1/events with numeric params', async () => {
      mockedGet.mockResolvedValueOnce({ data: mockEventDetail });
      const params: EventQueryParams = { brand_id: 42, category_id: 5 };

      await EventsService.getEvents(params);

      expect(mockedGet).toHaveBeenCalledWith('/api/v1/events', { params });
    });

    it('works without params', async () => {
      mockedGet.mockResolvedValueOnce({ data: mockPaginatedResponse });
      await expect(EventsService.getEvents()).resolves.toBeDefined();
    });
  });

  describe('getEventById', () => {
    it('uses numeric ID in URL', async () => {
      mockedGet.mockResolvedValueOnce({ data: mockEventDetail });
      await EventsService.getEventById(1);
      expect(mockedGet).toHaveBeenCalledWith('/api/v1/events/1');
    });
  });

  describe('createEvent', () => {
    it('sends numeric IDs in payload', async () => {
      const payload: CreateEventRequest = {
        title: 'New',
        location: 'Kyiv',
        start_date: '2026-01-01',
        brand_id: 42,
        category_ids: [5],
      };
      mockedPost.mockResolvedValueOnce({ data: { data: mockEvent } });

      await EventsService.createEvent(payload);

      expect(mockedPost).toHaveBeenCalledWith('/api/v1/events', expect.any(FormData), {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    });
  });
  describe('Discovery Methods', () => {
    it('should fetch events with correct query params', async () => {
      mockedGet.mockResolvedValueOnce({ data: mockPaginatedResponse });
      const params: EventQueryParams = { page: 1, status: 'published' };

      const result = await EventsService.getEvents(params);

      expect(mockedGet).toHaveBeenCalledWith('/api/v1/events', { params });
      expect(result.data).toEqual([mockEvent]);
    });

    it('should fetch a single event by ID', async () => {
      mockedGet.mockResolvedValueOnce({ data: mockEventDetail });

      const result = await EventsService.getEventById(1);

      expect(mockedGet).toHaveBeenCalledWith('/api/v1/events/1');
      expect(result.id).toBe(1);
    });
  });

  describe('Creation', () => {
    it('should create an event with correct payload structure', async () => {
      const payload: CreateEventRequest = {
        title: 'New Event',
        location: 'Kyiv',
        start_date: '2026-10-15',
        brand_id: 42,
      };
      mockedPost.mockResolvedValueOnce({ data: { data: mockEvent } });

      await EventsService.createEvent(payload);

      expect(mockedPost).toHaveBeenCalledWith('/api/v1/events', expect.any(FormData), {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    });
  });

  describe('buildEventFormData (via createEvent)', () => {
    it('excludes null and undefined values from FormData', async () => {
      const payload = {
        title: 'Event',
        location: null,
        start_date: undefined,
        brand_id: 42,
      } as unknown as CreateEventRequest;

      mockedPost.mockResolvedValueOnce({ data: mockEvent });
      await EventsService.createEvent(payload);

      const formData = mockedPost.mock.calls[0][1] as FormData;
      expect(formData.get('event[title]')).toBe('Event');
      expect(formData.get('event[location]')).toBeNull();
      expect(formData.get('event[start_date]')).toBeNull();
    });

    it('appends category_ids as array entries', async () => {
      const payload: CreateEventRequest = {
        title: 'Event',
        location: 'Lviv',
        start_date: '2026-01-01',
        brand_id: 42,
        category_ids: [1, 2, 3],
      };

      mockedPost.mockResolvedValueOnce({ data: mockEvent });
      await EventsService.createEvent(payload);

      const formData = mockedPost.mock.calls[0][1] as FormData;
      expect(formData.getAll('event[category_ids][]')).toEqual(['1', '2', '3']);
    });

    it('appends banner as File when provided', async () => {
      const file = new File(['content'], 'banner.png', { type: 'image/png' });
      const payload: CreateEventRequest = {
        title: 'Event',
        location: 'Lviv',
        start_date: '2026-01-01',
        brand_id: 42,
        banner: file,
      };

      mockedPost.mockResolvedValueOnce({ data: mockEvent });
      await EventsService.createEvent(payload);

      const formData = mockedPost.mock.calls[0][1] as FormData;
      expect(formData.get('event[banner]')).toBe(file);
    });
  });
});
