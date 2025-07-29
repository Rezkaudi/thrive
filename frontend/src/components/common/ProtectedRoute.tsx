// frontend/src/components/common/ProtectedRoute.tsx
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { chackPayment, checkAuth } from '../../store/slices/authSlice';
import { fetchDashboardData } from '../../store/slices/dashboardSlice';


interface ProtectedRouteProps {
  children: React.ReactElement;
  requiredRole?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, loading, user, authChecking, hasTrailingSubscription } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Re-check auth if needed
    if (!isAuthenticated && !authChecking) {
      dispatch(checkAuth());
      dispatch(fetchDashboardData());
      // dispatch(chackPayment());
    }
  }, [dispatch, isAuthenticated, authChecking]);

  if (authChecking || loading) {
    return null; // Or a loading spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!hasTrailingSubscription) {
    return <Navigate to="/subscription" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};