export type SortOrder = 'asc' | 'desc';

export interface TicketEvent {
  id: number;
  title: string;
  location: string;
  start_date: string;
  end_date: string | null;
}

export interface TicketFeedback {
  id: number;
  rating: number;
  comment: string;
}

export interface Ticket {
  id: string;
  is_active: boolean;
  qr_code_url?: string;
  event_id: number;
  user_id: number;
  event?: TicketEvent;
  event_feedback?: TicketFeedback;
}

export interface TicketQueryParams {
  page?: number;
  per_page?: number;
  sort?: string;
  order?: SortOrder;
  q?: string;
  is_active?: boolean;
  event_id?: number;
}

export interface ReviewRequest {
  rating: number;
  comment: string;
}

export interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
}

export interface PaginatedTicketsResponse {
  data: Ticket[];
  meta: PaginationMeta;
}
