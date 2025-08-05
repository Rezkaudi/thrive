// frontend/src/components/admin/SlidesBuilder.tsx
import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Stack,
  Typography,
  Paper,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Divider,
  Grid,
  RadioGroup,
  FormControlLabel,
  Radio,
  Switch,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Tooltip,
  Slider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import {
  Add,
  Delete,
  DragIndicator,
  ContentCopy,
  TextFields,
  Image,
  VideoLibrary,
  Quiz,
  Code,
  Extension,
  ColorLens,
  Wallpaper,
  TouchApp,
  SwapHoriz,
  LinearScale,
  Timeline,
  CompareArrows,
  RecordVoiceOver,
  Hearing,
  School,
  SortByAlpha,
  Category,
  ExpandMore,
  Preview,
  Save,
  PlayArrow,
  VolumeUp,
  PhotoLibrary,
  CloudUpload,
  Settings,
  Visibility,
  CheckCircle,
  Error,
  Help,
  Close
} from '@mui/icons-material';

interface SlideContent {
  type: 'text' | 'image' | 'video' | 'quiz' | 'interactive' | 'code';
  content: any;
  title?: string;
  subtitle?: string;
  alignment?: 'left' | 'center' | 'right';
}

interface Slide {
  id: string;
  content: SlideContent;
  backgroundImage?: string;
  backgroundColor?: string;
  notes?: string;
  transition?: 'slide' | 'fade' | 'zoom' | 'flip';
  duration?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  learningObjectives?: string;
  tags?: string;
}

interface InteractiveContent {
  type: 'drag-drop' | 'fill-blanks' | 'matching' | 'sorting' | 'hotspot' | 'timeline' | 'flashcard' | 'pronunciation' | 'listening' | 'sentence-builder';
  items: any[];
  settings: any;
  instruction: string;
  feedback: {
    correct: string;
    incorrect: string;
  };
}

