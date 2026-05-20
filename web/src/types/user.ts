export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'superadmin';
  createdAt: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
}
