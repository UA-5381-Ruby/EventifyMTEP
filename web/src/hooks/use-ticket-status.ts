import { useState, useEffect } from 'react';
import { TicketsService } from '@/services/tickets-service';
import type { Ticket } from '@/types/ticket';

export function useTicketStatus(eventId: number) {
  const [hasBoughtTicket, setHasBoughtTicket] = useState(false);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isCheckingTicket, setIsCheckingTicket] = useState(true);

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
