import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Header } from '@/components/layout/header/header';
import AuthService from '@/services/auth-service';
import { tokenStorage } from '@/lib/api-client';

jest.mock('@/services/auth-service', () => ({
  __esModule: true,
  default: {
    getState: jest.fn(() => ({ isAuthenticated: false, user: null })),
    subscribe: jest.fn(() => jest.fn()),
    logout: jest.fn(),
  },
}));

jest.mock('@/lib/api-client', () => ({
  tokenStorage: { get: jest.fn() },
}));

jest.mock('@/components/layout/header/header-nav', () => ({
  HeaderNav: () => null,
}));

jest.mock('@/components/layout/header/header-actions', () => ({
  HeaderActions: ({ onProfile, onLogout }: { onProfile: () => void; onLogout: () => void }) => (
    <div>
      <button onClick={onProfile}>Profile</button>
      <button onClick={onLogout}>Logout</button>
    </div>
  ),
}));

jest.mock('@/components/layout/container', () => ({
  Container: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

function renderHeader() {
  return render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>
  );
}

describe('Header', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls logout and navigates to /login when logout is clicked', () => {
    renderHeader();
    fireEvent.click(screen.getByRole('button', { name: /logout/i }));

    expect(AuthService.logout).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
  });

  it('navigates to /profile/settings when token exists and profile is clicked', () => {
    jest.mocked(tokenStorage.get).mockReturnValue('some-token');

    renderHeader();
    fireEvent.click(screen.getByRole('button', { name: /profile/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/profile/settings');
  });

  it('navigates to /register when no token and profile is clicked', () => {
    jest.mocked(tokenStorage.get).mockReturnValue(null);

    renderHeader();
    fireEvent.click(screen.getByRole('button', { name: /profile/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });
});
