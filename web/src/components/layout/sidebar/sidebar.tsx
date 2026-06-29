import React from 'react';
import { SidebarNav } from '@/components/layout/sidebar/sidebar-nav';
import { SidebarActions } from '@/components/layout/sidebar/sidebar-action';
import { useAuth } from '@/hooks/use-auth';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/store';
import { useReduxState } from '@/hooks/use-redux-state';

import { toggleSidebar } from '@/sidebar-slice';

interface SidebarProps {
  currentPath?: string;
  onNavigate?: (href: string) => void;
  onBack?: () => void;
  onToggleMenu?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate = () => {}, onToggleMenu }) => {
  const [currentPath, setActivePage] = useReduxState<string>('dashboard');
  const { user } = useAuth();
  const dispatch = useDispatch();

  const isOpen = useSelector((state: RootState) => state.sidebar.isOpen);

  const isCollapsed = !isOpen;

  const isSuperAdmin = user?.is_superadmin || false;
  const isAuthorized = isSuperAdmin;

  const handleToggleMenu = () => {
    dispatch(toggleSidebar());

    if (onToggleMenu) {
      onToggleMenu();
    }
  };

  if (!isAuthorized) {
    return null;
  }

  return (
    <aside
      style={{
        width: isCollapsed ? '80px' : '280px',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#FFFFFF',
      }}
    >
      <SidebarActions
        onBack={() => console.log('Go back to Eventify!')}
        onToggleMenu={handleToggleMenu}
        isCollapsed={isCollapsed}
      />
      <SidebarNav
        currentPath={currentPath}
        onNavigate={onNavigate}
        isCollapsed={isCollapsed}
        onSelect={setActivePage}
        isSuperAdmin={isSuperAdmin}
      />
    </aside>
  );
};
