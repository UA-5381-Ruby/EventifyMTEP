import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket as TicketIcon } from 'lucide-react';
import { PageWrapper, Container } from '@/components/layout';
import { Spinner, Button } from '@/components/ui';
import { TicketQrCard } from '@/components/tickets/ticket-qr-card';
import { TicketsService } from '@/services/tickets-service';
import type { Ticket } from '@/types/ticket';

export function MyTicketsPage() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    TicketsService.getMyTickets({ per_page: 50, sort: 'created_at', order: 'desc' })
      .then(({ data }) => setTickets(data))
      .catch((err: Error) => setError(err.message || 'Failed to load tickets'))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <PageWrapper>
      <Container className="py-10">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-wide text-primary-600">Tickets</p>
          <h1 className="mt-1 text-3xl font-bold text-neutral-900">My Tickets</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Your QR codes for purchased events are listed below.
          </p>
        </div>

        {isLoading && (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        )}

        {!isLoading && error && (
          <div className="rounded-xl border border-error-200 bg-error-50 p-6 text-sm text-error-700">
            {error}
          </div>
        )}

        {!isLoading && !error && tickets.length === 0 && (
          <div className="flex flex-col items-center gap-4 rounded-xl border border-neutral-200 bg-white px-6 py-16 text-center">
            <TicketIcon size={40} className="text-neutral-300" />
            <div>
              <p className="text-lg font-semibold text-neutral-900">No tickets yet</p>
              <p className="mt-1 text-sm text-neutral-500">
                Buy a ticket on an event page and your QR code will appear here.
              </p>
            </div>
            <Button type="button" onClick={() => navigate('/events')}>
              Browse events
            </Button>
          </div>
        )}

        {!isLoading && !error && tickets.length > 0 && (
          <div className="grid gap-4">
            {tickets.map((ticket) => (
              <TicketQrCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </Container>
    </PageWrapper>
  );
}
