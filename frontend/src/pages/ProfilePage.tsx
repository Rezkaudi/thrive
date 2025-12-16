// frontend/src/pages/ProfilePage.tsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  IconButton,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  Alert,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import {
  EmojiEvents,
  School,
  TrendingUp,
  Star,
  Forum,
  WorkspacePremium,
  Timeline,
  Category,
  Close,
  CreditCard,
} from "@mui/icons-material";
import { AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import {
  fetchMyProfile,
  clearError,
} from "../store/slices/profileSlice";
import { profileService } from "../services/profileService";
import { subscriptionService } from "../services/subscriptionService";
import { fetchUserActivities } from "../store/slices/activitySlice";
import { Achievement } from "../types/achievement.types";
import {
  Achievements,
  Activity,
  Overview,
  ProfileHeader,
  ShareDialog,
  StatCard,
} from "../components/profile";
import { Progress } from "../components/profile/Progress";

export interface Milestone {
  id: string;
  title: string;
  icon: React.ReactElement;
  achieved: boolean;
  date?: string;
  description: string;
}

// interface UserSettings {
//   notifications: {
//     email: boolean;
//     push: boolean;
//     lessonReminders: boolean;
//     achievements: boolean;
//     communityUpdates: boolean;
//   };
//   privacy: {
//     profileVisibility: 'public' | 'friends' | 'private';
//     showProgress: boolean;
//     showAchievements: boolean;
//     allowMessages: boolean;
//   };
//   preferences: {
//     theme: 'light' | 'dark' | 'auto';
//     language: 'en' | 'ja';
//     timezone: string;
//   };
// }

export const ProfilePage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const {
    data: profile,
    loading,
    error,
  } = useSelector((state: RootState) => state.profile);
  const { user } = useSelector((state: RootState) => state.auth);
  // const totalLessonsCompleted = useSelector((state: RootState) => state.dashboard.data?.stats.totalLessonsCompleted)
  // const totalLessonsAvailable = useSelector((state: RootState) => state.dashboard.data?.stats.totalLessonsAvailable)
  const {
    userActivities,
    loading: activityLoading,
    pagination,
  } = useSelector((state: RootState) => state.activity);

  // Local state
  const [tabValue, setTabValue] = useState(0);
  const [coverImageDialog, setCoverImageDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const [loadingManage, setLoadingManage] = useState(false);
  // const [loadingStart, setLoadingStart] = useState(false);
  const [activityPage, setActivityPage] = useState(1);

  // Real profile data state
  const [publicProfileData, setPublicProfileData] = useState<any>(null);
  const [loadingPublicData, setLoadingPublicData] = useState(false);

  // New state for button functionalities
  const [shareDialog, setShareDialog] = useState(false);
  const [settingsDialog, setSettingsDialog] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  // const [settings, setSettings] = useState<UserSettings>({
  //   notifications: {
  //     email: true,
  //     push: true,
  //     lessonReminders: true,
  //     achievements: true,
  //     communityUpdates: false,
  //   },
  //   privacy: {
  //     profileVisibility: 'public',
  //     showProgress: true,
  //     showAchievements: true,
  //     allowMessages: true,
  //   },
  //   preferences: {
  //     theme: 'light',
  //     language: 'en',
  //     timezone: 'UTC',
  //   },
  // });

  // Fetch activities when tab changes
  useEffect(() => {
    if (tabValue === 3 && profile?.userId) {
      dispatch(
        fetchUserActivities({
          userId: profile.userId,
          page: activityPage,
          limit: 10,
        })
      );
    }
  }, [tabValue, profile?.userId, activityPage, dispatch]);

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
          const realData = await profileService.getPublicProfile(
            profile.userId
          );
          setPublicProfileData(realData);
        } catch (error) {
          // Error silently handled
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
      setSnackbar({ open: true, message: error, severity: "error" });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // const handleSaveSettings = () => {
  //   // Here you would typically save settings to your backend
  //   setSnackbar({ open: true, message: 'Settings saved successfully!', severity: 'success' });
  //   setSettingsDialog(false);
  // };

  // const updateSettings = (section: keyof UserSettings, key: string, value: any) => {
  //   setSettings(prev => ({
  //     ...prev,
  //     [section]: {
  //       ...prev[section],
  //       [key]: value,
  //     },
  //   }));
  // };

  const handleSubscriptionManagement = async () => {
    setLoadingManage(true);
    try {
      const data = await subscriptionService.createCustomerPortal();
      window.location.href = data.session.url;
    } catch (error) {
      // Error silently handled
    } finally {
      setLoadingManage(false);
    }
  };

  // Use real data for achievements
  const achievements: Achievement[] =
    publicProfileData?.publicAchievements || [];

  // Use real data for milestones
  const milestones: Milestone[] =
    publicProfileData?.recentMilestones?.map((milestone: any) => ({
      id: milestone.title,
      title: milestone.title,
      icon:
        milestone.type === "lesson" ? (
          <School />
        ) : milestone.type === "level" ? (
          <Star />
        ) : milestone.type === "community" ? (
          <Forum />
        ) : milestone.type === "achievement" ? (
          <EmojiEvents />
        ) : (
          <WorkspacePremium />
        ),
      achieved: true,
      date: milestone.date,
      description: milestone.details || milestone.title,
    })) || [];

  // Use real data for stats
  const stats = [
    {
      label: "Total Points",
      value: publicProfileData?.totalPoints || profile?.points || 0,
      icon: <EmojiEvents sx={{ color: "#FFD700" }} />,
      color: "#FFD700",
      description: "Lifetime earnings",
    },
    {
      label: "Current Level",
      value: profile?.level || 1,
      icon: <TrendingUp sx={{ color: "#5C633A" }} />,
      color: "#5C633A",
      description: "Keep learning to level up",
    },
    {
      label: "Lessons Completed",
      value: publicProfileData?.totalLessonsCompleted || 0,
      icon: <School sx={{ color: "#A6531C" }} />,
      color: "#A6531C",
      description: `Out of ${
        publicProfileData?.totalLessonsAvailable || 0
      } total`,
    },
    {
      label: "Study Streak",
      value: `${publicProfileData?.joinedDaysAgo || 0} days`,
      icon: <Star sx={{ color: "#D4BC8C" }} />,
      color: "#D4BC8C",
      description: "Days since joining",
    },
  ];

  if (loading || loadingPublicData) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Cover Image Section */}
      <Box
        sx={{
          position: "relative",
          height: { xs: 200, md: 300 },
          background: `linear-gradient(135deg, #5C633A 0%, #D4BC8C 50%, #A6531C 100%)`,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.2)",
          }}
        />
      </Box>

      <Container
        maxWidth="lg"
        sx={{ mt: -8, mb: 4, position: "relative", zIndex: 1 }}
      >
        {/* Profile Header */}
        <ProfileHeader
          isMobile={isMobile}
          profile={profile as NonNullable<typeof profile>}
          user={user}
          setSettingsDialog={setSettingsDialog}
          publicProfileData={publicProfileData}
          setSnackbar={setSnackbar}
          setShareDialog={setShareDialog}
        />

        {/* Stats Cards */}
        <Grid container spacing={3} mb={4}>
          {stats.map((stat, index) => (
            <StatCard key={index} index={index} stat={stat} />
          ))}
        </Grid>

        {/* Main Content Tabs */}
        <Card>
          <Tabs
            value={tabValue}
            onChange={(e, v) => setTabValue(v)}
            variant={isMobile ? "scrollable" : "standard"}
            scrollButtons={isMobile ? "auto" : false}
            allowScrollButtonsMobile
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              px: { xs: 1, md: 3 },
              "& .MuiTab-root": {
                minHeight: "48px", // Reduce height on mobile
                // padding: { xs: '6px 8px', sm: '12px 16px' },
                fontSize: { xs: "0.7rem", sm: "0.875rem" },
              },
            }}
          >
            <Tab label="Overview" icon={<Category />} iconPosition="start" />
            <Tab
              label="Achievements"
              icon={<EmojiEvents />}
              iconPosition="start"
            />
            <Tab label="Progress" icon={<TrendingUp />} iconPosition="start" />
            <Tab label="Activity" icon={<Timeline />} iconPosition="start" />
          </Tabs>

          <CardContent sx={{ p: { xs: 2, md: 4 } }}>
            <AnimatePresence mode="wait">
              {tabValue === 0 && <Overview milestones={milestones} />}

              {tabValue === 1 && (
                <Achievements isMobile={isMobile} achievements={achievements} />
              )}

              {tabValue === 2 && (
                <Progress publicProfileData={publicProfileData} />
              )}

              {tabValue === 3 && (
                <Activity
                  activityLoading={activityLoading}
                  activityPage={activityPage}
                  setActivityPage={setActivityPage}
                  pagination={pagination}
                  userActivities={userActivities}
                />
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </Container>

      {/* Share Profile Dialog */}
      <ShareDialog
        open={shareDialog}
        onClose={() => setShareDialog(false)}
        shareUrl={shareUrl}
        setSnackbar={setSnackbar}
      />

      {/* Settings Dialog */}
      <Dialog
        open={settingsDialog}
        onClose={() => setSettingsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            Profile Settings
            <IconButton onClick={() => setSettingsDialog(false)}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={4}>
            {/* Notification Settings */}
            {/* <Box>
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
            </Box> */}

            {/* <Divider /> */}

            {/* Privacy Settings */}
            {/* <Box>
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
            </Box> */}

            {/* <Divider /> */}

            {/* Preferences */}
            {/* <Box>
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
            </Box> */}

            {/* <Divider /> */}

            {/* Payment Settings */}
            {user?.role !== "ADMIN" && (
              <Box>
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  <CreditCard color="primary" />
                  <Typography variant="h6">Payment Settings</Typography>
                </Stack>
                <Stack spacing={2}>
                  <Typography variant="body2" color="text.secondary">
                    Manage your subscription and billing preferences.
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={handleSubscriptionManagement}
                      disabled={loadingManage}
                      startIcon={
                        loadingManage && <CircularProgress size={20} />
                      }
                    >
                      {"Subscription Management"}
                    </Button>
                    {/* {status === "trialing" && <Button
                    variant="contained"
                    color="primary"
                    onClick={handleStartSubscription}
                    disabled={loadingStart}
                    startIcon={loadingStart && <CircularProgress size={20} />}
                  >
                    {'Start Subscription'}
                  </Button>} */}
                  </Stack>
                </Stack>
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setSettingsDialog(false)}>
            Cancel
          </Button>
          {/* <Button variant="contained" onClick={handleSaveSettings}>
            Save Settings
          </Button> */}
        </DialogActions>
      </Dialog>

      {/* Cover Image Dialog */}
      <Dialog
        open={coverImageDialog}
        onClose={() => setCoverImageDialog(false)}
      >
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
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
