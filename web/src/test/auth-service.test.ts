import AuthService from '@/services/auth-service';
import { parseUserIdFromToken } from '@/services/auth-service';
import apiClient, { tokenStorage } from '@/lib/api-client';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '@/hooks/use-auth';

jest.mock('@/lib/api-client', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
    patch: jest.fn(),
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
const mockGet = apiClient.get as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  (tokenStorage.get as jest.Mock).mockReturnValue(null);
});

describe('login', () => {
  it('stores the JWT in sessionStorage by default (remember=false)', async () => {
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
    mockPost.mockResolvedValueOnce({ data: { token: 'tok', user } });

    await AuthService.login({ email: 'a@b.com', password: 'secret' });

    expect(AuthService.getState()).toEqual({ user, isAuthenticated: true });
  });

  it('does not store a token when credentials are rejected', async () => {
    mockPost.mockRejectedValueOnce(new Error('Invalid credentials'));

    await expect(AuthService.login({ email: 'a@b.com', password: 'wrong' })).rejects.toThrow();
    expect(tokenStorage.set).not.toHaveBeenCalled();
  });
});

describe('register', () => {
  it('resolves with the full AuthResponse', async () => {
    const user = { id: '2', email: 'b@b.com', name: 'Bob' };
    const fakeToken = 'eyJhbGciOiJIUzI1NiJ9.fake.sig';
    mockPost.mockResolvedValueOnce({ data: { token: fakeToken, user } });

    const result = await AuthService.register(
      { name: 'Bob', email: 'b@b.com', password: 'pw' },
      true
    );

    expect(result).toEqual({ token: fakeToken, user });
  });

  it('sets auth state to isAuthenticated on success', async () => {
    const user = { id: '2', email: 'b@b.com', name: 'Bob' };
    mockPost.mockResolvedValueOnce({ data: { token: 'tok', user } });

    await AuthService.register({ name: 'Bob', email: 'b@b.com', password: 'pw' });

    expect(AuthService.getState()).toEqual({ user, isAuthenticated: true });
  });

  it('throws when registration fails', async () => {
    mockPost.mockRejectedValueOnce(new Error('Email already taken'));

    await expect(
      AuthService.register({ name: 'Bob', email: 'taken@b.com', password: 'pw' })
    ).rejects.toThrow('Email already taken');
    expect(tokenStorage.set).not.toHaveBeenCalled();
  });

  it('stores the JWT with rememberMe=true when passed', async () => {
    const fakeToken = 'eyJhbGciOiJIUzI1NiJ9.fake.sig';
    const user = { id: '2', email: 'b@b.com', name: 'Bob' };
    mockPost.mockResolvedValueOnce({ data: { token: fakeToken, user } });

    await AuthService.register({ name: 'Bob', email: 'b@b.com', password: 'pw' }, true);

    expect(tokenStorage.set).toHaveBeenCalledWith(fakeToken, true);
  });
});

describe('logout', () => {
  it('clears the token and resets auth state', () => {
    AuthService.logout();

    expect(tokenStorage.clear).toHaveBeenCalled();
    expect(AuthService.getState()).toEqual({ user: null, isAuthenticated: false });
  });
});

describe('requestPasswordReset', () => {
  it('POSTs to the correct endpoint with just the email', async () => {
    mockPost.mockResolvedValueOnce({ data: {} });

    await AuthService.requestPasswordReset('a@b.com');

    expect(mockPost).toHaveBeenCalledWith('/api/v1/auth/password/reset', { email: 'a@b.com' });
  });

  it('throws when the request fails', async () => {
    mockPost.mockRejectedValueOnce(new Error('Not found'));

    await expect(AuthService.requestPasswordReset('a@b.com')).rejects.toThrow('Not found');
  });
});

