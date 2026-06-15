import { Link } from 'react-router-dom';
import { useAuthSuperadmin } from '@/hooks/use-superadmin-auth';

const NAV_LINKS = [
  { to: '/my-tickets', label: 'My Tickets' },
  { to: '/my-brands', label: 'My Brands' },
  { to: '/brands', label: 'Brands' },
  { to: '/events', label: 'Events' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

const ADMIN_LINKS = [
  { to: '/superadmin', label: 'Super Admin' },
  { to: '/logs', label: 'Logs' },
];

export function HeaderNav() {
  const { isSuperAdmin } = useAuthSuperadmin();

  return (
    <div className="flex items-center gap-10">
      <Link to="/" className="text-xl font-bold text-black">
        LOGO
      </Link>

      <nav className="flex items-center gap-6">
        {NAV_LINKS.map(({ to, label }) => (
          <Link key={to} to={to} className="text-sm text-neutral-700 hover:text-black">
            {label}
          </Link>
        ))}

        {isSuperAdmin &&
          ADMIN_LINKS.map(({ to, label }) => (
            <Link key={to} to={to} className="text-sm text-neutral-700 hover:text-black">
              {label}
            </Link>
          ))}
      </nav>
    </div>
  );
}
