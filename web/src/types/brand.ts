export interface Brand {
  id: string;
  name: string;
  description: string;
  logoUrl?: string;
  ownerId: string;
}

export interface BrandWithEvents extends Brand {
  events: Array<{
    id: string;
    title: string;
    startDate: string;
  }>;
}

export interface CreateBrandRequest {
  name: string;
  description: string;
  logoUrl?: string;
}

export type UpdateBrandRequest = Partial<CreateBrandRequest>;
