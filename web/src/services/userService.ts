import apiClient from './apiClient';

export interface User {
    id: number;
    email: string;
    name: string;
}

export const getCurrentUser = async (): Promise<User> => {
    const response = await apiClient.get<User>('/users/me');

    return response.data;
};