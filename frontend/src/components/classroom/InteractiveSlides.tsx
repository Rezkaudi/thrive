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
  Alert,
  Grid,
  Skeleton,
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
  TouchApp,
  RecordVoiceOver,
  Hearing,
  Extension,
  CompareArrows,
  SortByAlpha,
  Timeline,
  SwapHoriz,
  LinearScale,
  Category,
  Translate,
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
  const [draggedItem, setDraggedItem] = useState<any>(null);
  const [connections, setConnections] = useState<Record<string, string>>({});
  const [sortedItems, setSortedItems] = useState<string[]>([]);
  const [timelineOrder, setTimelineOrder] = useState<any[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const slide = slides[currentSlide];
  const progress = ((currentSlide + 1) / slides.length) * 100;
  const isLastSlide = currentSlide === slides.length - 1;

  useEffect(() => {
    if (slide) {
      setSlideProgress(prev => new Set(prev).add(currentSlide));
    }
  }, [currentSlide, slide]);

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
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const checkAnswer = (slideId: string, userAnswer: any, correctAnswer: any) => {
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
      setSlideProgress(prev => new Set(prev).add(currentSlide));
    }

    setTimeout(() => {
      setShowFeedback(prev => ({
        ...prev,
        [slideId]: false
      }));
    }, 3000);

    return isCorrect;
  };

  // Drag & Drop Implementation
  const renderDragDropSlide = (content: any) => {
    const slideId = `drag-drop-${slide.id}`;
    const userAnswer = interactiveAnswers[slideId] || {};
    const showSlideFeeback = showFeedback[slideId];

    const handleDragStart = (e: React.DragEvent, item: any) => {
      setDraggedItem(item);
      e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, target: string) => {
      e.preventDefault();
      if (draggedItem) {
        const newAnswer = { ...userAnswer, [draggedItem.text]: target };
        setInteractiveAnswers(prev => ({ ...prev, [slideId]: newAnswer }));
        setDraggedItem(null);
      }
    };

    const handleCheckAnswer = () => {
      const correctAnswer = content.items?.reduce((acc: any, item: any) => {
        acc[item.text] = item.target;
        return acc;
      }, {}) || {};
      
      checkAnswer(slideId, userAnswer, correctAnswer);
    };

    return (
      <Box sx={{ padding: 4, maxWidth: '900px', margin: '0 auto' }}>
        <Typography variant="h4" gutterBottom fontWeight={600} textAlign="center" sx={{ mb: 3 }}>
          {slide.content.title}
        </Typography>
        
        <Typography variant="body1" sx={{ textAlign: 'center', mb: 4, color: 'text.secondary', fontSize: '1.1rem' }}>
          {content.instruction}
        </Typography>

        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3, bgcolor: 'primary.50', borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom textAlign="center" fontWeight={600}>
                🇯🇵 Japanese Words
              </Typography>
              <Stack spacing={2}>
                {content.items?.map((item: any) => (
                  <Paper
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    sx={{
                      p: 2.5,
                      cursor: userAnswer[item.text] ? 'default' : 'grab',
                      textAlign: 'center',
                      backgroundColor: userAnswer[item.text] ? 'success.light' : 'background.paper',
                      opacity: userAnswer[item.text] ? 0.8 : 1,
                      transition: 'all 0.3s ease',
                      border: '2px solid transparent',
                      borderColor: userAnswer[item.text] ? 'success.main' : 'transparent',
                      '&:hover': {
                        transform: userAnswer[item.text] ? 'none' : 'translateY(-2px)',
                        boxShadow: userAnswer[item.text] ? 1 : 3
                      }
                    }}
                  >
                    <Typography variant="h6" fontWeight={500} sx={{ fontSize: '1.4rem' }}>
                      {item.text}
                    </Typography>
                    {userAnswer[item.text] && (
                      <Typography variant="body2" color="success.dark" sx={{ mt: 1, fontWeight: 500 }}>
                        ✓ Matched with: {userAnswer[item.text]}
                      </Typography>
                    )}
                  </Paper>
                )) || []}
              </Stack>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3, bgcolor: 'secondary.50', borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom textAlign="center" fontWeight={600}>
                🇬🇧 English Translations
              </Typography>
              <Stack spacing={2}>
                {content.items?.map((item: any) => {
                  const isMatched = Object.values(userAnswer).includes(item.target);
                  return (
                    <Paper
                      key={`target-${item.id}`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, item.target)}
                      sx={{
                        p: 2.5,
                        textAlign: 'center',
                        border: '2px dashed',
                        borderColor: isMatched ? 'success.main' : 'divider',
                        backgroundColor: isMatched ? 'success.light' : 'grey.50',
                        minHeight: '70px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: isMatched ? 'success.dark' : 'primary.main',
                          backgroundColor: isMatched ? 'success.light' : 'primary.50'
                        }
                      }}
                    >
                      <Typography variant="h6" fontWeight={500} sx={{ fontSize: '1.2rem' }}>
                        {item.target}
                      </Typography>
                      {isMatched && (
                        <CheckCircle sx={{ ml: 1, color: 'success.main' }} />
                      )}
                    </Paper>
                  );
                }) || []}
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleCheckAnswer}
            disabled={Object.keys(userAnswer).length !== (content.items?.length || 0)}
            sx={{ 
              px: 6, 
              py: 2,
              fontSize: '1.1rem',
              borderRadius: 3,
              background: 'linear-gradient(45deg, #FF6B6B 30%, #FFB7C5 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #E55555 30%, #FF9FAC 90%)',
              }
            }}
          >
            Check Answers ({Object.keys(userAnswer).length}/{content.items?.length || 0})
          </Button>
        </Box>

        {showSlideFeeback && (
          <Fade in>
            <Alert
              severity={Object.keys(userAnswer).length === (content.items?.length || 0) ? 'success' : 'error'}
              sx={{ mt: 3, borderRadius: 2, fontSize: '1rem' }}
              icon={Object.keys(userAnswer).length === (content.items?.length || 0) ? <CheckCircle /> : undefined}
            >
              {Object.keys(userAnswer).length === (content.items?.length || 0) 
                ? content.feedback?.correct || 'Excellent! Perfect match! 🎉'
                : content.feedback?.incorrect || 'Keep trying! You can do it! 💪'}
            </Alert>
          </Fade>
        )}
      </Box>
    );
  };

  // Fill in the Blanks Implementation
  const renderFillBlanksSlide = (content: any) => {
    const slideId = `fill-blanks-${slide.id}`;
    const userAnswer = interactiveAnswers[slideId] || {};
    const showSlideFeeback = showFeedback[slideId];

    const handleInputChange = (itemId: number, blankIndex: number, value: string) => {
      const newAnswer = {
        ...userAnswer,
        [`${itemId}-${blankIndex}`]: value
      };
      setInteractiveAnswers(prev => ({ ...prev, [slideId]: newAnswer }));
    };

    const handleCheckAnswer = () => {
      const correctAnswer: Record<string, string> = {};
      content.items?.forEach((item: any) => {
        item.blanks?.forEach((blank: string, index: number) => {
          correctAnswer[`${item.id}-${index}`] = blank;
        });
      });
      
      checkAnswer(slideId, userAnswer, correctAnswer);
    };

    const renderSentenceWithBlanks = (item: any) => {
      const parts = item.sentence?.split('___') || [];
      const result = [];
      
      for (let i = 0; i < parts.length; i++) {
        result.push(
          <span key={`text-${i}`} style={{ fontSize: '1.5rem', fontWeight: 500 }}>
            {parts[i]}
          </span>
        );
        
        if (i < parts.length - 1) {
          result.push(
            <TextField
              key={`blank-${i}`}
              size="medium"
              value={userAnswer[`${item.id}-${i}`] || ''}
              onChange={(e) => handleInputChange(item.id, i, e.target.value)}
              sx={{
                mx: 1,
                width: '140px',
                '& .MuiOutlinedInput-root': {
                  height: '50px',
                  fontSize: '1.2rem',
                  textAlign: 'center',
                  backgroundColor: 'background.paper',
                  '&:hover': {
                    backgroundColor: 'primary.50'
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'primary.50'
                  }
                }
              }}
              placeholder="?"
            />
          );
        }
      }
      
      return <div style={{ lineHeight: 2.5 }}>{result}</div>;
    };

    return (
      <Box sx={{ padding: 4, maxWidth: '900px', margin: '0 auto' }}>
        <Typography variant="h4" gutterBottom fontWeight={600} textAlign="center" sx={{ mb: 3 }}>
          {slide.content.title}
        </Typography>
        
        <Typography variant="body1" sx={{ textAlign: 'center', mb: 4, color: 'text.secondary', fontSize: '1.1rem' }}>
          {content.instruction}
        </Typography>

        <Stack spacing={4} sx={{ mb: 4 }}>
          {content.items?.map((item: any, index: number) => (
            <Paper 
              key={item.id} 
              sx={{ 
                p: 4, 
                textAlign: 'center',
                borderRadius: 3,
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                border: '2px solid transparent',
                '&:hover': {
                  border: '2px solid',
                  borderColor: 'primary.light'
                }
              }}
            >
              <Typography variant="h6" sx={{ mb: 3, color: 'text.secondary', fontWeight: 500 }}>
                Sentence {index + 1}
              </Typography>
              <Box sx={{ mb: 3 }}>
                {renderSentenceWithBlanks(item)}
              </Box>
              {item.translation && (
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: 'text.secondary', 
                    fontStyle: 'italic',
                    fontSize: '1rem',
                    mt: 2,
                    p: 2,
                    backgroundColor: 'primary.50',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'primary.200'
                  }}
                >
                  💭 Translation: {item.translation}
                </Typography>
              )}
            </Paper>
          )) || []}
        </Stack>

        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleCheckAnswer}
            sx={{ 
              px: 6, 
              py: 2,
              fontSize: '1.1rem',
              borderRadius: 3,
              background: 'linear-gradient(45deg, #4ECDC4 30%, #7ED4D0 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #3BA59E 30%, #6DD6CE 90%)',
              }
            }}
          >
            Check My Answers
          </Button>
        </Box>

        {showSlideFeeback && (
          <Fade in>
            <Alert 
              severity="success" 
              sx={{ 
                mt: 3, 
                borderRadius: 2, 
                fontSize: '1rem',
                '& .MuiAlert-icon': {
                  fontSize: '1.5rem'
                }
              }}
            >
              {content.feedback?.correct || 'Perfect! Your Japanese is improving! ✨'}
            </Alert>
          </Fade>
        )}
      </Box>
    );
  };

  // Matching Pairs Implementation
  const renderMatchingSlide = (content: any) => {
    const slideId = `matching-${slide.id}`;
    const showSlideFeeback = showFeedback[slideId];

    const handleConnection = (leftItem: string, rightItem: string) => {
      setConnections(prev => ({
        ...prev,
        [leftItem]: rightItem
      }));
    };

    const handleCheckAnswer = () => {
      const correctAnswer: Record<string, string> = {};
      content.items?.forEach((item: any) => {
        correctAnswer[item.left] = item.right;
      });
      
      checkAnswer(slideId, connections, correctAnswer);
    };

    return (
      <Box sx={{ padding: 4, maxWidth: '900px', margin: '0 auto' }}>
        <Typography variant="h4" gutterBottom fontWeight={600} textAlign="center" sx={{ mb: 3 }}>
          {slide.content.title}
        </Typography>
        
        <Typography variant="body1" sx={{ textAlign: 'center', mb: 4, color: 'text.secondary', fontSize: '1.1rem' }}>
          {content.instruction}
        </Typography>

        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3, bgcolor: 'primary.50', borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom textAlign="center" fontWeight={600}>
                🔤 Characters
              </Typography>
              <Stack spacing={2}>
                {content.items?.map((item: any) => (
                  <Button
                    key={`left-${item.id}`}
                    variant={connections[item.left] ? "contained" : "outlined"}
                    onClick={() => {
                      const rightItem = content.items?.find((i: any) => i.pair === item.pair);
                      if (rightItem) {
                        handleConnection(item.left, rightItem.right);
                      }
                    }}
                    sx={{
                      p: 3,
                      fontSize: '2rem',
                      fontWeight: 600,
                      minHeight: '80px',
                      borderRadius: 2,
                      backgroundColor: connections[item.left] ? 'success.main' : 'background.paper',
                      color: connections[item.left] ? 'white' : 'text.primary',
                      '&:hover': {
                        backgroundColor: connections[item.left] ? 'success.dark' : 'primary.light',
                        transform: 'scale(1.02)'
                      }
                    }}
                  >
                    <Box>
                      <Typography variant="h4" component="div">
                        {item.left}
                      </Typography>
                      {connections[item.left] && (
                        <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                          → {connections[item.left]}
                        </Typography>
                      )}
                    </Box>
                  </Button>
                )) || []}
              </Stack>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3, bgcolor: 'secondary.50', borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom textAlign="center" fontWeight={600}>
                🔊 Sounds
              </Typography>
              <Stack spacing={2}>
                {content.items?.map((item: any) => {
                  const isConnected = Object.values(connections).includes(item.right);
                  return (
                    <Paper
                      key={`right-${item.id}`}
                      sx={{
                        p: 3,
                        textAlign: 'center',
                        backgroundColor: isConnected ? 'success.light' : 'background.paper',
                        border: '2px solid',
                        borderColor: isConnected ? 'success.main' : 'divider',
                        borderRadius: 2,
                        minHeight: '80px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <Typography variant="h5" fontWeight={500}>
                        {item.right}
                      </Typography>
                      {isConnected && (
                        <CheckCircle sx={{ ml: 2, color: 'success.main' }} />
                      )}
                    </Paper>
                  );
                }) || []}
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleCheckAnswer}
            disabled={Object.keys(connections).length !== (content.items?.length || 0)}
            sx={{ 
              px: 6, 
              py: 2,
              fontSize: '1.1rem',
              borderRadius: 3,
              background: 'linear-gradient(45deg, #45B7D1 30%, #96CEB4 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #3A9BC1 30%, #86C3A4 90%)',
              }
            }}
          >
            Check Connections ({Object.keys(connections).length}/{content.items?.length || 0})
          </Button>
        </Box>

        {showSlideFeeback && (
          <Fade in>
            <Alert
              severity={Object.keys(connections).length === (content.items?.length || 0) ? 'success' : 'error'}
              sx={{ mt: 3, borderRadius: 2, fontSize: '1rem' }}
            >
              {Object.keys(connections).length === (content.items?.length || 0)
                ? content.feedback?.correct || 'Amazing! You know your characters! 🌸'
                : content.feedback?.incorrect || 'Keep practicing! You\'re getting there!'}
            </Alert>
          </Fade>
        )}
      </Box>
    );
  };

  // Sentence Builder Implementation
  const renderSentenceBuilderSlide = (content: any) => {
    const slideId = `sentence-builder-${slide.id}`;
    const showSlideFeeback = showFeedback[slideId];
    const item = content.items?.[0];

    const handleWordClick = (word: string) => {
      if (selectedWords.includes(word)) {
        setSelectedWords(prev => prev.filter(w => w !== word));
      } else {
        setSelectedWords(prev => [...prev, word]);
      }
    };

    const handleCheckAnswer = () => {
      if (!item) return;
      const correctSentence = item.correctOrder?.map((index: number) => item.words[index]) || [];
      checkAnswer(slideId, selectedWords, correctSentence);
    };

    const resetSentence = () => {
      setSelectedWords([]);
    };

    if (!item) {
      return (
        <Box sx={{ textAlign: 'center', p: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No sentence data available
          </Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ padding: 4, maxWidth: '900px', margin: '0 auto' }}>
        <Typography variant="h4" gutterBottom fontWeight={600} textAlign="center" sx={{ mb: 3 }}>
          {slide.content.title}
        </Typography>
        
        <Typography variant="body1" sx={{ textAlign: 'center', mb: 4, color: 'text.secondary', fontSize: '1.1rem' }}>
          {content.instruction}
        </Typography>

        {/* Sentence Building Area */}
        <Paper sx={{ 
          minHeight: '120px',
          p: 3,
          mb: 4,
          backgroundColor: 'grey.50',
          border: '3px dashed',
          borderColor: selectedWords.length > 0 ? 'primary.main' : 'grey.300',
          borderRadius: 3,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease'
        }}>
          {selectedWords.length === 0 ? (
            <Typography variant="h6" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              Click words below to build your sentence ⬇️
            </Typography>
          ) : (
            selectedWords.map((word, index) => (
              <Chip
                key={`selected-${index}`}
                label={word}
                onClick={() => setSelectedWords(prev => prev.filter((_, i) => i !== index))}
                sx={{
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  p: 2,
                  height: 'auto',
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                    transform: 'scale(1.05)'
                  }
                }}
                clickable
              />
            ))
          )}
        </Paper>

        {/* Available Words */}
        <Paper sx={{ p: 3, mb: 4, borderRadius: 3, bgcolor: 'background.paper' }}>
          <Typography variant="h6" gutterBottom textAlign="center" fontWeight={600} sx={{ mb: 3 }}>
            📝 Available Words
          </Typography>
          <Box sx={{ 
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            justifyContent: 'center'
          }}>
            {item.words?.map((word: string, index: number) => (
              <Button
                key={`word-${index}`}
                variant={selectedWords.includes(word) ? "outlined" : "contained"}
                onClick={() => handleWordClick(word)}
                disabled={selectedWords.includes(word)}
                sx={{
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  p: 2,
                  minWidth: '80px',
                  backgroundColor: selectedWords.includes(word) ? 'grey.200' : 'secondary.main',
                  color: selectedWords.includes(word) ? 'text.disabled' : 'white',
                  '&:hover': {
                    backgroundColor: selectedWords.includes(word) ? 'grey.200' : 'secondary.dark',
                    transform: selectedWords.includes(word) ? 'none' : 'scale(1.05)'
                  }
                }}
              >
                {word}
              </Button>
            )) || []}
          </Box>
        </Paper>

        {/* Translation */}
        <Paper sx={{
          p: 3,
          mb: 4,
          bgcolor: 'info.50',
          border: '1px solid',
          borderColor: 'info.200',
          borderRadius: 3,
          textAlign: 'center'
        }}>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: 'info.dark' }}>
            💭 Translation
          </Typography>
          <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
            {item.translation}
          </Typography>
        </Paper>

        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="outlined"
            size="large"
            onClick={resetSentence}
            sx={{ 
              px: 4, 
              py: 1.5,
              fontSize: '1rem',
              borderRadius: 3
            }}
          >
            🔄 Reset
          </Button>
          <Button
            variant="contained"
            size="large"
            onClick={handleCheckAnswer}
            disabled={selectedWords.length !== (item.words?.length || 0)}
            sx={{ 
              px: 6, 
              py: 1.5,
              fontSize: '1.1rem',
              borderRadius: 3,
              background: 'linear-gradient(45deg, #FF6348 30%, #FF8E8E 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #E55538 30%, #FF7E7E 90%)',
              }
            }}
          >
            Check Sentence ({selectedWords.length}/{item.words?.length || 0})
          </Button>
        </Stack>

        {showSlideFeeback && (
          <Fade in>
            <Alert
              severity={selectedWords.length === (item.words?.length || 0) ? 'success' : 'error'}
              sx={{ mt: 3, borderRadius: 2, fontSize: '1rem' }}
            >
              {selectedWords.length === (item.words?.length || 0)
                ? content.feedback?.correct || 'Perfect sentence structure! 文法上手！'
                : content.feedback?.incorrect || 'Try a different word order!'}
            </Alert>
          </Fade>
        )}
      </Box>
    );
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
                onChange={(e) => setInteractiveAnswers(prev => ({
                  ...prev,
                  [quizId]: e.target.value
                }))}
              >
                {content.content.options?.map((option: string, index: number) => (
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
                onChange={(e) => setInteractiveAnswers(prev => ({
                  ...prev,
                  [quizId]: e.target.value
                }))}
                sx={{ mt: 3 }}
              />
            )}

            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <Button
                variant="contained"
                onClick={() => {
                  const correct = content.content.correctAnswer;
                  checkAnswer(quizId, userAnswer, correct);
                }}
                disabled={!userAnswer}
              >
                Check Answer
              </Button>
            </Stack>

            {showQuizFeedback && (
              <Fade in>
                <Alert
                  severity={userAnswer === content.content.correctAnswer?.toString() ? 'success' : 'error'}
                  sx={{ mt: 2 }}
                >
                  {userAnswer === content.content.correctAnswer?.toString()
                    ? 'Correct! ' + (content.content.explanation || '')
                    : 'Not quite. ' + (content.content.explanation || '')}
                </Alert>
              </Fade>
            )}
          </Box>
        );

      case 'interactive':
        const interactiveContent = content.content;
        if (!interactiveContent) {
          return (
            <Box sx={{ textAlign: 'center', p: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No interactive content available
              </Typography>
            </Box>
          );
        }

        switch (interactiveContent.type) {
          case 'drag-drop':
            return renderDragDropSlide(interactiveContent);
          case 'fill-blanks':
            return renderFillBlanksSlide(interactiveContent);
          case 'matching':
            return renderMatchingSlide(interactiveContent);
          case 'sentence-builder':
            return renderSentenceBuilderSlide(interactiveContent);
          default:
            return (
              <Box sx={{ textAlign: 'center', p: 4 }}>
                <Typography variant="h4" gutterBottom>
                  Interactive Activity: {interactiveContent.type}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {interactiveContent.instruction || 'Complete the interactive activity.'}
                </Typography>
                <Alert severity="info" sx={{ mt: 3 }}>
                  This interactive type ({interactiveContent.type}) is not yet implemented in the demo.
                </Alert>
              </Box>
            );
        }

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
        return (
          <Box sx={{ textAlign: 'center', p: 4 }}>
            <Typography variant="h4">Unknown slide type</Typography>
            <Typography>Content type: {content.type}</Typography>
          </Box>
        );
    }
  };

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

  if (!slide) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6">No slides available</Typography>
      </Box>
    );
  }

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
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Chip
            icon={getSlideIcon(slide.content.type)}
            label={`Slide ${currentSlide + 1} of ${slides.length}`}
            size="small"
            sx={{ fontWeight: 600 }}
          />
          {pointsReward > 0 && (
            <Chip
              icon={<CheckCircle />}
              label={`${pointsReward} points`}
              color="primary"
              size="small"
              sx={{ color: 'white' }}
            />
          )}
        </Stack>
        <IconButton onClick={toggleFullscreen} sx={{ bgcolor: 'action.hover' }}>
          {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
        </IconButton>
      </Stack>

      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{ 
          height: 8,
          '& .MuiLinearProgress-bar': {
            background: 'linear-gradient(90deg, #FF6B6B 0%, #4ECDC4 100%)'
          }
        }}
      />

      {/* Slide Content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AnimatePresence mode="wait">
          <MotionBox
            key={currentSlide}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            sx={{ width: '100%', maxWidth: 1200, mx: 'auto' }}
          >
            <Card sx={{ 
              m: 3, 
              bgcolor: 'rgba(255, 255, 255, 0.98)', 
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }}>
              <CardContent sx={{ p: 0 }}>
                {renderSlideContent(slide)}
              </CardContent>
            </Card>
          </MotionBox>
        </AnimatePresence>
      </Box>

      {/* Navigation Footer */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          p: 3,
          bgcolor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Button
          startIcon={<NavigateBefore />}
          onClick={handlePrevious}
          disabled={currentSlide === 0}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          Previous
        </Button>

        <Stack direction="row" spacing={1}>
          {slides.map((_, index) => (
            <Box
              key={index}
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
                '&:hover': {
                  transform: 'scale(1.2)'
                }
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
            sx={{ 
              borderRadius: 2,
              px: 3,
              background: 'linear-gradient(45deg, #4caf50 30%, #8bc34a 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #45a049 30%, #7cb342 90%)',
              }
            }}
          >
            {isLessonCompleted ? 'Completed' : 'Complete Lesson'}
          </Button>
        ) : (
          <Button
            endIcon={<NavigateNext />}
            onClick={handleNext}
            variant="contained"
            sx={{ 
              borderRadius: 2,
              px: 3,
              background: 'linear-gradient(45deg, #FF6B6B 30%, #FFB7C5 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #E55555 30%, #FF9FAC 90%)',
              }
            }}
          >
            Next
          </Button>
        )}
      </Stack>
    </Box>
  );
};