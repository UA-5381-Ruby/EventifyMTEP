import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, QrCode, Star } from 'lucide-react';
import { formatDate } from '@/utils/date';
import type { Ticket, TicketFeedback } from '@/types/ticket';
import { Button } from '@/components/ui';
import { TicketReviewModal } from './ticket-review-modal';

interface TicketQrCardProps {
  ticket: Ticket;
  compact?: boolean;
  onUpdate?: () => void;
}

export function TicketQrCard({ ticket, compact = false, onUpdate }: TicketQrCardProps) {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const [localFeedback, setLocalFeedback] = useState<TicketFeedback | undefined>(ticket.event_feedback);

  useEffect(() => {
    setLocalFeedback(ticket.event_feedback);
  }, [ticket.event_feedback]);

  const eventTitle = ticket.event?.title ?? `Event #${ticket.event_id}`;
  const hasReview = !!localFeedback;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-primary-600">
            Your ticket
          </p>
          <h3 className="mt-1 text-lg font-semibold text-neutral-900">{eventTitle}</h3>

          {ticket.event?.location && (
            <div className="mt-2 flex items-center gap-1.5 text-sm text-neutral-600">
              <MapPin size={14} className="shrink-0 text-neutral-400" />
              <span>{ticket.event.location}</span>
            </div>
          )}

          {ticket.event?.start_date && !compact && (
            <p className="mt-1 text-sm text-neutral-500">{formatDate(ticket.event.start_date)}</p>
          )}

          {!compact && (
            <div className="mt-4 flex flex-col items-start gap-3">
              <Link
                to={`/events/${ticket.event_id}`}
                className="inline-block text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                Open event page
              </Link>

              <Button
                variant="outline"
                onClick={() => setIsReviewModalOpen(true)}
              >
                <Star
                  size={16}
                  className={`mr-2 ${hasReview ? 'fill-yellow-400 text-yellow-400 border-yellow-400' : ''}`}
                />
                {hasReview ? 'Edit Review' : 'Leave a Review'}
              </Button>
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-center gap-2">
          {ticket.qr_code_url ? (
            <img
              src={ticket.qr_code_url}
              alt={`QR code for ${eventTitle}`}
              className="h-40 w-40 rounded-lg border border-neutral-100 bg-white p-2"
            />
          ) : (
            <div className="flex h-40 w-40 items-center justify-center rounded-lg border border-dashed border-neutral-200 bg-neutral-50 text-neutral-400">
              <QrCode size={32} />
            </div>
          )}
          <p className="max-w-40 text-center text-xs text-neutral-500">
            Show this QR code at the event entrance
          </p>
        </div>
      </div>

      <TicketReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        ticketId={ticket.id}
        existingFeedback={localFeedback}
        onSuccess={(newFeedback) => {
          setLocalFeedback(newFeedback ?? undefined);
          if (onUpdate) onUpdate();
        }}
      />
    </div>
  );
}