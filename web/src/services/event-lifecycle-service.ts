import apiClient from '@/lib/api-client';
import { parseApiError } from '@/lib/api-client';
import axios from 'axios';
import type { Event } from '@/types/event';

const handleLifecycleError = (err: unknown): never => {
  if (axios.isAxiosError(err) && err.response?.data?.message) {
    throw new Error(err.response.data.message);
  }
  return parseApiError(err);
};

export const EventLifecycleService = {
  async submitEvent(id: string | number): Promise<Event> {
    try {
      const response = await apiClient.post(`/api/v1/events/${id}/submit`);
      return response.data.data || response.data;
    } catch (error) {
      return handleLifecycleError(error);
    }
  },

  async approveEvent(id: string | number): Promise<Event> {
    try {
      const response = await apiClient.post(`/api/v1/events/${id}/approve`);
      return response.data.data || response.data;
    } catch (error) {
      return handleLifecycleError(error);
    }
  },

  async rejectEvent(id: string | number, payload: { reason?: string } = {}): Promise<Event> {
    try {
      const response = await apiClient.post(`/api/v1/events/${id}/reject`, payload);
      return response.data.data || response.data;
    } catch (error) {
      return handleLifecycleError(error);
    }
  },

  async cancelEvent(id: string | number): Promise<Event> {
    try {
      const response = await apiClient.post(`/api/v1/events/${id}/cancel`);
      return response.data.data || response.data;
    } catch (error) {
      return handleLifecycleError(error);
    }
  },
};
