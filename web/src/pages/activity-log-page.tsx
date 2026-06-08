import React, { useState } from 'react';

interface LogItem {
  id: string;
  actor: { name: string; avatar: string };
  brand: string;
  location: string;
  date: string;
  status: 'In Progress' | 'Complete' | 'Pending' | 'Approved' | 'Rejected';
}

interface PageWrapperProps {
  children: React.ReactNode;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children }) => {
  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        minHeight: '100vh',
        background: '#F5F5F5',
        fontFamily: 'sans-serif',
      }}
    >
      <aside
        style={{
          width: '240px',
          background: '#1A1A1A',
          color: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            padding: '24px',
            fontSize: '18px',
            fontWeight: 'bold',
            borderBottom: '1px solid #2D2D2D',
            letterSpacing: '0.5px',
          }}
        >
          ⚡️ Control Panel
        </div>
        <nav
          style={{
            flex: 1,
            padding: '24px 0',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          <div style={{ padding: '12px 24px', color: '#888888', cursor: 'pointer' }}>Dashboard</div>
          <div style={{ padding: '12px 24px', color: '#888888', cursor: 'pointer' }}>Events</div>
          <div style={{ padding: '12px 24px', color: '#888888', cursor: 'pointer' }}>Brands</div>
          {/* Активний пункт меню */}
          <div
            style={{
              padding: '12px 24px',
              background: '#2D2D2D',
              color: '#FFFFFF',
              fontWeight: '600',
              borderLeft: '4px solid #FFFFFF',
              cursor: 'pointer',
            }}
          >
            Activity Log
          </div>
          <div style={{ padding: '12px 24px', color: '#888888', cursor: 'pointer' }}>Settings</div>
        </nav>
        <div
          style={{
            padding: '24px',
            borderTop: '1px solid #2D2D2D',
            color: '#666666',
            fontSize: '12px',
          }}
        >
          v1.0.4 • 2026
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* ВЕРХНІЙ ХЕДЕР */}
        <header
          style={{
            height: '64px',
            background: '#FFFFFF',
            padding: '0 40px',
            boxSizing: 'border-box',
            borderBottom: '1px solid #EAEAEA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: '#1A1A1A' }}>
            System Activity
          </h1>

          {/* Профіль користувача у хедері */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#1A1A1A' }}>
                Alex Kovalenko
              </div>
              <div style={{ fontSize: '12px', color: '#888888' }}>Super Admin</div>
            </div>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#E0E0E0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                color: '#555',
              }}
            >
              AK
            </div>
          </div>
        </header>

        {/* КОНТЕНТ СТОРІНКИ */}
        <main
          style={{
            flex: 1,
            padding: '40px',
            boxSizing: 'border-box',
            width: '100%',
            overflowY: 'auto',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

const statusColors = {
  'In Progress': { text: '#6366F1', dot: '#6366F1', bg: '#EEF2F6' },
  Complete: { text: '#10B981', dot: '#10B981', bg: '#EEF2F6' },
  Pending: { text: '#06B6D4', dot: '#06B6D4', bg: '#EEF2F6' },
  Approved: { text: '#F59E0B', dot: '#F59E0B', bg: '#EEF2F6' },
  Rejected: { text: '#EF4444', dot: '#EF4444', bg: '#EEF2F6' },
};

const initialItems: LogItem[] = [
  {
    id: '#CM9801',
    actor: {
      name: 'Natali Craig',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
    },
    brand: 'Landing Page',
    location: 'Meadow Lane Oakland',
    date: 'Just now',
    status: 'In Progress',
  },
  {
    id: '#CM9802',
    actor: {
      name: 'Kate Morrison',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    },
    brand: 'CRM Admin pages',
    location: 'Larry San Francisco',
    date: 'A minute ago',
    status: 'Complete',
  },
  {
    id: '#CM9803',
    actor: {
      name: 'Drew Cano',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    },
    brand: 'Client Project',
    location: 'Bagwell Avenue Ocala',
    date: '1 hour ago',
    status: 'Pending',
  },
  {
    id: '#CM9804',
    actor: {
      name: 'Orlando Diggs',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
    },
    brand: 'Admin Dashboard',
    location: 'Washburn Baton Rouge',
    date: 'Yesterday',
    status: 'Approved',
  },
  {
    id: '#CM9805',
    actor: {
      name: 'Andi Lane',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    },
    brand: 'App Landing Page',
    location: 'Nest Lane Olivette',
    date: 'Feb 2, 2026',
    status: 'Rejected',
  },
];

export const ActionLogsPage: React.FC = () => {
  const [items, setItems] = useState<LogItem[]>(initialItems);
  const [activeRowId, setActiveRowId] = useState<string | null>(null);

  const handleStatusChange = (id: string, newStatus: LogItem['status']) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  const colStyles = {
    id: { width: '12%' },
    actor: { width: '22%', display: 'flex', alignItems: 'center', gap: '12px' },
    brand: { width: '18%' },
    location: { width: '20%' },
    date: { width: '13%' },
    status: { width: '15%' },
  };

  return (
    <PageWrapper>
      {/* ФІЛЬТРИ ТА ПОШУК */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '24px',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', gap: '12px' }}>
          <select
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #E0E0E0',
              background: '#FFF',
              fontSize: '14px',
              cursor: 'pointer',
            }}
            defaultValue=""
          >
            <option value="" disabled>
              Category
            </option>
          </select>
          <select
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #E0E0E0',
              background: '#FFF',
              fontSize: '14px',
              cursor: 'pointer',
            }}
            defaultValue=""
          >
            <option value="" disabled>
              Brands
            </option>
          </select>
          <select
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #E0E0E0',
              background: '#FFF',
              fontSize: '14px',
              cursor: 'pointer',
            }}
            defaultValue=""
          >
            <option value="" disabled>
              Status
            </option>
          </select>
          <div
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: '#1A1A1A',
              color: '#FFF',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            Past 7 days ▾
          </div>
        </div>
        <input
          type="text"
          placeholder="🔍 Search"
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid #E0E0E0',
            background: '#FFF',
            width: '240px',
            fontSize: '14px',
            outline: 'none',
          }}
        />
      </div>

      {/* ТАБЛИЦЯ ЛОГІВ */}
      <div
        style={{
          background: '#EAEAEA',
          borderRadius: '12px',
          overflow: 'hidden',
          paddingBottom: '8px',
        }}
      >
        <div
          style={{
            display: 'flex',
            width: '100%',
            padding: '16px 24px',
            color: '#666666',
            fontSize: '14px',
            fontWeight: '600',
            boxSizing: 'border-box',
            borderBottom: '1px solid #D5D5D5',
          }}
        >
          <div style={colStyles.id}>Action ID</div>
          <div style={colStyles.actor}>Actor (Role)</div>
          <div style={colStyles.brand}>Brand</div>
          <div style={colStyles.location}>Location</div>
          <div style={colStyles.date}>Date</div>
          <div style={colStyles.status}>Status</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {items.map((item) => {
            const isActive = activeRowId === item.id;
            const currentColors = statusColors[item.status];

            return (
              <div
                key={item.id}
                onClick={() => setActiveRowId(item.id)}
                style={{
                  display: 'flex',
                  width: '100%',
                  alignItems: 'center',
                  padding: '12px 24px',
                  background: isActive ? '#FFFFFF' : 'transparent',
                  color: '#000000',
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                  transition: 'background 0.15s ease',
                  borderLeft: isActive ? '4px solid #000000' : '4px solid transparent',
                }}
              >
                <div style={{ ...colStyles.id, fontWeight: '500' }}>{item.id}</div>
                <div style={colStyles.actor}>
                  <img
                    src={item.actor.avatar}
                    alt=""
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                    }}
                  />
                  <span style={{ fontWeight: '500' }}>{item.actor.name}</span>
                </div>
                <div style={{ ...colStyles.brand, color: '#333' }}>{item.brand}</div>
                <div style={{ ...colStyles.location, color: '#555' }}>{item.location}</div>
                <div style={{ ...colStyles.date, color: '#666' }}>{item.date}</div>

                <div style={colStyles.status} onClick={(e) => e.stopPropagation()}>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      position: 'relative',
                    }}
                  >
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: currentColors.dot,
                        position: 'absolute',
                        left: '12px',
                        zIndex: 2,
                      }}
                    />
                    <select
                      value={item.status}
                      onChange={(e) =>
                        handleStatusChange(item.id, e.target.value as LogItem['status'])
                      }
                      style={{
                        padding: '6px 12px 6px 26px',
                        borderRadius: '16px',
                        border: 'none',
                        background: 'transparent',
                        color: currentColors.text,
                        fontWeight: '600',
                        fontSize: '13px',
                        cursor: 'pointer',
                        outline: 'none',
                        appearance: 'none',
                        WebkitAppearance: 'none',
                      }}
                    >
                      <option value="In Progress">In Progress</option>
                      <option value="Complete">Complete</option>
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ПАГІНАЦІЯ */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          marginTop: '24px',
        }}
      >
        <button
          style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '16px' }}
        >
          ‹
        </button>
        <button
          style={{
            width: '32px',
            height: '32px',
            border: 'none',
            borderRadius: '50%',
            background: '#E0E0E0',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          1
        </button>
        <button
          style={{
            width: '32px',
            height: '32px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
          }}
        >
          2
        </button>
        <button
          style={{
            width: '32px',
            height: '32px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
          }}
        >
          3
        </button>
        <button
          style={{
            width: '32px',
            height: '32px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
          }}
        >
          4
        </button>
        <button
          style={{
            width: '32px',
            height: '32px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
          }}
        >
          5
        </button>
        <button
          style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '16px' }}
        >
          ›
        </button>
      </div>
    </PageWrapper>
  );
};
