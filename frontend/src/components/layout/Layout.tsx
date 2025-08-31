// frontend/src/components/layout/Layout.tsx (UPDATE YOUR EXISTING LAYOUT)
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  MenuOpen as MenuOpenIcon,
  Dashboard,
  School,
  Groups,
  CalendarMonth,
  Person,
  Logout,
  EmojiEvents,
  AdminPanelSettings,
  ChevronLeft,
  ChevronRight,
  ContactMail
} from '@mui/icons-material';
import { logout } from '../../store/slices/authSlice';
import { RootState, AppDispatch } from '../../store/store';
import {
  fetchTourVideo,
  fetchTourVideoStatus,
  setShowTourModal,
  hideTourModal
} from '../../store/slices/videoSlice';
import { TourVideoModal } from '../welcome-video/TourVideoModal';
import { VideoButton } from '../welcome-video/VideoButton';


interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();

  const user = useSelector((state: RootState) => state.auth.user);
  const profile = useSelector((state: RootState) => state.dashboard?.data);
  const profilePhoto = useSelector((state: RootState) => state.dashboard?.data?.user?.profilePhoto);

  // 🎯 VIDEO STATE FOR FIRST-TIME LOGIN
  const {
    video,
    tourVideoStatus,
    showTourModal
  } = useSelector((state: RootState) => state.videos);

  const [openMenu, setOpenMenu] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);

  const [desktopDrawerOpen, setDesktopDrawerOpen] = useState<boolean>(() => {
    const stored = localStorage.getItem("desktopDrawerOpen");
    return stored ? stored === "true" : true;
  });

  // 🎯 FIRST-TIME LOGIN: Load tour video and status on user login
  useEffect(() => {
    if (user) {
      // console.log('🎯 User logged in, checking tour video status...');
      // Load both video and user status in parallel
      Promise.all([
        dispatch(fetchTourVideo()),
        dispatch(fetchTourVideoStatus())
      ]).catch(error => {
        console.error('Failed to load tour video data:', error);
      });
    }
  }, [dispatch, user]);

  // 🎯 FIRST-TIME LOGIN: Auto-show modal with optimal timing
  useEffect(() => {
    if (!user) return; // Wait for user to be loaded

    const shouldAutoShow = (
      tourVideoStatus?.shouldShowTour && // User hasn't seen tour (hasSeedTourVideo = false)
      video && // Video exists
      video.isActive && // Video is active
      !showTourModal // Modal not already showing
    );

    if (shouldAutoShow) {
      // Smooth UX with appropriate delay for first-time users
      const timer = setTimeout(() => {
        console.log('🎥 AUTO-SHOWING tour video for first-time user!');
        dispatch(setShowTourModal(true)); // 🎯 TRIGGERS AUTO-SHOW!
      }, 1500); //  

      return () => clearTimeout(timer);
    }
  }, [tourVideoStatus, video, showTourModal, dispatch, user]);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setOpenMenu(prev => !prev);
  };

  const handleCloseUserMenu = () => {
    setOpenMenu(prev => !prev);
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setDesktopDrawerOpen(!desktopDrawerOpen);
      localStorage.setItem("desktopDrawerOpen", String(!desktopDrawerOpen));
    }
  };

  const handleTourModalClose = () => {
    dispatch(hideTourModal());
  };

  const menuItems = [
    { title: 'Dashboard', icon: <Dashboard sx={{ fontSize: 20 }} />, path: '/dashboard' },
    { title: 'Classroom', icon: <School sx={{ fontSize: 20 }} />, path: '/classroom' },
    {
      title: 'Community',
      icon: <Groups sx={{ fontSize: 20 }} />,
      path: '/community',
      isSpecial: true
    },
    { title: 'Calendar', icon: <CalendarMonth sx={{ fontSize: 20 }} />, path: '/calendar' },
    { title: 'Profile', icon: <Person sx={{ fontSize: 20 }} />, path: '/profile' },
    { title: 'Contact Us', icon: <ContactMail sx={{ fontSize: 20 }} />, path: 'mailto:info@uzumibi-jp.com', isExternalLink: true },
  ];

  if (user?.role === 'ADMIN') {
    menuItems.push({ title: 'Admin', icon: <AdminPanelSettings sx={{ fontSize: 20 }} />, path: '/admin' });
  }

  const drawerWidth = desktopDrawerOpen ? 240 : 72;

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar>
        {!isMobile && (
          <IconButton
            onClick={handleDrawerToggle}
            sx={{
              ml: 'auto',
              ...(desktopDrawerOpen && { ml: 'auto' }),
              ...(!desktopDrawerOpen && { mx: 'auto' }),
            }}
          >
            {desktopDrawerOpen ? <ChevronLeft /> : <ChevronRight />}
          </IconButton>
        )}
      </Toolbar>
      <Divider />
      <List sx={{ flexGrow: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.title} disablePadding>
            <Tooltip
              title={!desktopDrawerOpen && !isMobile ? item.title : ''}
              placement="right"
            >
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => {
                  if (item.isExternalLink) {
                    window.location.href = item.path;
                  }
                  else {
                    navigate(item.path);
                  }
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  minHeight: 48,
                  justifyContent: desktopDrawerOpen || isMobile ? 'initial' : 'center',
                  px: 2.5,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: desktopDrawerOpen || isMobile ? 3 : 'auto',
                    justifyContent: 'center',
                  }}
                >
                  {item.isSpecial && (
                    <Badge
                      badgeContent="NEW"
                      color="warning"
                      sx={{
                        '& .MuiBadge-badge': {
                          fontSize: '0.6rem',
                          height: 16,
                          minWidth: 30,
                          top: "-15px",
                          animation: 'pulse 2s infinite',
                          '@keyframes pulse': {
                            '0%': { transform: 'scale(1)', opacity: 1 },
                            '50%': { transform: 'scale(1.2)', opacity: 0.7 },
                            '100%': { transform: 'scale(1)', opacity: 1 },
                          },
                        },
                      }}
                    >
                      {item.icon}
                    </Badge>
                  )}
                  {!item.isSpecial && item.icon}
                </ListItemIcon>
                {(desktopDrawerOpen || isMobile) && (
                  <ListItemText primary={item.title} />
                )}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}

        {/* 🎯 VIDEO TOUR BUTTON IN SIDEBAR */}
        <VideoButton
          collapsed={!desktopDrawerOpen && !isMobile}
          inSidebar={true}
        />

      </List>

      <Divider sx={{ mt: 'auto' }} />
      {(desktopDrawerOpen || isMobile) && (
        <Box sx={{ p: 2 }}>
          <Stack spacing={1}>
            <Chip
              icon={<EmojiEvents sx={{ fontSize: 16 }} />}
              label={`${profile?.stats?.totalPoints || "0"} Points`}
              color="primary"
              variant="outlined"
              size="small"
            />
            <Chip
              label={`Level ${profile?.user?.level || "1"}`}
              color="secondary"
              size="small"
            />
          </Stack>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          background: 'white',
          color: 'text.primary',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            {(isMobile && mobileOpen) || (!isMobile && desktopDrawerOpen) ? (
              <MenuOpenIcon />
            ) : (
              <MenuIcon />
            )}
          </IconButton>

          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontWeight: 700, color: 'primary.main' }}
          >
            <Link to="/" style={{ color: "#5C633A", textDecoration: "none", display: "flex", alignItems: "center" }}>
              <Box
                component="img"
                src="/logo.png"
                alt="Logo"
                sx={isMobile ? { width: 150, height: 20 } : { width: 200, height: 30 }}
              />
            </Link>
          </Typography>

          <Stack direction="row" spacing={2} alignItems="center">
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar
                  src={profilePhoto || undefined}
                  sx={{
                    bgcolor: 'primary.main',
                    width: 40,
                    height: 40,
                    border: '2px solid',
                    borderColor: 'primary.light',
                  }}
                >
                  {!profilePhoto && (profile?.user?.name?.[0] || user?.email[0]?.toUpperCase())}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Stack>

          <Menu
            sx={{ mt: '45px' }}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            keepMounted
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={openMenu}
            onClose={handleCloseUserMenu}
          >
            <MenuItem onClick={() => { navigate('/profile'); handleCloseUserMenu(); }}>
              <ListItemIcon><Person sx={{ fontSize: 20 }} /></ListItemIcon>
              Profile
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon><Logout sx={{ fontSize: 20 }} /></ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Desktop Drawer */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              overflowX: 'hidden',
            },
          }}
        >
          {drawer}
        </Drawer>
      )}

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>

      <Box
        component="main"
        sx={{
          maxWidth: "100%",
          flexGrow: 1,
          bgcolor: 'background.default',
          p: 0,
          minHeight: 'calc(100vh - 64px)',
          mt: '64px',
          ml: isMobile ? 0 : 0,
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {children}
      </Box>

      {/* 🎯 FIRST-TIME LOGIN: Tour Video Modal */}
      <TourVideoModal
        open={showTourModal}
        onClose={handleTourModalClose}
        video={video}
        isFirstTimeUser={tourVideoStatus?.shouldShowTour || false}
      />
    </Box>
  );
};