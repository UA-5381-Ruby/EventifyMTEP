import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HeaderNav } from '@/components/layout/header/header-nav';
import { useAuthSuperadmin } from '@/hooks/use-superadmin-auth';

jest.mock('@/hooks/use-superadmin-auth');

const mockedUseAuthSuperadmin = jest.mocked(useAuthSuperadmin);

describe('HeaderNav', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders standard navigation links', () => {
    mockedUseAuthSuperadmin.mockReturnValue({
      isSuperAdmin: false,
      isLoading: false,
      user: null,
    });

    render(
      <MemoryRouter>
        <HeaderNav />
      </MemoryRouter>
    );

    expect(screen.getByText('My Brands')).toBeInTheDocument();
    expect(screen.getByText('Brands')).toBeInTheDocument();
    expect(screen.getByText('Events')).toBeInTheDocument();
  });

  it('does not render admin links for regular users', () => {
    mockedUseAuthSuperadmin.mockReturnValue({
      isSuperAdmin: false,
      isLoading: false,
      user: null,
    });

    render(
      <MemoryRouter>
        <HeaderNav />
      </MemoryRouter>
    );

    expect(screen.queryByText('Super Admin')).not.toBeInTheDocument();
    expect(screen.queryByText('Logs')).not.toBeInTheDocument();
  });

  it('renders admin links for super admin', () => {
    mockedUseAuthSuperadmin.mockReturnValue({
      isSuperAdmin: true,
      isLoading: false,
      user: null,
    });

    render(
      <MemoryRouter>
        <HeaderNav />
      </MemoryRouter>
    );

    expect(screen.getByText('Super Admin')).toBeInTheDocument();
    expect(screen.getByText('Logs')).toBeInTheDocument();
  });
});
