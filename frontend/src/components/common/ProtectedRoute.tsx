// frontend/src/components/common/ProtectedRoute.tsx
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { checkAuth } from '../../store/slices/authSlice';
import { fetchDashboardData } from '../../store/slices/dashboardSlice';

interface ProtectedRouteProps {
  children: React.ReactElement;
  requiredRole?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user, authChecking } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Re-check auth if needed
    if (!isAuthenticated && !authChecking) {
      dispatch(checkAuth());
      dispatch(fetchDashboardData());
    }
  }, [dispatch, isAuthenticated, authChecking]);

  if (authChecking) {
    return null; // Or a loading spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};