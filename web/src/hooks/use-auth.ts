import { useEffect } from 'react';
import AuthService from '@/services/auth-service';
import type { AuthState } from '@/types/auth';
import { useReduxState } from '@/hooks/use-redux-state';

export function useAuth(): AuthState {
  const [state, setState] = useReduxState<AuthState>(AuthService.getState());

  useEffect(() => {
    return AuthService.subscribe(setState);
  }, [setState]);

  return state;
}
