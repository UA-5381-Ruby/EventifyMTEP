import apiClient from './apiClient';
import { authStorage } from './authStorage';

export interface LoginPayload {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
}

export const authService = {
    async login(payload: LoginPayload): Promise<void> {
        const response = await apiClient.post<LoginResponse>(
            '/auth/login',
            payload,
        );

        authStorage.setToken(response.data.token);
    },

    logout(): void {
        authStorage.removeToken();
    },

    isAuthenticated(): boolean {
        return !!authStorage.getToken();
    },
};