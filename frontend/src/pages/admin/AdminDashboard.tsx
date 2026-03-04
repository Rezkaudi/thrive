import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Stack,
  Paper,
  IconButton,
  Tooltip,
  Skeleton,
} from "@mui/material";
import {
  People,
  School,
  Forum,
  CalendarMonth,
  AttachMoney,
  Warning,
  Refresh,
  ArrowUpward,
  ArrowDownward,
  VideoLibrary,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { activityService } from "../../services/activityService";
import { ActivityFeed } from "../../components/activity/ActivityFeed";

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  monthlyRevenue: number;
  completionRate: number;
  userGrowth: number;
  revenueGrowth: number;
  pendingReviews: number;
}

const OVERVIEW_CACHE_TTL_MS = 2 * 60 * 1000;
let overviewCache: DashboardStats | null = null;
let overviewCacheTimestamp = 0;
let overviewInFlightRequest: Promise<DashboardStats> | null = null;

const isOverviewCacheFresh = () => {
  if (!overviewCache || !overviewCacheTimestamp) return false;
  return Date.now() - overviewCacheTimestamp < OVERVIEW_CACHE_TTL_MS;
};

const getOverviewWithCache = async (forceRefresh = false): Promise<DashboardStats> => {
  if (!forceRefresh && isOverviewCacheFresh() && overviewCache) {
    return overviewCache;
  }

  if (overviewInFlightRequest) {
    return overviewInFlightRequest;
  }

  overviewInFlightRequest = api
    .get("/admin/analytics/overview")
    .then((response) => {
      overviewCache = response.data;
      overviewCacheTimestamp = Date.now();
      return response.data;
    })
    .finally(() => {
      overviewInFlightRequest = null;
    });

  return overviewInFlightRequest;
};

