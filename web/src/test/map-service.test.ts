import { MapService } from '@/services/map-service';

const mockFetch = jest.fn();
globalThis.fetch = mockFetch as typeof fetch; // another way for `global.fetch`

const mockSuccessResponse = [{ lat: '50.4501', lon: '30.5234' }];

function mockFetchResolving(body: unknown, ok = true) {
  mockFetch.mockResolvedValueOnce({
    ok,
    status: ok ? 200 : 500,
    json: async () => body,
  });
}

beforeEach(() => {
  mockFetch.mockClear();
});

describe('MapService.getCoordinates', () => {
  it('returns parsed coordinates on a successful response', async () => {
    mockFetchResolving(mockSuccessResponse);

    const result = await MapService.getCoordinates('Kyiv, Ukraine');

    expect(result).toEqual({ lat: 50.4501, lon: 30.5234 });
  });

  it('calls the Nominatim API with the encoded location', async () => {
    mockFetchResolving(mockSuccessResponse);

    await MapService.getCoordinates('Lviv, Ukraine');

    expect(mockFetch).toHaveBeenCalledWith(
      `${import.meta.env.VITE_MAP_API_BASE_URL}?format=json&q=Lviv%2C%20Ukraine`,
      { signal: AbortSignal.timeout(5000) }
    );
  });

  it('throws when the response is not ok', async () => {
    mockFetchResolving([], false);

    await expect(MapService.getCoordinates('Nowhere')).rejects.toThrow(
      'Geocoding request failed: 500'
    );
  });

  it('throws when the response returns an empty array', async () => {
    mockFetchResolving([]);

    await expect(MapService.getCoordinates('Nowhere')).rejects.toThrow(
      'No coordinates found for location: "Nowhere"'
    );
  });

  it('throws when fetch itself rejects (network error)', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(MapService.getCoordinates('Kyiv')).rejects.toThrow('Network error');
  });

  it('throws when the response is not an array', async () => {
    mockFetchResolving({ lat: '50.4501', lon: '30.5234' }); // object, not array

    await expect(MapService.getCoordinates('Kyiv')).rejects.toThrow('No coordinates found');
  });

  it('throws when lat or lon properties are missing', async () => {
    mockFetchResolving([{ lat: '50.4501' }]); // missing lon

    await expect(MapService.getCoordinates('Kyiv')).rejects.toThrow();
  });

  it('handles non-numeric coordinate strings gracefully', async () => {
    mockFetchResolving([{ lat: 'invalid', lon: '30.5234' }]);

    const result = await MapService.getCoordinates('Kyiv');

    expect(result.lat).toBeNaN(); // or verify error is thrown if validation added
  });
});
