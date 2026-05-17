import type { Category, LinkCategoryRequest } from '@/types/categories';
import { apiClient } from '@/lib/apiClient';

/**
 * Service for managing the many-to-many relationship between events and categories.
 * Handles category discovery and relationship management through nested API endpoints.
 */
export class EventCategoriesService {
  private baseEndpoint = '/api/v1/events';

  /**
   * Retrieves all categories associated with a specific event.
   * @param eventId - The ID of the event
   * @returns Promise resolving to an array of categories
   * @throws Error if the request fails or user lacks permission
   */
  async getEventCategories(eventId: string): Promise<Category[]> {
    const path = `${this.baseEndpoint}/${eventId}/categories`;
    return apiClient.get<Category[]>(path);
  }

  /**
   * Establishes a link between an event and a category.
   * @param eventId - The ID of the event
   * @param categoryId - The ID of the category to link
   * @returns Promise that resolves when the link is established
   * @throws Error if the request fails, user lacks permission (403), or category already linked (409)
   */
  async linkCategoryToEvent(eventId: string, categoryId: string): Promise<void> {
    const path = `${this.baseEndpoint}/${eventId}/categories`;
    const payload: LinkCategoryRequest = { category_id: categoryId };
    await apiClient.post<void>(path, payload);
  }

  /**
   * Removes the association between an event and a specific category.
   * @param eventId - The ID of the event
   * @param categoryId - The ID of the category to unlink
   * @returns Promise that resolves when the link is removed
   * @throws Error if the request fails, user lacks permission (403), or category not linked (409)
   */
  async unlinkCategoryFromEvent(eventId: string, categoryId: string): Promise<void> {
    const path = `${this.baseEndpoint}/${eventId}/categories/${categoryId}`;
    await apiClient.delete<void>(path);
  }
}

/**
 * Singleton instance of the EventCategoriesService
 */
export const eventCategoriesService = new EventCategoriesService();

export default eventCategoriesService;
