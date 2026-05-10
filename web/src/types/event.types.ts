export type EventStatus =
  | 'draft'
  | 'draft_on_review'
  | 'published'
  | 'rejected'
  | 'published_unverified'
  | 'published_on_review'
  | 'published_rejected'
  | 'archived'
  | 'cancelled';

export interface Event {
  id: string;
  title: string;
  start_date: string;
  status: EventStatus;
  brand_id: string;
}

export interface EventDetail extends Event {
  description: string | null;
  location: string;
  end_date: string | null;
  brand: {
    id: string;
    name: string;
  };
  categories: {
    id: string;
    name: string;
  }[];
}

export interface EventQueryParams {
  page?: number;
  per_page?: number;
  sort?: 'created_at' | 'updated_at' | 'title' | 'start_date' | 'status';
  order?: 'asc' | 'desc';
  q?: string;
  from?: string;
  to?: string;
  brand_id?: string;
  status?: EventStatus;
  category_id?: string;
}

export interface CreateEventRequest {
  title: string;
  location: string;
  start_date: string;
  brand_id: string;
  description?: string;
  end_date?: string;
  category_ids?: string[];
}

export interface EventTransitionRequest {
  reason?: string;
}

export interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}