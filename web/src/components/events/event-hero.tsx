import { ArrowLeft } from 'lucide-react';
import type { EventDetail } from '@/types/event';

interface EventHeroProps {
  event: EventDetail;
  onBack: () => void;
}

export function EventHero({ event, onBack }: EventHeroProps) {
  return (
    <div className="relative w-full h-56 bg-neutral-200">
      <button
        onClick={onBack}
        className="absolute top-4 left-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-colors"
      >
        <ArrowLeft size={16} className="text-neutral-700" />
      </button>

      {event.banner_url ? (
        <img src={event.banner_url} alt={event.title} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-neutral-200" />
      )}

      {event.categories?.length > 0 && (
        <div className="absolute bottom-4 left-4">
          <span className="bg-neutral-900 text-white text-xs font-semibold px-4 py-1.5 rounded-sm tracking-wide uppercase">
            {event.categories[0].name}
          </span>
        </div>
      )}
    </div>
  );
}
