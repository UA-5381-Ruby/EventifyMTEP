import MockAdapter from 'axios-mock-adapter';
import { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import apiClient, { tokenStorage, parseApiError } from '@/lib/api-client';

describe('apiClient', () => {
  let mock: MockAdapter;

  beforeEach(() => {
    mock = new MockAdapter(apiClient);
    localStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    mock.restore();
  });

  it('adds Authorization header when token exists', async () => {
    localStorage.setItem('accessToken', 'TEST_TOKEN');

    mock.onGet('/test').reply((config) => {
      return [
        200,
        {
          authHeader: config.headers?.Authorization,
        },
      ];
    });

    const response = await apiClient.get('/test');

    expect(response.data.authHeader).toBe('Bearer TEST_TOKEN');
  });

  it('does NOT add Authorization header when token is missing', async () => {
    mock.onGet('/test').reply((config) => {
      return [
        200,
        {
          authHeader: config.headers?.Authorization,
        },
      ];
    });

    const response = await apiClient.get('/test');

    expect(response.data.authHeader).toBeUndefined();
  });

  it('handles 401 response', async () => {
    mock.onGet('/protected').reply(401);

    await expect(apiClient.get('/protected')).rejects.toBeTruthy();
  });

  it('uses correct baseURL', () => {
    expect(apiClient.defaults.baseURL).toBe('http://localhost:3000');
  });

  describe('tokenStorage', () => {
    it('sets, gets, and clears the token from localStorage', () => {
      const token = 'TEST_SECRET_TOKEN';

      // Set
      tokenStorage.set(token);
      expect(localStorage.getItem('accessToken')).toBe(token);

      expect(tokenStorage.get()).toBe(token);

      tokenStorage.clear();
      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(tokenStorage.get()).toBeNull();
    });
  });

  describe('apiClient interceptors', () => {
    it('adds Authorization header when token exists in storage', async () => {
      tokenStorage.set('TEST_TOKEN');

      mock.onGet('/test').reply((config) => {
        return [200, { authHeader: config.headers?.Authorization }];
      });

      const response = await apiClient.get('/test');
      expect(response.data.authHeader).toBe('Bearer TEST_TOKEN');
    });

    it('does NOT add Authorization header when token is missing', async () => {
      mock.onGet('/test').reply((config) => {
        return [200, { authHeader: config.headers?.Authorization }];
      });

      const response = await apiClient.get('/test');
      expect(response.data.authHeader).toBeUndefined();
    });
  });

  describe('parseApiError', () => {
    const createAxiosError = (data?: unknown, noResponse: boolean = false): AxiosError => {
      const error = new Error('Test Axios Error') as AxiosError;
      error.isAxiosError = true;
      if (!noResponse) {
        error.response = {
          data,
          status: 400,
          statusText: 'Bad Request',
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        };
      }
      return error;
    };

    it('throws error with data.error string', () => {
      const err = createAxiosError({ error: 'Single error message' });
      expect(() => parseApiError(err)).toThrow('Single error message');
    });

    it('throws error with data.errors string', () => {
      const err = createAxiosError({ errors: 'String error message' });
      expect(() => parseApiError(err)).toThrow('String error message');
    });

    it('throws error with data.errors array', () => {
      const err = createAxiosError({ errors: ['Error 1', 'Error 2'] });
      expect(() => parseApiError(err)).toThrow('Error 1, Error 2');
    });

    it('throws network error when there is no response', () => {
      const err = createAxiosError(null, true);
      expect(() => parseApiError(err)).toThrow('Network error — please check your connection.');
    });

    it('rethrows a standard Error as-is', () => {
      const standardError = new Error('Standard error');
      expect(() => parseApiError(standardError)).toThrow('Standard error');
    });

    it('throws unexpected error fallback for non-Error objects', () => {
      const nonError = { something: 'else' };
      expect(() => parseApiError(nonError)).toThrow('An unexpected error occurred.');
    });
  });
});
