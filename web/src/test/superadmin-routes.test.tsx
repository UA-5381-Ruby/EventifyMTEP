import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { SuperAdminRoute } from '@/components/super-admin-route';
import { useAuthSuperadmin } from '@/hooks/use-superadmin-auth';

jest.mock('@/hooks/use-superadmin-auth');

const mockedUseAuthSuperadmin = jest.mocked(useAuthSuperadmin);

describe('SuperAdminRoute', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders protected content for super admin', () => {
    mockedUseAuthSuperadmin.mockReturnValue({
      isSuperAdmin: true,
      isLoading: false,
      user: null,
    });

    render(
      <MemoryRouter initialEntries={['/superadmin']}>
        <Routes>
          <Route element={<SuperAdminRoute />}>
            <Route path="/superadmin" element={<div>Admin Panel</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Admin Panel')).toBeInTheDocument();
  });

  it('redirects regular user', () => {
    mockedUseAuthSuperadmin.mockReturnValue({
      isSuperAdmin: false,
      isLoading: false,
      user: null,
    });

    render(
      <MemoryRouter initialEntries={['/superadmin']}>
        <Routes>
          <Route path="/events" element={<div>Events Page</div>} />
          <Route element={<SuperAdminRoute />}>
            <Route path="/superadmin" element={<div>Admin Panel</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Events Page')).toBeInTheDocument();
  });
});
