import apiClient, { parseApiError } from '@/lib/api-client';
import axios from 'axios';
import type {
  Ticket,
  TicketQueryParams,
  ReviewRequest,
  PaginatedTicketsResponse,
  TicketFeedback,
} from '@/types/ticket';

const handleTicketError = (err: unknown): never => {
  if (axios.isAxiosError(err) && err.response?.data?.errors) {
    const errors = err.response.data.errors;
    if (typeof errors === 'object' && !Array.isArray(errors)) {
      const messages = Object.values(errors).flat();
      throw new Error(messages.join(', '));
    }
  }
  return parseApiError(err);
};

//ticket service + feedbacks

export const TicketsService = {
  async getMyTickets(params: TicketQueryParams = {}): Promise<PaginatedTicketsResponse> {
    try {
      const response = await apiClient.get<PaginatedTicketsResponse>('/api/v1/tickets', { params });
      return response.data;
    } catch (error) {
      return handleTicketError(error);
    }
  },

  async createTicket(eventId: number): Promise<Ticket> {
    try {
      const response = await apiClient.post<Ticket>('/api/v1/tickets', {
        ticket: { event_id: eventId },
      });
      return response.data;
    } catch (error) {
      return handleTicketError(error);
    }
  },

  async getTicketById(id: string | number): Promise<Ticket> {
    try {
      const response = await apiClient.get<Ticket>(`/api/v1/tickets/${id}`);
      return response.data;
    } catch (error) {
      return handleTicketError(error);
    }
  },

  async updateTicketStatus(id: string | number, isActive: boolean): Promise<Ticket> {
    try {
      const response = await apiClient.patch<Ticket>(`/api/v1/tickets/${id}`, {
        ticket: { is_active: isActive },
      });
      return response.data;
    } catch (error) {
      return handleTicketError(error);
    }
  },

  async submitTicketReview(id: string | number, review: ReviewRequest): Promise<TicketFeedback> {
    try {
      const response = await apiClient.post<TicketFeedback>(`/api/v1/tickets/${id}/review`, {
        ticket: review,
      });
      return response.data;
    } catch (error) {
      return handleTicketError(error);
    }
  },

  async deleteTicketReview(id: string | number): Promise<void> {
    try {
      await apiClient.delete(`/api/v1/tickets/${id}/review`);
    } catch (error) {
      return handleTicketError(error);
    }
  },
};
