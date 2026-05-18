import axios, { AxiosError, type AxiosInstance } from 'axios';

const TOKEN_KEY = 'accessToken';

export const tokenStorage = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  clear: (): void => localStorage.removeItem(TOKEN_KEY),
};

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Attach the Bearer token to every request if one is stored.
apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface RailsErrorBody {
  error?: string;
  errors?: string | string[];
}

/**
 * Converts an Axios error into a plain, user-friendly string.
 */
export function parseApiError(err: unknown): never {
  if (axios.isAxiosError(err)) {
    const axiosErr = err as AxiosError<RailsErrorBody>;
    const data = axiosErr.response?.data;

    if (data) {
      if (typeof data.error === 'string') throw new Error(data.error);

      if (data.errors) {
        const msg = Array.isArray(data.errors) ? data.errors.join(', ') : data.errors;
        throw new Error(msg);
      }
    }

    // Network-level failures (no response at all)
    if (!axiosErr.response) {
      throw new Error('Network error — please check your connection.');
    }
  }

  // Unknown shape — rethrow as-is so nothing is silently swallowed
  throw err instanceof Error ? err : new Error('An unexpected error occurred.');
}

export default apiClient;
