import { useAuth } from '@/hooks/use-auth';
import { useBrandMembership } from '@/hooks/use-brand-membership';
import { useNavigate } from 'react-router-dom';

interface SidebarNavProps {
  currentPath?: string;
  onNavigate?: (href: string) => void;
  isCollapsed?: boolean;
  onSelect?: (label: string) => void;
  isSuperAdmin?: boolean;
  role?: string;
}

const SUPERADMIN_ITEMS = [
  { label: 'Dashboard', href: '/superadmin' },
  { label: 'Brands', href: '/brands' },
  { label: "User's activity log", href: '/activity-log' },
  { label: 'Events History', href: '/logs' },
];

const ADMIN_ITEMS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Events', href: '/events' },
  { label: 'Members', href: '/members' },
  { label: 'Settings', href: '/settings' },
  { label: 'Our policy', href: '/policy' },
];

export function SidebarNav({
  currentPath = '/dashboard',
  isCollapsed = false,
  onSelect = () => {},
  isSuperAdmin,
  role,
}: SidebarNavProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAnyBrandManager } = useBrandMembership();

  const effectiveIsSuperAdmin =
    isSuperAdmin !== undefined ? isSuperAdmin : user?.is_superadmin || false;
  const effectiveRole = role !== undefined ? role : isAnyBrandManager ? 'admin' : '';

  const isAuthorized = effectiveIsSuperAdmin || effectiveRole === 'admin';

  if (!isAuthorized) {
    return null;
  }

  const items = effectiveIsSuperAdmin ? SUPERADMIN_ITEMS : ADMIN_ITEMS;

  const handleItemClick = (href: string, label: string) => {
    navigate(href);

    onSelect(label);
  };

  return (
    <nav className="flex flex-col gap-2">
      {items.map((item) => (
        <button
          key={item.href}
          onClick={() => handleItemClick(item.href, item.label)}
          style={{
            padding: '8px 12px',
            textAlign: 'left',
            border: currentPath === item.href ? '1px solid #10B981' : '1px solid transparent',
            background: currentPath === item.href ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
            color: currentPath === item.href ? '#10B981' : '#6B7280',
            cursor: 'pointer',
            fontSize: '14px',
            borderRadius: '4px',
            transition: 'all 0.2s',
            display: isCollapsed ? 'none' : 'block',
          }}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
