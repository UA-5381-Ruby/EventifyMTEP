import { useState, useEffect } from 'react';
import { TicketsService } from '@/services/tickets-service';

export function useTicketStatus(eventId: number) {
  const [hasBoughtTicket, setHasBoughtTicket] = useState(false);
  const [isCheckingTicket, setIsCheckingTicket] = useState(true);

  useEffect(() => {
    TicketsService.getMyTickets({ event_id: eventId })
      .then(({ data }) => setHasBoughtTicket(data.length > 0))
      .catch(() => {})
      .finally(() => setIsCheckingTicket(false));
  }, [eventId]);

  return { hasBoughtTicket, isCheckingTicket };
}
