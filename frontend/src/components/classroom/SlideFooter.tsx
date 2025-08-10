// Updated SlideFooter.tsx to handle quiz validation

import React from 'react';
import {
  Stack,
  Button,
  Box,
  Tooltip,
} from '@mui/material';
import {
  NavigateNext,
  NavigateBefore,
  CheckCircle,
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
  canNavigateToNext?: boolean; // NEW prop
  slides?: any[]; // NEW prop to check slide types
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

  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{
        p: 3,
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
        sx={{
          borderRadius: 2,
          minWidth: 120,
          '&:disabled': {
            opacity: 0.5
          }
        }}
      >
        Previous
      </Button>

      {/* Slide Progress Dots */}
      <Stack direction="row" spacing={1} alignItems="center">
        {Array.from({ length: totalSlides }, (_, index) => {
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
                  width: 12,
                  height: 12,
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
                  position: 'relative',
                  '&:hover': accessible ? {
                    transform: 'scale(1.3)',
                    boxShadow: 2,
                    borderColor: index === currentSlide
                      ? 'primary.dark'
                      : slideProgress.has(index)
                        ? 'success.dark'
                        : 'grey.500'
                  } : {},
                  // Show lock icon for inaccessible slides
                  '&::after': !accessible ? {
                    content: '""',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 8,
                    height: 8,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23666'%3E%3Cpath d='M12 2C9.243 2 7 4.243 7 7v5a5 5 0 0 0 10 0V7c0-2.757-2.243-5-5-5z'/%3E%3C/svg%3E")`,
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                  } : {}
                }}
                onClick={() => accessible && onSlideClick(index)}
              />
            </Tooltip>
          );
        })}
      </Stack>

      {/* Next/Complete Button */}
      {isLastSlide && slideProgress.size === totalSlides ? (
        <Button
          variant="contained"
          color="success"
          onClick={onComplete}
          disabled={isLessonCompleted}
          endIcon={<CheckCircle />}
          sx={{
            borderRadius: 2,
            px: 4,
            py: 1.5,
            minWidth: 120,
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
          {isLessonCompleted ? 'Completed' : 'Complete Lesson'}
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
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
                minWidth: 120,
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
              {isQuizIncomplete ? 'Complete Quiz First' : 'Next'}
            </Button>
          </span>
        </Tooltip>
      )}
    </Stack>
  );
};