const StatCard = ({
  icon,
  title,
  value,
  subtitle,
  trend,
  color,
  onClick,
  loading,
}: any) => (
  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
    <Card
      sx={{
        cursor: onClick ? "pointer" : "default",
        height: "100%",
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        border: `1px solid ${color}20`,
        minHeight: "100%",
      }}
      onClick={onClick}
    >
      <CardContent>
        <Stack spacing={2}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="start"
          >
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                background: `${color}20`,
                color: color,
              }}
            >
              {icon}
            </Box>
            {trend !== undefined && (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                {trend > 0 ? (
                  <ArrowUpward sx={{ fontSize: 16, color: "success.main" }} />
                ) : (
                  <ArrowDownward sx={{ fontSize: 16, color: "error.main" }} />
                )}
                <Typography
                  variant="caption"
                  color={trend > 0 ? "success.main" : "error.main"}
                  fontWeight={600}
                >
                  {Math.abs(trend)}%
                </Typography>
              </Stack>
            )}
          </Stack>
          <Box>
            <Typography variant="h4" fontWeight={700} color={color}>
              {loading ? <Skeleton variant="text" width="60%" /> : value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {loading ? <Skeleton variant="text" width="40%" /> : title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  </motion.div>
);

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    monthlyRevenue: 0,
    completionRate: 0,
    userGrowth: 0,
    revenueGrowth: 0,
    pendingReviews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [globalActivities, setGlobalActivities] = useState<any[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  const fetchGlobalActivities = useCallback(async () => {
    setActivitiesLoading(true);
    try {
      const response = await activityService.getGlobalActivities(10);
      setGlobalActivities(response.activities);
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    } finally {
      setActivitiesLoading(false);
    }
  }, []);

  const fetchDashboardStats = useCallback(async (forceRefresh = false) => {
    try {
      if (!forceRefresh && overviewCache) {
        setStats(overviewCache);
      }

      const shouldShowLoading = forceRefresh || !overviewCache;
      if (shouldShowLoading) {
        setLoading(true);
      }

      const data = await getOverviewWithCache(forceRefresh);
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardStats(false);
  }, [fetchDashboardStats]);

  useEffect(() => {
    fetchGlobalActivities();
  }, [fetchGlobalActivities]);

  const quickActions = [
    {
      title: "User Management",
      description: "View and manage all users",
      icon: <People />,
      path: "/admin/users",
      color: "#5C633A",
    },
    {
      title: "Course Management",
      description: "Create and edit courses",
      icon: <School />,
      path: "/admin/courses",
      color: "#A6531C",
    },
    {
      title: "Tour Video Management",
      description: "Add and edit tour video",
      icon: <VideoLibrary />,
      path: "/admin/videos",
      color: "#8B5A2B",
    },
    {
      title: "Community Moderation",
      description: "Review flagged content",
      icon: <Forum />,
      path: "/admin/community",
      color: "#D4BC8C",
    },
    {
      title: "Session Management",
      description: "Manage speaking sessions",
      icon: <CalendarMonth />,
      path: "/admin/sessions",
      color: "#483C32",
    },
  ];

  // if (loading) {
  //   return (
  //     <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
  //       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
  //         <Stack spacing={2} alignItems="center">
  //           <CircularProgress />
  //         </Stack>
  //       </Box>
  //     </Container>
  //   );
  // }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Box>
          <Typography variant="h3" fontWeight={700}>
            Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back! Here's your platform overview.
          </Typography>
        </Box>
        <Tooltip title="Refresh data">
          <IconButton onClick={() => fetchDashboardStats(true)} color="primary">
            <Refresh />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Stats Grid */}
      <Grid container spacing={3} mb={4}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            icon={<People />}
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            subtitle={`${stats.activeUsers} active`}
            trend={stats.userGrowth}
            color="#5C633A"
            onClick={() => navigate("/admin/users")}
            loading={loading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            icon={<AttachMoney />}
            title="Monthly Revenue"
            value={`$${stats.monthlyRevenue.toLocaleString()}`}
            trend={stats.revenueGrowth}
            color="#A6531C"
            onClick={() => navigate("/admin/analytics")}
            loading={loading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            icon={<School />}
            title="Completion Rate"
            value={`${stats.completionRate}%`}
            subtitle="Average across all courses"
            color="#D4BC8C"
            onClick={() => navigate("/admin/courses")}
            loading={loading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            icon={<Warning />}
            title="Pending Reviews"
            value={`${stats.pendingReviews}`}
            subtitle="Flagged content"
            color="#FFA502"
            onClick={() => navigate("/admin/community")}
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h5" fontWeight={600} mb={3}>
        Quick Actions
      </Typography>
      <Grid container spacing={3} mb={4}>
        {quickActions.map((action, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Paper
                sx={{
                  p: 3,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4,
                  },
                }}
                onClick={() => navigate(action.path)}
              >
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    background: `${action.color}20`,
                    color: action.color,
                    display: "inline-flex",
                    mb: 2,
                  }}
                >
                  {action.icon}
                </Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {action.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ flexGrow: 1 }}
                >
                  {action.description}
                </Typography>
              </Paper>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Recent Activity */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Recent Platform Activity
              </Typography>
              <ActivityFeed
                activities={globalActivities}
                loading={activitiesLoading}
                showUser
                compact
                maxItems={100}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                System Status
              </Typography>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Database</Typography>
                  <Chip label="Healthy" color="success" size="small" sx={{ color: "white" }} />
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Payment Gateway</Typography>
                  <Chip label="Active" color="success" size="small" sx={{ color: "white" }} />
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Email Service</Typography>
                  <Chip label="Active" color="success" size="small" sx={{ color: "white" }} />
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2">Storage</Typography>
                  <Chip label="75% Used" color="warning" size="small" />
                </Stack>
              </Stack>
              <Button fullWidth variant="outlined" sx={{ mt: 3 }}>
                View System Logs
              </Button>
            </CardContent>
          </Card>
        </Grid> */}
      </Grid>
    </Container>
  );
};
