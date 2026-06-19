import React from 'react';
import { useNavigate } from 'react-router-dom';

interface SidebarActionsProps {
  onToggleMenu?: () => void;
  isCollapsed: boolean;
}

export const SidebarActions: React.FC<SidebarActionsProps> = ({ onToggleMenu, isCollapsed }) => {
  const navigate = useNavigate();
  return (
    <div
      style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: isCollapsed ? 'center' : 'space-between',
        alignItems: 'center',
      }}
    >
      {!isCollapsed && (
        <button
          onClick={() => navigate('/events')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'none',
            border: 'none',
            fontSize: '14px',
            cursor: 'pointer',
            color: '#000000',
            fontFamily: 'sans-serif',
            padding: 0,
            fontWeight: 500,
          }}
        >
          ← Back to Eventify
        </button>
      )}

      <button
        onClick={onToggleMenu}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          width: '36px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          padding: 0,
          alignItems: 'center',
        }}
      >
        <span style={{ height: '4px', background: '#CCCCCC', width: '100%' }}></span>
        <span style={{ height: '4px', background: '#CCCCCC', width: '100%' }}></span>
        <span style={{ height: '4px', background: '#CCCCCC', width: '100%' }}></span>
      </button>
    </div>
  );
};
