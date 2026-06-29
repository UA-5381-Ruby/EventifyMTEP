import React, { useState } from 'react';
import { SidebarNav } from '@/components/layout/sidebar/sidebar-nav';
import { SidebarActions } from '@/components/layout/sidebar/sidebar-action';
import { useAuth } from '@/hooks/use-auth';
import { useBrandMembership } from '@/hooks/use-brand-membership';

interface SidebarProps {
  currentPath?: string;
  onNavigate?: (href: string) => void;
  onBack?: () => void;
  onToggleMenu?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate = () => {}, onToggleMenu }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentPath, setActivePage] = useState<string>('dashboard');
  const { user } = useAuth();
  const { isAnyBrandManager } = useBrandMembership();

  const isSuperAdmin = user?.is_superadmin || false;
  const brandRole = isAnyBrandManager ? 'admin' : undefined;

  const isAuthorized = isSuperAdmin || brandRole === 'admin';

  const handleToggleMenu = () => {
    setIsCollapsed((prev) => !prev);
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
        display: 'flex',
        flexDirection: 'column',
        background: '#FFFFFF',
      }}
    >
      <SidebarActions onToggleMenu={handleToggleMenu} isCollapsed={isCollapsed} />
      <SidebarNav
        currentPath={currentPath}
        onNavigate={onNavigate}
        isCollapsed={isCollapsed}
        onSelect={setActivePage}
        isSuperAdmin={isSuperAdmin}
        role={brandRole}
      />
    </aside>
  );
};
