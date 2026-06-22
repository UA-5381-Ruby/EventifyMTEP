import { renderHook, waitFor } from '@testing-library/react';
import { useTicketStatus } from '@/hooks/use-ticket-status';
import { TicketsService } from '@/services/tickets-service';
import { type Ticket } from '@/types/ticket';

jest.mock('@/services/tickets-service');

const mockGetMyTickets = jest.mocked(TicketsService.getMyTickets);

describe('useTicketStatus', () => {
  beforeEach(() => jest.clearAllMocks());

  it('starts with isCheckingTicket true and then sets states when no tickets', async () => {
    mockGetMyTickets.mockResolvedValueOnce({ data: [], meta: { page: 1, per_page: 20, total: 0 } });

    const { result } = renderHook(() => useTicketStatus(5));

    expect(result.current.isCheckingTicket).toBe(true);

    await waitFor(() => expect(result.current.isCheckingTicket).toBe(false));

    expect(mockGetMyTickets).toHaveBeenCalledWith({ event_id: 5 });
    expect(result.current.hasBoughtTicket).toBe(false);
    expect(result.current.ticket).toBeNull();
  });

  it('sets hasBoughtTicket true and ticket when tickets returned', async () => {
    const ticket = { id: 't1', event_id: 5 } as Ticket;
    mockGetMyTickets.mockResolvedValueOnce({
      data: [ticket],
      meta: { page: 1, per_page: 20, total: 1 },
    });

    const { result } = renderHook(() => useTicketStatus(5));

    await waitFor(() => expect(result.current.isCheckingTicket).toBe(false));

    expect(mockGetMyTickets).toHaveBeenCalledWith({ event_id: 5 });
    expect(result.current.hasBoughtTicket).toBe(true);
    expect(result.current.ticket).toEqual(ticket);
  });

  it('handles service error by setting isCheckingTicket false and leaving defaults', async () => {
    mockGetMyTickets.mockRejectedValueOnce(new Error('Network'));

    const { result } = renderHook(() => useTicketStatus(7));

    await waitFor(() => expect(result.current.isCheckingTicket).toBe(false));

    expect(result.current.hasBoughtTicket).toBe(false);
    expect(result.current.ticket).toBeNull();
  });
});
