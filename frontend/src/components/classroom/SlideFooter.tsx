import React, { useEffect, useRef, useCallback, useState } from 'react';
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
  HourglassEmpty,
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
  canNavigateToNext?: boolean;
  slides?: any[];
  // NEW: Props for auto-progression feedback
  validationResults?: Record<string, any>;
  showFeedback?: Record<string, boolean>;
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
  validationResults = {},
  showFeedback = {},
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const footerRef = useRef<HTMLDivElement>(null);

  // NEW: Enhanced state management for processing and transitions
  const [showAutoProgression, setShowAutoProgression] = useState(false);
  const [isProcessingValidation, setIsProcessingValidation] = useState(false);
  const [processingSlideIndex, setProcessingSlideIndex] = useState<number | null>(null);

  // Check if a slide at given index is accessible
  const isSlideAccessible = (index: number) => {
    if (index < currentSlide) return true;
    if (index === currentSlide) return true;

    for (let i = currentSlide; i < index; i++) {
      const slide = slides[i];
      if (slide && isQuizSlide(slide) && !slideProgress.has(i)) {
        return false;
      }
    }
    return true;
  };

  // Helper to check if slide is ONLY quiz type (not other interactive types)
  const isQuizSlide = (slide: any) => {
    return slide?.content?.type === 'quiz';
  };

  const currentSlideIsQuiz = slides[currentSlide] && isQuizSlide(slides[currentSlide]);
  const isQuizIncomplete = currentSlideIsQuiz && !slideProgress.has(currentSlide);

  // Helper function to get slide ID consistently
  const getSlideId = (slide: any) => {
    if (!slide) return '';
    if (slide.content?.type === 'quiz') {
      return `quiz-${slide.id}`;
    } else if (slide.content?.type === 'interactive') {
      const interactiveContent = slide.content.content;
      return `${interactiveContent?.type || 'interactive'}-${slide.id}`;
    }
    return slide.id || '';
  };

  // NEW: Enhanced validation monitoring with persistent processing state
  useEffect(() => {
    if (!currentSlideIsQuiz) {
      // Reset processing state when not on a quiz slide
      if (processingSlideIndex !== currentSlide) {
        setIsProcessingValidation(false);
        setShowAutoProgression(false);
        setProcessingSlideIndex(null);
      }
      return;
    }

    const currentSlide_slide = slides[currentSlide];
    const slideId = getSlideId(currentSlide_slide);
    const validation = validationResults[slideId];
    const isShowingFeedback = showFeedback[slideId];

    if (validation?.type === 'success' && isShowingFeedback && !isLastSlide) {
      setIsProcessingValidation(true);
      setShowAutoProgression(true);
      setProcessingSlideIndex(currentSlide);

      // Auto-advance after showing success feedback
      const advanceTimer = setTimeout(() => {
        onNext(); // This will trigger slide transition
        // Don't reset processing state here - let slide change handle it
      }, 2500);

      return () => {
        clearTimeout(advanceTimer);
      };
    } else if (validation?.type === 'error' && isShowingFeedback) {
      // Reset processing state on error
      setIsProcessingValidation(false);
      setShowAutoProgression(false);
      setProcessingSlideIndex(null);
    }
  }, [validationResults, showFeedback, currentSlide, currentSlideIsQuiz, isLastSlide, slides, onNext, processingSlideIndex]);

  // NEW: Handle slide change completion - reset processing state after transition
  useEffect(() => {
    if (processingSlideIndex !== null && processingSlideIndex !== currentSlide) {
      // Slide has changed, reset processing state after a brief delay to ensure smooth transition
      const resetTimer = setTimeout(() => {
        setIsProcessingValidation(false);
        setShowAutoProgression(false);
        setProcessingSlideIndex(null);
      }, 300); // Brief delay to complete any transitions

      return () => {
        clearTimeout(resetTimer);
      };
    }
  }, [currentSlide, processingSlideIndex]);

  // Determine if next button should be disabled
  const shouldDisableNext = () => {
    if (currentSlide >= totalSlides - 1) return true;
    if (!canNavigateToNext) return true;
    if (isQuizIncomplete) return true;
    if (isProcessingValidation) return true; // Keep disabled during processing
    return false;
  };

  // Keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const activeElement = document.activeElement;
    const isInputFocused = activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.tagName === 'SELECT' ||
      (activeElement as HTMLElement).contentEditable === 'true'
    );

    if (isInputFocused) return;

    if (['ArrowLeft', 'ArrowRight', 'Enter'].includes(event.key)) {
      event.preventDefault();
      event.stopPropagation();
    }

    switch (event.key) {
      case 'ArrowLeft':
        if (currentSlide > 0) {
          onPrevious();
        }
        break;
      case 'ArrowRight':
        if (!shouldDisableNext()) {
          onNext();
        }
        break;
      case 'Enter':
        if (isLastSlide && !isLessonCompleted) {
          onComplete();
        } else if (!shouldDisableNext()) {
          onNext();
        }
        break;
    }
  }, [currentSlide, totalSlides, canNavigateToNext, isLastSlide, isLessonCompleted, onPrevious, onNext, onComplete, shouldDisableNext]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    if (footerRef.current && document.activeElement === document.body) {
      footerRef.current.focus();
    }
  }, [currentSlide]);

  const handleFooterClick = useCallback(() => {
    if (footerRef.current) {
      footerRef.current.focus();
    }
  }, []);

  const handleButtonClick = useCallback((callback: () => void) => {
    return (event: React.MouseEvent) => {
      event.preventDefault();
      callback();
      setTimeout(() => {
        if (footerRef.current) {
          footerRef.current.focus();
        }
      }, 0);
    };
  }, []);

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

    const accessible = isSlideAccessible(index);
    const isCurrentSlideQuizType = slides[index] && isQuizSlide(slides[index]);
    const isIncompleteQuiz = isCurrentSlideQuizType && !slideProgress.has(index);

    return (
      <Tooltip
        key={index}
        title={
          !accessible
            ? 'Complete previous quiz activities to unlock'
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

  // Get next button text and icon based on state
  const getNextButtonConfig = () => {
    if (isProcessingValidation) {
      return {
        text: isMobile ? 'Moving...' : 'Moving to next slide...',
        icon: <HourglassEmpty sx={{
          animation: 'rotate 2s linear infinite',
          '@keyframes rotate': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' }
          }
        }} />,
        tooltip: 'Transitioning to next slide...'
      };
    }
    if (isQuizIncomplete) {
      return {
        text: isMobile ? 'Quiz' : (isTablet ? 'Complete Quiz' : 'Complete Quiz First'),
        icon: <Lock />,
        tooltip: 'Complete the quiz to continue'
      };
    }
    return {
      text: 'Next',
      icon: <NavigateNext />,
      tooltip: ''
    };
  };

  const nextButtonConfig = getNextButtonConfig();

  // Mobile Layout
  if (isMobile) {
    return (
      <Stack
        ref={footerRef}
        tabIndex={0}
        onClick={handleFooterClick}
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
          outline: 'none',
        }}
      >
        {/* Auto-progression indicator */}
        {/* {showAutoProgression && (
          <Fade in={showAutoProgression}>
            <Box sx={{ 
              p: 2, 
              bgcolor: 'success.light', 
              borderRadius: 2,
              textAlign: 'center',
              mb: 1 
            }}>
              <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                <AutoAwesome sx={{ color: 'success.dark' }} />
                <Typography variant="body2" color="success.dark" fontWeight={600}>
                  Great job! Moving to next slide...
                </Typography>
              </Stack>
            </Box>
          </Fade>
        )} */}

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
            onClick={handleButtonClick(onPrevious)}
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

          {isLastSlide ? (
            <Button
              variant="contained"
              color="success"
              onClick={handleButtonClick(onComplete)}
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
              title={nextButtonConfig.tooltip}
              arrow
            >
              <span>
                <Button
                  endIcon={nextButtonConfig.icon}
                  onClick={handleButtonClick(onNext)}
                  variant="contained"
                  disabled={shouldDisableNext()}
                  size="small"
                  sx={{
                    borderRadius: 2,
                    flex: 1,
                    fontWeight: 600,
                    background: isProcessingValidation
                      ? 'linear-gradient(45deg, #2196f3 30%, #64b5f6 90%)'
                      : isQuizIncomplete
                        ? 'linear-gradient(45deg, #9e9e9e 30%, #bdbdbd 90%)'
                        : 'linear-gradient(45deg, #5C633A 30%, #D4BC8C 90%)',
                    '&:hover': {
                      background: isProcessingValidation
                        ? 'linear-gradient(45deg, #2196f3 30%, #64b5f6 90%)'
                        : isQuizIncomplete
                          ? 'linear-gradient(45deg, #9e9e9e 30%, #bdbdbd 90%)'
                          : 'linear-gradient(45deg, #283618 30%, #C4AC7C 90%)',
                    },
                    '&:disabled': {
                      background: isProcessingValidation
                        ? 'linear-gradient(45deg, #2196f3 30%, #64b5f6 90%)'
                        : 'linear-gradient(45deg, #9e9e9e 30%, #bdbdbd 90%)',
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  {nextButtonConfig.text}
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
      ref={footerRef}
      direction="column"
      spacing={1}
      tabIndex={0}
      onClick={handleFooterClick}
      sx={{
        p: isTablet ? 2 : 3,
        bgcolor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid',
        borderColor: 'divider',
        position: 'sticky',
        bottom: 0,
        zIndex: 100,
        outline: 'none',
      }}
    >
      {/* Auto-progression indicator (desktop)
      {showAutoProgression && (
        <Fade in={showAutoProgression}>
          <Box sx={{ 
            p: 2, 
            bgcolor: 'success.light', 
            borderRadius: 2,
            textAlign: 'center',
            mb: 1 
          }}>
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
              <AutoAwesome sx={{ color: 'success.dark' }} />
              <Typography variant="body2" color="success.dark" fontWeight={600}>
                Great job! Moving to next slide...
              </Typography>
            </Stack>
          </Box>
        </Fade>
      )} */}

      {/* Main Navigation Row */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        {/* Previous Button */}
        <Button
          startIcon={<NavigateBefore />}
          onClick={handleButtonClick(onPrevious)}
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
        {isLastSlide ? (
          <Button
            variant="contained"
            color="success"
            onClick={handleButtonClick(onComplete)}
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
            title={nextButtonConfig.tooltip}
            arrow
          >
            <span>
              <Button
                endIcon={nextButtonConfig.icon}
                onClick={handleButtonClick(onNext)}
                variant="contained"
                disabled={shouldDisableNext()}
                size={isTablet ? "small" : "medium"}
                sx={{
                  borderRadius: 2,
                  px: isTablet ? 3 : 4,
                  py: isTablet ? 1 : 1.5,
                  minWidth: isTablet ? 100 : 120,
                  flexShrink: 0,
                  fontWeight: 600,
                  background: isProcessingValidation
                    ? 'linear-gradient(45deg, #2196f3 30%, #64b5f6 90%)'
                    : isQuizIncomplete
                      ? 'linear-gradient(45deg, #9e9e9e 30%, #bdbdbd 90%)'
                      : 'linear-gradient(45deg, #5C633A 30%, #D4BC8C 90%)',
                  '&:hover': {
                    background: isProcessingValidation
                      ? 'linear-gradient(45deg, #2196f3 30%, #64b5f6 90%)'
                      : isQuizIncomplete
                        ? 'linear-gradient(45deg, #9e9e9e 30%, #bdbdbd 90%)'
                        : 'linear-gradient(45deg, #283618 30%, #C4AC7C 90%)',
                    transform: (isQuizIncomplete || isProcessingValidation) ? 'none' : 'translateY(-1px)',
                    boxShadow: (isQuizIncomplete || isProcessingValidation) ? 1 : 4,
                  },
                  '&:disabled': {
                    background: isProcessingValidation
                      ? 'linear-gradient(45deg, #2196f3 30%, #64b5f6 90%)'
                      : 'linear-gradient(45deg, #9e9e9e 30%, #bdbdbd 90%)',
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                {nextButtonConfig.text}
              </Button>
            </span>
          </Tooltip>
        )}
      </Stack>
    </Stack>
  );
};