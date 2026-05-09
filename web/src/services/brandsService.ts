import { apiClient } from '@/lib/apiClient';
import type {
  Brand,
  BrandWithEvents,
  CreateBrandRequest,
  UpdateBrandRequest,
} from '@/types/brand';

export class BrandsService {
  async getAllBrands(): Promise<Brand[]> {
    return apiClient.get<Brand[]>('/brands');
  }

  async getBrandById(id: string): Promise<BrandWithEvents> {
    return apiClient.get<BrandWithEvents>(`/brands/${id}`);
  }

  async createBrand(payload: CreateBrandRequest): Promise<Brand> {
    return apiClient.post<Brand>('/brands', payload);
  }

  async updateBrand(id: string, payload: UpdateBrandRequest): Promise<Brand> {
    return apiClient.patch<Brand>(`/brands/${id}`, payload);
  }

  async deleteBrand(id: string): Promise<void> {
    return apiClient.delete(`/brands/${id}`);
  }
}

export const brandsService = new BrandsService();
