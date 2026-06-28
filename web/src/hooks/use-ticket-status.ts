import { useEffect } from 'react';
import { TicketsService } from '@/services/tickets-service';
import type { Ticket } from '@/types/ticket';
import { useReduxState } from '@/hooks/use-redux-state';

export function useTicketStatus(eventId: number) {
  const [hasBoughtTicket, setHasBoughtTicket] = useReduxState(false);
  const [ticket, setTicket] = useReduxState<Ticket | null>(null);
  const [isCheckingTicket, setIsCheckingTicket] = useReduxState(true);

  useEffect(() => {
    TicketsService.getMyTickets({ event_id: eventId })
      .then(({ data }) => {
        setHasBoughtTicket(data.length > 0);
        setTicket(data[0] ?? null);
      })
      .catch(() => {})
      .finally(() => setIsCheckingTicket(false));
  }, [eventId]);

  return { hasBoughtTicket, ticket, isCheckingTicket };
}
