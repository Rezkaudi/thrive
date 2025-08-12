import React from 'react';
import {
  Stack,
  Chip,
  IconButton,
} from '@mui/material';
import {
  CheckCircle,
  Fullscreen,
  FullscreenExit,
  Close,
  TextFields,
  Image,
  VideoLibrary,
  Quiz,
  Extension,
  Code,
  Slideshow,
} from '@mui/icons-material';

interface SlideHeaderProps {
  currentSlide: number;
  totalSlides: number;
  pointsReward: number;
  isFullscreen: boolean;
  slideType: string;
  onToggleFullscreen: () => void;
  onExitFullscreen: () => void;
}

export const SlideHeader: React.FC<SlideHeaderProps> = ({
  currentSlide,
  totalSlides,
  pointsReward,
  isFullscreen,
  slideType,
  onToggleFullscreen,
  onExitFullscreen,
}) => {
  const getSlideIcon = (type: string) => {
    switch (type) {
      case 'text': return <TextFields />;
      case 'image': return <Image />;
      case 'video': return <VideoLibrary />;
      case 'quiz': return <Quiz />;
      case 'interactive': return <Extension />;
      case 'code': return <Code />;
      default: return <Slideshow />;
    }
  };

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{
        p: 2,
        bgcolor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid',
        borderColor: 'divider',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Left Side - Slide Info */}
      <Stack direction="row" spacing={2} alignItems="center">
        <Chip
          icon={getSlideIcon(slideType)}
          label={`Slide ${currentSlide + 1} of ${totalSlides}`}
          size="small"
          sx={{
            fontWeight: 600,
            bgcolor: 'primary.50',
            '& .MuiChip-icon': {
              color: 'primary.main'
            }
          }}
        />
        {pointsReward > 0 && (
          <Chip
            icon={<CheckCircle />}
            label={`${pointsReward} points`}
            color="primary"
            size="small"
            sx={{
              color: 'white',
              fontWeight: 600,
              '& .MuiChip-icon': {
                color: 'white'
              }
            }}
          />
        )}
      </Stack>

      {/* Right Side - Controls */}
      <Stack direction="row" spacing={1}>
        {/* {isFullscreen && (
          <IconButton 
            onClick={onExitFullscreen} 
            sx={{ 
              bgcolor: 'action.hover',
              '&:hover': {
                bgcolor: 'action.selected'
              }
            }}
            title="Exit Fullscreen"
          >
            <Close />
          </IconButton>
        )} */}
        <IconButton
          onClick={onToggleFullscreen}
          sx={{
            bgcolor: 'action.hover',
            '&:hover': {
              bgcolor: 'action.selected'
            }
          }}
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
        </IconButton>
      </Stack>
    </Stack>
  );
};