import AuthService from '@/services/auth-service';
import apiClient, { tokenStorage } from '@/lib/api-client';

jest.mock('@/lib/api-client', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
    },
  },
  tokenStorage: {
    get: jest.fn(),
    set: jest.fn(),
    clear: jest.fn(),
  },
  parseApiError: jest.fn((err) => {
    throw err;
  }),
}));

const mockPost = apiClient.post as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

describe('login', () => {
  it('stores the JWT in localStorage on success', async () => {
    const fakeToken = 'eyJhbGciOiJIUzI1NiJ9.fake.sig';
    mockPost.mockResolvedValueOnce({
      data: { token: fakeToken, user: { id: '1', email: 'a@b.com', name: 'Ada' } },
    });

    await AuthService.login({ email: 'a@b.com', password: 'secret' });

    expect(tokenStorage.set).toHaveBeenCalledWith(fakeToken, false);
    expect(tokenStorage.set).toHaveBeenCalledTimes(1);
  });

  it('stores the JWT in localStorage when rememberMe is true', async () => {
    const fakeToken = 'eyJhbGciOiJIUzI1NiJ9.fake.sig';
    mockPost.mockResolvedValueOnce({
      data: { token: fakeToken, user: { id: '1', email: 'a@b.com', name: 'Ada' } },
    });

    await AuthService.login({ email: 'a@b.com', password: 'secret' }, true);

    expect(tokenStorage.set).toHaveBeenCalledWith(fakeToken, true);
  });

  it('updates auth state to isAuthenticated on success', async () => {
    const user = { id: '1', email: 'a@b.com', name: 'Ada' };
    mockPost.mockResolvedValueOnce({
      data: { token: 'tok', user },
    });

    await AuthService.login({ email: 'a@b.com', password: 'secret' });

    expect(AuthService.getState()).toEqual({ user, isAuthenticated: true });
  });

  it('does not store a token when credentials are rejected', async () => {
    mockPost.mockRejectedValueOnce(new Error('Invalid credentials'));

    await expect(AuthService.login({ email: 'a@b.com', password: 'wrong' })).rejects.toThrow();
    expect(tokenStorage.set).not.toHaveBeenCalled();
  });
});

describe('requestPasswordReset', () => {
  it('POSTs to the correct endpoint with just the email', async () => {
    mockPost.mockResolvedValueOnce({ data: {} });

    await AuthService.requestPasswordReset('a@b.com');

    expect(mockPost).toHaveBeenCalledWith('/api/v1/auth/password/reset', { email: 'a@b.com' });
  });
});

describe('confirmPasswordReset', () => {
  it('POSTs to the same endpoint with the token as a query param', async () => {
    mockPost.mockResolvedValueOnce({ data: {} });

    await AuthService.confirmPasswordReset('reset-token-xyz', 'newPassw0rd!');

    expect(mockPost).toHaveBeenCalledWith(
      '/api/v1/auth/password/reset',
      { new_password: 'newPassw0rd!' },
      { params: { token: 'reset-token-xyz' } }
    );
  });

  it('throws when the token is expired', async () => {
    mockPost.mockRejectedValueOnce(new Error('Token has expired'));

    await expect(AuthService.confirmPasswordReset('bad-token', 'pass')).rejects.toThrow(
      'Token has expired'
    );
  });
});

describe('register', () => {
  it('resolves with the full AuthResponse so UI can derive loading/error state', async () => {
    const user = { id: '2', email: 'b@b.com', name: 'Bob' };
    const fakeToken = 'eyJhbGciOiJIUzI1NiJ9.fake.sig';
    mockPost.mockResolvedValueOnce({ data: { token: fakeToken, user } });

    const result = await AuthService.register({ name: 'Bob', email: 'b@b.com', password: 'pw' });

    expect(result).toEqual({ token: fakeToken, user });
  });
});

describe('logout', () => {
  it('clears the token and resets auth state', () => {
    AuthService.logout();

    expect(tokenStorage.clear).toHaveBeenCalled();
    expect(AuthService.getState()).toEqual({ user: null, isAuthenticated: false });
  });
});

describe('subscribe', () => {
  it('emits current state immediately on subscribe', () => {
    const listener = jest.fn();
    const unsub = AuthService.subscribe(listener);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(AuthService.getState());

    unsub();
  });

  it('notifies subscriber when login succeeds', async () => {
    const user = { id: '1', email: 'a@b.com', name: 'Ada' };
    mockPost.mockResolvedValueOnce({ data: { token: 'tok', user } });

    const listener = jest.fn();
    const unsub = AuthService.subscribe(listener);
    listener.mockClear();

    await AuthService.login({ email: 'a@b.com', password: 'pw' });

    expect(listener).toHaveBeenCalledWith({ user, isAuthenticated: true });
    unsub();
  });
});
