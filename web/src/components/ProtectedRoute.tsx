import { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import AuthService from '@/services/authService';

const ProtectedRoute = () => {
  const [state, setState] = useState(AuthService.getState());

  useEffect(() => {
    return AuthService.subscribe(setState);
  }, []);

  return state.isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
