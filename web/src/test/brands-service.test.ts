import type { AxiosResponse } from 'axios';
import type { CreateBrandRequest } from '@/types/brand';

jest.mock('@/lib/api-client.ts', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

import apiClient from '@/lib/api-client';
import { brandsService } from '@/services/brands-service.ts';

describe('BrandsService', () => {
  const endpoint = '/api/v1/brands';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch all brands', async () => {
    const mockBrands = [
      {
        id: 1,
        name: 'Brand A',
        description: 'Description',
        subdomain: 'brand-a',
      },
    ];

    const mockResponse = {
      data: mockBrands,
      meta: {
        current_page: 1,
        total_pages: 3,
        total_count: 30,
      },
    };

    jest.mocked(apiClient.get).mockResolvedValue({
      data: mockResponse,
    } as AxiosResponse);

    const result = await brandsService.getBrands({});

    expect(apiClient.get).toHaveBeenCalledWith(endpoint, { params: {} });
    expect(result).toEqual(mockResponse);
  });

  it('should fetch brand by id with events', async () => {
    const mockBrand = {
      id: 1,
      description: 'A great brand',
      logo_url: 'https://cdn.example.com/logo.png',
      name: 'Tech Corp',
      primary_color: '#FF5733',
      secondary_color: '#FFFFFF',
      subdomain: 'tech-corp',
      events: [
        {
          id: 1,
          brand_id: 1,
          description: 'Annual conference',
          end_date: '2025-12-02T18:00:00.000Z',
          location: 'Kyiv, Ukraine',
          start_date: '2025-12-01T10:00:00.000Z',
          status: 'draft',
          title: 'Tech Summit 2025',
        },
      ],
    };

    jest.mocked(apiClient.get).mockResolvedValue({
      data: mockBrand,
    } as AxiosResponse);

    const result = await brandsService.getBrandById(1);

    expect(apiClient.get).toHaveBeenCalledWith(`${endpoint}/1`);
    expect(result).toEqual(mockBrand);
    expect(result.events).toHaveLength(1);
    expect(result.events[0].title).toBe('Tech Summit 2025');
  });

  it('should create brand', async () => {
    const payload: CreateBrandRequest = {
      name: 'Brand A',
      description: 'Description',
      subdomain: 'brand-a',
    };

    const mockBrand = {
      id: 1,
      ...payload,
    };

    jest.mocked(apiClient.post).mockResolvedValue({
      data: mockBrand,
    } as AxiosResponse);

    const result = await brandsService.createBrand(payload);

    expect(apiClient.post).toHaveBeenCalledWith(endpoint, { brand: payload });
    expect(result).toEqual(mockBrand);
  });

  it('should update brand', async () => {
    const payload = {
      name: 'Updated Brand',
    };

    const mockBrand = {
      id: 1,
      name: 'Updated Brand',
      description: 'Description',
      subdomain: 'brand-a',
    };

    jest.mocked(apiClient.patch).mockResolvedValue({
      data: mockBrand,
    } as AxiosResponse);

    const result = await brandsService.updateBrand(1, payload);

    expect(apiClient.patch).toHaveBeenCalledWith(`${endpoint}/1`, { brand: payload });
    expect(result).toEqual(mockBrand);
  });

  it('should delete brand', async () => {
    jest.mocked(apiClient.delete).mockResolvedValue({} as AxiosResponse);

    await brandsService.deleteBrand(1);

    expect(apiClient.delete).toHaveBeenCalledWith(`${endpoint}/1`);
  });

  it('should handle API errors', async () => {
    jest.mocked(apiClient.get).mockRejectedValue(new Error('API Error'));

    await expect(brandsService.getBrandById(1)).rejects.toThrow('API Error');
  });

  it('should throw permission error when updating brand without ownership', async () => {
    const forbiddenError = Object.assign(new Error('Forbidden'), { isForbidden: true });
    jest.mocked(apiClient.patch).mockRejectedValue(forbiddenError);

    await expect(brandsService.updateBrand(1, { name: 'Test' })).rejects.toThrow(
      'You do not have permission to update this brand'
    );
  });

  it('should rethrow non-forbidden error when updating brand', async () => {
    const networkError = new Error('Network Error');
    jest.mocked(apiClient.patch).mockRejectedValue(networkError);

    await expect(brandsService.updateBrand(1, { name: 'Test' })).rejects.toBe(networkError);
  });
  it('should throw permission error when deleting brand without ownership', async () => {
    const forbiddenError = Object.assign(new Error('Forbidden'), { isForbidden: true });
    jest.mocked(apiClient.delete).mockRejectedValue(forbiddenError);

    await expect(brandsService.deleteBrand(1)).rejects.toThrow(
      'You do not have permission to delete this brand'
    );
  });
});

it('should rethrow non-forbidden error when deleting brand', async () => {
  const networkError = new Error('Network Error');
  jest.mocked(apiClient.delete).mockRejectedValue(networkError);

  await expect(brandsService.deleteBrand(1)).rejects.toBe(networkError);
});
