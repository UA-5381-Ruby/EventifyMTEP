// import type { Event } from './event';

export interface Brand {
  id: number;
  name: string;
  description: string | null;
  logo_url?: string;
  subdomain: string;
  primary_color?: string;
  secondary_color?: string;
}

// will reuse the Event from event type
export interface BrandEvent {
  id: number;
  title: string;
  start_date: string;
  end_date?: string;
  location?: string;
  status: string;
  brand_id: number;
}

export interface BrandWithEvents extends Brand {
  events: BrandEvent[];
  // events: Event[];
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
