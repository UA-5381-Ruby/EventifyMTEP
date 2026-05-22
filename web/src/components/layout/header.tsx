import { useState, useEffect } from 'react';
import { Container } from './container';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '@/services/auth-service';

export function Header() {
  const [state, setState] = useState(AuthService.getState());
  const navigate = useNavigate();

  useEffect(() => {
    return AuthService.subscribe(setState);
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-sm">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 font-heading text-xl font-bold text-primary-600"
          >
            <span className="text-2xl"></span>
            Eventify
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/events"
              className="text-sm font-medium text-neutral-600 hover:text-primary-600 transition-colors"
            >
              Events
            </Link>
            <Link
              to="/about"
              className="text-sm font-medium text-neutral-600 hover:text-primary-600 transition-colors"
            >
              About
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {state.isAuthenticated ? (
              <>
                <span className="text-sm font-medium text-neutral-700">{state.user?.name}</span>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-4 py-2 rounded-md bg-primary-500 text-sm font-medium text-white hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 transition-colors"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className="text-sm font-medium text-neutral-700 hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded transition-colors"
                >
                  Sign up
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 rounded-md bg-primary-500 text-sm font-medium text-white hover:bg-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded transition-colors"
                >
                  Log in
                </Link>
              </>
            )}
          </div>
        </div>
      </Container>
    </header>
  );
}
