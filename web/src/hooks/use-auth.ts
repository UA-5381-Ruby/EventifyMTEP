import { useState, useEffect } from 'react';
import AuthService from '@/services/auth-service';
import type { AuthState } from '@/types/auth';

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>(AuthService.getState());

  useEffect(() => {
    return AuthService.subscribe(setState);
  }, []);

  return state;
}
