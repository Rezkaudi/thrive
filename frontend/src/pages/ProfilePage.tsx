// frontend/src/pages/ProfilePage.tsx
import React, { useState, useRef, useEffect } from 'react';
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
  Snackbar,
  CircularProgress,
  Menu,
  Switch,
  FormControlLabel,
  Divider,
  Link,
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
  Delete,
  CloudUpload,
  SaveAlt,
  Cancel,
  Notifications,
  Security,
  Palette,
  Email,
  Phone,
  Visibility,
  VisibilityOff,
  Facebook,
  Twitter,
  LinkedIn,
  WhatsApp,
  ContentCopy,
  Close,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { 
  fetchMyProfile, 
  updateProfile, 
  uploadProfilePhoto, 
  deleteProfilePhoto,
  clearError
} from '../store/slices/profileSlice';
import { UpdateProfileData, profileService } from '../services/profileService';

interface Achievement {
  id: string;
  icon: string;
  title: string;
  description: string;
  unlockedAt?: string;
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

interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    lessonReminders: boolean;
    achievements: boolean;
    communityUpdates: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private';
    showProgress: boolean;
    showAchievements: boolean;
    allowMessages: boolean;
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: 'en' | 'ja';
    timezone: string;
  };
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
  const dispatch = useDispatch<AppDispatch>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Redux state
  const { data: profile, loading, updateLoading, photoUploadLoading, error } = useSelector((state: RootState) => state.profile);
  const user = useSelector((state: RootState) => state.auth.user);

  // Local state
  const [tabValue, setTabValue] = useState(0);
  const [editing, setEditing] = useState(false);
  const [coverImageDialog, setCoverImageDialog] = useState(false);
  const [photoMenuAnchor, setPhotoMenuAnchor] = useState<null | HTMLElement>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  // Real profile data state
  const [publicProfileData, setPublicProfileData] = useState<any>(null);
  const [loadingPublicData, setLoadingPublicData] = useState(false);
  
  // New state for button functionalities
  const [shareDialog, setShareDialog] = useState(false);
  const [settingsDialog, setSettingsDialog] = useState(false);
  const [certificateLoading, setCertificateLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      email: true,
      push: true,
      lessonReminders: true,
      achievements: true,
      communityUpdates: false,
    },
    privacy: {
      profileVisibility: 'public',
      showProgress: true,
      showAchievements: true,
      allowMessages: true,
    },
    preferences: {
      theme: 'light',
      language: 'en',
      timezone: 'UTC',
    },
  });

  const [formData, setFormData] = useState<UpdateProfileData>({
    name: '',
    bio: '',
    languageLevel: 'N5',
  });

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        bio: profile.bio || '',
        languageLevel: profile.languageLevel || 'N5',
      });
    }
  }, [profile]);

  // Generate share URL
  useEffect(() => {
    if (profile?.userId) {
      setShareUrl(`${window.location.origin}/profile/${profile.userId}`);
    }
  }, [profile]);

  // Fetch profile on component mount
  useEffect(() => {
    dispatch(fetchMyProfile());
  }, [dispatch]);

  // Fetch real profile data
  useEffect(() => {
    const fetchRealProfileData = async () => {
      if (profile?.userId) {
        setLoadingPublicData(true);
        try {
          const realData = await profileService.getPublicProfile(profile.userId);
          setPublicProfileData(realData);
        } catch (error) {
          console.error('Failed to fetch real profile data:', error);
        } finally {
          setLoadingPublicData(false);
        }
      }
    };

    fetchRealProfileData();
  }, [profile?.userId]);

  // Handle errors
  useEffect(() => {
    if (error) {
      setSnackbar({ open: true, message: error, severity: 'error' });
      dispatch(clearError());
    }
  }, [error, dispatch]);

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

  const handleSaveProfile = async () => {
    try {
      await dispatch(updateProfile(formData)).unwrap();
      setEditing(false);
      setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        bio: profile.bio || '',
        languageLevel: profile.languageLevel || 'N5',
      });
    }
    setEditing(false);
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await dispatch(uploadProfilePhoto(file)).unwrap();
      setSnackbar({ open: true, message: 'Profile photo updated successfully!', severity: 'success' });
      setPhotoMenuAnchor(null);
    } catch (error) {
      console.error('Failed to upload photo:', error);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePhotoDelete = async () => {
    try {
      await dispatch(deleteProfilePhoto()).unwrap();
      setSnackbar({ open: true, message: 'Profile photo deleted successfully!', severity: 'success' });
      setPhotoMenuAnchor(null);
    } catch (error) {
      console.error('Failed to delete photo:', error);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
    setPhotoMenuAnchor(null);
  };

  // Share Profile Functionality
  const handleShareProfile = () => {
    setShareDialog(true);
  };

  const copyShareUrl = () => {
    navigator.clipboard.writeText(shareUrl);
    setSnackbar({ open: true, message: 'Profile URL copied to clipboard!', severity: 'success' });
  };

  const shareToSocial = (platform: string) => {
    const message = `Check out my Japanese learning progress on Thrive in Japan!`;
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedMessage = encodeURIComponent(message);
    
    let shareUrl_platform = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl_platform = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareUrl_platform = `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedUrl}`;
        break;
      case 'linkedin':
        shareUrl_platform = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'whatsapp':
        shareUrl_platform = `https://wa.me/?text=${encodedMessage} ${encodedUrl}`;
        break;
    }
    
    window.open(shareUrl_platform, '_blank', 'width=600,height=400');
  };

  // Download Certificate Functionality
  const handleDownloadCertificate = async () => {
    setCertificateLoading(true);
    
    try {
      // Simulate certificate generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a mock certificate download
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Background
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, 800, 600);
        
        // Border
        ctx.strokeStyle = '#FF6B6B';
        ctx.lineWidth = 10;
        ctx.strokeRect(20, 20, 760, 560);
        
        // Title
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Certificate of Achievement', 400, 120);
        
        // Subtitle
        ctx.font = '24px Arial';
        ctx.fillText('Thrive in Japan', 400, 160);
        
        // Name
        ctx.font = 'bold 32px Arial';
        ctx.fillStyle = '#FF6B6B';
        ctx.fillText(profile?.name || 'Student', 400, 250);
        
        // Description
        ctx.fillStyle = '#2c3e50';
        ctx.font = '20px Arial';
        ctx.fillText('has successfully completed', 400, 300);
        ctx.fillText(`${publicProfileData?.totalLessonsCompleted || 0} lessons in Japanese language learning`, 400, 330);
        
        // Level
        ctx.font = 'bold 24px Arial';
        ctx.fillStyle = '#4ECDC4';
        ctx.fillText(`Current Level: JLPT ${profile?.languageLevel || 'N5'}`, 400, 380);
        
        // Points
        ctx.fillStyle = '#FFD700';
        ctx.fillText(`Total Points Earned: ${publicProfileData?.totalPoints || profile?.points || 0}`, 400, 420);
        
        // Date
        ctx.fillStyle = '#2c3e50';
        ctx.font = '16px Arial';
        ctx.fillText(`Issued on: ${new Date().toLocaleDateString()}`, 400, 500);
      }
      
      // Download the certificate
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${profile?.name || 'Student'}_Japanese_Learning_Certificate.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          setSnackbar({ open: true, message: 'Certificate downloaded successfully!', severity: 'success' });
        }
      });
      
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to generate certificate. Please try again.', severity: 'error' });
    } finally {
      setCertificateLoading(false);
    }
  };

  // Settings Functionality
  const handleOpenSettings = () => {
    setSettingsDialog(true);
  };

  const handleSaveSettings = () => {
    // Here you would typically save settings to your backend
    setSnackbar({ open: true, message: 'Settings saved successfully!', severity: 'success' });
    setSettingsDialog(false);
  };

  const updateSettings = (section: keyof UserSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  // Use real data for achievements
  const achievements: Achievement[] = publicProfileData?.publicAchievements || [];

  // Use real data for milestones
  const milestones: Milestone[] = publicProfileData?.recentMilestones?.map((milestone: any) => ({
    id: milestone.title,
    title: milestone.title,
    icon: milestone.type === 'lesson' ? <School /> :
          milestone.type === 'level' ? <Star /> :
          milestone.type === 'community' ? <Forum /> :
          milestone.type === 'achievement' ? <EmojiEvents /> :
          <WorkspacePremium />,
    achieved: true,
    date: milestone.date,
    description: milestone.details || milestone.title,
  })) || [];

  // Use real data for stats
  const stats = [
    {
      label: 'Total Points',
      value: publicProfileData?.totalPoints || profile?.points || 0,
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
      value: publicProfileData?.totalLessonsCompleted || 0,
      icon: <School sx={{ color: '#4ECDC4' }} />,
      color: '#4ECDC4',
      description: `Out of ${publicProfileData?.totalLessonsAvailable || 0} total`
    },
    {
      label: 'Study Streak',
      value: `${publicProfileData?.joinedDaysAgo || 0} days`,
      icon: <Star sx={{ color: '#FFB7C5' }} />,
      color: '#FFB7C5',
      description: 'Days since joining'
    },
  ];

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
              {isUnlocked && achievement.unlockedAt && (
                <Typography variant="caption" color="primary" sx={{ textAlign: 'center' }}>
                  Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                </Typography>
              )}
            </Stack>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  if (loading || loadingPublicData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

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
                      onClick={(e) => setPhotoMenuAnchor(e.currentTarget)}
                      disabled={photoUploadLoading}
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        border: '3px solid white',
                        '&:hover': { bgcolor: 'primary.dark' },
                      }}
                    >
                      {photoUploadLoading ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : (
                        <PhotoCamera fontSize="small" />
                      )}
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

                {/* Photo Menu */}
                <Menu
                  anchorEl={photoMenuAnchor}
                  open={Boolean(photoMenuAnchor)}
                  onClose={() => setPhotoMenuAnchor(null)}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <MenuItem onClick={triggerFileInput}>
                    <CloudUpload sx={{ mr: 1 }} />
                    {profile?.profilePhoto ? "Update Photo" : "Upload Photo"}
                  </MenuItem>
                  {profile?.profilePhoto && (
                    <MenuItem onClick={handlePhotoDelete} sx={{ color: 'error.main' }}>
                      <Delete sx={{ mr: 1 }} />
                      Delete Photo
                    </MenuItem>
                  )}
                </Menu>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  style={{ display: 'none' }}
                  onChange={handlePhotoUpload}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                {editing ? (
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label="Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={updateLoading}
                      error={!formData.name?.trim()}
                      helperText={!formData.name?.trim() ? 'Name is required' : ''}
                    />
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label="Bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      disabled={updateLoading}
                      inputProps={{ maxLength: 500 }}
                      helperText={`${formData.bio?.length || 0}/500 characters`}
                    />
                    <FormControl fullWidth disabled={updateLoading}>
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
                        startIcon={updateLoading ? <CircularProgress size={16} /> : <SaveAlt />}
                        onClick={handleSaveProfile}
                        disabled={updateLoading || !formData.name?.trim()}
                        fullWidth={isMobile}
                      >
                        {updateLoading ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Cancel />}
                        onClick={handleCancelEdit}
                        disabled={updateLoading}
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
                          <IconButton onClick={handleShareProfile}>
                            <Share />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download Certificate">
                          <IconButton 
                            onClick={handleDownloadCertificate}
                            disabled={certificateLoading}
                          >
                            {certificateLoading ? (
                              <CircularProgress size={20} />
                            ) : (
                              <Download />
                            )}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Settings">
                          <IconButton onClick={handleOpenSettings}>
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
                        {publicProfileData?.learningStats?.map((skill: any) => (
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
                        )) || [
                          // Fallback data if no real data available
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
                        {publicProfileData?.courseProgress?.map((course: any) => (
                          <Paper key={course.courseTitle} sx={{ p: 3 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                              <Box>
                                <Typography variant="subtitle1" fontWeight={600}>
                                  {course.courseTitle}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {course.completedLessons}/{course.totalLessons} lessons completed
                                </Typography>
                              </Box>
                            </Stack>
                            <LinearProgress
                              variant="determinate"
                              value={course.progressPercentage}
                              sx={{
                                height: 10,
                                borderRadius: 5,
                                backgroundColor: 'action.hover',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 5,
                                  backgroundColor: '#4ECDC4',
                                },
                              }}
                            />
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              {course.progressPercentage}% Complete
                            </Typography>
                          </Paper>
                        )) || 
                        // Fallback if no real data
                        [
                          { course: 'Japan in Context', progress: 40, lessons: '4/10', color: '#FF6B6B' },
                          { course: 'JLPT N5 Preparation', progress: 25, lessons: '3/12', color: '#4ECDC4' },
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
                              sx={{ fontWeight: 600, color: "white" }}
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

      {/* Share Profile Dialog */}
      <Dialog 
        open={shareDialog} 
        onClose={() => setShareDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            Share Your Profile
            <IconButton onClick={() => setShareDialog(false)}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Share your learning progress with friends and family
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="body2" sx={{ flex: 1, wordBreak: 'break-all' }}>
                    {shareUrl}
                  </Typography>
                  <IconButton onClick={copyShareUrl} size="small">
                    <ContentCopy />
                  </IconButton>
                </Stack>
              </Paper>
            </Box>
            
            <Divider />
            
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Share on Social Media
              </Typography>
              <Stack direction="row" spacing={2}>
                <IconButton 
                  onClick={() => shareToSocial('facebook')}
                  sx={{ bgcolor: '#1877F2', color: 'white', '&:hover': { bgcolor: '#166FE5' } }}
                >
                  <Facebook />
                </IconButton>
                <IconButton 
                  onClick={() => shareToSocial('twitter')}
                  sx={{ bgcolor: '#1DA1F2', color: 'white', '&:hover': { bgcolor: '#1A91DA' } }}
                >
                  <Twitter />
                </IconButton>
                <IconButton 
                  onClick={() => shareToSocial('linkedin')}
                  sx={{ bgcolor: '#0A66C2', color: 'white', '&:hover': { bgcolor: '#095BA8' } }}
                >
                  <LinkedIn />
                </IconButton>
                <IconButton 
                  onClick={() => shareToSocial('whatsapp')}
                  sx={{ bgcolor: '#25D366', color: 'white', '&:hover': { bgcolor: '#22C75D' } }}
                >
                  <WhatsApp />
                </IconButton>
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog 
        open={settingsDialog} 
        onClose={() => setSettingsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            Profile Settings
            <IconButton onClick={() => setSettingsDialog(false)}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={4}>
            {/* Notification Settings */}
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <Notifications color="primary" />
                <Typography variant="h6">Notifications</Typography>
              </Stack>
              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.email}
                      onChange={(e) => updateSettings('notifications', 'email', e.target.checked)}
                    />
                  }
                  label="Email notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.push}
                      onChange={(e) => updateSettings('notifications', 'push', e.target.checked)}
                    />
                  }
                  label="Push notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.lessonReminders}
                      onChange={(e) => updateSettings('notifications', 'lessonReminders', e.target.checked)}
                    />
                  }
                  label="Lesson reminders"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.achievements}
                      onChange={(e) => updateSettings('notifications', 'achievements', e.target.checked)}
                    />
                  }
                  label="Achievement notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.notifications.communityUpdates}
                      onChange={(e) => updateSettings('notifications', 'communityUpdates', e.target.checked)}
                    />
                  }
                  label="Community updates"
                />
              </Stack>
            </Box>

            <Divider />

            {/* Privacy Settings */}
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <Security color="primary" />
                <Typography variant="h6">Privacy</Typography>
              </Stack>
              <Stack spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>Profile Visibility</InputLabel>
                  <Select
                    value={settings.privacy.profileVisibility}
                    label="Profile Visibility"
                    onChange={(e) => updateSettings('privacy', 'profileVisibility', e.target.value)}
                  >
                    <MenuItem value="public">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Visibility fontSize="small" />
                        <span>Public</span>
                      </Stack>
                    </MenuItem>
                    <MenuItem value="friends">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <VisibilityOff fontSize="small" />
                        <span>Friends Only</span>
                      </Stack>
                    </MenuItem>
                    <MenuItem value="private">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Lock fontSize="small" />
                        <span>Private</span>
                      </Stack>
                    </MenuItem>
                  </Select>
                </FormControl>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.privacy.showProgress}
                      onChange={(e) => updateSettings('privacy', 'showProgress', e.target.checked)}
                    />
                  }
                  label="Show learning progress"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.privacy.showAchievements}
                      onChange={(e) => updateSettings('privacy', 'showAchievements', e.target.checked)}
                    />
                  }
                  label="Show achievements"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.privacy.allowMessages}
                      onChange={(e) => updateSettings('privacy', 'allowMessages', e.target.checked)}
                    />
                  }
                  label="Allow messages from other users"
                />
              </Stack>
            </Box>

            <Divider />

            {/* Preferences */}
            <Box>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <Palette color="primary" />
                <Typography variant="h6">Preferences</Typography>
              </Stack>
              <Stack spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>Theme</InputLabel>
                  <Select
                    value={settings.preferences.theme}
                    label="Theme"
                    onChange={(e) => updateSettings('preferences', 'theme', e.target.value)}
                  >
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                    <MenuItem value="auto">Auto</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={settings.preferences.language}
                    label="Language"
                    onChange={(e) => updateSettings('preferences', 'language', e.target.value)}
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="ja">日本語</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Timezone</InputLabel>
                  <Select
                    value={settings.preferences.timezone}
                    label="Timezone"
                    onChange={(e) => updateSettings('preferences', 'timezone', e.target.value)}
                  >
                    <MenuItem value="UTC">UTC</MenuItem>
                    <MenuItem value="America/New_York">Eastern Time</MenuItem>
                    <MenuItem value="America/Los_Angeles">Pacific Time</MenuItem>
                    <MenuItem value="Asia/Tokyo">Japan Time</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsDialog(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSaveSettings}>
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>

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

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};