// frontend/src/components/common/ProtectedRoute.tsx
import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store/store";
import { checkAuth } from "../../store/slices/authSlice";
import { fetchDashboardData } from "../../store/slices/dashboardSlice";
import { Box, CircularProgress } from "@mui/material";

interface ProtectedRouteProps {
  children: React.ReactElement;
  requiredRole?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    isAuthenticated,
    loading,
    user,
    authChecking,
    isInFreeTrial,
    freeTrialExpired,
    status,
  } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated && !authChecking) {
        await dispatch(checkAuth());
        await dispatch(fetchDashboardData());
      }
    };

    fetchData();
  }, [dispatch, isAuthenticated, authChecking]);

  if (authChecking || loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Admin users can access everything regardless of subscription status
  const isAdmin = user?.role === "ADMIN";

  // Allow access if:
  // 1. User is admin (bypass all checks)
  // 2. Has active subscription (status = 'active')
  // 3. Has Stripe trial subscription (status = 'trialing') - backend validates currentPeriodEnd
  // 4. In free trial period (status = 'free_trial' OR isInFreeTrial && !freeTrialExpired)
  const hasValidAccess =
    isAdmin ||
    status === "active" ||
    status === "trialing" ||
    status === "free_trial" ||
    (isInFreeTrial && !freeTrialExpired);

  if (!hasValidAccess) {
    return <Navigate to="/subscription" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
