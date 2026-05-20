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
