import apiClient from './apiClient';
import type {
  Brand,
  BrandWithEvents,
  CreateBrandRequest,
  UpdateBrandRequest,
} from '@/types/brand';

export class BrandsService {
  private readonly endpoint = '/api/v1/brands';
  async getAllBrands(): Promise<Brand[]> {
    const res = await apiClient.get<Brand[]>(this.endpoint);
    return res.data;
  }

  async getBrandById(id: string): Promise<BrandWithEvents> {
    const res = await apiClient.get<BrandWithEvents>(`${this.endpoint}/${id}`);
    return res.data;
  }

  async createBrand(payload: CreateBrandRequest): Promise<Brand> {
    const res = await apiClient.post<Brand>(this.endpoint, payload);
    return res.data;
  }

  async updateBrand(id: string, payload: UpdateBrandRequest): Promise<Brand> {
    const res = await apiClient.patch<Brand>(`${this.endpoint}/${id}`, payload);
    return res.data;
  }

  async deleteBrand(id: string): Promise<void> {
    await apiClient.delete(`${this.endpoint}/${id}`);
  }
}

export const brandsService = new BrandsService();
