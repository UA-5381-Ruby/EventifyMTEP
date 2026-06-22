import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useBrandContext } from '@/contexts/brand-context';
import { ChevronLeft, User } from 'lucide-react';
import { Spinner } from '@/components/ui';

export const AdminLayout = () => {
  const { brand, isLoading } = useBrandContext();
  const location = useLocation();
  const navigate = useNavigate();

  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );

  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Events', path: '/dashboard/events' },
    { name: 'Members', path: '/dashboard/members' },
    { name: 'Settings', path: '/dashboard/settings' },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="h-16 border-b border-neutral-200 flex items-center px-6 justify-between bg-white sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link to="/" className="font-bold text-lg">
            LOGO
          </Link>
          <div className="h-4 w-[1px] bg-neutral-300 mx-2" />
          <span className="text-sm text-neutral-500 uppercase tracking-widest font-medium">
            Brand Dashboard
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center">
            <User size={16} />
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="w-64 border-r border-neutral-200 p-4 flex flex-col gap-8 bg-white">
          <button
            onClick={() => navigate('/events')}
            className="flex items-center gap-2 text-sm text-neutral-600 hover:text-black transition-colors"
          >
            <ChevronLeft size={16} /> Back to Eventify
          </button>

          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-neutral-100 text-black'
                      : 'text-neutral-500 hover:text-black hover:bg-neutral-50'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 bg-white">
          <div className="p-8 max-w-6xl">
            <div className="text-[12px] text-neutral-400 mb-6 uppercase tracking-wider">
              Brands / {brand?.name} /{' '}
              <span className="text-black">{location.pathname.split('/').pop()}</span>
            </div>
            <Outlet context={{ brand }} />
          </div>
        </main>
      </div>
    </div>
  );
};
