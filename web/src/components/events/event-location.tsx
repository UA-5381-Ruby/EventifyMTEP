import { useEffect } from 'react';
import { MapPin, Globe } from 'lucide-react';
import { MapContainer, TileLayer, Marker, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useReduxState } from '@/hooks/use-redux-state';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

import { MapService } from '@/services/map-service';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface EventLocationSectionProps {
  location: string;
}

export function EventLocationSection({ location }: EventLocationSectionProps) {
  const [coords, setCoords] = useReduxState<[number, number] | null>(null);
  const [error, setError] = useReduxState<boolean>(false);

  const isOnline = location.trim().toLowerCase() === 'online';

  useEffect(() => {
    if (isOnline || !location) return;

    MapService.getCoordinates(location)
      .then(({ lat, lon }) => {
        setCoords([lat, lon]);
        setError(false);
      })
      .catch((err) => {
        console.error('Error fetching coordinates:', err);
        setError(true);
      });
  }, [location, isOnline]);

  return (
    <div className="py-6">
      <p className="text-sm font-semibold text-neutral-800 mb-2">Location</p>

      <div className="flex items-center gap-2 text-sm text-neutral-600 mb-3">
        {isOnline ? (
          <Globe size={14} className="shrink-0 text-neutral-400" />
        ) : (
          <MapPin size={14} className="shrink-0 text-neutral-400" />
        )}
        <span>{location}</span>
      </div>

      <div className="relative w-full h-32 rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 flex items-center justify-center">
        {isOnline ? (
          <div className="flex flex-col items-center gap-1 text-neutral-400">
            <Globe size={24} className="text-blue-400" />
            <span className="text-xs">Virtual Event</span>
          </div>
        ) : coords ? (
          <MapContainer
            center={coords}
            zoom={13}
            scrollWheelZoom={false}
            zoomControl={false}
            className="w-full h-full z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={coords} />
            <ZoomControl position="bottomright" />
          </MapContainer>
        ) : error ? (
          <div className="flex flex-col items-center gap-1 text-neutral-400">
            <MapPin size={24} className="text-red-400" />
            <span className="text-xs">Location map unavailable</span>
          </div>
        ) : (
          <span className="text-xs text-neutral-400 animate-pulse">Loading map...</span>
        )}
      </div>
    </div>
  );
}
