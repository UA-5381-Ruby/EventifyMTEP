export interface Brand {
  id: number;
  name: string;
  description: string | null;
  logo_url?: string;
  subdomain: string;
  primary_color?: string;
  secondary_color?: string;
}

export interface BrandEvent {
  id: number;
  title: string;
  start_date: string;
}

export interface BrandWithEvents extends Brand {
  events: BrandEvent[];
}

export interface CreateBrandRequest {
  name: string;
  description?: string;
  logo_url?: string;
  subdomain: string;
  primary_color?: string;
  secondary_color?: string;
}

export type UpdateBrandRequest = Partial<CreateBrandRequest>;