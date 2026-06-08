import { Navigate, Outlet } from 'react-router-dom';
import { useAuthSuperadmin } from '@/hooks/use-superadmin-auth';
import { Spinner } from '@/components/ui/spinner';
export const SuperAdminRoute = () => {
  const { isSuperAdmin, isLoading } = useAuthSuperadmin();

  if (isLoading) {
    return <Spinner />;
  }
  if (!isSuperAdmin) {
    return <Navigate to="/events" replace />;
  }

  return <Outlet />;
};
