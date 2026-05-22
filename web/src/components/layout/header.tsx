import { useState, useEffect } from 'react';
import { Container } from './container';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '@/services/auth-service';
import { Search, User } from 'lucide-react';

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

  const handleProfileClick = () => {
    const token = localStorage.getItem('token');

    if (token) {
      navigate('/profile/settings');
    } else {
      navigate('/register');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white">
      {/* Верхній поверх */}
      <div className="border-b border-neutral-200">
        <Container>
          <div className="flex h-16 items-center justify-between">
            {/* Left */}
            <div className="flex items-center gap-10">
              {/* Logo */}
              <Link
                to="/"
                className="text-xl font-bold text-black"
              >
                LOGO
              </Link>

              {/* Navigation */}
              <nav className="flex items-center gap-6">
                <Link
                  to="/brands"
                  className="text-sm text-neutral-700 hover:text-black"
                >
                  Brands
                </Link>

                <Link
                  to="/events"
                  className="text-sm text-neutral-700 hover:text-black"
                >
                  Events
                </Link>

                <Link
                  to="/about"
                  className="text-sm text-neutral-700 hover:text-black"
                >
                  About
                </Link>

                <Link
                  to="/contact"
                  className="text-sm text-neutral-700 hover:text-black"
                >
                  Contact
                </Link>
              </nav>
            </div>

            {/* Right */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="flex items-center border border-neutral-300 px-3 py-1 rounded-sm">
                <input
                  type="text"
                  placeholder="Search"
                  className="outline-none text-sm"
                />
                <Search size={16} className="text-neutral-500" />

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
                <button
                    onClick={handleProfileClick}
                    className="w-8 h-8 rounded-full bg-neutral-300 flex items-center justify-center"
                >
                  <User size={16} />
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
      </div>

      {/* Нижній поверх */}
      <div className="bg-neutral-100">
        <Container>
          <div className="h-10 flex items-center">
            <span className="text-sm text-neutral-600">
              Superadmin Dashboard
            </span>
          </div>
        </Container>
      </div>
    </header>
  );
}
