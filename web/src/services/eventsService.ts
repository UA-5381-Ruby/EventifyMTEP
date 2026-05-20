import apiClient from '@/lib/apiClient';
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
    return response.data.data; // Обгортка Rails
  },

  async createEvent(payload: CreateEventRequest): Promise<Event> {
    const response = await apiClient.post('/api/v1/events', { event: payload });
    return response.data.data;
  },

  async submitEvent(id: number): Promise<Event> {
    const response = await apiClient.post(`/api/v1/events/${id}/submit`);
    return response.data.data;
  },

  async approveEvent(id: number): Promise<Event> {
    const response = await apiClient.post(`/api/v1/events/${id}/approve`);
    return response.data.data;
  },

  async rejectEvent(id: number, payload: { reason?: string } = {}): Promise<Event> {
    const response = await apiClient.post(`/api/v1/events/${id}/reject`, payload);
    return response.data.data;
  },

  async cancelEvent(id: number): Promise<Event> {
    const response = await apiClient.post(`/api/v1/events/${id}/cancel`);
    return response.data.data;
  },
};
