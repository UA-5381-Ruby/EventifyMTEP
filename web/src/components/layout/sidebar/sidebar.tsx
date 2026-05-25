import React from 'react';
import { SidebarNav } from '@/components/layout/sidebar/sidebar-nav';
import { SidebarActions } from '@/components/layout/sidebar/sidebar-action';

interface SidebarProps {
  currentPath: string;
  onNavigate: (href: string) => void;
  onBack: () => void;
  onToggleMenu?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  onNavigate,
  onBack,
  onToggleMenu,
}) => {
  return (
    <aside
      style={{
        width: '280px',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#FFFFFF',
      }}
    >
      <SidebarActions onBack={onBack} onToggleMenu={onToggleMenu} />
      <SidebarNav currentPath={currentPath} onNavigate={onNavigate} />
    </aside>
  );
};
