import apiClient from '@/lib/api-client';
import type {
  Event,
  EventDetail,
  EventQueryParams,
  CreateEventRequest,
  PaginatedResponse,
} from '@/types/event.ts';

export const EventsService = {
  async getEvents(params: EventQueryParams = {}): Promise<PaginatedResponse<Event>> {
    const response = await apiClient.get('/api/v1/events', { params });
    return response.data;
  },

  async getEventById(id: number): Promise<EventDetail> {
    const response = await apiClient.get(`/api/v1/events/${id}`);
    return response.data;
  },

  async createEvent(payload: CreateEventRequest): Promise<Event> {
    const response = await apiClient.post('/api/v1/events', { event: payload });
    return response.data.data;
  },
};
