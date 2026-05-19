import apiClient from '@/lib/apiClient';
import type { Category, LinkCategoryRequest } from '@/types/category';

export const EventCategoriesService = {
  /**
   * Retrieves all categories associated with a specific event.
   * @param eventId The ID of the event
   * @returns Array of categories linked to the event
   */
  async getEventCategories(eventId: string): Promise<Category[]> {
    const response = await apiClient.get<Category[]>(`/api/v1/events/${eventId}/categories`);
    return response.data;
  },

  /**
   * Links a category to an event.
   * @param eventId The ID of the event
   * @param categoryId The ID of the category to link
   * @throws Error if the category is already linked or if permission is denied
   */
  async linkCategoryToEvent(eventId: string, categoryId: number): Promise<void> {
    const payload: LinkCategoryRequest = { category_id: categoryId };
    await apiClient.post(`/api/v1/events/${eventId}/categories`, payload);
  },

  /**
   * Unlinks a category from an event.
   * @param eventId The ID of the event
   * @param categoryId The ID of the category to unlink
   * @throws Error if the category is not linked or if permission is denied
   */
  async unlinkCategoryFromEvent(eventId: string, categoryId: number): Promise<void> {
    await apiClient.delete(`/api/v1/events/${eventId}/categories/${categoryId}`);
  },
};
