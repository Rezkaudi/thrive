// frontend/src/pages/PublicProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Stack,
  Chip,
  LinearProgress,
  Paper,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  EmojiEvents,
  School,
  TrendingUp,
  Star,
  CalendarMonth,
  CheckCircle,
  Language,
  ArrowBack,
  Share,
  PersonAdd,
  Message,
  VerifiedUser,
  WorkspacePremium,
  Timeline,
  Forum,
  VideoCall,
  BookOnline,
  Grade,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { profileService } from '../services/profileService';

interface PublicProfile {
  id: string;
  name: string;
  bio?: string;
  profilePhoto?: string;
  languageLevel?: string;
  level: number;
  badges: string[];
  createdAt: string;
  totalLessonsCompleted: number;
  totalLessonsAvailable: number;
  totalPoints: number;
  joinedDaysAgo: number;
  totalCourses: number;
  enrolledCourses: number;
  completedCourses: number;
  communityPosts: number;
  sessionsAttended: number;
  publicAchievements: Array<{
    id: string;
    title: string;
    icon: string;
    description: string;
    unlockedAt: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
  }>;
  learningStats: Array<{
    skill: string;
    level: number;
    color: string;
  }>;
  recentMilestones: Array<{
    title: string;
    date: string;
    type: 'lesson' | 'level' | 'achievement' | 'community' | 'course';
    details?: string;
  }>;
  courseProgress: Array<{
    courseTitle: string;
    totalLessons: number;
    completedLessons: number;
    progressPercentage: number;
  }>;
}

const rarityColors = {
  common: '#636E72',
  rare: '#0984E3',
  epic: '#6C5CE7',
  legendary: '#FDCB6E',
};

const milestoneIcons = {
  lesson: <School color="primary" />,
  level: <TrendingUp color="warning" />,
  achievement: <EmojiEvents color="success" />,
  community: <Forum color="info" />,
  course: <BookOnline color="secondary" />,
};

