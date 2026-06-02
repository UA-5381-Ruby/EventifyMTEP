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
  isCollapsed: boolean;
  onSelect: (id: string) => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({ currentPath, onNavigate, isCollapsed, onSelect }) => {
  return (
    <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {navItems.map((item) => {

        const isActive = currentPath === item.href;
        return (
          <button
            key={item.label}
            onClick={() => {
              onNavigate(item.href);
              onSelect(item.label);
            }}
            style={{
              width: '100%',
              display: isCollapsed ? 'none' : 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              padding: '16px 24px',
              fontSize: '14px',
              border: isActive ? '1px solid #10B981' : '1px solid transparent',
              background: isActive ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
              color: isActive ? '#10B981' : '#000000',
              cursor: 'pointer',
              fontFamily: 'sans-serif',
              minHeight: '60px',
              transition: 'all 0.2s ease',
            }}
          >
            <span style={{ whiteSpace: 'nowrap', fontWeight: isActive ? '600' : '400' }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};