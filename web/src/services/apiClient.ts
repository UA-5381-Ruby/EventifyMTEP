import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosError,
} from 'axios';
import { toast } from 'react-toastify';
import i18next from 'i18next';

const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      const data = error.response.data as any;
      const backendErrorCode = data?.error?.code;

      if (backendErrorCode === 'REMOVE_MEMBER_FORBIDDEN') {
        toast.error(i18next.t('errors.brand_memberships.remove_forbidden'));
      } else if (backendErrorCode === 'ASSIGN_ROLE_FORBIDDEN') {
        toast.error(i18next.t('errors.brand_memberships.add_forbidden'));
      } else {
        toast.error(i18next.t('errors.forbidden_generic'));
      }

      const forbiddenError = error as AxiosError & {
        isForbidden?: boolean;
      };
      
      forbiddenError.isForbidden = true;
      forbiddenError.name = 'ForbiddenError';

      return Promise.reject(forbiddenError);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;