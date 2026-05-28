import React from 'react';

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Events', href: '/events' },
  { label: 'Members', href: '/members' },
  { label: 'Brands', href: '/brands' },
  { label: 'Users', href: '/users' },
  { label: 'Settings', href: '/settings' },
  { label: 'Our policy', href: '/policy' },
];

interface SidebarNavProps {
  currentPath: string;
  onNavigate: (href: string) => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({ currentPath, onNavigate }) => {
  return (
    <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {navItems.map((item) => {
        const isActive = currentPath === item.href;
        return (
          <button
            key={item.label}
            onClick={() => onNavigate(item.href)}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: '16px 24px',
              fontSize: '24px',
              border: 'none',
              background: isActive ? '#DBDBDB' : 'transparent',
              color: '#000000',
              cursor: 'pointer',
              fontFamily: 'sans-serif',
            }}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
};
