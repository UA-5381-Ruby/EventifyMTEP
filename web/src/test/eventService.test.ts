import apiClient from '@/lib/apiClient';
import { EventsService } from '@/services/eventsService';
import type {
  Event,
  EventDetail,
  EventQueryParams,
  PaginatedResponse,
  CreateEventRequest,
} from '@/types/event.types';

jest.mock('@/lib/apiClient', () => ({
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
};

const mockPaginatedResponse: PaginatedResponse<Event> = {
  data: [mockEvent],
  meta: { page: 1, per_page: 20, total: 1 },
};

describe('EventsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getEvents', () => {
    it('calls GET /api/v1/events with numeric params', async () => {
      mockedGet.mockResolvedValueOnce({ data: mockPaginatedResponse });
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
      mockedGet.mockResolvedValueOnce({ data: { data: mockEventDetail } });
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

      expect(mockedPost).toHaveBeenCalledWith('/api/v1/events', { event: payload });
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
      mockedGet.mockResolvedValueOnce({ data: { data: mockEventDetail } });

      const result = await EventsService.getEventById(1);

      expect(mockedGet).toHaveBeenCalledWith('/api/v1/events/1');
      expect(result.id).toBe(1);
    });
  });

  describe('Management Methods (Transitions)', () => {
    it('submitEvent: should call submit endpoint and return draft_on_review status', async () => {
      mockedPost.mockResolvedValueOnce({
        data: { data: { ...mockEvent, status: 'draft_on_review' } },
      });

      const result = await EventsService.submitEvent(1);

      expect(mockedPost).toHaveBeenCalledWith('/api/v1/events/1/submit');
      expect(result.status).toBe('draft_on_review');
    });

    it('rejectEvent: should call reject endpoint with reason', async () => {
      mockedPost.mockResolvedValueOnce({ data: { data: { ...mockEvent, status: 'rejected' } } });
      const payload = { reason: 'Invalid data' };

      const result = await EventsService.rejectEvent(1, payload);

      expect(mockedPost).toHaveBeenCalledWith('/api/v1/events/1/reject', payload);
      expect(result.status).toBe('rejected');
    });

    // --- НОВІ ТЕСТИ ---

    it('approveEvent: should call approve endpoint and return published status', async () => {
      // Налаштовуємо мок на повернення статусу 'published'
      mockedPost.mockResolvedValueOnce({
        data: { data: { ...mockEvent, status: 'published' } },
      });

      const result = await EventsService.approveEvent(1);

      // Перевіряємо правильність URL
      expect(mockedPost).toHaveBeenCalledWith('/api/v1/events/1/approve');
      // Перевіряємо, чи статус оброблено правильно
      expect(result.status).toBe('published');
    });

    it('cancelEvent: should call cancel endpoint and return cancelled status', async () => {
      // Налаштовуємо мок на повернення статусу 'cancelled'
      mockedPost.mockResolvedValueOnce({
        data: { data: { ...mockEvent, status: 'cancelled' } },
      });

      const result = await EventsService.cancelEvent(1);

      // Перевіряємо правильність URL
      expect(mockedPost).toHaveBeenCalledWith('/api/v1/events/1/cancel');
      // Перевіряємо, чи статус оброблено правильно
      expect(result.status).toBe('cancelled');
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

      expect(mockedPost).toHaveBeenCalledWith('/api/v1/events', { event: payload });
    });
  });
});
