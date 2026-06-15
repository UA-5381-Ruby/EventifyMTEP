import { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import AuthService from '@/services/auth-service';

const ProtectedRoute = () => {
  const [state, setState] = useState(AuthService.getState());
  const location = useLocation();

  useEffect(() => {
    return AuthService.subscribe(setState);
  }, []);

  if (!state.isAuthenticated) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
