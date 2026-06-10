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

export type EventSortField = 'created_at' | 'updated_at' | 'title' | 'start_date' | 'status';
export type SortOrder = 'asc' | 'desc';

export interface Event {
  id: number;
  title: string;
  start_date: string;
  status: EventStatus;
  brand_id: number;
}

export interface EventDetail extends Event {
  description: string;
  location: string;
  end_date: string | null;
  brand: {
    id: number;
    name: string;
    logoUrl?: string;
  };
  categories: {
    id: number;
    name: string;
  }[];
  available_tickets_count: number;
}

export interface EventQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  sort?: EventSortField;
  order?: SortOrder;
  status?: EventStatus;
  q?: string;
  from?: string;
  to?: string;
  brand_id?: number;
  category_id?: number;
}

export interface CreateEventRequest {
  title: string;
  location: string;
  start_date: string;
  brand_id: number;
  description?: string;
  end_date?: string;
  category_ids?: number[];
}

export interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
