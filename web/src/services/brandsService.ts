import apiClient from './apiClient';
import type { AxiosError } from 'axios';
import type {
  Brand,
  BrandWithEvents,
  CreateBrandRequest,
  UpdateBrandRequest,
} from '@/types/brand';

type ForbiddenError = AxiosError & { isForbidden?: boolean };

export class BrandsService {
  private readonly endpoint = '/api/v1/brands';
  async getAllBrands(): Promise<Brand[]> {
    const res = await apiClient.get<Brand[]>(this.endpoint);
    return res.data;
  }

  async getBrandById(id: number): Promise<BrandWithEvents> {
    const res = await apiClient.get<BrandWithEvents>(`${this.endpoint}/${id}`);
    return res.data;
  }

  async createBrand(payload: CreateBrandRequest): Promise<Brand> {
    const res = await apiClient.post<Brand>(this.endpoint, { brand: payload });
    return res.data;
  }

  async updateBrand(id: number, payload: UpdateBrandRequest): Promise<Brand> {
    try {
      const res = await apiClient.patch<Brand>(`${this.endpoint}/${id}`, {brand: payload});
      return res.data;
    } catch (error) {
      if ((error as ForbiddenError).isForbidden) {
        throw new Error('You do not have permission to update this brand', { cause: error });
      }
      throw error;
    }
  }

  async deleteBrand(id: number): Promise<void> {
    try {
      await apiClient.delete(`${this.endpoint}/${id}`);
    } catch (error) {
      if ((error as ForbiddenError).isForbidden) {
        throw new Error('You do not have permission to delete this brand', { cause: error });
      }
      throw error;
    }
  }
}

export const brandsService = new BrandsService();
