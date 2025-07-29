import React, { useState } from 'react';
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
  Notifications,
  AdminPanelSettings,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import { logout } from '../../store/slices/authSlice';
import { RootState, AppDispatch } from '../../store/store';

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
  const profile = useSelector((state: RootState) => state.dashboard.data);
  const profilePhoto = useSelector((state: RootState) => state.profile.data?.profilePhoto);

  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopDrawerOpen, setDesktopDrawerOpen] = useState(true);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setDesktopDrawerOpen(!desktopDrawerOpen);
    }
  };

  const menuItems = [
    { title: 'Dashboard', icon: <Dashboard sx={{ fontSize: 20 }} />, path: '/dashboard' },
    { title: 'Classroom', icon: <School sx={{ fontSize: 20 }} />, path: '/classroom' },
    { title: 'Community', icon: <Groups sx={{ fontSize: 20 }} />, path: '/community' },
    { title: 'Calendar', icon: <CalendarMonth sx={{ fontSize: 20 }} />, path: '/calendar' },
    { title: 'Profile', icon: <Person sx={{ fontSize: 20 }} />, path: '/profile' },
  ];

  if (user?.role === 'ADMIN') {
    menuItems.push({ title: 'Admin', icon: <AdminPanelSettings sx={{ fontSize: 20 }} />, path: '/admin' });
  }

  const drawerWidth = desktopDrawerOpen ? 240 : 72;

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar>
        {(isMobile || desktopDrawerOpen) && (
          <Typography variant="h6" fontWeight={700} color="primary">
            Thrive in Japan
          </Typography>
        )}
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
            <Tooltip title={!desktopDrawerOpen && !isMobile ? item.title : ''} placement="right">
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => {
                  navigate(item.path);
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
                  {item.icon}
                </ListItemIcon>
                {(desktopDrawerOpen || isMobile) && (
                  <ListItemText primary={item.title} />
                )}
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ mt: 'auto' }} />
      {(desktopDrawerOpen || isMobile) && (
        <Box sx={{ p: 2 }}>
          <Stack spacing={1}>
            <Chip
              icon={<EmojiEvents sx={{ fontSize: 16 }} />}
              label={`${profile?.stats.totalPoints || "0"} Points`}
              color="primary"
              variant="outlined"
              size="small"
            />
            <Chip
              label={`Level ${profile?.user.level || "1"}`}
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
            <Link to="/" style={{ color: "#FF6B6B", textDecoration: "none" }}>
              Thrive in Japan
            </Link>
          </Typography>

          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton color="inherit">
              <Badge badgeContent={3} color="error">
                <Notifications sx={{ fontSize: 20 }} />
              </Badge>
            </IconButton>

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
                  {!profilePhoto && (profile?.user.name?.[0] || user?.email[0].toUpperCase())}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Stack>

          <Menu
            sx={{ mt: '45px' }}
            anchorEl={anchorElUser}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
          >
            <MenuItem onClick={() => { navigate('/profile'); handleCloseUserMenu(); }}>
              <ListItemIcon>
                <Person sx={{ fontSize: 20 }} />
              </ListItemIcon>
              Profile
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout sx={{ fontSize: 20 }} />
              </ListItemIcon>
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
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 240,
          },
        }}
      >
        {drawer}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: 0,
          minHeight: 'calc(100vh - 64px)',
          mt: '64px',
          ml: isMobile ? 0 : 0, // Remove left margin as drawer is now collapsible
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {children}
      </Box>
    </Box>
  );
};