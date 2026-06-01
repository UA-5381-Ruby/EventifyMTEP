import type { Event } from './event';

export interface Brand {
  id: number;
  name: string;
  description: string | null;
  logo_url?: string;
  subdomain: string;
  primary_color?: string;
  secondary_color?: string;
}

export interface BrandWithEvents extends Brand {
  events: Event[];
}

export interface CreateBrandRequest {
  name: string;
  description?: string;
  logo_url?: string;
  subdomain: string;
  primary_color?: string;
  secondary_color?: string;
}

export type BrandScope = 'managed' | 'subscribed' | 'discover';
export type Tab = 'managed' | 'subscribed';

export interface BrandListParams {
  page?: number;
  per_page?: number;
  sort?: string;
  q?: string;
  scope?: BrandScope;
}

export interface BrandListResponse {
  data: Brand[];
  meta: {
    current_page: number;
    total_pages: number;
    total_count: number;
  };
}
