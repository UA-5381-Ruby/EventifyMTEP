import { useEffect, useState, useRef } from 'react';
import { Container } from './container';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '@/services/auth-service';
import { brandsService } from '@/services/brands-service'; // Імпортуємо сервіс
import { Search, User, LayoutDashboard, Settings, LogOut } from 'lucide-react';
import { tokenStorage } from '@/lib/api-client.ts';

export function Header() {
  const [state, setState] = useState(AuthService.getState());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = AuthService.subscribe(setState);

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      unsubscribe();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    setIsMenuOpen(false);
    navigate('/login', { replace: true });
  };

  const handleAdminAction = async () => {
    setIsMenuOpen(false);
    try {
      const brands = await brandsService.getUserBrands();
      if (brands && brands.length > 0) {
        navigate('/dashboard');
      } else {
        navigate('/create-brand');
      }
    } catch {
      navigate('/create-brand');
    }
  };

  const handleProfileClick = () => {
    setIsMenuOpen(false);
    const token = tokenStorage.get();
    if (token) {
      navigate('/profile/settings');
    } else {
      navigate('/register');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white">
      <div className="border-b border-neutral-200">
        <Container>
          <div className="flex h-16 items-center justify-between">
            {/* Left */}
            <div className="flex items-center gap-10">
              <Link to="/" className="text-xl font-bold text-black">
                LOGO
              </Link>

              <nav className="flex items-center gap-6">
                <Link to="/brands" className="text-sm text-neutral-700 hover:text-black">
                  Brands
                </Link>
                <Link to="/events" className="text-sm text-neutral-700 hover:text-black">
                  Events
                </Link>
                <Link to="/about" className="text-sm text-neutral-700 hover:text-black">
                  About
                </Link>
                <Link to="/contact" className="text-sm text-neutral-700 hover:text-black">
                  Contact
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center border border-neutral-300 px-3 py-1 rounded-sm">
                <input type="text" placeholder="Search" className="outline-none text-sm" />
              </div>
              <Search size={16} className="text-neutral-500" />
            </div>

            <div className="flex items-center gap-3 relative" ref={menuRef}>
              {state.isAuthenticated ? (
                <>
                  <span className="text-sm font-medium text-neutral-700">{state.user?.name}</span>
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="w-8 h-8 rounded-full bg-neutral-300 flex items-center justify-center cursor-pointer hover:bg-neutral-400 transition-colors"
                  >
                    <User size={16} />
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 top-10 w-48 bg-white border border-neutral-200 shadow-lg py-1 animate-in fade-in zoom-in-95 duration-100">
                      <button
                        onClick={handleAdminAction}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 cursor-pointer"
                      >
                        <LayoutDashboard size={14} />
                        Brand Dashboard
                      </button>
                      <button
                        onClick={handleProfileClick}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 cursor-pointer"
                      >
                        <Settings size={14} />
                        Profile Settings
                      </button>
                      <div className="border-t border-neutral-100 my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer font-medium"
                      >
                        <LogOut size={14} />
                        Log out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="inline-flex items-center px-4 py-2 rounded-md bg-primary-500 text-sm font-medium text-white hover:bg-primary-600 transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="text-sm font-medium text-neutral-700 hover:text-primary-600 transition-colors"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </Container>
      </div>

      <div className="bg-neutral-100">
        <Container>
          <div className="h-10 flex items-center">
            <span className="text-sm text-neutral-600">Superadmin Dashboard</span>
          </div>
        </Container>
      </div>
    </header>
  );
}
