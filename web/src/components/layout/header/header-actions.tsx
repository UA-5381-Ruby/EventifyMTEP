import { useRef, useEffect } from 'react';
import { User, LayoutDashboard, Settings, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';
import { useReduxState } from '@/hooks/use-redux-state';

interface HeaderActionsProps {
  isAuthenticated: boolean;
  userName?: string;
  onProfile: () => void;
  onLogout: () => void;
}

export function HeaderActions({
  isAuthenticated,
  userName,
  onProfile,
  onLogout,
}: HeaderActionsProps) {
  const [isMenuOpen, setIsMenuOpen] = useReduxState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const isInsideBrandDashboard = location.pathname.startsWith('/dashboard/overview');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDashboardChange = (path: string) => {
    setIsMenuOpen(false);
    navigate(path);
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-6">
        {isAuthenticated ? (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-3 text-sm font-medium text-neutral-700 cursor-pointer select-none"
            >
              {userName}
              <span className="w-8 h-8 rounded-full bg-neutral-300 flex items-center justify-center hover:bg-neutral-400 transition-colors">
                <User size={16} />
              </span>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-neutral-200 shadow-lg py-1 z-50 animate-in fade-in zoom-in-95 duration-100 rounded-md">
                <button
                  onClick={() => handleDashboardChange('/dashboard/overview')}
                  className={`w-full flex items-center gap-2 px-4 py-2 text-sm text-left cursor-pointer transition-colors ${
                    isInsideBrandDashboard
                      ? 'bg-neutral-100 text-black font-semibold'
                      : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  <LayoutDashboard size={14} className="text-neutral-500" />
                  Brand Dashboard
                </button>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onProfile();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 text-left cursor-pointer"
                >
                  <Settings size={14} className="text-neutral-500" />
                  Profile Settings
                </button>

                <div className="border-t border-neutral-100 my-1" />

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left cursor-pointer font-medium"
                >
                  <LogOut size={14} />
                  Log out
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Button variant="primary">
              <Link to="/login" className="text-sm font-medium text-neutral-0">
                Log in
              </Link>
            </Button>
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
  );
}
