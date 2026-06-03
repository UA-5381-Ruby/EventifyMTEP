export interface Coordinates {
  lat: number;
  lon: number;
}

const BASE_URL = 'https://nominatim.openstreetmap.org/search';

export const MapService = {
  async getCoordinates(location: string): Promise<Coordinates> {
    const response = await fetch(`${BASE_URL}?format=json&q=${encodeURIComponent(location)}`);

    if (!response.ok) {
      throw new Error(`Geocoding request failed: ${response.status}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      throw new Error(`No coordinates found for location: "${location}"`);
    }

    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
    };
  },
};
