import apiClient, { parseApiError } from '@/lib/api-client';
import { PaymentService } from '@/services/payment-service';

jest.mock('@/lib/api-client', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
  parseApiError: jest.fn((err: unknown) => {
    throw err;
  }),
}));

const mockedPost = apiClient.post as jest.Mock;
const mockedParse = parseApiError as unknown as jest.Mock;

describe('PaymentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('createInvoice: posts payload and returns response data', async () => {
    const mockResp = { pageUrl: 'https://pay.example', invoiceId: 'inv-123' };
    mockedPost.mockResolvedValueOnce({ data: mockResp });

    const result = await PaymentService.createInvoice(5, 2);

    expect(mockedPost).toHaveBeenCalledWith('/api/v1/payments', {
      event_id: 5,
      quantity: 2,
    });

    expect(result).toEqual(mockResp);
  });

  it('createInvoice: delegates error handling to parseApiError when request fails', async () => {
    const err = new Error('network');
    mockedPost.mockRejectedValueOnce(err);
    mockedParse.mockImplementationOnce(() => {
      throw new Error('parsed error');
    });

    await expect(PaymentService.createInvoice(1)).rejects.toThrow('parsed error');

    expect(mockedPost).toHaveBeenCalledWith('/api/v1/payments', {
      event_id: 1,
      quantity: 1,
    });
    expect(mockedParse).toHaveBeenCalledWith(err);
  });

  it('createInvoice: uses quantity 1 as default', async () => {
    mockedPost.mockResolvedValueOnce({
      data: { pageUrl: 'https://pay.example', invoiceId: 'inv-123' },
    });

    await PaymentService.createInvoice(1);

    expect(mockedPost).toHaveBeenCalledWith('/api/v1/payments', {
      event_id: 1,
      quantity: 1,
    });
  });

  it('createInvoice: throws when response has no pageUrl', async () => {
    mockedPost.mockResolvedValueOnce({ data: {} });

    const result = await PaymentService.createInvoice(1);
    expect(result).toEqual({});
  });
});
