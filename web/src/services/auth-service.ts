import type { AxiosError } from 'axios';
import apiClient, { parseApiError, tokenStorage } from '@/lib/api-client';
import type {
  AuthResponse,
  AuthState,
  AuthUser,
  LoginRequest,
  RegisterRequest,
} from '@/types/auth';

let authState: AuthState = {
  user: null,
  isAuthenticated: false,
};

type AuthStateListener = (state: AuthState) => void;
const listeners = new Set<AuthStateListener>();

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (normalized.length % 4)) % 4);
  const base64 = normalized + padding;
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

  return new TextDecoder().decode(bytes);
}

function parseUserIdFromToken(token: string): number | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) {
      return null;
    }

    const payload = JSON.parse(decodeBase64Url(parts[1]));
    return payload.user_id ?? null;
  } catch {
    return null;
  }
}

async function init(): Promise<void> {
  const token = tokenStorage.get();
  if (!token) {
    setAuthState({ user: null, isAuthenticated: false });
    return;
  }

  const userId = parseUserIdFromToken(token);
  if (!userId) {
    logout();
    return;
  }

  try {
    const { data } = await apiClient.get<AuthUser>(`/api/v1/users/${userId}`);

    setAuthState({ user: data, isAuthenticated: true });
  } catch (err: unknown) {
    const error = err as AxiosError;

    const status = error.response?.status;

    if (status === 401 || status === 403) {
      logout();
      return;
    }

    console.warn('Auth init failed, keeping session:', err);
  }
}

function setAuthState(next: AuthState): void {
  authState = next;
  listeners.forEach((cb) => cb(authState));
}

function subscribe(listener: AuthStateListener): () => void {
  listeners.add(listener);
  listener(authState);
  return () => listeners.delete(listener);
}
/**
 * POST /api/v1/auth/register
 */
async function register(payload: RegisterRequest, remember = false): Promise<AuthResponse> {
  try {
    const { data } = await apiClient.post<AuthResponse>('/api/v1/auth/register', payload);

    tokenStorage.set(data.token, remember);
    setAuthState({ user: data.user, isAuthenticated: true });

    return data;
  } catch (err) {
    parseApiError(err);
  }
}

/**
 * POST /api/v1/auth/login
 */
async function login(payload: LoginRequest, remember = false): Promise<AuthResponse> {
  try {
    const { data } = await apiClient.post<AuthResponse>('/api/v1/auth/login', payload);

    tokenStorage.set(data.token, remember);
    setAuthState({ user: data.user, isAuthenticated: true });

    return data;
  } catch (err) {
    parseApiError(err);
  }
}

/**
 * Clears credentials from storage and resets the auth state.
 * Call this on explicit logout *and* on 401 responses (e.g. expired token).
 */
function logout(): void {
  tokenStorage.clear();
  setAuthState({ user: null, isAuthenticated: false });
}

/**
 * POST /api/v1/auth/password/reset
 */
async function requestPasswordReset(email: string): Promise<void> {
  try {
    await apiClient.post('/api/v1/auth/password/reset', { email });
  } catch (err) {
    parseApiError(err);
  }
}

/**
 * POST /api/v1/auth/password/reset?token=<token>
 */
async function confirmPasswordReset(token: string, newPassword: string): Promise<void> {
  try {
    await apiClient.post(
      '/api/v1/auth/password/reset',
      { new_password: newPassword },
      { params: { token } }
    );
  } catch (err) {
    parseApiError(err);
  }
}

const AuthService = {
  getState: (): AuthState => authState,
  subscribe,

  register,
  login,
  logout,

  requestPasswordReset,
  confirmPasswordReset,

  init,
} as const;

export default AuthService;
