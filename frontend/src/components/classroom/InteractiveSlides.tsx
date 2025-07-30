// frontend/src/components/classroom/InteractiveSlides.tsx
import React, { useState, useEffect, useRef } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  Avatar,
  Tooltip,
  CircularProgress,
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
  Extension,
  PlayArrow,
  Stop,
  Mic,
  VolumeUp,
  Close,
  DragIndicator,
  Error,
  Warning,
} from '@mui/icons-material';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
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

interface ValidationResult {
  isValid: boolean;
  message: string;
  type: 'error' | 'warning' | 'success';
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
  const [validationResults, setValidationResults] = useState<Record<string, ValidationResult>>({});
  const [draggedItem, setDraggedItem] = useState<any>(null);
  const [connections, setConnections] = useState<Record<string, string>>({});
  const [sortedItems, setSortedItems] = useState<string[]>([]);
  const [timelineOrder, setTimelineOrder] = useState<any[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [hotspotClicks, setHotspotClicks] = useState<Set<string>>(new Set());
  const [flashcardStates, setFlashcardStates] = useState<Record<string, boolean>>({});
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  // const [isLoading, setIsLoading] = useState(false);
  const [fullscreenDialog, setFullscreenDialog] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const slide = slides[currentSlide];
  const progress = ((currentSlide + 1) / slides.length) * 100;
  const isLastSlide = currentSlide === slides.length - 1;

  useEffect(() => {
    if (slide) {
      setSlideProgress(prev => new Set(prev).add(currentSlide));
    }
  }, [currentSlide, slide]);

  // Enhanced fullscreen functionality
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = Boolean(document.fullscreenElement);
      setIsFullscreen(isCurrentlyFullscreen);
      if (!isCurrentlyFullscreen) {
        setFullscreenDialog(false);
      }
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if (isFullscreen) {
        switch (e.key) {
          case 'ArrowLeft':
            handlePrevious();
            break;
          case 'ArrowRight':
            handleNext();
            break;
          case 'Escape':
            exitFullscreen();
            break;
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isFullscreen, currentSlide]);

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
      setFullscreenDialog(true);
      if (containerRef.current) {
        containerRef.current.requestFullscreen?.();
      }
    } else {
      exitFullscreen();
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    }
    setFullscreenDialog(false);
  };

  // Enhanced validation system
  const validateAnswer = (slideId: string, userAnswer: any, interactiveType: string): ValidationResult => {
    if (!userAnswer) {
      return {
        isValid: false,
        message: 'Please provide an answer before submitting.',
        type: 'warning'
      };
    }

    switch (interactiveType) {
      case 'drag-drop':
        const requiredItems = slide.content.content.items?.length || 0;
        const answeredItems = Object.keys(userAnswer).length;
        if (answeredItems < requiredItems) {
          return {
            isValid: false,
            message: `Please match all ${requiredItems} items. You have ${answeredItems} matched.`,
            type: 'warning'
          };
        }
        break;

      case 'fill-blanks':
        const totalBlanks = slide.content.content.items?.reduce((total: number, item: any) => {
          return total + (item.sentence?.split('___').length - 1 || 0);
        }, 0) || 0;
        const filledBlanks = Object.keys(userAnswer).length;
        if (filledBlanks < totalBlanks) {
          return {
            isValid: false,
            message: `Please fill in all ${totalBlanks} blanks. You have ${filledBlanks} filled.`,
            type: 'warning'
          };
        }
        break;

      case 'sentence-builder':
        const requiredWords = slide.content.content.items?.[0]?.words?.length || 0;
        if (userAnswer.length < requiredWords) {
          return {
            isValid: false,
            message: `Please use all ${requiredWords} words to build the sentence.`,
            type: 'warning'
          };
        }
        break;

      case 'sorting':
        const sortItems = sortedItems.length;
        const requiredSort = slide.content.content.items?.length || 0;
        if (sortItems < requiredSort) {
          return {
            isValid: false,
            message: `Please arrange all ${requiredSort} items in order.`,
            type: 'warning'
          };
        }
        break;

      case 'hotspot':
        const requiredClicks = slide.content.content.items?.length || 0;
        const actualClicks = hotspotClicks.size;
        if (actualClicks < requiredClicks) {
          return {
            isValid: false,
            message: `Please click on all ${requiredClicks} hotspots. You have clicked ${actualClicks}.`,
            type: 'warning'
          };
        }
        break;
    }

    return {
      isValid: true,
      message: 'Answer validated successfully!',
      type: 'success'
    };
  };

  const checkAnswer = (slideId: string, userAnswer: any, correctAnswer: any, interactiveType?: string) => {
    // First validate the answer
    const validation = validateAnswer(slideId, userAnswer, interactiveType || 'generic');
    setValidationResults(prev => ({
      ...prev,
      [slideId]: validation
    }));

    if (!validation.isValid) {
      setShowFeedback(prev => ({
        ...prev,
        [slideId]: true
      }));
      setTimeout(() => {
        setShowFeedback(prev => ({
          ...prev,
          [slideId]: false
        }));
      }, 4000);
      return false;
    }

    // Check correctness
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
      setValidationResults(prev => ({
        ...prev,
        [slideId]: {
          isValid: true,
          message: 'Perfect! Correct answer! 🎉',
          type: 'success'
        }
      }));
    } else {
      setValidationResults(prev => ({
        ...prev,
        [slideId]: {
          isValid: false,
          message: 'Not quite right. Please try again! 💪',
          type: 'error'
        }
      }));
    }

    setTimeout(() => {
      setShowFeedback(prev => ({
        ...prev,
        [slideId]: false
      }));
    }, 3000);

    return isCorrect;
  };

  // Drag & Drop Implementation (Enhanced with validation)
  const renderDragDropSlide = (content: any) => {
    const slideId = `drag-drop-${slide.id}`;
    const userAnswer = interactiveAnswers[slideId] || {};
    const showSlideFeeback = showFeedback[slideId];
    const validation = validationResults[slideId];

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
      
      checkAnswer(slideId, userAnswer, correctAnswer, 'drag-drop');
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

        {showSlideFeeback && validation && (
          <Fade in>
            <Alert
              severity={validation.type}
              sx={{ mt: 3, borderRadius: 2, fontSize: '1rem' }}
              icon={validation.type === 'success' ? <CheckCircle /> : validation.type === 'error' ? <Error /> : <Warning />}
            >
              {validation.message}
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
    const validation = validationResults[slideId];

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
      
      checkAnswer(slideId, userAnswer, correctAnswer, 'fill-blanks');
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

        {showSlideFeeback && validation && (
          <Fade in>
            <Alert 
              severity={validation.type} 
              sx={{ 
                mt: 3, 
                borderRadius: 2, 
                fontSize: '1rem',
                '& .MuiAlert-icon': {
                  fontSize: '1.5rem'
                }
              }}
            >
              {validation.message}
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
    const validation = validationResults[slideId];

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
      
      checkAnswer(slideId, connections, correctAnswer, 'matching');
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

        {showSlideFeeback && validation && (
          <Fade in>
            <Alert
              severity={validation.type}
              sx={{ mt: 3, borderRadius: 2, fontSize: '1rem' }}
            >
              {validation.message}
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
    const validation = validationResults[slideId];
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
      checkAnswer(slideId, selectedWords, correctSentence, 'sentence-builder');
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

        {showSlideFeeback && validation && (
          <Fade in>
            <Alert
              severity={validation.type}
              sx={{ mt: 3, borderRadius: 2, fontSize: '1rem' }}
            >
              {validation.message}
            </Alert>
          </Fade>
        )}
      </Box>
    );
  };

  // Sorting Implementation
  const renderSortingSlide = (content: any) => {
    const slideId = `sorting-${slide.id}`;
    const showSlideFeeback = showFeedback[slideId];
    const validation = validationResults[slideId];

    const handleSort = (newOrder: string[]) => {
      setSortedItems(newOrder);
    };

    const handleCheckAnswer = () => {
      const correctOrder = content.items
        ?.sort((a: any, b: any) => a.correctOrder - b.correctOrder)
        .map((item: any) => item.text) || [];
      
      checkAnswer(slideId, sortedItems, correctOrder, 'sorting');
    };

    const resetSort = () => {
      setSortedItems([]);
    };

    const availableItems = content.items?.filter((item: any) => !sortedItems.includes(item.text)) || [];

    return (
      <Box sx={{ padding: 4, maxWidth: '900px', margin: '0 auto' }}>
        <Typography variant="h4" gutterBottom fontWeight={600} textAlign="center" sx={{ mb: 3 }}>
          {slide.content.title}
        </Typography>
        
        <Typography variant="body1" sx={{ textAlign: 'center', mb: 4, color: 'text.secondary', fontSize: '1.1rem' }}>
          {content.instruction}
        </Typography>

        {/* Sorting Area */}
        <Paper sx={{
          minHeight: '200px',
          p: 3,
          mb: 4,
          backgroundColor: 'primary.50',
          border: '3px dashed',
          borderColor: sortedItems.length > 0 ? 'primary.main' : 'primary.200',
          borderRadius: 3,
          transition: 'all 0.3s ease'
        }}>
          <Typography variant="h6" textAlign="center" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
            📋 Correct Order (Drag items here)
          </Typography>
          
          {sortedItems.length === 0 ? (
            <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ fontStyle: 'italic', mt: 4 }}>
              Drag items from below to arrange them in the correct order ⬇️
            </Typography>
          ) : (
            <Reorder.Group
              axis="y"
              values={sortedItems}
              onReorder={handleSort}
              style={{ listStyle: 'none', padding: 0, margin: 0 }}
            >
              {sortedItems.map((item, index) => (
                <Reorder.Item key={item} value={item}>
                  <Paper
                    sx={{
                      p: 2,
                      mb: 2,
                      backgroundColor: 'white',
                      cursor: 'grab',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      '&:hover': {
                        boxShadow: 3,
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Avatar sx={{ 
                      bgcolor: 'primary.main', 
                      width: 32, 
                      height: 32, 
                      fontSize: '0.9rem',
                      fontWeight: 600 
                    }}>
                      {index + 1}
                    </Avatar>
                    <DragIndicator sx={{ color: 'text.secondary' }} />
                    <Typography variant="body1" fontWeight={500} sx={{ flexGrow: 1 }}>
                      {item}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => setSortedItems(prev => prev.filter(i => i !== item))}
                      sx={{ color: 'error.main' }}
                    >
                      <Close />
                    </IconButton>
                  </Paper>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          )}
        </Paper>

        {/* Available Items */}
        <Paper sx={{ p: 3, mb: 4, borderRadius: 3, bgcolor: 'grey.50' }}>
          <Typography variant="h6" gutterBottom textAlign="center" fontWeight={600} sx={{ mb: 3 }}>
            📦 Available Items
          </Typography>
          <Grid container spacing={2}>
            {availableItems.map((item: any) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setSortedItems(prev => [...prev, item.text])}
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 2
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  {item.text}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Paper>

        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="outlined"
            size="large"
            onClick={resetSort}
            sx={{ px: 4, py: 1.5, fontSize: '1rem', borderRadius: 3 }}
          >
            🔄 Reset
          </Button>
          <Button
            variant="contained"
            size="large"
            onClick={handleCheckAnswer}
            disabled={sortedItems.length !== (content.items?.length || 0)}
            sx={{ 
              px: 6, 
              py: 1.5,
              fontSize: '1.1rem',
              borderRadius: 3,
              background: 'linear-gradient(45deg, #9C27B0 30%, #E1BEE7 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #8E24AA 30%, #D8B4DE 90%)',
              }
            }}
          >
            Check Order ({sortedItems.length}/{content.items?.length || 0})
          </Button>
        </Stack>

        {showSlideFeeback && validation && (
          <Fade in>
            <Alert
              severity={validation.type}
              sx={{ mt: 3, borderRadius: 2, fontSize: '1rem' }}
            >
              {validation.message}
            </Alert>
          </Fade>
        )}
      </Box>
    );
  };

  // Hotspot Implementation
  const renderHotspotSlide = (content: any) => {
    const slideId = `hotspot-${slide.id}`;
    const showSlideFeeback = showFeedback[slideId];
    const validation = validationResults[slideId];

    const handleHotspotClick = (hotspotId: string) => {
      setHotspotClicks(prev => new Set(prev).add(hotspotId));
    };

    const handleCheckAnswer = () => {
      const correctHotspots = content.items?.map((item: any) => item.id.toString()) || [];
      const clickedHotspots = Array.from(hotspotClicks);
      
      checkAnswer(slideId, clickedHotspots.sort(), correctHotspots.sort(), 'hotspot');
    };

    const resetHotspots = () => {
      setHotspotClicks(new Set());
    };

    return (
      <Box sx={{ padding: 4, maxWidth: '1000px', margin: '0 auto' }}>
        <Typography variant="h4" gutterBottom fontWeight={600} textAlign="center" sx={{ mb: 3 }}>
          {slide.content.title}
        </Typography>
        
        <Typography variant="body1" sx={{ textAlign: 'center', mb: 4, color: 'text.secondary', fontSize: '1.1rem' }}>
          {content.instruction}
        </Typography>

        {/* Image with Hotspots */}
        <Paper sx={{ position: 'relative', borderRadius: 3, overflow: 'hidden', mb: 4 }}>
          {content.settings?.imageUrl ? (
            <Box sx={{ position: 'relative', width: '100%', paddingTop: '60%' }}>
              <Box
                component="img"
                src={content.settings.imageUrl}
                alt="Interactive image"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              
              {/* Hotspot Indicators */}
              {content.items?.map((item: any) => (
                <Tooltip
                  key={item.id}
                  title={hotspotClicks.has(item.id.toString()) ? item.feedback : item.label}
                  arrow
                  placement="top"
                >
                  <IconButton
                    onClick={() => handleHotspotClick(item.id.toString())}
                    sx={{
                      position: 'absolute',
                      left: `${item.x}%`,
                      top: `${item.y}%`,
                      transform: 'translate(-50%, -50%)',
                      width: 40,
                      height: 40,
                      bgcolor: hotspotClicks.has(item.id.toString()) ? 'success.main' : 'primary.main',
                      color: 'white',
                      boxShadow: 3,
                      animation: content.settings?.showAllHotspots || hotspotClicks.has(item.id.toString()) 
                        ? 'none' : 'pulse 2s infinite',
                      '&:hover': {
                        bgcolor: hotspotClicks.has(item.id.toString()) ? 'success.dark' : 'primary.dark',
                        transform: 'translate(-50%, -50%) scale(1.1)',
                      },
                      '@keyframes pulse': {
                        '0%': { boxShadow: '0 0 0 0 rgba(25, 118, 210, 0.7)' },
                        '70%': { boxShadow: '0 0 0 10px rgba(25, 118, 210, 0)' },
                        '100%': { boxShadow: '0 0 0 0 rgba(25, 118, 210, 0)' }
                      }
                    }}
                  >
                    {hotspotClicks.has(item.id.toString()) ? <CheckCircle /> : <TouchApp />}
                  </IconButton>
                </Tooltip>
              ))}
            </Box>
          ) : (
            <Box sx={{ p: 8, textAlign: 'center', bgcolor: 'grey.100' }}>
              <Image sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No background image provided
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Progress Indicator */}
        <Paper sx={{ p: 3, mb: 4, bgcolor: 'info.50', borderRadius: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body1" fontWeight={500}>
              Progress: {hotspotClicks.size} of {content.items?.length || 0} hotspots found
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(hotspotClicks.size / (content.items?.length || 1)) * 100}
              sx={{ width: 200, height: 8, borderRadius: 4 }}
            />
          </Stack>
        </Paper>

        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="outlined"
            size="large"
            onClick={resetHotspots}
            sx={{ px: 4, py: 1.5, fontSize: '1rem', borderRadius: 3 }}
          >
            🔄 Reset
          </Button>
          <Button
            variant="contained"
            size="large"
            onClick={handleCheckAnswer}
            disabled={hotspotClicks.size !== (content.items?.length || 0)}
            sx={{ 
              px: 6, 
              py: 1.5,
              fontSize: '1.1rem',
              borderRadius: 3,
              background: 'linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #F57C00 30%, #FF9800 90%)',
              }
            }}
          >
            Check Hotspots ({hotspotClicks.size}/{content.items?.length || 0})
          </Button>
        </Stack>

        {showSlideFeeback && validation && (
          <Fade in>
            <Alert
              severity={validation.type}
              sx={{ mt: 3, borderRadius: 2, fontSize: '1rem' }}
            >
              {validation.message}
            </Alert>
          </Fade>
        )}
      </Box>
    );
  };

  // Timeline Implementation
  const renderTimelineSlide = (content: any) => {
    const slideId = `timeline-${slide.id}`;
    const showSlideFeeback = showFeedback[slideId];
    const validation = validationResults[slideId];

    const handleTimelineOrder = (newOrder: any[]) => {
      setTimelineOrder(newOrder);
    };

    const handleCheckAnswer = () => {
      const correctOrder = content.items
        ?.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((item: any) => item.id) || [];
      const userOrder = timelineOrder.map(item => item.id);
      
      checkAnswer(slideId, userOrder, correctOrder, 'timeline');
    };

    const resetTimeline = () => {
      setTimelineOrder([]);
    };

    const availableEvents = content.items?.filter((item: any) => 
      !timelineOrder.find(t => t.id === item.id)
    ) || [];

    return (
      <Box sx={{ padding: 4, maxWidth: '1000px', margin: '0 auto' }}>
        <Typography variant="h4" gutterBottom fontWeight={600} textAlign="center" sx={{ mb: 3 }}>
          {slide.content.title}
        </Typography>
        
        <Typography variant="body1" sx={{ textAlign: 'center', mb: 4, color: 'text.secondary', fontSize: '1.1rem' }}>
          {content.instruction}
        </Typography>

        {/* Timeline Area */}
        <Paper sx={{ p: 3, mb: 4, borderRadius: 3, bgcolor: 'primary.50' }}>
          <Typography variant="h6" textAlign="center" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
            ⏰ Timeline (Chronological Order)
          </Typography>

          {timelineOrder.length === 0 ? (
            <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ fontStyle: 'italic', py: 4 }}>
              Drag events from below to arrange them chronologically ⬇️
            </Typography>
          ) : (
            <Box sx={{ position: 'relative' }}>
              {/* Timeline Line */}
              <Box
                sx={{
                  position: 'absolute',
                  left: 32,
                  top: 0,
                  bottom: 0,
                  width: 4,
                  bgcolor: 'primary.main',
                  borderRadius: 2,
                  zIndex: 0
                }}
              />

              <Reorder.Group
                axis="y"
                values={timelineOrder}
                onReorder={handleTimelineOrder}
                style={{ listStyle: 'none', padding: 0, margin: 0, position: 'relative', zIndex: 1 }}
              >
                {timelineOrder.map((item, index) => (
                  <Reorder.Item key={item.id} value={item}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      {/* Timeline Dot */}
                      <Avatar
                        sx={{
                          bgcolor: 'primary.main',
                          width: 48,
                          height: 48,
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          mr: 3,
                          boxShadow: 3
                        }}
                      >
                        {index + 1}
                      </Avatar>

                      {/* Event Card */}
                      <Paper
                        sx={{
                          p: 3,
                          flexGrow: 1,
                          cursor: 'grab',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          '&:hover': {
                            boxShadow: 6,
                            transform: 'translateY(-2px)'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <DragIndicator sx={{ color: 'text.secondary' }} />
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" fontWeight={600} gutterBottom>
                            {item.event}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {item.date}
                          </Typography>
                          <Typography variant="body2">
                            {item.description}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => setTimelineOrder(prev => prev.filter(t => t.id !== item.id))}
                          sx={{ color: 'error.main' }}
                        >
                          <Close />
                        </IconButton>
                      </Paper>
                    </Box>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            </Box>
          )}
        </Paper>

        {/* Available Events */}
        <Paper sx={{ p: 3, mb: 4, borderRadius: 3, bgcolor: 'grey.50' }}>
          <Typography variant="h6" gutterBottom textAlign="center" fontWeight={600} sx={{ mb: 3 }}>
            📅 Historical Events
          </Typography>
          <Grid container spacing={2}>
            {availableEvents.map((item: any) => (
              <Grid size={{ xs: 12, md: 4 }} key={item.id}>
                <Card
                  onClick={() => setTimelineOrder(prev => [...prev, item])}
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {item.event}
                    </Typography>
                    <Typography variant="body2" color="primary.main" gutterBottom>
                      {item.date}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>

        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="outlined"
            size="large"
            onClick={resetTimeline}
            sx={{ px: 4, py: 1.5, fontSize: '1rem', borderRadius: 3 }}
          >
            🔄 Reset
          </Button>
          <Button
            variant="contained"
            size="large"
            onClick={handleCheckAnswer}
            disabled={timelineOrder.length !== (content.items?.length || 0)}
            sx={{ 
              px: 6, 
              py: 1.5,
              fontSize: '1.1rem',
              borderRadius: 3,
              background: 'linear-gradient(45deg, #795548 30%, #A1887F 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #6D4C41 30%, #8D6E63 90%)',
              }
            }}
          >
            Check Timeline ({timelineOrder.length}/{content.items?.length || 0})
          </Button>
        </Stack>

        {showSlideFeeback && validation && (
          <Fade in>
            <Alert
              severity={validation.type}
              sx={{ mt: 3, borderRadius: 2, fontSize: '1rem' }}
            >
              {validation.message}
            </Alert>
          </Fade>
        )}
      </Box>
    );
  };

  // Flashcard Implementation
  const renderFlashcardSlide = (content: any) => {
    const slideId = `flashcard-${slide.id}`;

    const handleFlipCard = (cardId: string) => {
      setFlashcardStates(prev => ({
        ...prev,
        [cardId]: !prev[cardId]
      }));
    };

    const handleMarkComplete = () => {
      setSlideProgress(prev => new Set(prev).add(currentSlide));
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    };

    return (
      <Box sx={{ padding: 4, maxWidth: '1000px', margin: '0 auto' }}>
        <Typography variant="h4" gutterBottom fontWeight={600} textAlign="center" sx={{ mb: 3 }}>
          {slide.content.title}
        </Typography>
        
        <Typography variant="body1" sx={{ textAlign: 'center', mb: 4, color: 'text.secondary', fontSize: '1.1rem' }}>
          {content.instruction}
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {content.items?.map((item: any, index: number) => {
            const isFlipped = flashcardStates[item.id] || false;
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card
                    onClick={() => handleFlipCard(item.id)}
                    sx={{
                      height: 200,
                      cursor: 'pointer',
                      position: 'relative',
                      transformStyle: 'preserve-3d',
                      transition: 'transform 0.6s',
                      transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                      boxShadow: 4,
                      '&:hover': {
                        boxShadow: 8
                      }
                    }}
                  >
                    {/* Front Side */}
                    <CardContent
                      sx={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backfaceVisibility: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
                        p: 3
                      }}
                    >
                      <Typography variant="h5" fontWeight={600} gutterBottom>
                        {item.front}
                      </Typography>
                      <Chip
                        label={item.category}
                        size="small"
                        sx={{ mt: 2, bgcolor: 'primary.main', color: 'white' }}
                      />
                      <Typography variant="caption" sx={{ mt: 2, opacity: 0.7 }}>
                        Click to flip
                      </Typography>
                    </CardContent>

                    {/* Back Side */}
                    <CardContent
                      sx={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)',
                        p: 3
                      }}
                    >
                      <Typography variant="body1" fontWeight={500} sx={{ mb: 2 }}>
                        {item.back}
                      </Typography>
                      <CheckCircle sx={{ color: 'success.main', fontSize: 32, mt: 1 }} />
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            );
          }) || []}
        </Grid>

        {/* Progress Indicator */}
        <Paper sx={{ p: 3, mb: 4, bgcolor: 'success.50', borderRadius: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body1" fontWeight={500}>
              Cards reviewed: {Object.keys(flashcardStates).length} of {content.items?.length || 0}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(Object.keys(flashcardStates).length / (content.items?.length || 1)) * 100}
              sx={{ width: 200, height: 8, borderRadius: 4 }}
            />
          </Stack>
        </Paper>

        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleMarkComplete}
            disabled={Object.keys(flashcardStates).length !== (content.items?.length || 0)}
            sx={{ 
              px: 6, 
              py: 2,
              fontSize: '1.1rem',
              borderRadius: 3,
              background: 'linear-gradient(45deg, #2E7D32 30%, #4CAF50 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1B5E20 30%, #388E3C 90%)',
              }
            }}
          >
            Complete Flashcard Review ({Object.keys(flashcardStates).length}/{content.items?.length || 0})
          </Button>
        </Box>
      </Box>
    );
  };

  // Pronunciation Implementation
  const renderPronunciationSlide = (content: any) => {
    const slideId = `pronunciation-${slide.id}`;

    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          const audioUrl = URL.createObjectURL(audioBlob);
          setAudioUrl(audioUrl);
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    };

    const stopRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    };

    const playAudio = (url: string) => {
      if (currentAudio) {
        currentAudio.pause();
      }
      const audio = new Audio(url);
      setCurrentAudio(audio);
      audio.play();
    };

    const handleMarkComplete = () => {
      setSlideProgress(prev => new Set(prev).add(currentSlide));
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    };

    return (
      <Box sx={{ padding: 4, maxWidth: '800px', margin: '0 auto' }}>
        <Typography variant="h4" gutterBottom fontWeight={600} textAlign="center" sx={{ mb: 3 }}>
          {slide.content.title}
        </Typography>
        
        <Typography variant="body1" sx={{ textAlign: 'center', mb: 4, color: 'text.secondary', fontSize: '1.1rem' }}>
          {content.instruction}
        </Typography>

        <Stack spacing={4}>
          {content.items?.map((item: any, index: number) => (
            <Paper key={item.id} sx={{ p: 4, borderRadius: 3, bgcolor: 'background.paper' }}>
              <Typography variant="h5" fontWeight={600} textAlign="center" gutterBottom sx={{ mb: 3 }}>
                {item.text}
              </Typography>

              <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 3, fontSize: '1.1rem' }}>
                Pronunciation: <strong>{item.pronunciation}</strong>
              </Typography>

              <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" sx={{ mb: 3 }}>
                {item.audioUrl && (
                  <Button
                    variant="outlined"
                    startIcon={<VolumeUp />}
                    onClick={() => playAudio(item.audioUrl)}
                    sx={{ borderRadius: 3, px: 3 }}
                  >
                    Listen to Reference
                  </Button>
                )}

                <Button
                  variant={isRecording ? "contained" : "outlined"}
                  color={isRecording ? "error" : "primary"}
                  startIcon={isRecording ? <Stop /> : <Mic />}
                  onClick={isRecording ? stopRecording : startRecording}
                  sx={{ borderRadius: 3, px: 3 }}
                >
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
                </Button>

                {audioUrl && (
                  <Button
                    variant="outlined"
                    startIcon={<PlayArrow />}
                    onClick={() => playAudio(audioUrl)}
                    sx={{ borderRadius: 3, px: 3 }}
                  >
                    Play My Recording
                  </Button>
                )}
              </Stack>

              {isRecording && (
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <CircularProgress size={24} />
                  <Typography variant="body2" color="error.main" sx={{ mt: 1 }}>
                    Recording... Speak clearly into your microphone
                  </Typography>
                </Box>
              )}

              {audioUrl && (
                <Alert severity="success" sx={{ borderRadius: 2 }}>
                  Great! Your pronunciation has been recorded. Compare it with the reference audio.
                </Alert>
              )}
            </Paper>
          )) || []}
        </Stack>

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleMarkComplete}
            disabled={!audioUrl}
            sx={{ 
              px: 6, 
              py: 2,
              fontSize: '1.1rem',
              borderRadius: 3,
              background: 'linear-gradient(45deg, #1976D2 30%, #42A5F5 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #1565C0 30%, #2196F3 90%)',
              }
            }}
          >
            Complete Pronunciation Practice
          </Button>
        </Box>
      </Box>
    );
  };

  // Listening Implementation
  const renderListeningSlide = (content: any) => {
    const slideId = `listening-${slide.id}`;
    const userAnswer = interactiveAnswers[slideId];
    const showSlideFeeback = showFeedback[slideId];
    const validation = validationResults[slideId];

    const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
      setInteractiveAnswers(prev => ({
        ...prev,
        [slideId]: {
          ...prev[slideId],
          [questionIndex]: answerIndex
        }
      }));
    };

    const handleCheckAnswer = () => {
      const correctAnswers: Record<number, number> = {};
      content.items?.forEach((item: any, index: number) => {
        correctAnswers[index] = item.correct;
      });
      
      checkAnswer(slideId, userAnswer || {}, correctAnswers, 'listening');
    };

    const playAudio = (url: string) => {
      if (currentAudio) {
        currentAudio.pause();
      }
      const audio = new Audio(url);
      setCurrentAudio(audio);
      audio.play();
    };

    return (
      <Box sx={{ padding: 4, maxWidth: '800px', margin: '0 auto' }}>
        <Typography variant="h4" gutterBottom fontWeight={600} textAlign="center" sx={{ mb: 3 }}>
          {slide.content.title}
        </Typography>
        
        <Typography variant="body1" sx={{ textAlign: 'center', mb: 4, color: 'text.secondary', fontSize: '1.1rem' }}>
          {content.instruction}
        </Typography>

        <Stack spacing={4}>
          {content.items?.map((item: any, questionIndex: number) => (
            <Paper key={item.id} sx={{ p: 4, borderRadius: 3, bgcolor: 'background.paper' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight={600}>
                  Question {questionIndex + 1}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<VolumeUp />}
                  onClick={() => playAudio(item.audioUrl)}
                  sx={{ borderRadius: 3 }}
                >
                  Play Audio
                </Button>
              </Stack>

              <Typography variant="body1" sx={{ mb: 3, fontSize: '1.1rem' }}>
                {item.question}
              </Typography>

              <RadioGroup
                value={userAnswer?.[questionIndex]?.toString() || ''}
                onChange={(e) => handleAnswerSelect(questionIndex, parseInt(e.target.value))}
              >
                {item.options?.map((option: string, optionIndex: number) => (
                  <FormControlLabel
                    key={optionIndex}
                    value={optionIndex.toString()}
                    control={<Radio />}
                    label={option}
                    sx={{
                      mb: 1,
                      p: 2,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  />
                ))}
              </RadioGroup>
            </Paper>
          )) || []}
        </Stack>

        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleCheckAnswer}
            disabled={!userAnswer || Object.keys(userAnswer).length !== (content.items?.length || 0)}
            sx={{ 
              px: 6, 
              py: 2,
              fontSize: '1.1rem',
              borderRadius: 3,
              background: 'linear-gradient(45deg, #8BC34A 30%, #CDDC39 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #689F38 30%, #9E9D24 90%)',
              }
            }}
          >
            Check Answers ({Object.keys(userAnswer || {}).length}/{content.items?.length || 0})
          </Button>
        </Box>

        {showSlideFeeback && validation && (
          <Fade in>
            <Alert
              severity={validation.type}
              sx={{ mt: 3, borderRadius: 2, fontSize: '1rem' }}
            >
              {validation.message}
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
          case 'sorting':
            return renderSortingSlide(interactiveContent);
          case 'hotspot':
            return renderHotspotSlide(interactiveContent);
          case 'timeline':
            return renderTimelineSlide(interactiveContent);
          case 'flashcard':
            return renderFlashcardSlide(interactiveContent);
          case 'pronunciation':
            return renderPronunciationSlide(interactiveContent);
          case 'listening':
            return renderListeningSlide(interactiveContent);
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
    <>
      <Box
        ref={containerRef}
        sx={{
          height: isFullscreen ? '100vh' : 'calc(100vh - 200px)',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: slide.backgroundColor || 'background.default',
          backgroundImage: slide.backgroundImage ? `url(${slide.backgroundImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: isFullscreen ? 'fixed' : 'relative',
          top: isFullscreen ? 0 : 'auto',
          left: isFullscreen ? 0 : 'auto',
          width: isFullscreen ? '100vw' : '100%',
          zIndex: isFullscreen ? 9999 : 'auto',
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
          <Stack direction="row" spacing={1}>
            {isFullscreen && (
              <IconButton onClick={exitFullscreen} sx={{ bgcolor: 'action.hover' }}>
                <Close />
              </IconButton>
            )}
            <IconButton onClick={toggleFullscreen} sx={{ bgcolor: 'action.hover' }}>
              {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
            </IconButton>
          </Stack>
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

      {/* Enhanced Fullscreen Dialog */}
      <Dialog
        fullScreen
        open={fullscreenDialog && !isFullscreen}
        onClose={() => setFullscreenDialog(false)}
        PaperProps={{
          sx: { 
            bgcolor: 'background.default',
            backgroundImage: 'none'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          bgcolor: 'primary.main',
          color: 'white'
        }}>
          <Typography variant="h6" fontWeight={600}>
            Interactive Slides - Fullscreen Mode
          </Typography>
          <IconButton 
            onClick={() => setFullscreenDialog(false)}
            sx={{ color: 'white' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: '100%' }}>
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {renderSlideContent(slide)}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};