describe('confirmPasswordReset', () => {
  it('POSTs to the correct endpoint with the token as a query param', async () => {
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

  it('unsubscribes correctly and stops receiving updates', async () => {
    const user = { id: '1', email: 'a@b.com', name: 'Ada' };
    mockPost.mockResolvedValueOnce({ data: { token: 'tok', user } });

    const listener = jest.fn();
    const unsub = AuthService.subscribe(listener);
    listener.mockClear();
    unsub();

    await AuthService.login({ email: 'a@b.com', password: 'pw' });

    expect(listener).not.toHaveBeenCalled();
  });
});

it('returns null for malformed token', () => {
  const result = parseUserIdFromToken('notajwt');
  expect(result).toBeNull();
});

describe('init', () => {
  it('resets auth state when no token in storage', async () => {
    (tokenStorage.get as jest.Mock).mockReturnValueOnce(null);

    await AuthService.init();

    expect(mockGet).not.toHaveBeenCalled();
    expect(AuthService.getState()).toEqual({ user: null, isAuthenticated: false });
  });

  it('calls logout when token cannot be parsed (invalid jwt structure)', async () => {
    (tokenStorage.get as jest.Mock).mockReturnValueOnce('not.a.valid.jwt');

    await AuthService.init();

    expect(tokenStorage.clear).toHaveBeenCalled();
    expect(AuthService.getState()).toEqual({ user: null, isAuthenticated: false });
  });

  it('calls logout when token is valid JWT but has no user_id field', async () => {
    const fakeToken = 'eyJhbGciOiJIUzI1NiJ9.' + btoa(JSON.stringify({ sub: 'someone' })) + '.sig';

    (tokenStorage.get as jest.Mock).mockReturnValueOnce(fakeToken);

    await AuthService.init();

    expect(tokenStorage.clear).toHaveBeenCalled();
    expect(AuthService.getState()).toEqual({ user: null, isAuthenticated: false });
  });

  it('sets auth state when token and user fetch succeed', async () => {
    const fakeToken = 'eyJhbGciOiJIUzI1NiJ9.' + btoa(JSON.stringify({ user_id: 1 })) + '.sig';
    const user = { id: '1', email: 'a@b.com', name: 'Ada' };

    (tokenStorage.get as jest.Mock).mockReturnValueOnce(fakeToken);
    mockGet.mockResolvedValueOnce({ data: user });

    await AuthService.init();

    expect(mockGet).toHaveBeenCalledWith('/api/v1/users/1');
    expect(AuthService.getState()).toEqual({ user, isAuthenticated: true });
  });

  it('calls logout when API returns 401', async () => {
    const fakeToken = 'eyJhbGciOiJIUzI1NiJ9.' + btoa(JSON.stringify({ user_id: 1 })) + '.sig';

    (tokenStorage.get as jest.Mock).mockReturnValueOnce(fakeToken);
    mockGet.mockRejectedValueOnce({ response: { status: 401 } });

    await AuthService.init();

    expect(tokenStorage.clear).toHaveBeenCalled();
    expect(AuthService.getState()).toEqual({ user: null, isAuthenticated: false });
  });

  it('calls logout when API returns 403', async () => {
    const fakeToken = 'eyJhbGciOiJIUzI1NiJ9.' + btoa(JSON.stringify({ user_id: 1 })) + '.sig';

    (tokenStorage.get as jest.Mock).mockReturnValueOnce(fakeToken);
    mockGet.mockRejectedValueOnce({ response: { status: 403 } });

    await AuthService.init();

    expect(tokenStorage.clear).toHaveBeenCalled();
    expect(AuthService.getState()).toEqual({ user: null, isAuthenticated: false });
  });

  it('keeps session and warns when API fails with non-auth error', async () => {
    const fakeToken = 'eyJhbGciOiJIUzI1NiJ9.' + btoa(JSON.stringify({ user_id: 1 })) + '.sig';
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    (tokenStorage.get as jest.Mock).mockReturnValueOnce(fakeToken);
    mockGet.mockRejectedValueOnce({ response: { status: 500 } });

    await AuthService.init();

    expect(tokenStorage.clear).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith('Auth init failed, keeping session:', expect.anything());

    warnSpy.mockRestore();
  });
});

describe('parseIsSuperAdminFromToken', () => {
  it('returns false when token has no is_superadmin field', () => {
    const fakeToken = 'eyJhbGciOiJIUzI1NiJ9.' + btoa(JSON.stringify({ user_id: 1 })) + '.sig';
    (tokenStorage.get as jest.Mock).mockReturnValue(fakeToken);
    expect(AuthService.isSuperAdmin()).toBe(false);
  });

  it('returns true when token has is_superadmin: true', () => {
    const fakeToken = 'eyJhbGciOiJIUzI1NiJ9.' + btoa(JSON.stringify({ is_superadmin: true })) + '.sig';
    (tokenStorage.get as jest.Mock).mockReturnValue(fakeToken);
    expect(AuthService.isSuperAdmin()).toBe(true);
  });

  it('returns false when no token in storage', () => {
    (tokenStorage.get as jest.Mock).mockReturnValue(null);
    expect(AuthService.isSuperAdmin()).toBe(false);
  });

  it('returns false when token is malformed', () => {
    (tokenStorage.get as jest.Mock).mockReturnValue('notajwt');
    expect(AuthService.isSuperAdmin()).toBe(false);
  });
});

describe('confirmEmail', () => {
  it('POSTs to the correct endpoint with the token', async () => {
    mockPost.mockResolvedValueOnce({ data: {} });
    await AuthService.confirmEmail('confirm-token-abc');
    expect(mockPost).toHaveBeenCalledWith('/api/v1/auth/confirm_email', { token: 'confirm-token-abc' });
  });

  it('throws when confirmation fails', async () => {
    mockPost.mockRejectedValueOnce(new Error('Invalid token'));
    await expect(AuthService.confirmEmail('bad-token')).rejects.toThrow('Invalid token');
  });
});

describe('resendEmailVerification', () => {
  it('POSTs to the correct endpoint with the email', async () => {
    mockPost.mockResolvedValueOnce({ data: {} });
    await AuthService.resendEmailVerification('a@b.com');
    expect(mockPost).toHaveBeenCalledWith('/api/v1/auth/resend_confirmation', { email: 'a@b.com' });
  });

  it('throws when the request fails', async () => {
    mockPost.mockRejectedValueOnce(new Error('Too many requests'));
    await expect(AuthService.resendEmailVerification('a@b.com')).rejects.toThrow('Too many requests');
  });
});

describe('changePassword', () => {
  it('PATCHes the correct endpoint with both passwords', async () => {
    const mockPatch = apiClient.patch as jest.Mock;
    mockPatch.mockResolvedValueOnce({ data: {} });

    await AuthService.changePassword('oldPass1!', 'newPass2!');

    expect(mockPatch).toHaveBeenCalledWith('/api/v1/auth/password/change', {
      current_password: 'oldPass1!',
      new_password: 'newPass2!',
    });
  });

  it('throws when the current password is wrong', async () => {
    const mockPatch = apiClient.patch as jest.Mock;
    mockPatch.mockRejectedValueOnce(new Error('Incorrect password'));

    await expect(AuthService.changePassword('wrongPass', 'newPass2!')).rejects.toThrow('Incorrect password');
  });
});

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AuthService.logout();
  });

  it('returns initial state from AuthService', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current).toEqual(AuthService.getState());
  });

  it('updates state when AuthService notifies subscribers', async () => {
    const user = { id: '1', email: 'a@b.com', name: 'Ada' };
    mockPost.mockResolvedValueOnce({ data: { token: 'tok', user } });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await AuthService.login({ email: 'a@b.com', password: 'pw' });
    });

    expect(result.current).toEqual({ user, isAuthenticated: true });
  });

  it('unsubscribes on unmount', async () => {
    const { unmount } = renderHook(() => useAuth());
    unmount();

    const user = { id: '1', email: 'a@b.com', name: 'Ada' };
    mockPost.mockResolvedValueOnce({ data: { token: 'tok', user } });

    await act(async () => {
      await AuthService.login({ email: 'a@b.com', password: 'pw' });
    });
  });
});

