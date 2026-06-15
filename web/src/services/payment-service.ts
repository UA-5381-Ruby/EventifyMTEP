import apiClient, { parseApiError } from '@/lib/api-client';
import { type CreateInvoiceResponse } from '@/types/payment';

export const PaymentService = {
  async createInvoice(eventId: number, quantity: number = 1): Promise<CreateInvoiceResponse> {
    try {
      const response = await apiClient.post<CreateInvoiceResponse>('/api/v1/payments', {
        event_id: eventId,
        quantity: quantity,
      });
      return response.data;
    } catch (err) {
      parseApiError(err);
    }
  },
};
