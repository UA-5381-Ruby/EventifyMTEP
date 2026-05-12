import type { AxiosResponse } from 'axios';
import apiClient from '../../apiClient';
import { brandsService } from '../../brandsService';
import type {CreateBrandRequest} from "@/types/brand.ts";

// Замінюємо vi.mock на jest.mock
jest.mock('../../apiClient', () => ({
  default: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('BrandsService', () => {
  beforeEach(() => {
    // Замінюємо vi.clearAllMocks на jest.clearAllMocks
    jest.clearAllMocks();
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

    // Використовуємо jest.mocked для типізації моків
    jest.mocked(apiClient.get).mockResolvedValue({
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

    jest.mocked(apiClient.get).mockResolvedValue({
      data: mockBrand,
    } as AxiosResponse);

    const result = await brandsService.getBrandById('1');

    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/brands/1');
    expect(result).toEqual(mockBrand);
    expect(result.ownerId).toBe('owner1');
  });

  it('should create brand', async () => {
    const payload: CreateBrandRequest  = {
      subdomain: "",
      name: 'Brand A',
      description: 'Description'
    };

    const mockBrand = {
      id: '1',
      ...payload,
      ownerId: 'owner1',
    };

    jest.mocked(apiClient.post).mockResolvedValue({
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

    jest.mocked(apiClient.patch).mockResolvedValue({
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
    jest.mocked(apiClient.delete).mockResolvedValue({} as AxiosResponse);

    await brandsService.deleteBrand('1');

    expect(apiClient.delete).toHaveBeenCalledWith('/api/v1/brands/1');
  });

  it('should handle API errors', async () => {
    jest.mocked(apiClient.get).mockRejectedValue(new Error('API Error'));

    await expect(brandsService.getBrandById('123'))
        .rejects.toThrow('API Error');
  });
});