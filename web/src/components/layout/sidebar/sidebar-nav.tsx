import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useBrandMembership } from '@/hooks/use-brand-membership';

interface SidebarNavProps {
  currentPath?: string;
  onNavigate?: (href: string) => void;
  isCollapsed?: boolean;
  onSelect?: (label: string) => void;
  isSuperAdmin?: boolean;
  role?: string;
}

const SUPERADMIN_ITEMS = [
  { label: 'SuperAdmin Dash', href: '/dashboard' },
  { label: 'Brands', href: '/brands' },
  { label: 'Users', href: '/users' },
  { label: 'Login Page', href: '/login' },
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
  onNavigate = () => { },
  isCollapsed = false,
  onSelect = () => { },
  isSuperAdmin,
  role,
}: SidebarNavProps) {
  const { user } = useAuth();
  const { isAnyBrandManager } = useBrandMembership();

  const effectiveIsSuperAdmin = isSuperAdmin !== undefined ? isSuperAdmin : user?.is_superadmin || false;
  const effectiveRole = role !== undefined ? role : (isAnyBrandManager ? 'admin' : '');

  const isAuthorized = effectiveIsSuperAdmin || effectiveRole === 'admin';

  if (!isAuthorized) {
    return null;
  }

  const items = effectiveIsSuperAdmin ? SUPERADMIN_ITEMS : ADMIN_ITEMS;

  const handleItemClick = (href: string, label: string) => {
    onNavigate(href);
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