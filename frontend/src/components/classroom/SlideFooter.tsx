// components/SlideFooter.tsx
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
        {Array.from({ length: totalSlides }, (_, index) => (
          <Tooltip
            key={index}
            title={`Slide ${index + 1}${slideProgress.has(index) ? ' - Completed' : ''}`}
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
                    : 'grey.300',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: '2px solid transparent',
                '&:hover': {
                  transform: 'scale(1.3)',
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
        ))}
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
        <Button
          endIcon={<NavigateNext />}
          onClick={onNext}
          variant="contained"
          disabled={currentSlide >= totalSlides - 1}
          sx={{
            borderRadius: 2,
            px: 4,
            py: 1.5,
            minWidth: 120,
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