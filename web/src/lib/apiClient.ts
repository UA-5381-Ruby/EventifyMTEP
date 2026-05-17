/**
 * API Client configuration and utilities
 * Handles JWT authentication and common API operations
 */

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

class ApiClient {
  private baseUrl: string;
  private defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  constructor(baseUrl: string = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  /**
   * Retrieves JWT token from localStorage
   */
  private getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  /**
   * Constructs headers with JWT token if available
   */
  private getHeaders(skipAuth: boolean = false): HeadersInit {
    const headers = { ...this.defaultHeaders };

    if (!skipAuth) {
      const token = this.getAuthToken();
      if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Makes an HTTP request to the API
   */
  private async request<T>(
    method: HttpMethod,
    path: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const { skipAuth = false, ...fetchOptions } = options;
    const url = `${this.baseUrl}${path}`;

    const response = await fetch(url, {
      method,
      headers: this.getHeaders(skipAuth),
      ...fetchOptions,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      const error = new Error(errorData.message || `HTTP ${response.status}`) as unknown as Record<string, unknown>;
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  /**
   * GET request
   */
  public get<T>(path: string, options?: FetchOptions): Promise<T> {
    return this.request<T>('GET', path, options);
  }

  /**
   * POST request
   */
  public post<T>(path: string, body?: unknown, options?: FetchOptions): Promise<T> {
    return this.request<T>('POST', path, {
      ...options,
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PUT request
   */
  public put<T>(path: string, body?: unknown, options?: FetchOptions): Promise<T> {
    return this.request<T>('PUT', path, {
      ...options,
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PATCH request
   */
  public patch<T>(path: string, body?: unknown, options?: FetchOptions): Promise<T> {
    return this.request<T>('PATCH', path, {
      ...options,
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * DELETE request
   */
  public delete<T>(path: string, options?: FetchOptions): Promise<T> {
    return this.request<T>('DELETE', path, options);
  }

  /**
   * Sets/updates the auth token (typically called after login)
   */
  public setAuthToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  /**
   * Clears the auth token (typically called on logout)
   */
  public clearAuthToken(): void {
    localStorage.removeItem('authToken');
  }
}

/**
 * Singleton instance of the API client
 */
export const apiClient = new ApiClient();

export default apiClient;
