const BASE_URL = '/api/v1/payments';

export interface CreateInvoiceResponse {
  pageUrl: string;
}

export const PaymentService = {
  async createInvoice(eventId: number): Promise<CreateInvoiceResponse> {
    const res = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_id: eventId }),
    });

    if (!res.ok) throw new Error('Failed to create invoice');

    return res.json();
  },
};