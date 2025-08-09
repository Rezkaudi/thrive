// components/SlideFooter.tsx
import React from 'react';
import {
  Stack,
  Button,
  Box,
  Tooltip,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  NavigateNext,
  NavigateBefore,
  CheckCircle,
  MoreHoriz,
} from '@mui/icons-material';

interface SlideFooterProps {
  currentSlide: number;
  totalSlides: number;
  slideProgress: Set<number>;
  isLessonCompleted: boolean;
  isLastSlide: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onComplete: () => void;
  onSlideClick: (index: number) => void;
}

export const SlideFooter: React.FC<SlideFooterProps> = ({
  currentSlide,
  totalSlides,
  slideProgress,
  isLessonCompleted,
  isLastSlide,
  onPrevious,
  onNext,
  onComplete,
  onSlideClick,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Function to get visible slide indices
  const getVisibleSlides = () => {
    const maxVisible = isMobile ? 5 : isTablet ? 6 : 7; // Fewer dots on smaller screens
    
    if (totalSlides <= maxVisible) {
      return Array.from({ length: totalSlides }, (_, i) => i);
    }
    
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(0, currentSlide - half);
    let end = Math.min(totalSlides - 1, start + maxVisible - 1);
    
    if (end - start < maxVisible - 1) {
      start = Math.max(0, end - maxVisible + 1);
    }
    
    const visible = [];
    
    if (start > 0) {
      visible.push(0);
      if (start > 1) {
        visible.push(-1);
      }
    }
    
    for (let i = start; i <= end; i++) {
      visible.push(i);
    }
    
    if (end < totalSlides - 1) {
      if (end < totalSlides - 2) {
        visible.push(-2);
      }
      visible.push(totalSlides - 1);
    }
    
    return visible;
  };

  const visibleSlides = getVisibleSlides();

  const renderDot = (index: number) => {
    if (index === -1 || index === -2) {
      return (
        <Box
          key={`ellipsis-${index}`}
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: isMobile ? 0.5 : 1,
          }}
        >
          <MoreHoriz sx={{ 
            color: 'grey.400', 
            fontSize: isMobile ? 12 : 16 
          }} />
        </Box>
      );
    }

    return (
      <Tooltip
        key={index}
        title={`Slide ${index + 1}${slideProgress.has(index) ? ' - Completed' : ''}`}
        arrow
      >
        <Box
          sx={{
            width: isMobile ? 8 : 12,
            height: isMobile ? 8 : 12,
            borderRadius: '50%',
            bgcolor: index === currentSlide
              ? 'primary.main'
              : slideProgress.has(index)
                ? 'success.main'
                : 'grey.300',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            border: '2px solid transparent',
            flexShrink: 0,
            '&:hover': {
              transform: isMobile ? 'scale(1.2)' : 'scale(1.3)',
              boxShadow: 2,
              borderColor: index === currentSlide
                ? 'primary.dark'
                : slideProgress.has(index)
                  ? 'success.dark'
                  : 'grey.500'
            }
          }}
          onClick={() => onSlideClick(index)}
        />
      </Tooltip>
    );
  };

  if (isMobile) {
    // Mobile Layout - Stack vertically
    return (
      <Stack
        spacing={2}
        sx={{
          p: 2,
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid',
          borderColor: 'divider',
          position: 'sticky',
          bottom: 0,
          zIndex: 100,
        }}
      >
        {/* Progress Section */}
        <Stack alignItems="center" spacing={1}>
          <Stack direction="row" spacing={0.5} alignItems="center">
            {visibleSlides.map(renderDot)}
          </Stack>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontSize: '0.7rem',
              fontWeight: 500,
            }}
          >
            {currentSlide + 1} of {totalSlides}
          </Typography>
        </Stack>

        {/* Buttons Row */}
        <Stack direction="row" spacing={2} justifyContent="space-between">
          <Button
            startIcon={<NavigateBefore />}
            onClick={onPrevious}
            disabled={currentSlide === 0}
            variant="outlined"
            size="small"
            sx={{ 
              borderRadius: 2,
              flex: 1,
              '&:disabled': {
                opacity: 0.5
              }
            }}
          >
            Prev
          </Button>

          {isLastSlide && slideProgress.size === totalSlides ? (
            <Button
              variant="contained"
              color="success"
              onClick={onComplete}
              disabled={isLessonCompleted}
              endIcon={<CheckCircle />}
              size="small"
              sx={{
                borderRadius: 2,
                flex: 1,
                fontWeight: 600,
                background: 'linear-gradient(45deg, #4caf50 30%, #8bc34a 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #45a049 30%, #7cb342 90%)',
                },
                '&:disabled': {
                  opacity: 0.6,
                  background: 'grey.400'
                },
                transition: 'all 0.2s ease'
              }}
            >
              {isLessonCompleted ? 'Done' : 'Complete'}
            </Button>
          ) : (
            <Button
              endIcon={<NavigateNext />}
              onClick={onNext}
              variant="contained"
              disabled={currentSlide >= totalSlides - 1}
              size="small"
              sx={{
                borderRadius: 2,
                flex: 1,
                fontWeight: 600,
                background: 'linear-gradient(45deg, #5C633A 30%, #D4BC8C 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #283618 30%, #C4AC7C 90%)',
                },
                transition: 'all 0.2s ease'
              }}
            >
              Next
            </Button>
          )}
        </Stack>
      </Stack>
    );
  }

  // Desktop/Tablet Layout - Horizontal
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{
        p: isTablet ? 2 : 3,
        bgcolor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid',
        borderColor: 'divider',
        position: 'sticky',
        bottom: 0,
        zIndex: 100,
      }}
    >
      {/* Previous Button */}
      <Button
        startIcon={<NavigateBefore />}
        onClick={onPrevious}
        disabled={currentSlide === 0}
        variant="outlined"
        size={isTablet ? "small" : "medium"}
        sx={{ 
          borderRadius: 2,
          minWidth: isTablet ? 100 : 120,
          flexShrink: 0,
          '&:disabled': {
            opacity: 0.5
          }
        }}
      >
        Previous
      </Button>

      {/* Center Section - Dots + Progress Text */}
      <Stack alignItems="center" spacing={1} sx={{ flex: 1, mx: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          {visibleSlides.map(renderDot)}
        </Stack>
        
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            fontSize: isTablet ? '0.7rem' : '0.75rem',
            fontWeight: 500,
          }}
        >
          {currentSlide + 1} of {totalSlides}
        </Typography>
      </Stack>

      {/* Next/Complete Button */}
      {isLastSlide && slideProgress.size === totalSlides ? (
        <Button
          variant="contained"
          color="success"
          onClick={onComplete}
          disabled={isLessonCompleted}
          endIcon={<CheckCircle />}
          size={isTablet ? "small" : "medium"}
          sx={{
            borderRadius: 2,
            px: isTablet ? 3 : 4,
            py: isTablet ? 1 : 1.5,
            minWidth: isTablet ? 100 : 120,
            flexShrink: 0,
            fontWeight: 600,
            background: 'linear-gradient(45deg, #4caf50 30%, #8bc34a 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #45a049 30%, #7cb342 90%)',
              transform: 'translateY(-1px)',
              boxShadow: 4,
            },
            '&:disabled': {
              opacity: 0.6,
              background: 'grey.400'
            },
            transition: 'all 0.2s ease'
          }}
        >
          {isLessonCompleted ? 'Completed' : (isTablet ? 'Complete' : 'Complete Lesson')}
        </Button>
      ) : (
        <Button
          endIcon={<NavigateNext />}
          onClick={onNext}
          variant="contained"
          disabled={currentSlide >= totalSlides - 1}
          size={isTablet ? "small" : "medium"}
          sx={{
            borderRadius: 2,
            px: isTablet ? 3 : 4,
            py: isTablet ? 1 : 1.5,
            minWidth: isTablet ? 100 : 120,
            flexShrink: 0,
            fontWeight: 600,
            background: 'linear-gradient(45deg, #5C633A 30%, #D4BC8C 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #283618 30%, #C4AC7C 90%)',
              transform: 'translateY(-1px)',
              boxShadow: 4,
            },
            transition: 'all 0.2s ease'
          }}
        >
          Next
        </Button>
      )}
    </Stack>
  );
};