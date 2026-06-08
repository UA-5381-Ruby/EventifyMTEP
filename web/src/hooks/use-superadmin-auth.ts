import { useAuth } from '@/hooks/use-auth';

export const useAuthSuperadmin = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  const isSuperAdmin = isAuthenticated && user?.is_superadmin === true;

  return {
    isSuperAdmin,
    isLoading,
    user,
  };
};