export const PublicProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      if (!userId) {
        setError('Invalid profile URL');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const profileData = await profileService.getPublicProfile(userId);
        setProfile(profileData);
        console.log(profileData)
      } catch (err: any) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProfile();
  }, [userId]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile?.name}'s Japanese Learning Profile`,
          text: `Check out ${profile?.name}'s progress on Thrive in Japan!`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could show a snackbar here
    }
  };

  const AchievementCard = ({ achievement }: { achievement: PublicProfile['publicAchievements'][0] }) => (
    <motion.div
      whileHover={{ y: -4 }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        sx={{
          height: '100%',
          position: 'relative',
          overflow: 'visible',
          background: `linear-gradient(135deg, ${rarityColors[achievement.rarity]}10 0%, ${rarityColors[achievement.rarity]}05 100%)`,
          border: '1px solid',
          borderColor: `${rarityColors[achievement.rarity]}30`,
        }}
      >
        <Chip
          label={achievement.rarity}
          size="small"
          sx={{
            position: 'absolute',
            top: -10,
            right: 10,
            backgroundColor: rarityColors[achievement.rarity],
            color: 'white',
            fontWeight: 600,
            fontSize: '0.7rem',
            textTransform: 'uppercase',
          }}
        />
        <CardContent>
          <Stack spacing={2} alignItems="center" textAlign="center">
            <Typography variant="h1" sx={{ fontSize: '3rem' }}>
              {achievement.icon}
            </Typography>
            <Typography variant="subtitle1" fontWeight={600}>
              {achievement.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {achievement.description}
            </Typography>
            <Typography variant="caption" color="primary">
              Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !profile) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Alert severity="error" sx={{ mb: 3 }}>
              {error || 'Profile not found'}
            </Alert>
            <Button
              variant="contained"
              startIcon={<ArrowBack />}
              onClick={() => navigate('/')}
            >
              Go Home
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  const stats = [
    {
      label: 'Total Points',
      value: profile.totalPoints.toLocaleString(),
      icon: <EmojiEvents sx={{ color: '#FFD700' }} />,
      color: '#FFD700',
      description: 'Points earned',
    },
    {
      label: 'Current Level',
      value: profile.level,
      icon: <TrendingUp sx={{ color: '#FF6B6B' }} />,
      color: '#FF6B6B',
      description: 'Learning level',
    },
    {
      label: 'Lessons Completed',
      value: profile.totalLessonsCompleted,
      icon: <School sx={{ color: '#4ECDC4' }} />,
      color: '#4ECDC4',
      description: `Out of ${profile.totalLessonsAvailable}`,
    },
    {
      label: 'Days Learning',
      value: profile.joinedDaysAgo,
      icon: <CalendarMonth sx={{ color: '#FFB7C5' }} />,
      color: '#FFB7C5',
      description: 'Since joining',
    },
  ];

  const additionalStats = [
    {
      label: 'Courses Enrolled',
      value: profile.enrolledCourses,
      icon: <BookOnline sx={{ color: '#9B59B6' }} />,
      color: '#9B59B6',
    },
    {
      label: 'Courses Completed',
      value: profile.completedCourses,
      icon: <Grade sx={{ color: '#E67E22' }} />,
      color: '#E67E22',
    },
    {
      label: 'Community Posts',
      value: profile.communityPosts,
      icon: <Forum sx={{ color: '#3498DB' }} />,
      color: '#3498DB',
    },
    {
      label: 'Sessions Attended',
      value: profile.sessionsAttended,
      icon: <VideoCall sx={{ color: '#E74C3C' }} />,
      color: '#E74C3C',
    },
  ];

  const overallProgress = profile.totalLessonsAvailable > 0 
    ? (profile.totalLessonsCompleted / profile.totalLessonsAvailable) * 100 
    : 0;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      {/* <Box
        sx={{
          background: `linear-gradient(135deg, #FF6B6B 0%, #FFB7C5 50%, #4ECDC4 100%)`,
          color: 'white',
          py: 2,
        }}
      >
        <Container maxWidth="lg">
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate('/')}
              sx={{ color: 'white' }}
            >
              Back to Home
            </Button>
            <Stack direction="row" spacing={1}>
              <Tooltip title="Share Profile">
                <IconButton onClick={handleShare} sx={{ color: 'white' }}>
                  <Share />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Container>
      </Box> */}

      {/* Cover Image Section */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: 200, md: 250 },
          background: `linear-gradient(135deg, #FF6B6B 0%, #FFB7C5 50%, #4ECDC4 100%)`,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.3)',
          }}
        />
      </Box>

      <Container maxWidth="lg" sx={{ mt: -8, mb: 4, position: 'relative', zIndex: 1 }}>
        {/* Profile Header */}
        <Card sx={{ mb: 4, overflow: 'visible' }}>
          <CardContent sx={{ p: { xs: 2, md: 4 } }}>
            <Grid container spacing={3} alignItems="flex-start">
              <Grid size={{ xs: 12, md: 3 }} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                <Avatar
                  src={profile.profilePhoto}
                  sx={{
                    width: { xs: 120, md: 150 },
                    height: { xs: 120, md: 150 },
                    mx: 'auto',
                    border: '4px solid white',
                    boxShadow: 3,
                  }}
                >
                  {profile.name?.[0] || 'U'}
                </Avatar>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Stack spacing={2}>
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
                      <Typography variant="h4" fontWeight={700}>
                        {profile.name}
                      </Typography>
                      <Chip
                        icon={<Language />}
                        label={`JLPT ${profile.languageLevel || 'N5'}`}
                        color="primary"
                      />
                    </Stack>
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                      {profile.bio || 'Learning Japanese with passion! 🌸'}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={2} flexWrap="wrap">
                    <Chip 
                      icon={<CalendarMonth />} 
                      label={`Learning for ${profile.joinedDaysAgo} days`} 
                    />
                    <Chip 
                      icon={<WorkspacePremium />} 
                      label={`Level ${profile.level}`} 
                    />
                    <Chip 
                      icon={<EmojiEvents />} 
                      label={`${profile.publicAchievements.length} achievements`} 
                    />
                  </Stack>
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <Stack spacing={2} alignItems={{ xs: 'center', md: 'flex-end' }}>
                  <Button
                    variant="contained"
                    startIcon={<PersonAdd />}
                    fullWidth={isMobile}
                    disabled
                  >
                    Follow
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Message />}
                    fullWidth={isMobile}
                    disabled
                  >
                    Message
                  </Button>
                </Stack>
              </Grid>
            </Grid>

            {/* Overall Progress Bar */}
            <Box sx={{ mt: 4 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2" fontWeight={600}>
                  Overall Learning Progress
                </Typography>
                <Typography variant="body2" color="primary" fontWeight={600}>
                  {Math.round(overallProgress)}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={overallProgress}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: 'action.hover',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 5,
                    background: 'linear-gradient(90deg, #FF6B6B 0%, #FFB7C5 50%, #4ECDC4 100%)',
                  },
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {profile.totalLessonsCompleted} of {profile.totalLessonsAvailable} lessons completed
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Main Stats Cards */}
        <Grid container spacing={3} mb={4}>
          {stats.map((stat, index) => (
            <Grid size={{ xs: 6, md: 3 }} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  sx={{
                    height: '100%',
                    background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}05 100%)`,
                    border: `1px solid ${stat.color}30`,
                  }}
                >
                  <CardContent>
                    <Stack spacing={1} alignItems="center" textAlign="center">
                      {stat.icon}
                      <Typography variant="h4" fontWeight={700} color={stat.color}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {stat.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {stat.description}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Additional Stats */}
        <Grid container spacing={3} mb={4}>
          {additionalStats.map((stat, index) => (
            <Grid size={{ xs: 6, md: 3 }} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (index + 4) * 0.1 }}
              >
                <Card
                  sx={{
                    height: '100%',
                    background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}05 100%)`,
                    border: `1px solid ${stat.color}30`,
                  }}
                >
                  <CardContent>
                    <Stack spacing={1} alignItems="center" textAlign="center">
                      {stat.icon}
                      <Typography variant="h4" fontWeight={700} color={stat.color}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {stat.label}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Learning Progress and Course Progress */}
        <Grid container spacing={4} mb={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Skill Progress
                </Typography>
                <Stack spacing={3}>
                  {profile.learningStats.map((skill) => (
                    <Box key={skill.skill}>
                      <Stack direction="row" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" fontWeight={500}>
                          {skill.skill}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {skill.level}%
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={skill.level}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: 'action.hover',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            backgroundColor: skill.color,
                          },
                        }}
                      />
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Course Progress
                </Typography>
                {profile.courseProgress.length > 0 ? (
                  <Stack spacing={3}>
                    {profile.courseProgress.slice(0, 4).map((course, index) => (
                      <Box key={index}>
                        <Stack direction="row" justifyContent="space-between" mb={1}>
                          <Typography variant="body2" fontWeight={500}>
                            {course.courseTitle}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {course.completedLessons}/{course.totalLessons}
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={course.progressPercentage}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: 'action.hover',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 4,
                              backgroundColor: course.progressPercentage === 100 ? '#00B894' : '#FF6B6B',
                            },
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {course.progressPercentage}% Complete
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No courses enrolled yet
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Milestones */}
        <Grid container spacing={4} mb={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Recent Milestones
                </Typography>
                {profile.recentMilestones.length > 0 ? (
                  <List>
                    {profile.recentMilestones.map((milestone, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon>
                          {milestoneIcons[milestone.type] || <Star />}
                        </ListItemIcon>
                        <ListItemText
                          primary={milestone.title}
                          secondary={
                            <>
                              {milestone.date}
                              {milestone.details && (
                                <Typography variant="caption" display="block" color="text.secondary">
                                  {milestone.details}
                                </Typography>
                              )}
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No recent activity
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Quick Stats
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h5" fontWeight={600} color="primary">
                        {Math.round(overallProgress)}%
                      </Typography>
                      <Typography variant="caption">Overall Progress</Typography>
                    </Paper>
                  </Grid>
                  <Grid size={6}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h5" fontWeight={600} color="success.main">
                        {profile.completedCourses}
                      </Typography>
                      <Typography variant="caption">Courses Done</Typography>
                    </Paper>
                  </Grid>
                  <Grid size={6}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h5" fontWeight={600} color="warning.main">
                        {profile.publicAchievements.filter(a => a.rarity === 'rare' || a.rarity === 'epic' || a.rarity === 'legendary').length}
                      </Typography>
                      <Typography variant="caption">Rare+ Achievements</Typography>
                    </Paper>
                  </Grid>
                  <Grid size={6}>
                    <Paper sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h5" fontWeight={600} color="info.main">
                        {profile.joinedDaysAgo}
                      </Typography>
                      <Typography variant="caption">Days Active</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Achievements */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Achievements ({profile.publicAchievements.length})
            </Typography>
            <Divider sx={{ mb: 3 }} />
            {profile.publicAchievements.length > 0 ? (
              <Grid container spacing={3}>
                {profile.publicAchievements.map((achievement) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={achievement.id}>
                    <AchievementCard achievement={achievement} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                No achievements unlocked yet
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card sx={{ mt: 4, textAlign: 'center' }}>
          <CardContent sx={{ py: 6 }}>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Start Your Japanese Learning Journey
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Join thousands of learners like {profile.name} and master Japanese with Thrive in Japan!
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              sx={{ mr: 2 }}
            >
              Get Started
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};