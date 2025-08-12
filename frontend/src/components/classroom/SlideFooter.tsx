// Resolved SlideFooter.tsx combining responsive design + quiz validation

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
  Lock,
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
  canNavigateToNext?: boolean; // Quiz validation prop
  slides?: any[]; // Slide data for type checking
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
  canNavigateToNext = true,
  slides = [],
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Check if a slide at given index is accessible
  const isSlideAccessible = (index: number) => {
    // Can always go back
    if (index < currentSlide) return true;

    // Current slide is always accessible
    if (index === currentSlide) return true;

    // For future slides, check if all previous slides (especially quizzes) are completed
    for (let i = currentSlide; i < index; i++) {
      if (slides[i]?.content?.type === 'quiz' && !slideProgress.has(i)) {
        return false;
      }
    }

    return true;
  };

  const currentSlideIsQuiz = slides[currentSlide]?.content?.type === 'quiz';
  const isQuizIncomplete = currentSlideIsQuiz && !slideProgress.has(currentSlide);

  // Function to get visible slide indices (for responsive design)
  const getVisibleSlides = () => {
    const maxVisible = isMobile ? 5 : isTablet ? 6 : 7;

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
        visible.push(-1); // ellipsis
      }
    }

    for (let i = start; i <= end; i++) {
      visible.push(i);
    }

    if (end < totalSlides - 1) {
      if (end < totalSlides - 2) {
        visible.push(-2); // ellipsis
      }
      visible.push(totalSlides - 1);
    }

    return visible;
  };

  const visibleSlides = getVisibleSlides();

  const renderDot = (index: number) => {
    // Handle ellipsis dots
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

    // Regular slide dots with accessibility check
    const accessible = isSlideAccessible(index);
    const isQuizSlide = slides[index]?.content?.type === 'quiz';
    const isIncompleteQuiz = isQuizSlide && !slideProgress.has(index);

    return (
      <Tooltip
        key={index}
        title={
          !accessible
            ? 'Complete previous quiz to unlock'
            : isIncompleteQuiz && index === currentSlide
              ? 'Complete this quiz to proceed'
              : `Slide ${index + 1}${slideProgress.has(index) ? ' - Completed' : ''}`
        }
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
                : accessible
                  ? 'grey.300'
                  : 'grey.100',
            cursor: accessible ? 'pointer' : 'not-allowed',
            transition: 'all 0.3s ease',
            border: '2px solid transparent',
            flexShrink: 0,
            position: 'relative',
            '&:hover': accessible ? {
              transform: isMobile ? 'scale(1.2)' : 'scale(1.3)',
              boxShadow: 2,
              borderColor: index === currentSlide
                ? 'primary.dark'
                : slideProgress.has(index)
                  ? 'success.dark'
                  : 'grey.500'
            } : {},
            // Show lock icon overlay for inaccessible slides
            '&::after': !accessible ? {
              content: '""',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: isMobile ? 6 : 8,
              height: isMobile ? 6 : 8,
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23666'%3E%3Cpath d='M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6z'/%3E%3C/svg%3E")`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
            } : {}
          }}
          onClick={() => accessible && onSlideClick(index)}
        />
      </Tooltip>
    );
  };

  // Mobile Layout
  if (isMobile) {
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
            Prev
          </Button>

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
                minWidth: isTablet ? 100 : 120,
                flexShrink: 0,
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
            <Tooltip
              title={isQuizIncomplete ? 'Complete the quiz to continue' : ''}
              arrow
            >
              <span>
                <Button
                  endIcon={isQuizIncomplete ? <Lock /> : <NavigateNext />}
                  onClick={onNext}
                  variant="contained"
                  disabled={currentSlide >= totalSlides - 1 || !canNavigateToNext}
                  size="small"
                  sx={{
                    borderRadius: 2,
                    flex: 1,
                    fontWeight: 600,
                    background: isQuizIncomplete
                      ? 'linear-gradient(45deg, #9e9e9e 30%, #bdbdbd 90%)'
                      : 'linear-gradient(45deg, #5C633A 30%, #D4BC8C 90%)',
                    '&:hover': {
                      background: isQuizIncomplete
                        ? 'linear-gradient(45deg, #9e9e9e 30%, #bdbdbd 90%)'
                        : 'linear-gradient(45deg, #283618 30%, #C4AC7C 90%)',
                    },
                    '&:disabled': {
                      background: 'linear-gradient(45deg, #9e9e9e 30%, #bdbdbd 90%)',
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isQuizIncomplete ? 'Quiz' : 'Next'}
                </Button>
              </span>
            </Tooltip>
          )}
        </Stack>
      </Stack>
    );
  }

  // Desktop/Tablet Layout
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
        <Tooltip
          title={isQuizIncomplete ? 'Complete the quiz to continue' : ''}
          arrow
        >
          <span>
            <Button
              endIcon={isQuizIncomplete ? <Lock /> : <NavigateNext />}
              onClick={onNext}
              variant="contained"
              disabled={currentSlide >= totalSlides - 1 || !canNavigateToNext}
              size={isTablet ? "small" : "medium"}
              sx={{
                borderRadius: 2,
                px: isTablet ? 3 : 4,
                py: isTablet ? 1 : 1.5,
                minWidth: isTablet ? 100 : 120,
                flexShrink: 0,
                fontWeight: 600,
                background: isQuizIncomplete
                  ? 'linear-gradient(45deg, #9e9e9e 30%, #bdbdbd 90%)'
                  : 'linear-gradient(45deg, #5C633A 30%, #D4BC8C 90%)',
                '&:hover': {
                  background: isQuizIncomplete
                    ? 'linear-gradient(45deg, #9e9e9e 30%, #bdbdbd 90%)'
                    : 'linear-gradient(45deg, #283618 30%, #C4AC7C 90%)',
                  transform: isQuizIncomplete ? 'none' : 'translateY(-1px)',
                  boxShadow: isQuizIncomplete ? 1 : 4,
                },
                '&:disabled': {
                  background: 'linear-gradient(45deg, #9e9e9e 30%, #bdbdbd 90%)',
                },
                transition: 'all 0.2s ease'
              }}
            >
              {isQuizIncomplete ? (isTablet ? 'Quiz' : 'Complete Quiz First') : 'Next'}
            </Button>
          </span>
        </Tooltip>
      )}
    </Stack>
  );
};