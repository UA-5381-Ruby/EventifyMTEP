import apiClient from '@/lib/api-client.ts';

export interface User {
  id: number;
  email: string;
  name: string;
}

export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<User>('/users/me');

  return response.data;
};
