import apiClient from './apiClient';
import type {
  CreateEventRequest,
  Event,
  EventDetail,
  EventQueryParams,
  EventTransitionRequest,
  PaginatedResponse,
} from '../types/event.types';

const EVENTS_BASE = '/api/v1/events';

const EventsService = {
  async getEvents(
    params: EventQueryParams = {},
  ): Promise<PaginatedResponse<Event>> {
    const response = await apiClient.get<PaginatedResponse<Event>>(EVENTS_BASE, { params });
    return response.data;
  },

  async getEventById(id: string): Promise<EventDetail> {
    const response = await apiClient.get<EventDetail>(`${EVENTS_BASE}/${id}`);
    return response.data;
  },

  async createEvent(payload: CreateEventRequest): Promise<Event> {
    const response = await apiClient.post<Event>(EVENTS_BASE, { event: payload });
    return response.data;
  },

  async submitEvent(id: string): Promise<Event> {
    const response = await apiClient.post<Event>(`${EVENTS_BASE}/${id}/submit`);
    return response.data;
  },

  async approveEvent(id: string): Promise<Event> {
    const response = await apiClient.post<Event>(`${EVENTS_BASE}/${id}/approve`);
    return response.data;
  },

  async rejectEvent(id: string, payload: EventTransitionRequest = {}): Promise<Event> {
    const response = await apiClient.post<Event>(`${EVENTS_BASE}/${id}/reject`, payload);
    return response.data;
  },

  async cancelEvent(id: string): Promise<Event> {
    const response = await apiClient.post<Event>(`${EVENTS_BASE}/${id}/cancel`);
    return response.data;
  },
};

export default EventsService;