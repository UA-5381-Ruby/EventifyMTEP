import { renderHook } from '@testing-library/react';
import { useAuthSuperadmin } from '@/hooks/use-superadmin-auth';
import * as useAuthModule from '@/hooks/use-auth';
import type { AuthUser } from '@/types/auth';

jest.mock('@/hooks/use-auth');
const mockUseAuth = jest.mocked(useAuthModule.useAuth);
const baseUser: AuthUser = { id: 1, name: 'Admin', email: 'a@b.com', is_superadmin: true };

describe('useAuthSuperadmin', () => {
  it('returns isSuperAdmin=true when authenticated and is_superadmin=true', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { ...baseUser, is_superadmin: true },
    });
    const { result } = renderHook(() => useAuthSuperadmin());
    expect(result.current.isSuperAdmin).toBe(true);
  });

  it('returns isSuperAdmin=false when is_superadmin=false', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { ...baseUser, is_superadmin: false },
    });
    const { result } = renderHook(() => useAuthSuperadmin());
    expect(result.current.isSuperAdmin).toBe(false);
  });

  it('returns isSuperAdmin=false when not authenticated', () => {
    mockUseAuth.mockReturnValue({ isAuthenticated: false, isLoading: false, user: null });
    const { result } = renderHook(() => useAuthSuperadmin());
    expect(result.current.isSuperAdmin).toBe(false);
  });
});
