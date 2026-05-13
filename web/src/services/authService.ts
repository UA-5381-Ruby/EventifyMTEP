import apiClient, { parseApiError, tokenStorage } from '@/lib/apiClient';
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

async function init(): Promise<void> {
  const token = tokenStorage.get();
  if (!token) return;

  try {
    const { data } = await apiClient.get<{ user: AuthUser }>('/auth/login');
    setAuthState({ user: data.user, isAuthenticated: true });
  } catch {
    logout();
  }
}

function setAuthState(next: AuthState): void {
  authState = next;
  listeners.forEach((cb) => cb(authState));
}

/**
 * Subscribe to auth state changes.
 * Returns an unsubscribe function — call it inside useEffect's cleanup.
 *
 * @example
 * useEffect(() => {
 *   return AuthService.subscribe(setState);
 * }, []);
 */
function subscribe(listener: AuthStateListener): () => void {
  listeners.add(listener);
  // Immediately emit current state so the subscriber is never stale on mount.
  listener(authState);
  return () => listeners.delete(listener);
}

/**
 * POST /api/v1/auth/register
 * Creates a new account and immediately signs the user in.
 */
async function register(payload: RegisterRequest): Promise<AuthResponse> {
  try {
    const { data } = await apiClient.post<AuthResponse>('/api/v1/auth/register', payload);

    tokenStorage.set(data.token);
    setAuthState({ user: data.user, isAuthenticated: true });

    return data;
  } catch (err) {
    parseApiError(err); // always throws — return type is `never`
  }
}

/**
 * POST /api/v1/auth/login
 * Authenticates an existing user and stores their JWT.
 */
async function login(payload: LoginRequest): Promise<AuthResponse> {
  try {
    const { data } = await apiClient.post<AuthResponse>('/api/v1/auth/login', payload);

    tokenStorage.set(data.token);
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
 * Triggers the password-reset email from your Rails mailer.
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
 * Completes the reset flow using the token from the user's email link.
 */
async function confirmPasswordReset(token: string, newPassword: string): Promise<void> {
  try {
    await apiClient.post(
      '/api/v1/auth/password/reset',
      { new_password: newPassword },
      { params: { token } } // Axios serialises this as ?token=<value>
    );
  } catch (err) {
    parseApiError(err);
  }
}

const AuthService = {
  // State
  getState: (): AuthState => authState,
  subscribe,

  // Auth
  register,
  login,
  logout,

  // Password recovery
  requestPasswordReset,
  confirmPasswordReset,

  init,
} as const;

export default AuthService;
