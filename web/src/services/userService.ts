import apiClient from '@/lib/apiClient';

export interface User {
  id: number;
  email: string;
  name: string;
}

export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<User>('api/v1/users/me');

  return response.data;
};
