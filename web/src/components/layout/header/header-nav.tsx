import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';

const NAV_LINKS = [
  { to: '/my-tickets', label: 'My Tickets' },
  { to: '/my-brands', label: 'My Brands' },
  { to: '/brands', label: 'Brands' },
  { to: '/events', label: 'Events' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export function HeaderNav() {
  return (
    <div className="flex items-center gap-10">
      <Link to="/">
        <img src={logo} alt="Logo" className="h-auto w-13" />
      </Link>

      <nav className="flex items-center gap-6">
        {NAV_LINKS.map(({ to, label }) => (
          <Link key={to} to={to} className="text-sm text-neutral-700 hover:text-black">
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
