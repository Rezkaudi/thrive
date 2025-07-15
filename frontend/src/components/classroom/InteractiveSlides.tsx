// frontend/src/components/classroom/InteractiveSlides.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  LinearProgress,
  Chip,
  IconButton,
  Paper,
  Fade,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Alert,
} from '@mui/material';
import {
  NavigateNext,
  NavigateBefore,
  Fullscreen,
  FullscreenExit,
  CheckCircle,
  Slideshow,
  Quiz,
  TextFields,
  Image,
  VideoLibrary,
  Code,
  DragIndicator,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface SlideContent {
  type: 'text' | 'image' | 'video' | 'quiz' | 'interactive' | 'code';
  content: any;
  title?: string;
  subtitle?: string;
}

interface Slide {
  id: string;
  content: SlideContent;
  backgroundImage?: string;
  backgroundColor?: string;
  notes?: string;
}

interface InteractiveSlidesProps {
  slides: Slide[];
  onComplete: () => void;
  pointsReward: number;
  isLessonCompleted?: boolean;
}

const MotionBox = motion(Box);

export const InteractiveSlides: React.FC<InteractiveSlidesProps> = ({
  slides,
  onComplete,
  pointsReward = 0,
  isLessonCompleted = false,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [slideProgress, setSlideProgress] = useState<Set<number>>(new Set());
  const [interactiveAnswers, setInteractiveAnswers] = useState<Record<string, any>>({});
  const [showFeedback, setShowFeedback] = useState<Record<string, boolean>>({});

  const slide = slides[currentSlide];
  const progress = ((currentSlide + 1) / slides.length) * 100;
  const isLastSlide = currentSlide === slides.length - 1;

  useEffect(() => {
    // Mark slide as viewed
    setSlideProgress(prev => new Set(prev).add(currentSlide));
  }, [currentSlide]);

  const handleNext = () => {
    if (!isLastSlide) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleComplete = () => {
    if (slideProgress.size === slides.length) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      onComplete();
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleInteractiveAnswer = (slideId: string, answer: any) => {
    setInteractiveAnswers(prev => ({
      ...prev,
      [slideId]: answer
    }));
  };

  const checkAnswer = (slideId: string, correctAnswer: any) => {
    const userAnswer = interactiveAnswers[slideId];
    const isCorrect = JSON.stringify(userAnswer) === JSON.stringify(correctAnswer);
    
    setShowFeedback(prev => ({
      ...prev,
      [slideId]: true
    }));

    if (isCorrect) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    }

    return isCorrect;
  };

  const renderSlideContent = (slide: Slide) => {
    const { content } = slide;

    switch (content.type) {
      case 'text':
        return (
          <Box sx={{ textAlign: 'center', p: 4 }}>
            {content.title && (
              <Typography variant="h3" fontWeight={700} gutterBottom>
                {content.title}
              </Typography>
            )}
            {content.subtitle && (
              <Typography variant="h5" color="text.secondary" gutterBottom>
                {content.subtitle}
              </Typography>
            )}
            <Typography variant="body1" sx={{ mt: 3, fontSize: '1.2rem', lineHeight: 1.8 }}>
              {content.content}
            </Typography>
          </Box>
        );

      case 'image':
        return (
          <Box sx={{ textAlign: 'center', p: 4 }}>
            {content.title && (
              <Typography variant="h4" fontWeight={600} gutterBottom>
                {content.title}
              </Typography>
            )}
            <Box
              component="img"
              src={content.content.url}
              alt={content.content.alt || 'Slide image'}
              sx={{
                maxWidth: '100%',
                maxHeight: '60vh',
                objectFit: 'contain',
                borderRadius: 2,
                boxShadow: 3,
              }}
            />
            {content.content.caption && (
              <Typography variant="caption" display="block" sx={{ mt: 2 }}>
                {content.content.caption}
              </Typography>
            )}
          </Box>
        );

      case 'video':
        return (
          <Box sx={{ textAlign: 'center', p: 4 }}>
            {content.title && (
              <Typography variant="h4" fontWeight={600} gutterBottom>
                {content.title}
              </Typography>
            )}
            <Box
              component="video"
              controls
              src={content.content.url}
              sx={{
                maxWidth: '100%',
                maxHeight: '60vh',
                borderRadius: 2,
                boxShadow: 3,
              }}
            />
          </Box>
        );

      case 'quiz':
        const quizId = `quiz-${slide.id}`;
        const userAnswer = interactiveAnswers[quizId];
        const showQuizFeedback = showFeedback[quizId];
        
        return (
          <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
            <Typography variant="h4" fontWeight={600} gutterBottom>
              {content.content.question}
            </Typography>
            
            {content.content.type === 'multiple-choice' ? (
              <RadioGroup
                value={userAnswer || ''}
                onChange={(e) => handleInteractiveAnswer(quizId, e.target.value)}
              >
                {content.content.options.map((option: string, index: number) => (
                  <FormControlLabel
                    key={index}
                    value={index.toString()}
                    control={<Radio />}
                    label={option}
                    sx={{
                      mb: 2,
                      p: 2,
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  />
                ))}
              </RadioGroup>
            ) : (
              <TextField
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                placeholder="Type your answer here..."
                value={userAnswer || ''}
                onChange={(e) => handleInteractiveAnswer(quizId, e.target.value)}
                sx={{ mt: 3 }}
              />
            )}

            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <Button
                variant="contained"
                onClick={() => checkAnswer(quizId, content.content.correctAnswer)}
                disabled={!userAnswer}
              >
                Check Answer
              </Button>
            </Stack>

            {showQuizFeedback && (
              <Fade in>
                <Alert
                  severity={
                    userAnswer === content.content.correctAnswer.toString()
                      ? 'success'
                      : 'error'
                  }
                  sx={{ mt: 2 }}
                >
                  {userAnswer === content.content.correctAnswer.toString()
                    ? 'Correct! ' + (content.content.explanation || '')
                    : 'Not quite. ' + (content.content.explanation || '')}
                </Alert>
              </Fade>
            )}
          </Box>
        );

      case 'interactive':
        return (
          <Box sx={{ p: 4 }}>
            {content.title && (
              <Typography variant="h4" fontWeight={600} gutterBottom>
                {content.title}
              </Typography>
            )}
            {/* Custom interactive content based on content.content */}
            <Box sx={{ mt: 3 }}>
              {content.content.type === 'drag-drop' && (
                <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
                  <Typography variant="body1" gutterBottom>
                    Drag and drop activity
                  </Typography>
                  {/* Implement drag-drop functionality */}
                </Paper>
              )}
              {content.content.type === 'fill-blanks' && (
                <Box>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    Fill in the blanks:
                  </Typography>
                  {/* Implement fill-in-the-blanks */}
                </Box>
              )}
            </Box>
          </Box>
        );

      case 'code':
        return (
          <Box sx={{ p: 4 }}>
            {content.title && (
              <Typography variant="h4" fontWeight={600} gutterBottom>
                {content.title}
              </Typography>
            )}
            <Paper
              sx={{
                p: 2,
                bgcolor: 'grey.900',
                color: 'common.white',
                fontFamily: 'monospace',
                overflow: 'auto',
                maxHeight: '60vh',
              }}
            >
              <pre style={{ margin: 0 }}>
                <code>{content.content.code}</code>
              </pre>
            </Paper>
            {content.content.language && (
              <Chip
                label={content.content.language}
                size="small"
                sx={{ mt: 1 }}
              />
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  const getSlideIcon = (type: string) => {
    switch (type) {
      case 'text': return <TextFields />;
      case 'image': return <Image />;
      case 'video': return <VideoLibrary />;
      case 'quiz': return <Quiz />;
      case 'interactive': return <DragIndicator />;
      case 'code': return <Code />;
      default: return <Slideshow />;
    }
  };

  return (
    <Box
      sx={{
        height: isFullscreen ? '100vh' : 'calc(100vh - 200px)',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: slide.backgroundColor || 'background.default',
        backgroundImage: slide.backgroundImage ? `url(${slide.backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          p: 2,
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Chip
            icon={getSlideIcon(slide.content.type)}
            label={`Slide ${currentSlide + 1} / ${slides.length}`}
            size="small"
          />
          {pointsReward > 0 && (
            <Chip
              icon={<CheckCircle />}
              label={`${pointsReward} points`}
              color="primary"
              size="small"
            />
          )}
        </Stack>
        <IconButton onClick={toggleFullscreen}>
          {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
        </IconButton>
      </Stack>

      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{ height: 6 }}
      />

      {/* Slide Content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AnimatePresence mode="wait">
          <MotionBox
            key={currentSlide}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            sx={{ width: '100%', maxWidth: 1200, mx: 'auto' }}
          >
            <Card sx={{ m: 3, bgcolor: 'rgba(255, 255, 255, 0.95)' }}>
              <CardContent sx={{ p: 0 }}>
                {renderSlideContent(slide)}
              </CardContent>
            </Card>
          </MotionBox>
        </AnimatePresence>
      </Box>

      {/* Navigation */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          p: 3,
          bgcolor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Button
          startIcon={<NavigateBefore />}
          onClick={handlePrevious}
          disabled={currentSlide === 0}
        >
          Previous
        </Button>

        <Stack direction="row" spacing={1}>
          {slides.map((_, index) => (
            <Box
              key={index}
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                bgcolor: index === currentSlide
                  ? 'primary.main'
                  : slideProgress.has(index)
                  ? 'success.main'
                  : 'grey.300',
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </Stack>

        {isLastSlide && slideProgress.size === slides.length ? (
          <Button
            variant="contained"
            color="success"
            onClick={handleComplete}
            disabled={isLessonCompleted}
            endIcon={<CheckCircle />}
          >
            {isLessonCompleted ? 'Completed' : 'Complete Lesson'}
          </Button>
        ) : (
          <Button
            endIcon={<NavigateNext />}
            onClick={handleNext}
            variant="contained"
          >
            Next
          </Button>
        )}
      </Stack>
    </Box>
  );
};