import apiClient from '@/lib/api-client';
import { TicketsService } from '@/services/tickets-service';
import type {
  Ticket,
  TicketQueryParams,
  PaginatedTicketsResponse,
  ReviewRequest,
  TicketFeedback,
} from '@/types/ticket';

jest.mock('@/lib/api-client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
  },
  parseApiError: jest.fn((err) => {
    throw err;
  }),
}));

const mockedGet = apiClient.get as jest.Mock;
const mockedPost = apiClient.post as jest.Mock;
const mockedPatch = apiClient.patch as jest.Mock;

const mockTicket: Ticket = {
  id: '123',
  is_active: true,
  qr_code_url: 'https://example.com/qr.png',
  event_id: 1,
  user_id: 42,
  event: {
    id: 1,
    title: 'Tech Summit 2026',
    location: 'Kyiv',
    start_date: '2026-05-14T09:00:00.000Z',
    end_date: '2026-05-14T18:00:00.000Z',
  },
};

const mockFeedback: TicketFeedback = {
  id: 10,
  rating: 5,
  comment: 'Great event!',
};

const mockPaginatedResponse: PaginatedTicketsResponse = {
  data: [mockTicket],
  meta: { page: 1, per_page: 20, total: 1 },
};

describe('TicketsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Ticket Management', () => {
    it('getMyTickets: fetches tickets with query params', async () => {
      mockedGet.mockResolvedValueOnce({ data: mockPaginatedResponse });
      const params: TicketQueryParams = { page: 1, is_active: true };

      const result = await TicketsService.getMyTickets(params);

      expect(mockedGet).toHaveBeenCalledWith('/api/v1/tickets', { params });
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('getTicketById: fetches a single ticket', async () => {
      mockedGet.mockResolvedValueOnce({ data: mockTicket });

      const result = await TicketsService.getTicketById('123');

      expect(mockedGet).toHaveBeenCalledWith('/api/v1/tickets/123');
      expect(result.id).toBe('123');
    });

    it('createTicket: sends event_id nested in ticket object', async () => {
      mockedPost.mockResolvedValueOnce({ data: mockTicket });

      await TicketsService.createTicket(1);

      expect(mockedPost).toHaveBeenCalledWith('/api/v1/tickets', {
        ticket: { event_id: 1 },
      });
    });
  });

  describe('Status & Feedback', () => {
    it('updateTicketStatus: sends is_active nested in ticket object', async () => {
      mockedPatch.mockResolvedValueOnce({ data: { ...mockTicket, is_active: false } });

      const result = await TicketsService.updateTicketStatus('123', false);

      expect(mockedPatch).toHaveBeenCalledWith('/api/v1/tickets/123', {
        ticket: { is_active: false },
      });
      expect(result.is_active).toBe(false);
    });

    it('submitTicketReview: sends rating and comment nested in ticket object', async () => {
      mockedPost.mockResolvedValueOnce({ data: mockFeedback });
      const review: ReviewRequest = { rating: 5, comment: 'Awesome!' };

      const result = await TicketsService.submitTicketReview('123', review);

      expect(mockedPost).toHaveBeenCalledWith('/api/v1/tickets/123/review', {
        ticket: review,
      });
      expect(result.rating).toBe(5);
    });
  });
});
