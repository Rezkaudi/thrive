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
    hasSubscription,
    isInFreeTrial,
    freeTrialExpired,
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

  // Redirect to subscription page if:
  // 1. No active subscription AND free trial has expired
  // 2. No subscription AND no active trial AND trial not expired (edge case - never had trial)
  if (
    !hasSubscription &&
    (freeTrialExpired || (!isInFreeTrial && !freeTrialExpired))
  ) {
    return <Navigate to="/subscription" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
