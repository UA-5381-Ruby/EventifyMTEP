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

  it('should fetch all brands', async () => {
    const mockBrands = [
      {
        id: '1',
        name: 'Brand A',
        description: 'Description',
        ownerId: 'owner1',
      },
    ];

    vi.mocked(apiClient.get).mockResolvedValue({
      data: mockBrands,
    } as AxiosResponse);

    const result = await brandsService.getAllBrands();

    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/brands');
    expect(result).toEqual(mockBrands);
  });

  it('should fetch brand by id with events', async () => {
    const mockBrand = {
      id: '1',
      name: 'Brand A',
      description: 'Description',
      ownerId: 'owner1',
      events: [],
    };

    vi.mocked(apiClient.get).mockResolvedValue({
      data: mockBrand,
    } as AxiosResponse);

    const result = await brandsService.getBrandById('1');

    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/brands/1');
    expect(result).toEqual(mockBrand);
    expect(result.ownerId).toBe('owner1');
  });

  it('should create brand', async () => {
    const payload = {
      name: 'Brand A',
      description: 'Description',
    };

    const mockBrand = {
      id: '1',
      ...payload,
      ownerId: 'owner1',
    };

    vi.mocked(apiClient.post).mockResolvedValue({
      data: mockBrand,
    } as AxiosResponse);

    const result = await brandsService.createBrand(payload);

    expect(apiClient.post).toHaveBeenCalledWith(
      '/api/v1/brands',
      payload
    );
    expect(result).toEqual(mockBrand);
  });

  it('should update brand', async () => {
    const payload = {
      name: 'Updated Brand',
    };

    const mockBrand = {
      id: '1',
      name: 'Updated Brand',
      description: 'Description',
      ownerId: 'owner1',
    };

    vi.mocked(apiClient.patch).mockResolvedValue({
      data: mockBrand,
    } as AxiosResponse);

    const result = await brandsService.updateBrand('1', payload);

    expect(apiClient.patch).toHaveBeenCalledWith(
      '/api/v1/brands/1',
      payload
    );
    expect(result).toEqual(mockBrand);
  });

  it('should delete brand', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({} as AxiosResponse);

    await brandsService.deleteBrand('1');

    expect(apiClient.delete).toHaveBeenCalledWith('/api/v1/brands/1');
  });

  it('should handle API errors', async () => {
    vi.mocked(apiClient.get).mockRejectedValue(new Error('API Error'));

    await expect(brandsService.getBrandById('123'))
      .rejects.toThrow('API Error');
  });
});
