import React, { useState } from 'react';
import { SidebarNav } from '@/components/layout/sidebar/sidebar-nav';
import { SidebarActions } from '@/components/layout/sidebar/sidebar-action';

interface SidebarProps {
  currentPath?: string;
  onNavigate?: (href: string) => void;
  onBack?: () => void;
  onToggleMenu?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate = () => {}, onToggleMenu }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentPath, setActivePage] = useState<string>('dashboard');
  const handleToggleMenu = () => {
    setIsCollapsed((prev) => !prev);
    if (onToggleMenu) {
      onToggleMenu();
    }
  };

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
      />
    </aside>
  );
};
