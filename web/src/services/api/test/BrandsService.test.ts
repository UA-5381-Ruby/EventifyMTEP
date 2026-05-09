import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { AxiosResponse } from 'axios';
import apiClient from '../../apiClient';
import { brandsService } from '../../brandsService';

vi.mock('../../apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('BrandsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch all brands and return data', async () => {
    const mockBrands = [{
      id: '1',
      name: 'Brand A',
      description: 'Description for Brand A',
      ownerId: 'owner1',
    }];

    const mockResponse = {
      data: mockBrands,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    } as unknown as AxiosResponse;

    vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

    const result = await brandsService.getAllBrands();

    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/brands');
    expect(result).toEqual(mockBrands);
  });

  it('should handle API errors', async () => {
    vi.mocked(apiClient.get).mockRejectedValue(new Error('API Error'));

    await expect(brandsService.getBrandById('123'))
      .rejects.toThrow('API Error');
  });
});
