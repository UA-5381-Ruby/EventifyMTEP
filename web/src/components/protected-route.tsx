import { useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import AuthService from '@/services/auth-service';
import { useReduxState } from '@/hooks/use-redux-state';

const ProtectedRoute = () => {
  const [state, setState] = useReduxState(AuthService.getState());
  const location = useLocation();

  useEffect(() => {
    return AuthService.subscribe(setState);
  }, [setState]);

  if (!state.isAuthenticated) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
