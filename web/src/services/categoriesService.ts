import apiClient from '@/lib/apiClient';
import type { Category, CreateCategoryRequest } from '@/types/category';

export class CategoriesService {
  private static readonly endpoint = '/api/v1/categories';

  static async getCategories(): Promise<Category[]> {
    const response = await apiClient.get<Category[]>(this.endpoint);
    return response.data.sort((a, b) => a.name.localeCompare(b.name));
  }

  static async createCategory(payload: CreateCategoryRequest): Promise<Category> {
    try {
      const response = await apiClient.post<Category>(this.endpoint, { category: payload });
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }
}
