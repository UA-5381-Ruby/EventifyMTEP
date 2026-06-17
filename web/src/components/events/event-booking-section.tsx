import { useState } from 'react';
import { Calendar, Clock, Ticket, Users, CircleCheck } from 'lucide-react';
import { formatDate, formatTimeRange } from '@/utils/date';
import type { EventDetail } from '@/types/event';

import { Button } from '@/components/ui/button';

import { PaymentService } from '@/services/payment-service';
import { useTicketStatus } from '@/hooks/use-ticket-status';
import { TicketQrCard } from '@/components/tickets/ticket-qr-card';

interface EventBookingSectionProps {
  event: EventDetail;
}

export function EventBookingSection({ event }: EventBookingSectionProps) {
  const timeRange = formatTimeRange(event.start_date, event.end_date);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  const { hasBoughtTicket, ticket, isCheckingTicket } = useTicketStatus(event.id);

  const handleBuyTickets = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { pageUrl } = await PaymentService.createInvoice(event.id, quantity);
      window.location.href = pageUrl;
    } catch {
      setError('Could not initiate payment. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="py-6">
      <div className="flex gap-4">
        <div className="flex-1">
          <p className="text-sm font-semibold text-neutral-800 mb-2">Date and Time</p>
          <div className="flex items-center gap-2 text-sm text-neutral-600 mb-1">
            <Calendar size={14} className="shrink-0 text-neutral-400" />
            <span>{formatDate(event.start_date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-600 mb-2">
            <Clock size={14} className="shrink-0 text-neutral-400" />
            <span>{timeRange}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          {hasBoughtTicket ? (
            <Button variant="outline" disabled>
              <CircleCheck size={14} />
              Ticket Bought
            </Button>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-2 py-1 border rounded"
                >
                  −
                </button>
                <span className="text-sm w-4 text-center">{quantity}</span>
                <button
                  onClick={() =>
                    setQuantity((q) =>
                      Math.min(Math.min(10, Math.max(1, event.available_tickets_count)), q + 1)
                    )
                  }
                  className="px-2 py-1 border rounded"
                >
                  +
                </button>
              </div>
              <Button
                onClick={handleBuyTickets}
                isLoading={isLoading || isCheckingTicket}
                disabled={isCheckingTicket}
              >
                {!isLoading && !isCheckingTicket && <Ticket size={14} />}
                {isCheckingTicket ? 'Checking…' : isLoading ? 'Redirecting…' : 'Buy Tickets'}
              </Button>
            </>
          )}
          <div className="flex items-center gap-1.5 text-xs text-neutral-500">
            <Users size={12} />
            <span>{event.available_tickets_count} tickets remaining</span>
          </div>
          {error && <p className="text-xs text-error-500 text-right max-w-40">{error}</p>}
        </div>
      </div>

      {hasBoughtTicket && ticket && (
        <div className="mt-6">
          <TicketQrCard ticket={ticket} compact />
        </div>
      )}
    </div>
  );
}
