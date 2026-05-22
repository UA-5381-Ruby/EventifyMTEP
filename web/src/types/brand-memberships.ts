// types/brandMemberships.ts

export type UserRole = 'admin' | 'owner' | 'manager' | 'member';

export interface Membership {
  id: number;
  brand_id: number;
  user_id: number;
  role: UserRole;
  user: {
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
