// frontend/src/pages/ProfilePage.tsx
import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  TextField,
  Stack,
  Chip,
  LinearProgress,
  Paper,
  IconButton,
  Badge,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  useTheme,
  useMediaQuery,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
} from '@mui/material';
import {
  Edit,
  PhotoCamera,
  EmojiEvents,
  School,
  TrendingUp,
  Star,
  CalendarMonth,
  CheckCircle,
  Lock,
  Forum,
  VideoCall,
  WorkspacePremium,
  Timeline,
  Category,
  Language,
  Settings,
  Share,
  Download,
  CameraAlt,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
  unlockedAt?: string;
  progress?: number;
  total?: number;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

interface Milestone {
  id: string;
  title: string;
  icon: React.ReactElement;
  achieved: boolean;
  date?: string;
  description: string;
}

const rarityColors = {
  common: '#636E72',
  rare: '#0984E3',
  epic: '#6C5CE7',
  legendary: '#FDCB6E',
};

export const ProfilePage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [tabValue, setTabValue] = useState(0);
  const [editing, setEditing] = useState(false);
  const [coverImageDialog, setCoverImageDialog] = useState(false);
  const profile = useSelector((state: RootState) => state.profile.data);
  const user = useSelector((state: RootState) => state.auth.user);

  const [formData, setFormData] = useState({
    name: profile?.name || '',
    bio: profile?.bio || '',
    languageLevel: profile?.languageLevel || 'N5',
  });

  // Calculate profile completion
  const profileCompletion = () => {
    let completed = 0;
    const total = 5;
    if (profile?.name) completed++;
    if (profile?.bio) completed++;
    if (profile?.profilePhoto) completed++;
    if (profile?.languageLevel) completed++;
    if ((profile?.points || 0) > 0) completed++;
    return (completed / total) * 100;
  };

  const achievements: Achievement[] = [
    {
      id: '1',
      icon: '🔥',
      title: '7-Day Streak',
      description: 'Study for 7 days in a row',
      unlockedAt: '2024-01-15',
      rarity: 'common'
    },
    {
      id: '2',
      icon: '🌸',
      title: 'First Steps',
      description: 'Complete your first lesson',
      unlockedAt: '2024-01-10',
      rarity: 'common'
    },
    {
      id: '3',
      icon: '💬',
      title: 'Community Champion',
      description: 'Make 50 posts in the community',
      unlockedAt: '2024-01-20',
      progress: 35,
      total: 50,
      rarity: 'rare'
    },
    {
      id: '4',
      icon: '🎯',
      title: 'Quiz Master',
      description: 'Score 100% on 10 quizzes',
      progress: 3,
      total: 10,
      rarity: 'epic'
    },
    {
      id: '5',
      icon: '🗣️',
      title: 'Conversation Expert',
      description: 'Complete 25 speaking sessions',
      progress: 5,
      total: 25,
      rarity: 'rare'
    },
    {
      id: '6',
      icon: '📚',
      title: 'Course Completionist',
      description: 'Finish all available courses',
      progress: 1,
      total: 4,
      rarity: 'legendary'
    },
  ];

  const milestones: Milestone[] = [
    {
      id: '1',
      title: 'Started Journey',
      icon: <Star />,
      achieved: true,
      date: '2024-01-10',
      description: 'Joined Thrive in Japan',
    },
    {
      id: '2',
      title: 'First Lesson',
      icon: <School />,
      achieved: true,
      date: '2024-01-11',
      description: 'Completed first lesson',
    },
    {
      id: '3',
      title: 'Community Active',
      icon: <Forum />,
      achieved: true,
      date: '2024-01-15',
      description: 'Made first community post',
    },
    {
      id: '4',
      title: 'Speaking Practice',
      icon: <VideoCall />,
      achieved: false,
      description: 'Complete first speaking session',
    },
    {
      id: '5',
      title: 'JLPT Ready',
      icon: <WorkspacePremium />,
      achieved: false,
      description: 'Complete JLPT N5 course',
    },
  ];

  const stats = [
    {
      label: 'Total Points',
      value: profile?.points || 0,
      icon: <EmojiEvents sx={{ color: '#FFD700' }} />,
      color: '#FFD700',
      description: 'Lifetime earnings'
    },
    {
      label: 'Current Level',
      value: profile?.level || 1,
      icon: <TrendingUp sx={{ color: '#FF6B6B' }} />,
      color: '#FF6B6B',
      description: 'Keep learning to level up'
    },
    {
      label: 'Lessons Completed',
      value: 12,
      icon: <School sx={{ color: '#4ECDC4' }} />,
      color: '#4ECDC4',
      description: 'Out of 30 total'
    },
    {
      label: 'Study Streak',
      value: '7 days',
      icon: <Star sx={{ color: '#FFB7C5' }} />,
      color: '#FFB7C5',
      description: 'Your best: 7 days'
    },
  ];

  const handleSaveProfile = () => {
    // Save profile logic here
    setEditing(false);
  };

  const AchievementCard = ({ achievement }: { achievement: Achievement }) => {
    const isUnlocked = !!achievement.unlockedAt;

    return (
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
            opacity: isUnlocked ? 1 : 0.7,
            background: isUnlocked
              ? `linear-gradient(135deg, ${rarityColors[achievement.rarity || 'common']}10 0%, ${rarityColors[achievement.rarity || 'common']}05 100%)`
              : 'linear-gradient(135deg, #f5f5f5 0%, #fafafa 100%)',
            border: '1px solid',
            borderColor: isUnlocked ? `${rarityColors[achievement.rarity || 'common']}30` : 'divider',
            filter: isUnlocked ? 'none' : 'grayscale(100%)',
          }}
        >
          {achievement.rarity && isUnlocked && (
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
          )}
          <CardContent>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Typography variant="h1" sx={{ fontSize: '3rem' }}>
                  {achievement.icon}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {achievement.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {achievement.description}
                </Typography>
              </Box>
              {achievement.progress !== undefined && achievement.total && (
                <Box>
                  <Stack direction="row" justifyContent="space-between" mb={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Progress
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {achievement.progress}/{achievement.total}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={(achievement.progress / achievement.total) * 100}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: 'action.hover',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 3,
                        backgroundColor: rarityColors[achievement.rarity || 'common'],
                      },
                    }}
                  />
                </Box>
              )}
              {isUnlocked && achievement.unlockedAt && (
                <Typography variant="caption" color="primary" sx={{ textAlign: 'center' }}>
                  Unlocked {achievement.unlockedAt}
                </Typography>
              )}
            </Stack>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Cover Image Section */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: 200, md: 300 },
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
            background: 'rgba(0,0,0,0.2)',
          }}
        />
        <Container maxWidth="lg" sx={{ height: '100%', position: 'relative' }}>
          <IconButton
            sx={{
              position: 'absolute',
              bottom: 20,
              right: 20,
              bgcolor: 'rgba(255,255,255,0.9)',
              '&:hover': { bgcolor: 'white' },
            }}
            onClick={() => setCoverImageDialog(true)}
          >
            <CameraAlt />
          </IconButton>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: -8, mb: 4, position: 'relative', zIndex: 1 }}>
        {/* Profile Header */}
        <Card sx={{ mb: 4, overflow: 'visible' }}>
          <CardContent sx={{ p: { xs: 2, md: 4 } }}>
            <Grid container spacing={3} alignItems="flex-start">
              <Grid size={{ xs: 12, md: 3 }} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <IconButton
                      size="small"
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        border: '3px solid white',
                        '&:hover': { bgcolor: 'primary.dark' },
                      }}
                    >
                      <PhotoCamera fontSize="small" />
                    </IconButton>
                  }
                >
                  <Avatar
                    src={profile?.profilePhoto}
                    sx={{
                      width: { xs: 120, md: 150 },
                      height: { xs: 120, md: 150 },
                      mx: 'auto',
                      border: '4px solid white',
                      boxShadow: 3,
                    }}
                  >
                    {profile?.name?.[0] || 'U'}
                  </Avatar>
                </Badge>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                {editing ? (
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label="Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    />
                    <FormControl fullWidth>
                      <InputLabel>Language Level</InputLabel>
                      <Select
                        value={formData.languageLevel}
                        label="Language Level"
                        onChange={(e) => setFormData({ ...formData, languageLevel: e.target.value })}
                      >
                        <MenuItem value="N5">N5 - Beginner</MenuItem>
                        <MenuItem value="N4">N4 - Elementary</MenuItem>
                        <MenuItem value="N3">N3 - Intermediate</MenuItem>
                        <MenuItem value="N2">N2 - Advanced</MenuItem>
                        <MenuItem value="N1">N1 - Proficient</MenuItem>
                      </Select>
                    </FormControl>
                  </Stack>
                ) : (
                  <Stack spacing={2}>
                    <Box>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="h4" fontWeight={700}>
                          {profile?.name || 'User'}
                        </Typography>
                        <Chip
                          icon={<Language />}
                          label={`JLPT ${profile?.languageLevel || 'N5'}`}
                          color="primary"
                        />
                      </Stack>
                      <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                        {profile?.bio || 'No bio yet. Tell us about yourself!'}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                      <Chip icon={<CalendarMonth />} label={`Joined ${new Date(profile?.createdAt || '').toLocaleDateString()}`} />
                      <Chip icon={<School />} label={`${user?.role || 'Student'}`} />
                    </Stack>
                  </Stack>
                )}
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <Stack spacing={2} alignItems={{ xs: 'center', md: 'flex-end' }}>
                  {editing ? (
                    <>
                      <Button
                        variant="contained"
                        onClick={handleSaveProfile}
                        fullWidth={isMobile}
                      >
                        Save Changes
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => setEditing(false)}
                        fullWidth={isMobile}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="contained"
                        startIcon={<Edit />}
                        onClick={() => setEditing(true)}
                        fullWidth={isMobile}
                      >
                        Edit Profile
                      </Button>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="Share Profile">
                          <IconButton>
                            <Share />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download Certificate">
                          <IconButton>
                            <Download />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Settings">
                          <IconButton>
                            <Settings />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </>
                  )}
                </Stack>
              </Grid>
            </Grid>

            {/* Profile Completion */}
            <Box sx={{ mt: 4 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2" fontWeight={600}>
                  Profile Completion
                </Typography>
                <Typography variant="body2" color="primary" fontWeight={600}>
                  {Math.round(profileCompletion())}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={profileCompletion()}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'action.hover',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    background: 'linear-gradient(90deg, #FF6B6B 0%, #FFB7C5 100%)',
                  },
                }}
              />
              {profileCompletion() < 100 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Complete your profile to unlock all features and earn bonus points!
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Stats Cards */}
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

        {/* Main Content Tabs */}
        <Card>
          <Tabs
            value={tabValue}
            onChange={(e, v) => setTabValue(v)}
            variant={isMobile ? 'fullWidth' : 'standard'}
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              px: { xs: 1, md: 3 },
            }}
          >
            <Tab label="Overview" icon={<Category />} iconPosition="start" />
            <Tab label="Achievements" icon={<EmojiEvents />} iconPosition="start" />
            <Tab label="Progress" icon={<TrendingUp />} iconPosition="start" />
            <Tab label="Activity" icon={<Timeline />} iconPosition="start" />
          </Tabs>

          <CardContent sx={{ p: { xs: 2, md: 4 } }}>
            <AnimatePresence mode="wait">
              {tabValue === 0 && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Learning Journey
                      </Typography>
                      <List>
                        {milestones.map((milestone, index) => (
                          <ListItem
                            key={milestone.id}
                            sx={{
                              opacity: milestone.achieved ? 1 : 0.5,
                              '&::before': milestone.achieved && index < milestones.length - 1 ? {
                                content: '""',
                                position: 'absolute',
                                left: 28,
                                top: 48,
                                bottom: -48,
                                width: 2,
                                bgcolor: 'primary.main',
                              } : {},
                            }}
                          >
                            <ListItemIcon>
                              <Avatar
                                sx={{
                                  bgcolor: milestone.achieved ? 'primary.main' : 'action.hover',
                                  width: 36,
                                  height: 36,
                                }}
                              >
                                {milestone.achieved ? <CheckCircle /> : milestone.icon}
                              </Avatar>
                            </ListItemIcon>
                            <ListItemText
                              primary={milestone.title}
                              secondary={
                                <>
                                  {milestone.description}
                                  {milestone.date && (
                                    <Typography variant="caption" display="block" color="primary">
                                      {milestone.date}
                                    </Typography>
                                  )}
                                </>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Skills Overview
                      </Typography>
                      <Stack spacing={3}>
                        {[
                          { skill: 'Vocabulary', level: 60, color: '#FF6B6B' },
                          { skill: 'Grammar', level: 45, color: '#4ECDC4' },
                          { skill: 'Listening', level: 30, color: '#FFB7C5' },
                          { skill: 'Speaking', level: 20, color: '#00B894' },
                          { skill: 'Reading', level: 50, color: '#FFA502' },
                        ].map((skill) => (
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
                    </Grid>
                  </Grid>
                </motion.div>
              )}

              {tabValue === 1 && (
                <motion.div
                  key="achievements"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Stack spacing={3}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6" fontWeight={600}>
                        Your Achievements
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        {Object.entries(rarityColors).map(([rarity, color]) => (
                          <Chip
                            key={rarity}
                            label={rarity}
                            size="small"
                            sx={{
                              backgroundColor: color,
                              color: 'white',
                              textTransform: 'capitalize',
                              fontSize: '0.7rem',
                            }}
                          />
                        ))}
                      </Stack>
                    </Stack>

                    <Grid container spacing={3}>
                      {achievements.map((achievement) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={achievement.id}>
                          <AchievementCard achievement={achievement} />
                        </Grid>
                      ))}
                    </Grid>

                    <Alert severity="info" sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        Complete lessons, participate in the community, and practice speaking to unlock more achievements!
                      </Typography>
                    </Alert>
                  </Stack>
                </motion.div>
              )}

              {tabValue === 2 && (
                <motion.div
                  key="progress"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Stack spacing={4}>
                    <Box>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Course Progress
                      </Typography>
                      <Stack spacing={3}>
                        {[
                          { course: 'Japan in Context', progress: 40, lessons: '4/10', color: '#FF6B6B' },
                          { course: 'JLPT N5 Preparation', progress: 25, lessons: '3/12', color: '#4ECDC4' },
                          { course: 'Business Japanese', progress: 0, lessons: '0/8', color: '#FFB7C5', locked: true },
                          { course: 'Cultural Immersion', progress: 0, lessons: '0/6', color: '#00B894', locked: true },
                        ].map((course) => (
                          <Paper key={course.course} sx={{ p: 3 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                              <Box>
                                <Typography variant="subtitle1" fontWeight={600}>
                                  {course.course}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {course.lessons} lessons completed
                                </Typography>
                              </Box>
                              {course.locked && (
                                <Chip icon={<Lock />} label="Locked" size="small" />
                              )}
                            </Stack>
                            <LinearProgress
                              variant="determinate"
                              value={course.progress}
                              sx={{
                                height: 10,
                                borderRadius: 5,
                                backgroundColor: 'action.hover',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 5,
                                  backgroundColor: course.color,
                                },
                              }}
                            />
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              {course.progress}% Complete
                            </Typography>
                          </Paper>
                        ))}
                      </Stack>
                    </Box>

                    <Box>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        Weekly Study Time
                      </Typography>
                      <Paper sx={{ p: 3 }}>
                        <Grid container spacing={2}>
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                            <Grid size="auto" key={day}>
                              <Stack alignItems="center" spacing={1}>
                                <Box
                                  sx={{
                                    width: 40,
                                    height: 100,
                                    bgcolor: 'action.hover',
                                    borderRadius: 2,
                                    position: 'relative',
                                    overflow: 'hidden',
                                  }}
                                >
                                  <Box
                                    sx={{
                                      position: 'absolute',
                                      bottom: 0,
                                      left: 0,
                                      right: 0,
                                      height: `${Math.random() * 100}%`,
                                      bgcolor: 'primary.main',
                                      borderRadius: 2,
                                    }}
                                  />
                                </Box>
                                <Typography variant="caption">{day}</Typography>
                              </Stack>
                            </Grid>
                          ))}
                        </Grid>
                      </Paper>
                    </Box>
                  </Stack>
                </motion.div>
              )}

              {tabValue === 3 && (
                <motion.div
                  key="activity"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Recent Activity
                  </Typography>
                  <Stack spacing={2}>
                    {[
                      {
                        action: 'Completed Lesson 5: Greetings',
                        time: '2 hours ago',
                        points: '+50',
                        icon: <School />,
                        color: '#4ECDC4'
                      },
                      {
                        action: 'Posted in community',
                        time: '5 hours ago',
                        points: '+10',
                        icon: <Forum />,
                        color: '#FFB7C5'
                      },
                      {
                        action: 'Achieved 7-day streak',
                        time: 'Yesterday',
                        points: '+100',
                        icon: <EmojiEvents />,
                        color: '#FFD700'
                      },
                      {
                        action: 'Joined speaking session',
                        time: '2 days ago',
                        points: '+30',
                        icon: <VideoCall />,
                        color: '#FF6B6B'
                      },
                      {
                        action: 'Completed quiz with 90% score',
                        time: '3 days ago',
                        points: '+45',
                        icon: <CheckCircle />,
                        color: '#00B894'
                      },
                    ].map((activity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Paper sx={{ p: 3 }}>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar sx={{ bgcolor: `${activity.color}20`, color: activity.color }}>
                              {activity.icon}
                            </Avatar>
                            <Box flex={1}>
                              <Typography variant="body1" fontWeight={500}>
                                {activity.action}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {activity.time}
                              </Typography>
                            </Box>
                            <Chip
                              label={activity.points}
                              color="success"
                              size="small"
                              sx={{ fontWeight: 600 , color: "white"}}
                            />
                          </Stack>
                        </Paper>
                      </motion.div>
                    ))}
                  </Stack>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </Container>

      {/* Cover Image Dialog */}
      <Dialog open={coverImageDialog} onClose={() => setCoverImageDialog(false)}>
        <DialogTitle>Change Cover Image</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Upload a new cover image to personalize your profile.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCoverImageDialog(false)}>Cancel</Button>
          <Button variant="contained">Upload Image</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};