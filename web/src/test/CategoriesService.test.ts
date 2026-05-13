import type { AxiosResponse } from 'axios';
import { CategoriesService } from '../services/categoriesService.ts';
import apiClient from '@/lib/apiClient';

jest.mock('../lib/apiClient', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

describe('CategoriesService', () => {
  const endpoint = '/api/v1/categories';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCategories', () => {
    it('should fetch categories and sort them by name', async () => {
      const mockCategories = [
        { id: 1, name: 'Conference' },
        { id: 2, name: 'Workshop' },
        { id: 3, name: 'Music' },
      ];

      jest.mocked(apiClient.get).mockResolvedValue({
        data: mockCategories,
      } as AxiosResponse);

      const result = await CategoriesService.getCategories();

      expect(apiClient.get).toHaveBeenCalledWith(endpoint);

      expect(result[0].name).toBe('Conference');
      expect(result[1].name).toBe('Music');
      expect(result[2].name).toBe('Workshop');
    });

    it('should handle empty response', async () => {
      jest.mocked(apiClient.get).mockResolvedValue({
        data: [],
      } as AxiosResponse);

      const result = await CategoriesService.getCategories();
      expect(result).toEqual([]);
    });
  });

  describe('createCategory', () => {
    it('should create a category with wrapped payload', async () => {
      const payload = { name: 'New Category' };
      const mockResponse = { id: 99, name: 'New Category' };

      jest.mocked(apiClient.post).mockResolvedValue({
        data: mockResponse,
      } as AxiosResponse);

      const result = await CategoriesService.createCategory(payload);

      expect(apiClient.post).toHaveBeenCalledWith(endpoint, {
        category: payload,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should throw and log error when creation fails', async () => {
      const payload = { name: 'Fail' };
      const apiError = new Error('422 Unprocessable Entity');

      jest.mocked(apiClient.post).mockRejectedValue(apiError);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(CategoriesService.createCategory(payload)).rejects.toThrow(
        '422 Unprocessable Entity'
      );

      expect(consoleSpy).toHaveBeenCalledWith('Error creating category:', apiError);

      consoleSpy.mockRestore();
    });
  });
});
