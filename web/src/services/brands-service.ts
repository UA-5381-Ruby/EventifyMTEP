import apiClient, { parseApiError } from '@/lib/api-client';
import type {
  Brand,
  BrandWithEvents,
  BrandListParams,
  BrandListResponse,
  CreateBrandRequest,
  UpdateBrandRequest,
} from '@/types/brand';

interface ForbiddenError extends Error {
  isForbidden?: boolean;
}

export class BrandsService {
  private readonly endpoint = '/api/v1/brands';

  private buildFormData(data: Partial<CreateBrandRequest>): FormData {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(`brand[${key}]`, value instanceof File ? value : String(value));
      }
    });

    return formData;
  }

  async getBrands(params: BrandListParams): Promise<BrandListResponse> {
    const res = await apiClient.get<BrandListResponse>(this.endpoint, { params });
    return res.data;
  }

  async getBrandById(id: number): Promise<BrandWithEvents> {
    const res = await apiClient.get<BrandWithEvents>(`${this.endpoint}/${id}`);
    return res.data;
  }

  async createBrand(payload: CreateBrandRequest): Promise<Brand> {
    try {
      const formData = this.buildFormData(payload);

      const res = await apiClient.post<Brand>(this.endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data;
    } catch (error) {
      parseApiError(error);
    }
  }

  async updateBrand(id: number, data: UpdateBrandRequest): Promise<Brand> {
    try {
      const formData = this.buildFormData(data);

      const res = await apiClient.patch<Brand>(`${this.endpoint}/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data;
    } catch (error) {
      if (error instanceof Error && (error as ForbiddenError).isForbidden) {
        throw new Error('You do not have permission to update this brand', { cause: error });
      }
      parseApiError(error);
    }
  }

  async deleteBrand(id: number): Promise<void> {
    try {
      await apiClient.delete(`${this.endpoint}/${id}`);
    } catch (error) {
      if (error instanceof Error && (error as ForbiddenError).isForbidden) {
        throw new Error('You do not have permission to delete this brand', { cause: error });
      }
      throw error;
    }
  }
}

export const brandsService = new BrandsService();
