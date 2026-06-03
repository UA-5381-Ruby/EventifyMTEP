export interface Coordinates {
  lat: number;
  lon: number;
}

const BASE_URL = 'https://nominatim.openstreetmap.org/search';

export const MapService = {
  async getCoordinates(location: string): Promise<Coordinates> {
    const response = await fetch(
      `${BASE_URL}?format=json&q=${encodeURIComponent(location)}`,
      {
        signal: AbortSignal.timeout(5000), // 5 second timeout
      }
    );

    if (!response.ok) {
      throw new Error(`Geocoding request failed: ${response.status}`);
    }

    const data = await response.json();

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error(`No coordinates found for location: "${location}"`);
    }

    const firstResult = data[0];
    if (!firstResult.lat || !firstResult.lon) {
      throw new Error(`Invalid coordinates in response for location: "${location}"`);
    }

    return {
      lat: parseFloat(firstResult.lat),
      lon: parseFloat(firstResult.lon),
    };
  },
};
