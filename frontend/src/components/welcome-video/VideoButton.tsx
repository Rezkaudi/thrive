// frontend/src/components/video/VideoButton.tsx
import React from 'react';
import {
  IconButton,
  Tooltip,
  Badge,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  PlayCircleFilled,
  VideoLibrary
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { setShowTourModal } from '../../store/slices/videoSlice';

interface VideoButtonProps {
  collapsed?: boolean; // Whether sidebar is collapsed
  inSidebar?: boolean; // Whether this is in the sidebar or standalone
}

export const VideoButton: React.FC<VideoButtonProps> = ({ 
  collapsed = false, 
  inSidebar = false 
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { video, tourVideoStatus } = useSelector((state: RootState) => state.videos);

  const handleOpenTourVideo = () => {
    dispatch(setShowTourModal(true)); // Open modal manually
  };

  const hasUnviewedTour = tourVideoStatus && !tourVideoStatus.hasSeenTour;
  const hasActiveVideo = video && video.isActive;

  // Don't show button if no active video
  if (!hasActiveVideo) {
    return null;
  }

  if (inSidebar) {
    // Sidebar version
    return (
      <ListItem disablePadding>
        <Tooltip
          title={collapsed ? 'Watch Tour Video' : ''}
          placement="right"
        >
          <ListItemButton
            onClick={handleOpenTourVideo}
            sx={{
              minHeight: 48,
              justifyContent: collapsed ? 'center' : 'initial',
              px: 2.5,
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: collapsed ? 'auto' : 3,
                justifyContent: 'center',
              }}
            >
              <Badge
                badgeContent={hasUnviewedTour ? "NEW" : null}
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.6rem',
                    height: 16,
                    minWidth: 30,
                    animation: hasUnviewedTour ? 'pulse 2s infinite' : 'none',
                    '@keyframes pulse': {
                      '0%': { transform: 'scale(1)', opacity: 1 },
                      '50%': { transform: 'scale(1.1)', opacity: 0.7 },
                      '100%': { transform: 'scale(1)', opacity: 1 },
                    },
                  },
                }}
              >
                <PlayCircleFilled 
                  sx={{ 
                    fontSize: 20,
                    color: hasUnviewedTour ? 'warning.main' : 'text.secondary'
                  }} 
                />
              </Badge>
            </ListItemIcon>
            {!collapsed && (
              <ListItemText 
                primary="Tour Video" 
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: hasUnviewedTour ? 600 : 400
                }}
              />
            )}
          </ListItemButton>
        </Tooltip>
      </ListItem>
    );
  }

  // Standalone version (for header)
  return (
    <Tooltip title="Watch Tour Video">
      <IconButton
        onClick={handleOpenTourVideo}
        color={hasUnviewedTour ? 'warning' : 'default'}
        sx={{
          animation: hasUnviewedTour ? 'pulse 2s infinite' : 'none',
          '@keyframes pulse': {
            '0%': { transform: 'scale(1)', opacity: 1 },
            '50%': { transform: 'scale(1.1)', opacity: 0.7 },
            '100%': { transform: 'scale(1)', opacity: 1 },
          },
        }}
      >
        <Badge
          badgeContent={hasUnviewedTour ? "!" : null}
          color="error"
        >
          <VideoLibrary />
        </Badge>
      </IconButton>
    </Tooltip>
  );
};