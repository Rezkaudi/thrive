import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Chip,
  Card,
  CardContent,
  Typography,
  Stack,
  Paper,
  IconButton,
  Tooltip,
  Button,
  CircularProgress,
} from '@mui/material';
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
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  monthlyRevenue: number;
  completionRate: number;
  userGrowth: number;
  revenueGrowth: number;
}

const StatCard = ({ icon, title, value, subtitle, trend, color, onClick }: any) => (
  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
    <Card
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        height: '100%',
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        border: `1px solid ${color}20`,
      }}
      onClick={onClick}
    >
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="start">
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
                  <ArrowUpward sx={{ fontSize: 16, color: 'success.main' }} />
                ) : (
                  <ArrowDownward sx={{ fontSize: 16, color: 'error.main' }} />
                )}
                <Typography
                  variant="caption"
                  color={trend > 0 ? 'success.main' : 'error.main'}
                  fontWeight={600}
                >
                  {Math.abs(trend)}%
                </Typography>
              </Stack>
            )}
          </Stack>
          <Box>
            <Typography variant="h4" fontWeight={700} color={color}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
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
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/analytics/overview');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'User Management',
      description: 'View and manage all users',
      icon: <People />,
      path: '/admin/users',
      color: '#FF6B6B',
    },
    {
      title: 'Course Management',
      description: 'Create and edit courses',
      icon: <School />,
      path: '/admin/courses',
      color: '#4ECDC4',
    },
    {
      title: 'Community Moderation',
      description: 'Review flagged content',
      icon: <Forum />,
      path: '/admin/community',
      color: '#FFB7C5',
    },
    {
      title: 'Session Management',
      description: 'Manage speaking sessions',
      icon: <CalendarMonth />,
      path: '/admin/sessions',
      color: '#00B894',
    },
  ];

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <Stack spacing={2} alignItems="center">
            <CircularProgress />
            {/* <Typography variant="h6">Loading dashboard...</Typography> */}
          </Stack>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
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
          <IconButton onClick={fetchDashboardStats} color="primary">
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
            color="#FF6B6B"
            onClick={() => navigate('/admin/users')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            icon={<AttachMoney />}
            title="Monthly Revenue"
            value={`¥${stats.monthlyRevenue.toLocaleString()}`}
            trend={stats.revenueGrowth}
            color="#4ECDC4"
            onClick={() => navigate('/admin/analytics')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            icon={<School />}
            title="Completion Rate"
            value={`${stats.completionRate}%`}
            subtitle="Average across all courses"
            color="#FFB7C5"
            onClick={() => navigate('/admin/courses')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            icon={<Warning />}
            title="Pending Reviews"
            value="12"
            subtitle="Flagged content"
            color="#FFA502"
            onClick={() => navigate('/admin/community')}
          />
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h5" fontWeight={600} mb={3}>
        Quick Actions
      </Typography>
      <Grid container spacing={3} mb={4}>
        {quickActions.map((action, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Paper
                sx={{
                  p: 3,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
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
                    display: 'inline-flex',
                    mb: 2,
                  }}
                >
                  {action.icon}
                </Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {action.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
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
                Recent Activity
              </Typography>
              <Stack spacing={2}>
                {[
                  { action: 'New user registered', user: 'sarah@example.com', time: '2 minutes ago' },
                  { action: 'Course completed', user: 'mike@example.com', course: 'Japan in Context', time: '15 minutes ago' },
                  { action: 'Post flagged for review', user: 'john@example.com', time: '1 hour ago' },
                  { action: 'Speaking session booked', user: 'amy@example.com', time: '2 hours ago' },
                ].map((activity, index) => (
                  <Paper key={index} sx={{ p: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {activity.action}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {activity.user} {activity.course && `• ${activity.course}`}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {activity.time}
                      </Typography>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
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
        </Grid>
      </Grid>
    </Container>
  );
};