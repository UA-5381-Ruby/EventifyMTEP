import React from 'react';
import { Sidebar } from './sidebar/sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw' }}>
      <Sidebar
        currentPath="/dashboard"
        onNavigate={(href: string) => console.log(href)}
        onBack={() => console.log('back')}
      />
      <main style={{ flexGrow: 1, padding: '40px', background: '#F9F9F9', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
};
