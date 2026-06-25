import { Navigate, Outlet, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useBrandMembership } from '@/hooks/use-brand-membership';

export const BrandManagerRoute = () => {
  const { user, isAuthenticated } = useAuth();
  const { id: brandId } = useParams<{ id: string }>();
  const { isLoading, isCurrentBrandManager } = useBrandMembership(brandId);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (isLoading) return null;

  const hasAccess = user?.is_superadmin || isCurrentBrandManager;

  if (!hasAccess) return <Navigate to="/" replace />;

  return <Outlet />;
};
