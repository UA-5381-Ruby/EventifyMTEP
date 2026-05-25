import { Search, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';

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
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center border border-neutral-300 px-3 py-1 rounded-md">
        <input type="text" placeholder="Search" className="outline-none text-sm" />
        <Search size={16} className="text-neutral-500" />
      </div>

      <div className="flex items-center gap-6">
        {isAuthenticated ? (
          <>
            <span
              onClick={onProfile}
              className="flex items-center gap-3 text-sm font-medium text-neutral-700 cursor-pointer"
            >
              {userName}
              <button
                onClick={onProfile}
                className="w-8 h-8 rounded-full bg-neutral-300 flex items-center justify-center cursor-pointer"
              >
                <User size={16} />
              </button>
            </span>
            <Button variant="primary" onClick={onLogout}>
              Log out
            </Button>
          </>
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
