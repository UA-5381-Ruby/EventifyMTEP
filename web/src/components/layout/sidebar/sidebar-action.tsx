import React from 'react';
import { useNavigate } from 'react-router-dom';

interface SidebarActionsProps {
  onToggleMenu?: () => void;
  isCollapsed: boolean;
  onBack?: () => void;
}

export const SidebarActions: React.FC<SidebarActionsProps> = ({
  onToggleMenu,
  isCollapsed,
  onBack,
}) => {
  const navigate = useNavigate();

  const handleToggle = () => {
    onToggleMenu?.();
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    navigate('/events');
  };

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
          onClick={handleBack}
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

      {/* Кнопка-гамбургер, яка тепер тригерить Redux екшен */}
      <button
        onClick={handleToggle}
        aria-label={isCollapsed ? 'Open sidebar' : 'Close sidebar'}
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
