import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Card,
  Grid,
  CardContent,
  Typography,
  LinearProgress,
  Avatar,
  Stack,
  Paper,
  Chip,
  IconButton,
  Skeleton,
  Alert,
} from '@mui/material';
import {
  School,
  Groups,
  CalendarMonth,
  EmojiEvents,
  ArrowForward,
  Refresh,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { fetchDashboardData } from '../store/slices/dashboardSlice';
import { formatDistanceToNow } from 'date-fns';

const StatCard = ({ icon, title, value, color, onClick, loading }: any) => (
  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
    <Card
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        border: `1px solid ${color}20`,
        height: '100%',
      }}
      onClick={onClick}
    >
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            {loading ? (
              <Skeleton variant="text" width={60} height={40} />
            ) : (
              <Typography variant="h4" fontWeight={700} color={color}>
                {value}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {title}
            </Typography>
          </Box>
          <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  </motion.div>
);

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { data: dashboardData, loading, error } = useSelector((state: RootState) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchDashboardData());
  };

  const stats = [
    {
      icon: <School />,
      title: 'Lessons Completed',
      value: dashboardData
        ? `${dashboardData.stats.totalLessonsCompleted}/${dashboardData.stats.totalLessonsAvailable}`
        : '-',
      color: '#FF6B6B',
      onClick: () => navigate('/classroom'),
    },
    {
      icon: <EmojiEvents />,
      title: 'Total Points',
      value: dashboardData?.stats.totalPoints || 0,
      color: '#4ECDC4',
    },
    {
      icon: <Groups />,
      title: 'Community Posts',
      value: dashboardData?.stats.communityPostsCount || 0,
      color: '#FFB7C5',
      onClick: () => navigate('/community'),
    },
    {
      icon: <CalendarMonth />,
      title: 'Upcoming Sessions',
      value: dashboardData?.stats.upcomingSessionsCount || 0,
      color: '#00B894',
      onClick: () => navigate('/calendar'),
    },
  ];

  const formatActivityTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" action={
          <IconButton color="inherit" size="small" onClick={handleRefresh}>
            <Refresh />
          </IconButton>
        }>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper
          sx={{
            p: 4,
            mb: 4,
            background: 'linear-gradient(135deg, #FF6B6B 0%, #FFB7C5 100%)',
            color: 'white',
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
            }}
          />
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" gutterBottom fontWeight={600}>
                Welcome back, {dashboardData?.user.name || dashboardData?.user.email.split('@')[0]}! 👋
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Continue your Japanese learning journey today
              </Typography>
            </Box>
            <IconButton
              onClick={handleRefresh}
              sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.2)' }}
            >
              <Refresh />
            </IconButton>
          </Stack>
        </Paper>
      </motion.div>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <StatCard {...stat} loading={loading} />
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Progress Section */}
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
              >
                <Typography variant="h6" fontWeight={600}>
                  Current Progress
                </Typography>
                <Chip
                  label={`Level ${dashboardData?.user.level || 1}`}
                  color="primary"
                  size="small"
                />
              </Stack>

              {loading ? (
                <>
                  <Skeleton variant="rectangular" height={40} sx={{ mb: 2 }} />
                  <Skeleton variant="rectangular" height={40} />
                </>
              ) : (
                dashboardData?.courseProgress.map((course, index) => (
                  <Box key={course.courseId} sx={{ mb: index === 0 ? 3 : 0 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {course.courseTitle}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <LinearProgress
                        variant="determinate"
                        value={course.progressPercentage}
                        sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                        color={index === 0 ? "primary" : "secondary"}
                      />
                      <Typography variant="body2">{course.progressPercentage}%</Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      {course.completedLessons} of {course.totalLessons} lessons completed
                    </Typography>
                  </Box>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Recent Activity
              </Typography>
              <Stack spacing={2}>
                {loading ? (
                  <>
                    <Skeleton variant="text" height={30} />
                    <Skeleton variant="text" height={30} />
                    <Skeleton variant="text" height={30} />
                  </>
                ) : dashboardData?.recentActivity.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No recent activity
                  </Typography>
                ) : (
                  dashboardData?.recentActivity.slice(0, 5).map((activity, index) => (
                    <Stack
                      key={index}
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ py: 1 }}
                    >
                      <Typography variant="body2">{activity.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatActivityTime(activity.timestamp)}
                      </Typography>
                    </Stack>
                  ))
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          {/* Quick Actions */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Quick Actions
              </Typography>
              <Stack spacing={2}>
                <Paper
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                  onClick={() => navigate('/classroom')}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body1" fontWeight={500}>
                        Continue Learning
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {dashboardData && dashboardData.courseProgress.length > 0
                          ? `Next lesson in ${dashboardData.courseProgress[0].courseTitle}`
                          : 'Start your first lesson'}
                      </Typography>
                    </Box>
                    <IconButton color="primary">
                      <ArrowForward />
                    </IconButton>
                  </Stack>
                </Paper>

                <Paper
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                  onClick={() => navigate('/calendar')}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body1" fontWeight={500}>
                        Book Session
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {dashboardData?.upcomingSessions.length
                          ? `${dashboardData.upcomingSessions.length} upcoming`
                          : 'Practice speaking'}
                      </Typography>
                    </Box>
                    <IconButton color="secondary">
                      <ArrowForward />
                    </IconButton>
                  </Stack>
                </Paper>
              </Stack>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Recent Achievements
              </Typography>
              <Stack spacing={2}>
                {loading ? (
                  <>
                    <Skeleton variant="text" height={40} />
                    <Skeleton variant="text" height={40} />
                    <Skeleton variant="text" height={40} />
                  </>
                ) : dashboardData?.achievements.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    Complete lessons to earn achievements!
                  </Typography>
                ) : (
                  dashboardData?.achievements.map((achievement) => (
                    <Stack key={achievement.id} direction="row" spacing={2} alignItems="center">
                      <Typography variant="h4">{achievement.badge}</Typography>
                      <Typography variant="body2">{achievement.title}</Typography>
                    </Stack>
                  ))
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Upcoming Sessions Preview */}
      {dashboardData && dashboardData.upcomingSessions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={600}>
                  Upcoming Sessions
                </Typography>
                <IconButton color="primary" onClick={() => navigate('/calendar')}>
                  <ArrowForward />
                </IconButton>
              </Stack>
              <Stack spacing={2}>
                {dashboardData.upcomingSessions.slice(0, 3).map((session) => (
                  <Paper key={session.id} sx={{ p: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="body1" fontWeight={500}>
                          {session.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(session.scheduledAt).toLocaleDateString()} at{' '}
                          {new Date(session.scheduledAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Typography>
                      </Box>
                      <Chip
                        label={session.type}
                        size="small"
                        color={session.type === 'SPEAKING' ? 'primary' : 'secondary'}
                      />
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </Container>
  );
};