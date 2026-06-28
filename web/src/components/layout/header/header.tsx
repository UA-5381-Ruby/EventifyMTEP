import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '@/services/auth-service';
import { tokenStorage } from '@/lib/api-client';
import { Container } from '../container';
import { HeaderNav } from './header-nav';
import { HeaderActions } from './header-actions';
import { useReduxState } from '@/hooks/use-redux-state';

export function Header() {
  const [state, setState] = useReduxState(AuthService.getState());
  const navigate = useNavigate();

  useEffect(() => AuthService.subscribe(setState), []);

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login', { replace: true });
  };

  const handleProfileClick = () => {
    navigate(tokenStorage.get() ? '/profile/settings' : '/register');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <HeaderNav />
          <HeaderActions
            isAuthenticated={state.isAuthenticated}
            userName={state.user?.name}
            onProfile={handleProfileClick}
            onLogout={handleLogout}
          />
        </div>
      </Container>
    </header>
  );
}
