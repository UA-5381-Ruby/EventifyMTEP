import apiClient from '@/lib/api-client';
import type {
  Event,
  EventDetail,
  EventQueryParams,
  CreateEventRequest,
  PaginatedResponse,
} from '@/types/event.ts';

function buildEventFormData(payload: Partial<CreateEventRequest>): FormData {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (key === 'category_ids' && Array.isArray(value)) {
      value.forEach((id) => {
        formData.append('event[category_ids][]', id.toString());
      });
    } else if (key === 'banner' && value instanceof File) {
      formData.append('event[banner]', value);
    } else {
      formData.append(`event[${key}]`, value.toString());
    }
  });

  return formData;
}

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
    const formData = buildEventFormData(payload);

    const response = await apiClient.post('/api/v1/events', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
