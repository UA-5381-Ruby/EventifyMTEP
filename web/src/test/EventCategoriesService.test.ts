import type { AxiosResponse } from 'axios';
import { EventCategoriesService } from '../services/eventCategoriesService';
import apiClient from '@/lib/apiClient';
import type { Category, LinkCategoryRequest } from '@/types/category';

jest.mock('@/lib/apiClient', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('EventCategoriesService', () => {
  const mockEventId = 'event-123';
  const mockCategoryId = 1;
  const mockCategory: Category = {
    id: mockCategoryId,
    name: 'Technology',
    slug: 'technology',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getEventCategories', () => {
    it('повинен відправляти GET-запит для отримання категорій певної події', async () => {
      const mockCategories: Category[] = [
        { id: 1, name: 'Technology', slug: 'technology' },
        { id: 2, name: 'Business', slug: 'business' },
      ];

      jest.mocked(apiClient.get).mockResolvedValue({
        data: mockCategories,
      } as AxiosResponse);

      const result = await EventCategoriesService.getEventCategories(mockEventId);

      expect(apiClient.get).toHaveBeenCalledWith(`/api/v1/events/${mockEventId}/categories`);
      expect(result).toEqual(mockCategories);
    });

    it('повинен повернути порожній масив, якщо у події немає категорій', async () => {
      jest.mocked(apiClient.get).mockResolvedValue({
        data: [],
      } as AxiosResponse);

      const result = await EventCategoriesService.getEventCategories(mockEventId);

      expect(result).toEqual([]);
    });

    it('повинен передати помилку API при невдалому запиті', async () => {
      const apiError = new Error('404 Not Found');

      jest.mocked(apiClient.get).mockRejectedValue(apiError);

      await expect(EventCategoriesService.getEventCategories(mockEventId)).rejects.toThrow(
        '404 Not Found'
      );
    });
  });

  describe('linkCategoryToEvent', () => {
    it('повинен відправляти POST-запит з правильним payload', async () => {
      jest.mocked(apiClient.post).mockResolvedValue({
        data: {},
      } as AxiosResponse);

      await EventCategoriesService.linkCategoryToEvent(mockEventId, mockCategoryId);

      const expectedPayload: LinkCategoryRequest = {
        category_id: mockCategoryId,
      };
      expect(apiClient.post).toHaveBeenCalledWith(
        `/api/v1/events/${mockEventId}/categories`,
        expectedPayload
      );
    });

    it("повинен передати помилку 409 Conflict, якщо категорія вже пов'язана", async () => {
      const conflictError = new Error('409 Conflict: Category already linked');

      jest.mocked(apiClient.post).mockRejectedValue(conflictError);

      await expect(
        EventCategoriesService.linkCategoryToEvent(mockEventId, mockCategoryId)
      ).rejects.toThrow('409 Conflict');
    });

    it('повинен передати помилку 403 Forbidden, якщо недостатньо дозволів', async () => {
      const forbiddenError = new Error('403 Forbidden');

      jest.mocked(apiClient.post).mockRejectedValue(forbiddenError);

      await expect(
        EventCategoriesService.linkCategoryToEvent(mockEventId, mockCategoryId)
      ).rejects.toThrow('403 Forbidden');
    });
  });

  describe('unlinkCategoryFromEvent', () => {
    it('повинен відправляти DELETE-запит з правильним URL', async () => {
      jest.mocked(apiClient.delete).mockResolvedValue({
        data: {},
      } as AxiosResponse);

      await EventCategoriesService.unlinkCategoryFromEvent(mockEventId, mockCategoryId);

      expect(apiClient.delete).toHaveBeenCalledWith(
        `/api/v1/events/${mockEventId}/categories/${mockCategoryId}`
      );
    });

    it("повинен передати помилку 404 Not Found, якщо категорія не пов'язана", async () => {
      const notFoundError = new Error('404 Not Found');

      jest.mocked(apiClient.delete).mockRejectedValue(notFoundError);

      await expect(
        EventCategoriesService.unlinkCategoryFromEvent(mockEventId, mockCategoryId)
      ).rejects.toThrow('404 Not Found');
    });

    it('повинен передати помилку 403 Forbidden, якщо недостатньо дозволів', async () => {
      const forbiddenError = new Error('403 Forbidden');

      jest.mocked(apiClient.delete).mockRejectedValue(forbiddenError);

      await expect(
        EventCategoriesService.unlinkCategoryFromEvent(mockEventId, mockCategoryId)
      ).rejects.toThrow('403 Forbidden');
    });
  });

  describe('Integration scenarios', () => {
    it('повинен дозволити отримати категорії, додати нову та видалити', async () => {
      const initialCategories: Category[] = [mockCategory];
      jest.mocked(apiClient.get).mockResolvedValueOnce({
        data: initialCategories,
      } as AxiosResponse);

      const result1 = await EventCategoriesService.getEventCategories(mockEventId);
      expect(result1).toEqual(initialCategories);

      jest.mocked(apiClient.post).mockResolvedValueOnce({
        data: {},
      } as AxiosResponse);

      await EventCategoriesService.linkCategoryToEvent(mockEventId, 2);
      expect(apiClient.post).toHaveBeenCalled();

      jest.mocked(apiClient.delete).mockResolvedValueOnce({
        data: {},
      } as AxiosResponse);

      await EventCategoriesService.unlinkCategoryFromEvent(mockEventId, mockCategoryId);
      expect(apiClient.delete).toHaveBeenCalled();
    });
  });
});
