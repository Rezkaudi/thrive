import React from "react";
import { useParams } from "react-router-dom";
import { Box, Container, Grid } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

// Logic & Helpers
import { usePublicProfile } from "../hooks/usePublicProfile";
import { getAdditionalStats, getMainStats } from "../utils/publicProfileHelper";

// Components
import {
  Header,
  CoverImageSection,
  ProfileHeader,
  StatsGrid,
  CourseProgressSection,
  RecentActivity,
  QuickStats,
  AchievementsSection,
  ActionsSection,
  ProfileLoading,
  ProfileError,
} from "../components/public-profile";

export const PublicProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // 1. Custom Hook handles all fetching logic
  const { profile, loading, error, recentActivities, activitiesLoading } =
    usePublicProfile(userId);

  // 2. Handle Edge Cases
  if (loading) return <ProfileLoading />;
  if (error || !profile)
    return <ProfileError error={error || "Profile not found"} />;

  // 3. Prepare Data
  const mainStats = getMainStats(profile);
  const additionalStats = getAdditionalStats(profile);

  const overallProgress =
    profile.totalLessonsAvailable > 0
      ? (profile.totalLessonsCompleted / profile.totalLessonsAvailable) * 100
      : 0;

  // 4. Render Clean JSX
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Header />
      <CoverImageSection />

      <Container
        maxWidth="lg"
        sx={{ mt: -8, mb: 4, position: "relative", zIndex: 1 }}
      >
        <ProfileHeader profile={profile} overallProgress={overallProgress} />

        {/* Stats Section */}
        <StatsGrid stats={mainStats} />
        <StatsGrid stats={additionalStats} startIndex={mainStats.length} />

        {/* Progress Section */}
        <Grid container spacing={4} mb={4}>
          <CourseProgressSection courseProgress={profile.courseProgress} />
        </Grid>

        {/* Activity & Quick Stats */}
        <Grid container spacing={4} mb={4}>
          <RecentActivity
            activitiesLoading={activitiesLoading}
            recentActivities={recentActivities}
          />
          <QuickStats overallProgress={overallProgress} profile={profile} />
        </Grid>

        <AchievementsSection profile={profile} />

        {!isAuthenticated && <ActionsSection name={profile.name} />}
      </Container>
    </Box>
  );
};
