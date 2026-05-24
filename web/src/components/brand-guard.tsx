import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useUserBrand } from '@/hooks/use-user-brand';
import { Spinner } from '@/components/ui';

export const BrandGuard = () => {
  const { hasBrand, isLoading } = useUserBrand();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  const isCreatingBrand = location.pathname === '/create-brand';

  if (!hasBrand && !isCreatingBrand) {
    return <Navigate to="/create-brand" replace />;
  }

  if (hasBrand && isCreatingBrand) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
