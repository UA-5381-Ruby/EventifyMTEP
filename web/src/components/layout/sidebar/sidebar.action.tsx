import React from 'react';

interface SidebarActionsProps {
    onBack: () => void;
    onToggleMenu?: () => void;
}

export const SidebarActions: React.FC<SidebarActionsProps> = ({ onBack, onToggleMenu }) => {
    return (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <button
                onClick={onBack}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: '#000000',
                    fontFamily: 'sans-serif',
                    padding: 0,
                }}
            >
                <span>←</span> Back to Eventify
            </button>

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
                    margin: '8px 0',
                }}
            >
                <span style={{ height: '4px', background: '#CCCCCC', width: '100%' }}></span>
                <span style={{ height: '4px', background: '#CCCCCC', width: '100%' }}></span>
                <span style={{ height: '4px', background: '#CCCCCC', width: '100%' }}></span>
            </button>
        </div>
    );
};