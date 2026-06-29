import { useState } from 'react';
import { Star } from 'lucide-react';

interface InteractiveStarRatingProps {
  rating: number;
  setRating: (r: number) => void;
}

export function InteractiveStarRating({ rating, setRating }: InteractiveStarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="p-1 focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              size={32}
              className={
                (hoverRating || rating) >= star
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-neutral-200'
              }
            />
          </button>
        ))}
      </div>
      <span className="text-sm text-neutral-500">
        {rating === 0 ? 'Click to rate' : `You rated it ${rating} out of 5`}
      </span>
    </div>
  );
}
