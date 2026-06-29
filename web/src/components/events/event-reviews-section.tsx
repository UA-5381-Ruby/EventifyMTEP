import { useState, useEffect } from 'react';
import { Star, User } from 'lucide-react';
import { Button, Spinner } from '@/components/ui';
import { EventsService } from '@/services/events-service';
import type { EventReview } from '@/types/event';

interface Props {
  eventId: number;
  averageRating: number;
  reviewsCount: number;
}

const StarRating = ({ rating, size = 16 }: { rating: number; size?: number }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={star <= rating ? 'text-neutral-800 fill-neutral-800' : 'text-neutral-300'}
        />
      ))}
    </div>
  );
};

export function EventReviewsSection({ eventId, averageRating, reviewsCount }: Props) {
  const [reviews, setReviews] = useState<EventReview[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Початкове завантаження (ізольоване всередині useEffect)
  useEffect(() => {
    if (reviewsCount === 0) return;

    const fetchInitialReviews = async () => {
      try {
        const res = await EventsService.getEventReviews(eventId, { page: 1, per_page: 5 });
        setReviews(res.data);
        setTotalPages(res.meta.total_pages);
      } catch (error) {
        console.error('Failed to load initial reviews', error);
      }
    };

    fetchInitialReviews();
  }, [eventId, reviewsCount]);

  // 2. Завантаження за кліком (окрема функція для кнопки)
  const handleLoadMore = async () => {
    const nextPage = page + 1;
    setIsLoading(true);

    try {
      const res = await EventsService.getEventReviews(eventId, { page: nextPage, per_page: 5 });
      setReviews((prev) => [...prev, ...res.data]);
      setPage(nextPage);
    } catch (error) {
      console.error('Failed to load more reviews', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date
      .toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      .toLowerCase();
  };

  if (reviewsCount === 0) return null;

  return (
    <div className="py-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="text-4xl font-semibold text-neutral-900">{averageRating.toFixed(1)}</div>
        <div className="flex flex-col gap-1">
          <StarRating rating={Math.round(averageRating)} size={20} />
          <span className="text-sm text-neutral-500">Based on {reviewsCount} reviews</span>
        </div>
      </div>

      <div className="h-px bg-neutral-200 mb-6 w-full" />

      <div className="flex flex-col gap-6">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="flex gap-4 border-b border-neutral-200 pb-6 last:border-0 last:pb-0"
          >
            <div className="w-10 h-10 shrink-0 rounded-full bg-neutral-200 flex items-center justify-center">
              <User size={20} className="text-neutral-500" />
            </div>

            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-neutral-900">{review.user.name}</span>
                  <StarRating rating={review.rating || 0} size={14} />
                </div>
                <span className="text-sm text-neutral-400">{formatDate(review.created_at)}</span>
              </div>
              {review.comment && (
                <p className="mt-3 text-sm text-neutral-700 leading-relaxed">{review.comment}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {page < totalPages && (
        <div className="mt-8 flex justify-center">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? <Spinner className="w-4 h-4 mr-2" /> : null}
            Load More Reviews
          </Button>
        </div>
      )}
    </div>
  );
}
