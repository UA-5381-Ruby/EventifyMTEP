import React from 'react';

interface SidebarActionsProps {
  onBack: () => void;
  onToggleMenu?: () => void;
  isCollapsed: boolean;
}

export const SidebarActions: React.FC<SidebarActionsProps> = ({
  onBack,
  onToggleMenu,
  isCollapsed,
}) => {
  return (
    <div
      style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'row', // Выстраиваем элементы в одну линию
        justifyContent: isCollapsed ? 'center' : 'space-between', // Центруем гамбургер при згортанні, інакше розносимо по краях
        alignItems: 'center', // Выравниваем по вертикали
      }}
    >
      {/* Надпись показывается только если сайдбар НЕ свернут */}
      {!isCollapsed && (
        <button
          onClick={onBack}
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

      {/* Гамбургер-меню */}
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
