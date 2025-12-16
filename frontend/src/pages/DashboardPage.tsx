import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

import { Container, Grid, Alert, IconButton } from "@mui/material";
import { Refresh } from "@mui/icons-material";

import { RootState, AppDispatch } from "../store/store";
import { fetchDashboardData } from "../store/slices/dashboardSlice";
import {
  WelcomeSection,
  StatsGrid,
  ProgressSection,
  QuickActions,
  AchievementsSection,
  UpcomingSessions,
} from "../components/dashboard";

const GRID_SIZES = {
  MAIN_CONTENT: { xs: 12, md: 8 },
  SIDEBAR: { xs: 12, md: 4 },
} as const;

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const {
    data: dashboardData,
    loading,
    error,
  } = useSelector((state: RootState) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchDashboardData());
  };

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert
          severity="error"
          action={
            <IconButton color="inherit" size="small" onClick={handleRefresh}>
              <Refresh />
            </IconButton>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
      {/* Welcome Section */}
      <WelcomeSection
        userName={dashboardData?.user?.name}
        userEmail={dashboardData?.user?.email}
        onRefresh={handleRefresh}
      />

      {/* Stats Grid */}
      <StatsGrid
        stats={{
          totalLessonsCompleted:
            dashboardData?.stats?.totalLessonsCompleted || 0,
          totalLessonsAvailable:
            dashboardData?.stats?.totalLessonsAvailable || 0,
          totalPoints: dashboardData?.stats?.totalPoints || 0,
          communityPostsCount: dashboardData?.stats?.communityPostsCount || 0,
          upcomingSessionsCount:
            dashboardData?.stats?.upcomingSessionsCount || 0,
        }}
        loading={loading}
        onNavigate={navigate}
      />

      {/* Main Content Grid */}
      <Grid container spacing={4}>
        <Grid size={GRID_SIZES.MAIN_CONTENT}>
          {/* Progress Section */}
          <ProgressSection
            courseProgress={dashboardData?.courseProgress || []}
            recentActivity={dashboardData?.recentActivity || []}
            userLevel={dashboardData?.user?.level || 1}
            loading={loading}
          />
        </Grid>

        <Grid size={GRID_SIZES.SIDEBAR}>
          {/* Quick Actions */}
          <QuickActions
            courseProgress={dashboardData?.courseProgress || []}
            upcomingSessions={dashboardData?.upcomingSessions || []}
            onNavigate={navigate}
          />

          {/* Achievements */}
          <AchievementsSection
            achievements={dashboardData?.achievements || []}
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Upcoming Sessions Preview */}
      <UpcomingSessions
        sessions={dashboardData?.upcomingSessions || []}
        onNavigate={navigate}
      />
    </Container>
  );
};