interface SlidesBuilderProps {
  initialSlides?: Slide[];
  onChange: (slides: Slide[]) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export const SlidesBuilder: React.FC<SlidesBuilderProps> = ({
  initialSlides = [],
  onChange,
}) => {
  const [slides, setSlides] = useState<Slide[]>(
    initialSlides.length > 0 ? initialSlides : [{
      id: Date.now().toString(),
      content: {
        type: 'text',
        content: '',
        title: '',
        subtitle: '',
      },
    }]
  );
  const [activeSlide, setActiveSlide] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [tabValue, setTabValue] = useState(0);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  const updateSlide = (index: number, updates: Partial<Slide>) => {
    const newSlides = [...slides];
    newSlides[index] = { ...newSlides[index], ...updates };
    setSlides(newSlides);
    onChange(newSlides);
    validateSlide(index, newSlides[index]);
  };

  const updateSlideContent = (index: number, contentUpdates: Partial<SlideContent>) => {
    const newSlides = [...slides];
    newSlides[index].content = { ...newSlides[index].content, ...contentUpdates };
    setSlides(newSlides);
    onChange(newSlides);
    validateSlide(index, newSlides[index]);
  };

  const validateSlide = (index: number, slide: Slide) => {
    const errors: string[] = [];

    // Basic validation
    if (!slide.content.title?.trim() && slide.content.type !== 'code') {
      errors.push('Title is required');
    }

    // Type-specific validation
    switch (slide.content.type) {
      case 'image':
        if (!slide.content.content?.url?.trim()) {
          errors.push('Image URL is required');
        }
        break;
      case 'video':
        if (!slide.content.content?.url?.trim()) {
          errors.push('Video URL is required');
        }
        break;
      case 'quiz':
        if (!slide.content.content?.question?.trim()) {
          errors.push('Quiz question is required');
        }
        if ((slide.content.content?.type === 'single-choice' || slide.content.content?.type === 'multiple-choice') &&
          (!slide.content.content?.options ||
            slide.content.content.options.some((opt: string) => !opt.trim()))) {
          errors.push('All quiz options must be filled');
        }
        if (slide.content.content?.type === 'single-choice' &&
          (slide.content.content?.correctAnswer === undefined || slide.content.content?.correctAnswer === null)) {
          errors.push('Correct answer must be selected for single choice');
        }
        if (slide.content.content?.type === 'multiple-choice' &&
          (!slide.content.content?.correctAnswers ||
            slide.content.content.correctAnswers.length === 0)) {
          errors.push('At least one correct answer must be selected for multiple choice');
        }
        break;
      case 'interactive':
        const interactiveContent = slide.content.content as InteractiveContent;
        if (!interactiveContent?.instruction?.trim()) {
          errors.push('Interactive instruction is required');
        }
        if (!interactiveContent?.items?.length) {
          errors.push('At least one interactive item is required');
        }
        break;
      case 'code':
        if (!slide.content.content?.code?.trim()) {
          errors.push('Code content is required');
        }
        break;
    }

    setValidationErrors(prev => ({
      ...prev,
      [index]: errors
    }));
  };

  const addSlide = (type: SlideContent['type'] = 'text') => {
    const newSlide: Slide = {
      id: Date.now().toString(),
      content: getDefaultContent(type),
    };
    const newSlides = [...slides, newSlide];
    setSlides(newSlides);
    setActiveSlide(slides.length);
    onChange(newSlides);
  };

  const duplicateSlide = (index: number) => {
    const slideToDuplicate = slides[index];
    const newSlide: Slide = {
      ...slideToDuplicate,
      id: Date.now().toString(),
      content: { ...slideToDuplicate.content },
    };
    const newSlides = [...slides];
    newSlides.splice(index + 1, 0, newSlide);
    setSlides(newSlides);
    setActiveSlide(index + 1);
    onChange(newSlides);
  };

  const removeSlide = (index: number) => {
    if (slides.length === 1) return;
    const newSlides = slides.filter((_, i) => i !== index);
    setSlides(newSlides);
    if (activeSlide >= newSlides.length) {
      setActiveSlide(newSlides.length - 1);
    }
    onChange(newSlides);
  };

  const getDefaultContent = (type: SlideContent['type']): SlideContent => {
    switch (type) {
      case 'text':
        return { type: 'text', content: '', title: 'New Text Slide', subtitle: '' };
      case 'image':
        return { type: 'image', content: { url: '', alt: '', caption: '' }, title: 'New Image Slide' };
      case 'video':
        return { type: 'video', content: { url: '' }, title: 'New Video Slide' };
      case 'quiz':
        return {
          type: 'quiz',
          content: {
            question: '',
            type: 'single-choice',
            options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
            correctAnswer: 0,
            correctAnswers: [0], // For multiple choice
            explanation: '',
          },
          title: 'New Quiz Slide'
        };
      case 'interactive':
        return {
          type: 'interactive',
          content: {
            type: 'drag-drop',
            instruction: 'Drag items to their correct positions',
            items: [],
            settings: {},
            feedback: {
              correct: 'Excellent! You got it right! 🎉',
              incorrect: 'Not quite right. Try again! 💪'
            }
          },
          title: 'New Interactive Slide',
        };
      case 'code':
        return {
          type: 'code',
          content: { code: '// Enter your code here\nconsole.log("Hello, World!");', language: 'javascript' },
          title: 'New Code Slide',
        };
    }
  };

  const changeSlideType = (index: number, newType: SlideContent['type']) => {
    updateSlideContent(index, getDefaultContent(newType));
  };

  // Quiz slide helper functions
  const addQuizOption = (slideIndex: number) => {
    const slide = slides[slideIndex];
    const newOptions = [...(slide.content.content?.options || []), `Option ${(slide.content.content?.options?.length || 0) + 1}`];
    
    updateSlideContent(slideIndex, {
      content: {
        ...slide.content.content,
        options: newOptions
      }
    });
  };

  const updateQuizSlideOption = (slideIndex: number, optionIndex: number, value: string) => {
    const slide = slides[slideIndex];
    const newOptions = [...(slide.content.content?.options || [])];
    newOptions[optionIndex] = value;
    
    updateSlideContent(slideIndex, {
      content: {
        ...slide.content.content,
        options: newOptions
      }
    });
  };

  const removeQuizSlideOption = (slideIndex: number, optionIndex: number) => {
    const slide = slides[slideIndex];
    const newOptions = slide.content.content?.options?.filter((_: any, i: number) => i !== optionIndex) || [];
    
    let updates: any = {
      options: newOptions
    };

    // Handle single choice - adjust correctAnswer if needed
    if (slide.content.content?.type === 'single-choice') {
      if (slide.content.content?.correctAnswer >= optionIndex && slide.content.content?.correctAnswer > 0) {
        updates.correctAnswer = slide.content.content.correctAnswer - 1;
      } else if (slide.content.content?.correctAnswer === optionIndex) {
        updates.correctAnswer = 0; // Reset to first option if deleted option was selected
      }
    }
    
    // Handle multiple choice - remove from correctAnswers array and adjust indices
    if (slide.content.content?.type === 'multiple-choice') {
      const currentCorrect = slide.content.content?.correctAnswers || [];
      const newCorrect = currentCorrect
        .filter((i: number) => i !== optionIndex) // Remove the deleted option
        .map((i: number) => i > optionIndex ? i - 1 : i); // Adjust indices
      updates.correctAnswers = newCorrect;
    }
    
    updateSlideContent(slideIndex, {
      content: {
        ...slide.content.content,
        ...updates
      }
    });
  };

  const updateInteractiveContent = (slideIndex: number, updates: Partial<InteractiveContent>) => {
    const slide = slides[slideIndex];
    const interactiveContent = slide.content.content as InteractiveContent;

    updateSlideContent(slideIndex, {
      content: {
        ...interactiveContent,
        ...updates
      }
    });
  };

  // Interactive slide type configurations
  const interactiveTypes = [
    {
      value: 'drag-drop',
      label: 'Drag & Drop',
      icon: <TouchApp />,
      description: 'Students drag items to correct positions',
      example: 'Match Japanese words to their English translations',
      difficulty: 'Easy',
      color: '#5C633A'
    },
    {
      value: 'fill-blanks',
      label: 'Fill in the Blanks',
      icon: <LinearScale />,
      description: 'Students fill missing words in sentences',
      example: 'Complete the Japanese sentence: "私は___です"',
      difficulty: 'Medium',
      color: '#A6531C'
    },
    {
      value: 'matching',
      label: 'Matching Pairs',
      icon: <CompareArrows />,
      description: 'Connect related items with lines',
      example: 'Match hiragana characters to their sounds',
      difficulty: 'Easy',
      color: '#45B7D1'
    },
    {
      value: 'sorting',
      label: 'Sort & Order',
      icon: <SortByAlpha />,
      description: 'Arrange items in correct order',
      example: 'Order Japanese numbers from 1 to 10',
      difficulty: 'Medium',
      color: '#9C27B0'
    },
    {
      value: 'hotspot',
      label: 'Hotspot Click',
      icon: <TouchApp />,
      description: 'Click on specific areas of an image',
      example: 'Click on body parts in Japanese',
      difficulty: 'Easy',
      color: '#FF9800'
    },
    {
      value: 'timeline',
      label: 'Timeline',
      icon: <Timeline />,
      description: 'Arrange events chronologically',
      example: 'Order Japanese historical periods',
      difficulty: 'Hard',
      color: '#795548'
    },
    {
      value: 'flashcard',
      label: 'Interactive Flashcards',
      icon: <SwapHoriz />,
      description: 'Flip cards to reveal answers',
      example: 'Kanji flashcards with readings',
      difficulty: 'Easy',
      color: '#2E7D32'
    },
    {
      value: 'pronunciation',
      label: 'Pronunciation Practice',
      icon: <RecordVoiceOver />,
      description: 'Record and compare pronunciation',
      example: 'Practice Japanese pronunciation',
      difficulty: 'Hard',
      color: '#1976D2'
    },
    {
      value: 'listening',
      label: 'Listening Exercise',
      icon: <Hearing />,
      description: 'Audio-based comprehension',
      example: 'Listen and identify Japanese words',
      difficulty: 'Medium',
      color: '#8BC34A'
    },
    {
      value: 'sentence-builder',
      label: 'Sentence Builder',
      icon: <Category />,
      description: 'Build sentences from word blocks',
      example: 'Construct Japanese sentences with correct grammar',
      difficulty: 'Hard',
      color: '#FF5722'
    }
  ];

  const renderSlideEditor = (slide: Slide, index: number) => {
    const { content } = slide;
    const errors = validationErrors[index] || [];

    return (
      <Stack spacing={3}>
        {/* Validation Errors */}
        {errors.length > 0 && (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Please fix the following issues:
            </Typography>
            <List dense>
              {errors.map((error, i) => (
                <ListItem key={i}>
                  <ListItemIcon>
                    <Error color="error" />
                  </ListItemIcon>
                  <ListItemText primary={error} />
                </ListItem>
              ))}
            </List>
          </Alert>
        )}

        {/* Text Slide Editor */}
        {content.type === 'text' && (
          <>
            <TextField
              fullWidth
              label="Title"
              value={content.title || ''}
              onChange={(e) => updateSlideContent(index, { title: e.target.value })}
              error={!content.title?.trim()}
              helperText={!content.title?.trim() ? 'Title is required' : ''}
            />
            <TextField
              fullWidth
              label="Subtitle"
              value={content.subtitle || ''}
              onChange={(e) => updateSlideContent(index, { subtitle: e.target.value })}
            />
            <TextField
              fullWidth
              multiline
              rows={6}
              label="Content"
              value={content.content || ''}
              onChange={(e) => updateSlideContent(index, { content: e.target.value })}
            />
          </>
        )}

        {/* Image Slide Editor */}
        {content.type === 'image' && (
          <>
            <TextField
              fullWidth
              label="Title"
              value={content.title || ''}
              onChange={(e) => updateSlideContent(index, { title: e.target.value })}
              error={!content.title?.trim()}
              helperText={!content.title?.trim() ? 'Title is required' : ''}
            />
            <TextField
              fullWidth
              label="Subtitle"
              value={content.subtitle || ''}
              onChange={(e) => updateSlideContent(index, { subtitle: e.target.value })}
            />
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                fullWidth
                label="Image URL"
                value={content.content?.url || ''}
                onChange={(e) => updateSlideContent(index, {
                  content: { ...content.content, url: e.target.value }
                })}
                error={!content.content?.url?.trim()}
                helperText={!content.content?.url?.trim() ? 'Image URL is required' : ''}
                placeholder="https://example.com/image.jpg or S3 URL"
              />
              <Tooltip title="Upload Image">
                <IconButton color="primary" size="large">
                  <CloudUpload />
                </IconButton>
              </Tooltip>
            </Stack>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  label="Alt Text"
                  value={content.content?.alt || ''}
                  onChange={(e) => updateSlideContent(index, {
                    content: { ...content.content, alt: e.target.value }
                  })}
                  placeholder="Describe the image for accessibility"
                  helperText="Important for screen readers and SEO"
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  label="Caption"
                  value={content.content?.caption || ''}
                  onChange={(e) => updateSlideContent(index, {
                    content: { ...content.content, caption: e.target.value }
                  })}
                  placeholder="Optional caption text"
                />
              </Grid>
            </Grid>
            
            {/* Image Preview */}
            {content.content?.url && (
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    Image Preview
                  </Typography>
                  <Box
                    component="img"
                    src={content.content.url}
                    alt={content.content.alt || 'Preview'}
                    sx={{
                      width: '100%',
                      maxHeight: 300,
                      objectFit: 'contain',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  {content.content.caption && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      {content.content.caption}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Video Slide Editor */}
        {content.type === 'video' && (
          <>
            <TextField
              fullWidth
              label="Title"
              value={content.title || ''}
              onChange={(e) => updateSlideContent(index, { title: e.target.value })}
              error={!content.title?.trim()}
              helperText={!content.title?.trim() ? 'Title is required' : ''}
            />
            <TextField
              fullWidth
              label="Subtitle"
              value={content.subtitle || ''}
              onChange={(e) => updateSlideContent(index, { subtitle: e.target.value })}
            />
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                fullWidth
                label="Video URL"
                value={content.content?.url || ''}
                onChange={(e) => updateSlideContent(index, {
                  content: { ...content.content, url: e.target.value }
                })}
                error={!content.content?.url?.trim()}
                helperText={!content.content?.url?.trim() ? 'Video URL is required' : 'Supports YouTube, Vimeo, or direct video URLs'}
                placeholder="https://youtube.com/watch?v=... or S3 URL"
              />
              <Tooltip title="Upload Video">
                <IconButton color="primary" size="large">
                  <CloudUpload />
                </IconButton>
              </Tooltip>
            </Stack>
            
            {/* Video Preview */}
            {content.content?.url && (
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    Video Preview
                  </Typography>
                  <Box
                    sx={{
                      width: '100%',
                      height: 300,
                      bgcolor: 'grey.100',
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <Stack alignItems="center" spacing={2}>
                      <VideoLibrary sx={{ fontSize: 48, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        Video Player Preview
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<PlayArrow />}
                        size="small"
                      >
                        Test Video
                      </Button>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Quiz Slide Editor */}
        {content.type === 'quiz' && (
          <>
            <TextField
              fullWidth
              label="Title"
              value={content.title || ''}
              onChange={(e) => updateSlideContent(index, { title: e.target.value })}
              error={!content.title?.trim()}
              helperText={!content.title?.trim() ? 'Title is required' : ''}
            />
            
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Question"
              value={content.content?.question || ''}
              onChange={(e) => updateSlideContent(index, {
                content: { ...content.content, question: e.target.value }
              })}
              error={!content.content?.question?.trim()}
              helperText={!content.content?.question?.trim() ? 'Question is required' : ''}
              placeholder="Enter your quiz question here..."
            />

            <FormControl fullWidth>
              <InputLabel>Quiz Type</InputLabel>
              <Select
                value={content.content?.type || 'single-choice'}
                label="Quiz Type"
                onChange={(e) => {
                  const newType = e.target.value;
                  let updates: any = { type: newType };
                  
                  // Convert between types
                  if (newType === 'single-choice' && content.content?.type === 'multiple-choice') {
                    // Convert multiple choice to single choice - use first correct answer
                    const firstCorrect = content.content?.correctAnswers?.[0] || 0;
                    updates.correctAnswer = firstCorrect;
                    updates.correctAnswers = undefined;
                  } else if (newType === 'multiple-choice' && content.content?.type === 'single-choice') {
                    // Convert single choice to multiple choice - use current correct answer
                    const currentCorrect = content.content?.correctAnswer || 0;
                    updates.correctAnswers = [currentCorrect];
                    updates.correctAnswer = undefined;
                  }
                  
                  updateSlideContent(index, {
                    content: { ...content.content, ...updates }
                  });
                }}
              >
                <MenuItem value="single-choice">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Quiz />
                    <Box>
                      <Typography>Single Choice</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Students select one correct answer
                      </Typography>
                    </Box>
                  </Stack>
                </MenuItem>
                <MenuItem value="multiple-choice">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CheckCircle />
                    <Box>
                      <Typography>Multiple Choice</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Students can select multiple correct answers
                      </Typography>
                    </Box>
                  </Stack>
                </MenuItem>
              </Select>
            </FormControl>

            {/* Quiz Options */}
            {(content.content?.type === 'single-choice' || content.content?.type === 'multiple-choice') && (
              <Card variant="outlined" sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                  <Typography variant="h6" fontWeight={600}>
                    Answer Options
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => addQuizOption(index)}
                    size="small"
                    sx={{ borderRadius: 2 }}
                  >
                    Add Option
                  </Button>
                </Stack>

                <Stack spacing={2}>
                  {(content.content?.options || []).map((option: string, optionIndex: number) => (
                    <Stack key={optionIndex} direction="row" spacing={2} alignItems="center">
                      {content.content?.type === 'single-choice' ? (
                        <FormControlLabel
                          control={
                            <Radio
                              checked={content.content?.correctAnswer === optionIndex}
                              onChange={() => updateSlideContent(index, {
                                content: { ...content.content, correctAnswer: optionIndex }
                              })}
                              color="success"
                            />
                          }
                          label=""
                          sx={{ mr: 0 }}
                        />
                      ) : (
                        <FormControlLabel
                          control={
                            <input
                              type="checkbox"
                              checked={content.content?.correctAnswers?.includes(optionIndex) || false}
                              onChange={(e) => {
                                const currentCorrect = content.content?.correctAnswers || [];
                                const newCorrect = e.target.checked
                                  ? [...currentCorrect, optionIndex]
                                  : currentCorrect.filter((i: number) => i !== optionIndex);
                                updateSlideContent(index, {
                                  content: { ...content.content, correctAnswers: newCorrect }
                                });
                              }}
                              style={{ 
                                width: 20, 
                                height: 20, 
                                accentColor: '#4caf50',
                                cursor: 'pointer'
                              }}
                            />
                          }
                          label=""
                          sx={{ mr: 0 }}
                        />
                      )}
                      <TextField
                        fullWidth
                        label={`Option ${optionIndex + 1}`}
                        value={option}
                        onChange={(e) => updateQuizSlideOption(index, optionIndex, e.target.value)}
                        error={!option.trim()}
                        helperText={
                          content.content?.type === 'single-choice' 
                            ? (content.content?.correctAnswer === optionIndex ? 'Correct Answer' : '')
                            : (content.content?.correctAnswers?.includes(optionIndex) ? 'Correct Answer' : '')
                        }
                        placeholder={`Enter option ${optionIndex + 1}...`}
                      />
                      <Tooltip title="Delete Option">
                        <IconButton
                          color="error"
                          onClick={() => removeQuizSlideOption(index, optionIndex)}
                          disabled={(content.content?.options?.length || 0) <= 2}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  ))}
                </Stack>

                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    {content.content?.type === 'single-choice' 
                      ? '💡 Select the radio button next to the correct answer. Students will see these options in random order.'
                      : '💡 Check all correct answers. Students can select multiple options.'
                    }
                  </Typography>
                </Alert>
              </Card>
            )}

            {/* Explanation */}
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Explanation (optional)"
              value={content.content?.explanation || ''}
              onChange={(e) => updateSlideContent(index, {
                content: { ...content.content, explanation: e.target.value }
              })}
              placeholder="Explain why this is the correct answer..."
              helperText="This explanation will be shown to students after they answer"
            />

            {/* Quiz Preview */}
            <Card sx={{ bgcolor: 'grey.50', borderRadius: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom fontWeight={600}>
                  📋 Quiz Preview
                </Typography>
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="h6" gutterBottom>
                  {content.content?.question || 'Your question will appear here...'}
                </Typography>

                {content.content?.type === 'single-choice' && (
                  <Stack spacing={1} sx={{ mt: 2 }}>
                    {(content.content?.options || []).map((option: string, optionIndex: number) => (
                      <FormControlLabel
                        key={optionIndex}
                        control={<Radio disabled />}
                        label={option || `Option ${optionIndex + 1}`}
                        sx={{
                          bgcolor: content.content?.correctAnswer === optionIndex ? 'success.light' : 'transparent',
                          borderRadius: 1,
                          px: 1,
                          border: content.content?.correctAnswer === optionIndex ? '2px solid' : 'none',
                          borderColor: 'success.main'
                        }}
                      />
                    ))}
                  </Stack>
                )}

                {content.content?.type === 'multiple-choice' && (
                  <Stack spacing={1} sx={{ mt: 2 }}>
                    {(content.content?.options || []).map((option: string, optionIndex: number) => (
                      <FormControlLabel
                        key={optionIndex}
                        control={
                          <input
                            type="checkbox"
                            disabled
                            checked={content.content?.correctAnswers?.includes(optionIndex) || false}
                            style={{ 
                              width: 16, 
                              height: 16, 
                              accentColor: '#4caf50'
                            }}
                          />
                        }
                        label={option || `Option ${optionIndex + 1}`}
                        sx={{
                          bgcolor: content.content?.correctAnswers?.includes(optionIndex) ? 'success.light' : 'transparent',
                          borderRadius: 1,
                          px: 1,
                          border: content.content?.correctAnswers?.includes(optionIndex) ? '2px solid' : 'none',
                          borderColor: 'success.main'
                        }}
                      />
                    ))}
                  </Stack>
                )}

                {content.content?.explanation && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>Explanation:</strong> {content.content.explanation}
                    </Typography>
                  </Alert>
                )}

                <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                  <Typography variant="caption" color="info.dark">
                    <strong>Quiz Type:</strong> {content.content?.type === 'single-choice' ? 'Single Choice (select one)' : 'Multiple Choice (select all that apply)'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </>
        )}

        {/* Code Slide Editor */}
        {content.type === 'code' && (
          <>
            <TextField
              fullWidth
              label="Title"
              value={content.title || ''}
              onChange={(e) => updateSlideContent(index, { title: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Programming Language</InputLabel>
              <Select
                value={content.content?.language || 'javascript'}
                label="Programming Language"
                onChange={(e) => updateSlideContent(index, {
                  content: { ...content.content, language: e.target.value }
                })}
              >
                <MenuItem value="javascript">JavaScript</MenuItem>
                <MenuItem value="python">Python</MenuItem>
                <MenuItem value="java">Java</MenuItem>
                <MenuItem value="cpp">C++</MenuItem>
                <MenuItem value="html">HTML</MenuItem>
                <MenuItem value="css">CSS</MenuItem>
                <MenuItem value="sql">SQL</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              multiline
              rows={12}
              label="Code"
              value={content.content?.code || ''}
              onChange={(e) => updateSlideContent(index, {
                content: { ...content.content, code: e.target.value }
              })}
              error={!content.content?.code?.trim()}
              helperText={!content.content?.code?.trim() ? 'Code content is required' : ''}
              sx={{
                '& .MuiInputBase-input': {
                  fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                  fontSize: '0.875rem'
                }
              }}
            />
          </>
        )}

        {/* Interactive Editor would go here */}
        {content.type === 'interactive' && (
          <Alert severity="info">
            Interactive slides editor would be implemented here with the same comprehensive interface as shown before.
          </Alert>
        )}
      </Stack>
    );
  };

  const getSlideIcon = (type: string) => {
    switch (type) {
      case 'text': return <TextFields />;
      case 'image': return <Image />;
      case 'video': return <VideoLibrary />;
      case 'quiz': return <Quiz />;
      case 'interactive': return <Extension />;
      case 'code': return <Code />;
      default: return <TextFields />;
    }
  };

  const getSlideTypeColor = (type: string) => {
    switch (type) {
      case 'text': return '#1976D2';
      case 'image': return '#388E3C';
      case 'video': return '#F57C00';
      case 'quiz': return '#7B1FA2';
      case 'interactive': return '#C2185B';
      case 'code': return '#5D4037';
      default: return '#757575';
    }
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Slide List */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper sx={{ p: 2, height: 'fit-content', position: 'sticky', top: 20 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" gutterBottom>
                Slides ({slides.length})
              </Typography>
              <Tooltip title="Toggle Advanced Settings">
                <IconButton
                  size="small"
                  onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                  color={showAdvancedSettings ? 'primary' : 'default'}
                >
                  <Settings />
                </IconButton>
              </Tooltip>
            </Stack>

            <Stack spacing={1} sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {slides.map((slide, index) => {
                const errors = validationErrors[index] || [];
                const hasErrors = errors.length > 0;

                return (
                  <Paper
                    key={slide.id}
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      bgcolor: activeSlide === index ? 'primary.light' : 'background.paper',
                      border: '2px solid',
                      borderColor: hasErrors ? 'error.main' : activeSlide === index ? 'primary.main' : 'transparent',
                      '&:hover': {
                        bgcolor: activeSlide === index ? 'primary.light' : 'action.hover',
                        borderColor: hasErrors ? 'error.main' : 'primary.main'
                      },
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => setActiveSlide(index)}
                  >
                    <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                      <IconButton
                        size="small"
                        sx={{
                          cursor: 'grab',
                          color: getSlideTypeColor(slide.content.type)
                        }}
                      >
                        <DragIndicator />
                      </IconButton>
                      <Avatar
                        sx={{
                          width: 24,
                          height: 24,
                          bgcolor: getSlideTypeColor(slide.content.type),
                          '& .MuiSvgIcon-root': { fontSize: 14 }
                        }}
                      >
                        {getSlideIcon(slide.content.type)}
                      </Avatar>
                      <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: 500 }}>
                        Slide {index + 1}
                      </Typography>
                      {hasErrors && (
                        <Tooltip title={`${errors.length} error${errors.length > 1 ? 's' : ''}`}>
                          <Error color="error" fontSize="small" />
                        </Tooltip>
                      )}
                    </Stack>

                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      {slide.content.title || 'Untitled'}
                    </Typography>

                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Chip
                        label={slide.content.type}
                        size="small"
                        sx={{
                          bgcolor: getSlideTypeColor(slide.content.type) + '20',
                          color: getSlideTypeColor(slide.content.type),
                          fontWeight: 600,
                          fontSize: '0.65rem'
                        }}
                      />
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Duplicate Slide">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              duplicateSlide(index);
                            }}
                          >
                            <ContentCopy sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Slide">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSlide(index);
                            }}
                            disabled={slides.length === 1}
                          >
                            <Delete sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" gutterBottom>
              Add New Slide
            </Typography>
            <Grid container spacing={1}>
              {(['text', 'image', 'video', 'quiz', 'code', 'interactive'] as const).map(type => (
                <Grid size={{ xs: 4 }} key={type}>
                  <Tooltip title={`Add ${type} slide`}>
                    <Button
                      fullWidth
                      size="small"
                      onClick={() => addSlide(type)}
                      sx={{
                        flexDirection: 'column',
                        py: 1,
                        color: getSlideTypeColor(type),
                        borderColor: getSlideTypeColor(type) + '40',
                        '&:hover': {
                          borderColor: getSlideTypeColor(type),
                          bgcolor: getSlideTypeColor(type) + '10'
                        }
                      }}
                      variant="outlined"
                    >
                      {getSlideIcon(type)}
                      <Typography variant="caption" sx={{ mt: 0.5, textTransform: 'capitalize' }}>
                        {type}
                      </Typography>
                    </Button>
                  </Tooltip>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Slide Editor */}
        <Grid size={{ xs: 12, md: 9 }}>
          <Paper sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h5" fontWeight={600}>
                    Edit Slide {activeSlide + 1}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {slides[activeSlide]?.content.title || 'Untitled slide'}
                  </Typography>
                </Box>

                <Stack direction="row" spacing={2}>
                  <FormControl size="small" sx={{ width: 150 }}>
                    <InputLabel>Slide Type</InputLabel>
                    <Select
                      value={slides[activeSlide].content.type}
                      label="Slide Type"
                      onChange={(e) => changeSlideType(activeSlide, e.target.value as any)}
                    >
                      <MenuItem value="text">
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <TextFields sx={{ fontSize: 18 }} />
                          <Typography>Text</Typography>
                        </Stack>
                      </MenuItem>
                      <MenuItem value="image">
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Image sx={{ fontSize: 18 }} />
                          <Typography>Image</Typography>
                        </Stack>
                      </MenuItem>
                      <MenuItem value="video">
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <VideoLibrary sx={{ fontSize: 18 }} />
                          <Typography>Video</Typography>
                        </Stack>
                      </MenuItem>
                      <MenuItem value="quiz">
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Quiz sx={{ fontSize: 18 }} />
                          <Typography>Quiz</Typography>
                        </Stack>
                      </MenuItem>
                      <MenuItem value="interactive">
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Extension sx={{ fontSize: 18 }} />
                          <Typography>Interactive</Typography>
                        </Stack>
                      </MenuItem>
                      <MenuItem value="code">
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Code sx={{ fontSize: 18 }} />
                          <Typography>Code</Typography>
                        </Stack>
                      </MenuItem>
                    </Select>
                  </FormControl>

                  <Button
                    variant="outlined"
                    startIcon={<Preview />}
                    onClick={() => setPreviewMode(true)}
                    sx={{ borderRadius: 2 }}
                  >
                    Preview
                  </Button>

                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    sx={{ borderRadius: 2 }}
                  >
                    Save
                  </Button>
                </Stack>
              </Stack>

              <Divider />

              {/* Content Editor */}
              {renderSlideEditor(slides[activeSlide], activeSlide)}

            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Summary */}
      <Paper sx={{ p: 3, mt: 3, bgcolor: 'primary.50', borderRadius: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="h6" fontWeight={600} color="primary.main">
              📊 Presentation Summary: {slides.length} slides total
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {Object.values(validationErrors).reduce((acc, errors) => acc + errors.length, 0)} validation issues
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<PlayArrow />}
              onClick={() => setPreviewMode(true)}
            >
              Preview Presentation
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};