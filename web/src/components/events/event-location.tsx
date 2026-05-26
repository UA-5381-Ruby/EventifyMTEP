import { MapPin } from 'lucide-react';

interface EventLocationSectionProps {
  location: string;
}

export function EventLocationSection({ location }: EventLocationSectionProps) {
  return (
    <div className="py-6">
      <p className="text-sm font-semibold text-neutral-800 mb-2">Location</p>
      <div className="flex items-center gap-2 text-sm text-neutral-600 mb-3">
        <MapPin size={14} className="shrink-0 text-neutral-400" />
        <span>{location}</span>
      </div>

      <div className="relative w-full h-32 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200">
        {/* TODO: replace with Leaflet or Google Maps */}
        <div className="w-full h-full flex items-center justify-center">
          <div className="flex flex-col items-center gap-1 text-neutral-400">
            <MapPin size={24} className="text-red-400" />
            <span className="text-xs">{location}</span>
          </div>
        </div>

        <button className="absolute top-2 right-2 w-6 h-6 bg-white rounded flex items-center justify-center shadow-sm text-neutral-500 hover:text-neutral-800 transition-colors text-xs font-bold">
          ⤢
        </button>
        <div className="absolute bottom-2 right-2 flex flex-col gap-px">
          <button className="w-6 h-6 bg-white rounded-t flex items-center justify-center shadow-sm text-neutral-600 hover:bg-neutral-50 text-sm font-bold">
            +
          </button>
          <button className="w-6 h-6 bg-white rounded-b flex items-center justify-center shadow-sm text-neutral-600 hover:bg-neutral-50 text-sm font-bold">
            −
          </button>
        </div>
      </div>
    </div>
  );
}
