import apiClient, { parseApiError } from '@/lib/api-client';
import { type CreateInvoiceResponse } from '@/types/payment';

export const PaymentService = {
  async createInvoice(eventId: number): Promise<CreateInvoiceResponse> {
    try {
      const response = await apiClient.post<CreateInvoiceResponse>('/api/v1/payments', {
        event_id: eventId,
      });
      return response.data;
    } catch (err) {
      parseApiError(err);
    }
  },
};