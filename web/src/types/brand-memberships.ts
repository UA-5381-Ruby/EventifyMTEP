export type UserRole = 'admin' | 'owner' | 'member' | 'viewer';

export interface Membership {
  id: number;
  brand_id: number;
  user_id: number;
  role: UserRole;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CreateMembershipRequest {
  user_id: number;
  role: UserRole;
}

export interface PaginationParams {
  page?: number;
  per_page?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    total_pages: number;
    total_count: number;
  };
}
