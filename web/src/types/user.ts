import type { Brand } from './brand';
import type { UserRole } from './brand-memberships';

export interface User {
  id: number;
  name: string;
  email: string;
  is_superadmin: boolean;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
}

export interface UserMembership {
  id: string;
  role: UserRole;
  brand: Brand;
}

export interface UserProfile extends User {
  created_at: string;
  memberships: UserMembership[];
}
