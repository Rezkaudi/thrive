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
        if (slide.content.content?.type === 'multiple-choice' &&
          (!slide.content.content?.options ||
            slide.content.content.options.some((opt: string) => !opt.trim()))) {
          errors.push('All quiz options must be filled');
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

  // const moveSlide = (fromIndex: number, toIndex: number) => {
  //   const newSlides = [...slides];
  //   const [movedSlide] = newSlides.splice(fromIndex, 1);
  //   newSlides.splice(toIndex, 0, movedSlide);
  //   setSlides(newSlides);
  //   setActiveSlide(toIndex);
  //   onChange(newSlides);
  // };

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
            type: 'multiple-choice',
            options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
            correctAnswer: 0,
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

  const renderInteractiveTypeSelector = (slide: Slide, index: number) => {
    const interactiveContent = slide.content.content as InteractiveContent;
    const currentType = interactiveContent?.type || 'drag-drop';

    return (
      <Card sx={{ mb: 3, border: '2px solid', borderColor: 'primary.main', borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
            Choose Interactive Type
          </Typography>

          <Grid container spacing={2}>
            {interactiveTypes.map((type) => {
              const isSelected = currentType === type.value;
              return (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={type.value}>
                  <Card
                    onClick={() => {
                      updateInteractiveContent(index, {
                        type: type.value as any,
                        items: [],
                        settings: {},
                        instruction: getDefaultInstruction(type.value),
                        feedback: {
                          correct: 'Excellent! You got it right! 🎉',
                          incorrect: 'Not quite right. Try again! 💪'
                        }
                      });
                    }}
                    sx={{
                      cursor: 'pointer',
                      height: '100%',
                      border: '2px solid',
                      borderColor: isSelected ? type.color : 'transparent',
                      bgcolor: isSelected ? `${type.color}10` : 'background.paper',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: type.color,
                        transform: 'translateY(-4px)',
                        boxShadow: `0 8px 25px ${type.color}40`
                      }
                    }}
                  >
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <Avatar
                        sx={{
                          bgcolor: type.color,
                          width: 56,
                          height: 56,
                          mx: 'auto',
                          mb: 2
                        }}
                      >
                        {type.icon}
                      </Avatar>

                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {type.label}
                      </Typography>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                        {type.description}
                      </Typography>

                      <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 2 }}>
                        <Chip
                          label={type.difficulty}
                          size="small"
                          sx={{
                            bgcolor: type.color + '20',
                            color: type.color,
                            fontWeight: 600
                          }}
                        />
                      </Stack>

                      <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                        {type.example}
                      </Typography>

                      {isSelected && (
                        <CheckCircle sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          color: type.color
                        }} />
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>
    );
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

  const renderInteractiveEditor = (slide: Slide, index: number) => {
    const interactiveContent = slide.content.content as InteractiveContent;
    const currentType = interactiveContent?.type || 'drag-drop';

    const addInteractiveItem = () => {
      const newItem = getDefaultInteractiveItem(currentType);
      updateInteractiveContent(index, {
        items: [...(interactiveContent.items || []), newItem]
      });
    };

    const updateInteractiveItem = (itemIndex: number, updates: any) => {
      const newItems = [...(interactiveContent.items || [])];
      newItems[itemIndex] = { ...newItems[itemIndex], ...updates };
      updateInteractiveContent(index, { items: newItems });
    };

    const removeInteractiveItem = (itemIndex: number) => {
      const newItems = (interactiveContent.items || []).filter((_, i) => i !== itemIndex);
      updateInteractiveContent(index, { items: newItems });
    };

    const getDefaultInteractiveItem = (type: string) => {
      const id = Date.now() + Math.random();
      switch (type) {
        case 'drag-drop':
          return { id, text: '', target: '', category: '' };
        case 'fill-blanks':
          return { id, sentence: 'I am ___ student', blanks: ['a'], translation: 'I am a student' };
        case 'matching':
          return { id, left: '', right: '', pair: id };
        case 'sorting':
          return { id, text: '', correctOrder: 0 };
        case 'hotspot':
          return { id, x: 50, y: 50, label: '', feedback: '' };
        case 'timeline':
          return { id, event: '', date: '', description: '' };
        case 'flashcard':
          return { id, front: '', back: '', category: 'vocabulary' };
        case 'pronunciation':
          return { id, text: '', pronunciation: '', audioUrl: '' };
        case 'listening':
          return { id, audioUrl: '', question: '', options: ['Option 1', 'Option 2', 'Option 3'], correct: 0 };
        case 'sentence-builder':
          return { id, words: [''], correctOrder: [], translation: '' };
        default:
          return { id, text: '' };
      }
    };

    return (
      <Box>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
          <Tab label="Type Selection" />
          <Tab label="Content" />
          <Tab label="Settings" />
          <Tab label="Preview" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          {renderInteractiveTypeSelector(slide, index)}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Instructions"
              multiline
              rows={3}
              value={interactiveContent?.instruction || ''}
              onChange={(e) => updateInteractiveContent(index, { instruction: e.target.value })}
              helperText="Clear instructions for students on what to do"
            />

            {/* Feedback Settings */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Feedback Messages
                  </Typography>
                  <Chip label="Important" size="small" color="primary" />
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label="Correct Answer Feedback"
                    value={interactiveContent?.feedback?.correct || ''}
                    onChange={(e) => updateInteractiveContent(index, {
                      feedback: {
                        ...interactiveContent?.feedback,
                        correct: e.target.value
                      }
                    })}
                    placeholder="Excellent! You got it right! 🎉"
                  />
                  <TextField
                    fullWidth
                    label="Incorrect Answer Feedback"
                    value={interactiveContent?.feedback?.incorrect || ''}
                    onChange={(e) => updateInteractiveContent(index, {
                      feedback: {
                        ...interactiveContent?.feedback,
                        incorrect: e.target.value
                      }
                    })}
                    placeholder="Not quite right. Try again! 💪"
                  />
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Interactive Items */}
            <Card variant="outlined" sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" fontWeight={600}>
                  {interactiveTypes.find(t => t.value === currentType)?.label} Items
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={addInteractiveItem}
                  size="small"
                  sx={{ borderRadius: 2 }}
                >
                  Add Item
                </Button>
              </Stack>

              {(!interactiveContent.items || interactiveContent.items.length === 0) ? (
                <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Box sx={{ mb: 2 }}>
                    {interactiveTypes.find(t => t.value === currentType)?.icon}
                  </Box>
                  <Typography color="text.secondary" gutterBottom>
                    No items added yet. Click "Add Item" to get started.
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {interactiveTypes.find(t => t.value === currentType)?.example}
                  </Typography>
                </Paper>
              ) : (
                <Stack spacing={3}>
                  {interactiveContent.items.map((item: any, itemIndex: number) => (
                    <Card key={item.id || itemIndex} variant="outlined" sx={{
                      border: '2px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      '&:hover': {
                        borderColor: 'primary.main'
                      }
                    }}>
                      <CardContent>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                          <Chip
                            label={`Item ${itemIndex + 1}`}
                            color="primary"
                            variant="outlined"
                            icon={<DragIndicator />}
                          />
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="Duplicate Item">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  const duplicatedItem = { ...item, id: Date.now() + Math.random() };
                                  const newItems = [...interactiveContent.items];
                                  newItems.splice(itemIndex + 1, 0, duplicatedItem);
                                  updateInteractiveContent(index, { items: newItems });
                                }}
                              >
                                <ContentCopy fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Item">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => removeInteractiveItem(itemIndex)}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </Stack>

                        {renderInteractiveItemEditor(currentType, item, itemIndex, updateInteractiveItem)}
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              )}
            </Card>
          </Stack>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {renderTypeSpecificSettings(currentType, interactiveContent, (updates: any) => updateInteractiveContent(index, updates))}
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Preview functionality would show how this interactive slide appears to students.
            This would render the actual interactive component in a preview mode.
          </Alert>
          <Paper sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Interactive Preview
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Type: {interactiveTypes.find(t => t.value === currentType)?.label}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Items: {interactiveContent.items?.length || 0}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Preview />}
              sx={{ mt: 2 }}
              onClick={() => setPreviewMode(true)}
            >
              Full Preview
            </Button>
          </Paper>
        </TabPanel>
      </Box>
    );
  };

  const getDefaultInstruction = (type: string): string => {
    const typeConfig = interactiveTypes.find(t => t.value === type);
    return typeConfig?.description || 'Complete the interactive activity';
  };

  const renderInteractiveItemEditor = (type: string, item: any, itemIndex: number, updateItem: Function) => {
    switch (type) {
      case 'drag-drop':
        return (
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                label="Draggable Item"
                value={item.text || ''}
                onChange={(e) => updateItem(itemIndex, { text: e.target.value })}
                placeholder="e.g., こんにちは"
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                label="Target/Answer"
                value={item.target || ''}
                onChange={(e) => updateItem(itemIndex, { target: e.target.value })}
                placeholder="e.g., Hello"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Category (optional)"
                value={item.category || ''}
                onChange={(e) => updateItem(itemIndex, { category: e.target.value })}
                placeholder="e.g., Greetings"
              />
            </Grid>
          </Grid>
        );

      case 'fill-blanks':
        return (
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Sentence with Blanks"
              value={item.sentence || ''}
              onChange={(e) => updateItem(itemIndex, { sentence: e.target.value })}
              placeholder="Use ___ for blanks: I am ___ student"
              helperText="Use underscores (_) to mark where students should fill in words"
            />
            <TextField
              fullWidth
              label="Correct Answers (comma-separated)"
              value={Array.isArray(item.blanks) ? item.blanks.join(', ') : ''}
              onChange={(e) => updateItem(itemIndex, { blanks: e.target.value.split(',').map((s: string) => s.trim()) })}
              placeholder="e.g., a, student, learning"
            />
            <TextField
              fullWidth
              label="Translation (optional)"
              value={item.translation || ''}
              onChange={(e) => updateItem(itemIndex, { translation: e.target.value })}
              placeholder="e.g., I am a student"
            />
          </Stack>
        );

      case 'matching':
        return (
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                label="Left Item"
                value={item.left || ''}
                onChange={(e) => updateItem(itemIndex, { left: e.target.value })}
                placeholder="e.g., ありがとう"
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                label="Right Item (Match)"
                value={item.right || ''}
                onChange={(e) => updateItem(itemIndex, { right: e.target.value })}
                placeholder="e.g., Thank you"
              />
            </Grid>
          </Grid>
        );

      case 'sorting':
        return (
          <Grid container spacing={2}>
            <Grid size={{ xs: 8 }}>
              <TextField
                fullWidth
                label="Item to Sort"
                value={item.text || ''}
                onChange={(e) => updateItem(itemIndex, { text: e.target.value })}
                placeholder="e.g., 一 (one)"
              />
            </Grid>
            <Grid size={{ xs: 4 }}>
              <TextField
                fullWidth
                type="number"
                label="Correct Position"
                value={item.correctOrder || 0}
                onChange={(e) => updateItem(itemIndex, { correctOrder: parseInt(e.target.value) })}
                inputProps={{ min: 1 }}
                helperText="Position in final order"
              />
            </Grid>
          </Grid>
        );

      case 'hotspot':
        return (
          <Grid container spacing={2}>
            <Grid size={{ xs: 4 }}>
              <TextField
                fullWidth
                type="number"
                label="X Position (%)"
                value={item.x || 50}
                onChange={(e) => updateItem(itemIndex, { x: parseInt(e.target.value) })}
                inputProps={{ min: 0, max: 100 }}
              />
            </Grid>
            <Grid size={{ xs: 4 }}>
              <TextField
                fullWidth
                type="number"
                label="Y Position (%)"
                value={item.y || 50}
                onChange={(e) => updateItem(itemIndex, { y: parseInt(e.target.value) })}
                inputProps={{ min: 0, max: 100 }}
              />
            </Grid>
            <Grid size={{ xs: 4 }}>
              <TextField
                fullWidth
                label="Label"
                value={item.label || ''}
                onChange={(e) => updateItem(itemIndex, { label: e.target.value })}
                placeholder="e.g., 目 (eye)"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Feedback Text"
                value={item.feedback || ''}
                onChange={(e) => updateItem(itemIndex, { feedback: e.target.value })}
                placeholder="Feedback when this hotspot is clicked"
              />
            </Grid>
          </Grid>
        );

      case 'timeline':
        return (
          <Stack spacing={2}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 8 }}>
                <TextField
                  fullWidth
                  label="Event"
                  value={item.event || ''}
                  onChange={(e) => updateItem(itemIndex, { event: e.target.value })}
                  placeholder="e.g., Meiji Restoration"
                />
              </Grid>
              <Grid size={{ xs: 4 }}>
                <TextField
                  fullWidth
                  label="Date/Year"
                  value={item.date || ''}
                  onChange={(e) => updateItem(itemIndex, { date: e.target.value })}
                  placeholder="e.g., 1868"
                />
              </Grid>
            </Grid>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Description"
              value={item.description || ''}
              onChange={(e) => updateItem(itemIndex, { description: e.target.value })}
              placeholder="Brief description of the event"
            />
          </Stack>
        );

      case 'flashcard':
        return (
          <Stack spacing={2}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Front of Card"
                  value={item.front || ''}
                  onChange={(e) => updateItem(itemIndex, { front: e.target.value })}
                  placeholder="e.g., 漢字"
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Back of Card"
                  value={item.back || ''}
                  onChange={(e) => updateItem(itemIndex, { back: e.target.value })}
                  placeholder="e.g., Kanji - Chinese characters"
                />
              </Grid>
            </Grid>
            <TextField
              fullWidth
              label="Category"
              value={item.category || ''}
              onChange={(e) => updateItem(itemIndex, { category: e.target.value })}
              placeholder="e.g., Vocabulary, Grammar"
            />
          </Stack>
        );

      case 'pronunciation':
        return (
          <Stack spacing={2}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  label="Text to Pronounce"
                  value={item.text || ''}
                  onChange={(e) => updateItem(itemIndex, { text: e.target.value })}
                  placeholder="e.g., おはようございます"
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  label="Romanization"
                  value={item.pronunciation || ''}
                  onChange={(e) => updateItem(itemIndex, { pronunciation: e.target.value })}
                  placeholder="e.g., ohayou gozaimasu"
                />
              </Grid>
            </Grid>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                fullWidth
                label="Reference Audio URL"
                value={item.audioUrl || ''}
                onChange={(e) => updateItem(itemIndex, { audioUrl: e.target.value })}
                placeholder="S3 URL for reference pronunciation"
              />
              <Tooltip title="Upload Audio File">
                <IconButton color="primary">
                  <CloudUpload />
                </IconButton>
              </Tooltip>
              {item.audioUrl && (
                <Tooltip title="Test Audio">
                  <IconButton color="success">
                    <VolumeUp />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </Stack>
        );

      case 'listening':
        return (
          <Stack spacing={2}>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                fullWidth
                label="Audio URL"
                value={item.audioUrl || ''}
                onChange={(e) => updateItem(itemIndex, { audioUrl: e.target.value })}
                placeholder="S3 URL for audio file"
              />
              <Tooltip title="Upload Audio File">
                <IconButton color="primary">
                  <CloudUpload />
                </IconButton>
              </Tooltip>
              {item.audioUrl && (
                <Tooltip title="Test Audio">
                  <IconButton color="success">
                    <VolumeUp />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
            <TextField
              fullWidth
              label="Question"
              value={item.question || ''}
              onChange={(e) => updateItem(itemIndex, { question: e.target.value })}
              placeholder="What did you hear?"
            />
            <TextField
              fullWidth
              label="Answer Options (comma-separated)"
              value={Array.isArray(item.options) ? item.options.join(', ') : ''}
              onChange={(e) => updateItem(itemIndex, { options: e.target.value.split(',').map((s: string) => s.trim()) })}
              placeholder="e.g., Hello, Goodbye, Thank you"
            />
            <TextField
              fullWidth
              type="number"
              label="Correct Answer Index (0-based)"
              value={item.correct || 0}
              onChange={(e) => updateItem(itemIndex, { correct: parseInt(e.target.value) })}
              inputProps={{ min: 0 }}
              helperText="Index of the correct option (starting from 0)"
            />
          </Stack>
        );

      case 'sentence-builder':
        return (
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Word Blocks (comma-separated)"
              value={Array.isArray(item.words) ? item.words.join(', ') : ''}
              onChange={(e) => updateItem(itemIndex, { words: e.target.value.split(',').map((s: string) => s.trim()) })}
              placeholder="e.g., 私, は, 学生, です"
            />
            <TextField
              fullWidth
              label="Correct Order (comma-separated indices)"
              value={Array.isArray(item.correctOrder) ? item.correctOrder.join(', ') : ''}
              onChange={(e) => updateItem(itemIndex, { correctOrder: e.target.value.split(',').map((s: string) => parseInt(s.trim())) })}
              placeholder="e.g., 0, 1, 2, 3 (order of words above)"
              helperText="Indices start from 0. Order corresponds to word positions above."
            />
            <TextField
              fullWidth
              label="Translation"
              value={item.translation || ''}
              onChange={(e) => updateItem(itemIndex, { translation: e.target.value })}
              placeholder="e.g., I am a student"
            />
          </Stack>
        );

      default:
        return (
          <TextField
            fullWidth
            label="Content"
            value={item.text || ''}
            onChange={(e) => updateItem(itemIndex, { text: e.target.value })}
          />
        );
    }
  };

  const renderTypeSpecificSettings = (type: string, content: InteractiveContent, updateContent: Function) => {
    switch (type) {
      case 'drag-drop':
        return (
          <Stack spacing={3}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Drag & Drop Settings
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={content.settings?.showHints || false}
                  onChange={(e) => updateContent({
                    settings: { ...content.settings, showHints: e.target.checked }
                  })}
                />
              }
              label="Show hints for target areas"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={content.settings?.snapToTarget !== false}
                  onChange={(e) => updateContent({
                    settings: { ...content.settings, snapToTarget: e.target.checked }
                  })}
                />
              }
              label="Snap items to targets when dropped nearby"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={content.settings?.allowMultipleAttempts !== false}
                  onChange={(e) => updateContent({
                    settings: { ...content.settings, allowMultipleAttempts: e.target.checked }
                  })}
                />
              }
              label="Allow multiple attempts"
            />
          </Stack>
        );

      case 'hotspot':
        return (
          <Stack spacing={3}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Hotspot Settings
            </Typography>
            <TextField
              fullWidth
              label="Background Image URL"
              value={content.settings?.imageUrl || ''}
              onChange={(e) => updateContent({
                settings: { ...content.settings, imageUrl: e.target.value }
              })}
              placeholder="S3 URL for the background image"
              InputProps={{
                endAdornment: (
                  <Tooltip title="Upload Image">
                    <IconButton>
                      <PhotoLibrary />
                    </IconButton>
                  </Tooltip>
                )
              }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={content.settings?.showAllHotspots || false}
                  onChange={(e) => updateContent({
                    settings: { ...content.settings, showAllHotspots: e.target.checked }
                  })}
                />
              }
              label="Show all hotspot indicators initially"
            />
            <Box>
              <Typography gutterBottom>Hotspot Size</Typography>
              <Slider
                value={content.settings?.hotspotSize || 40}
                onChange={(e, value) => updateContent({
                  settings: { ...content.settings, hotspotSize: value }
                })}
                min={20}
                max={80}
                valueLabelDisplay="auto"
                marks={[
                  { value: 20, label: 'Small' },
                  { value: 40, label: 'Medium' },
                  { value: 80, label: 'Large' }
                ]}
              />
            </Box>
          </Stack>
        );

      case 'pronunciation':
        return (
          <Stack spacing={3}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Pronunciation Settings
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={content.settings?.enableRecording !== false}
                  onChange={(e) => updateContent({
                    settings: { ...content.settings, enableRecording: e.target.checked }
                  })}
                />
              }
              label="Enable student recording"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={content.settings?.showWaveform || false}
                  onChange={(e) => updateContent({
                    settings: { ...content.settings, showWaveform: e.target.checked }
                  })}
                />
              }
              label="Show audio waveform visualization"
            />
            <Box>
              <Typography gutterBottom>Recording Time Limit (seconds)</Typography>
              <Slider
                value={content.settings?.recordingTimeLimit || 30}
                onChange={(e, value) => updateContent({
                  settings: { ...content.settings, recordingTimeLimit: value }
                })}
                min={10}
                max={120}
                valueLabelDisplay="auto"
                marks={[
                  { value: 10, label: '10s' },
                  { value: 30, label: '30s' },
                  { value: 60, label: '1m' },
                  { value: 120, label: '2m' }
                ]}
              />
            </Box>
          </Stack>
        );

      case 'flashcard':
        return (
          <Stack spacing={3}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Flashcard Settings
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={content.settings?.shuffleCards || false}
                  onChange={(e) => updateContent({
                    settings: { ...content.settings, shuffleCards: e.target.checked }
                  })}
                />
              }
              label="Shuffle cards on each attempt"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={content.settings?.autoAdvance || false}
                  onChange={(e) => updateContent({
                    settings: { ...content.settings, autoAdvance: e.target.checked }
                  })}
                />
              }
              label="Auto-advance to next card after 3 seconds"
            />
            <Box>
              <Typography gutterBottom>Cards per session</Typography>
              <Slider
                value={content.settings?.cardsPerSession || 10}
                onChange={(e, value) => updateContent({
                  settings: { ...content.settings, cardsPerSession: value }
                })}
                min={5}
                max={50}
                valueLabelDisplay="auto"
                marks={[
                  { value: 5, label: '5' },
                  { value: 10, label: '10' },
                  { value: 25, label: '25' },
                  { value: 50, label: '50' }
                ]}
              />
            </Box>
          </Stack>
        );

      case 'listening':
        return (
          <Stack spacing={3}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Listening Settings
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={content.settings?.allowReplay !== false}
                  onChange={(e) => updateContent({
                    settings: { ...content.settings, allowReplay: e.target.checked }
                  })}
                />
              }
              label="Allow students to replay audio"
            />
            <Box>
              <Typography gutterBottom>Maximum Replays</Typography>
              <Slider
                value={content.settings?.maxReplays || 3}
                onChange={(e, value) => updateContent({
                  settings: { ...content.settings, maxReplays: value }
                })}
                min={1}
                max={10}
                valueLabelDisplay="auto"
                disabled={!content.settings?.allowReplay}
              />
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={content.settings?.showTranscript || false}
                  onChange={(e) => updateContent({
                    settings: { ...content.settings, showTranscript: e.target.checked }
                  })}
                />
              }
              label="Show transcript after completion"
            />
          </Stack>
        );

      default:
        return (
          <Alert severity="info">
            No specific settings available for this interactive type.
          </Alert>
        );
    }
  };

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

        {content.type === 'interactive' ? (
          renderInteractiveEditor(slide, index)
        ) : (
          <>
            {/* Basic Content Editors for other types remain the same... */}
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

            {/* Other slide type editors... */}
          </>
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
        {/* Enhanced Slide List */}
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

            {showAdvancedSettings && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Presentation Settings
                </Typography>
                <Stack spacing={2}>
                  <FormControlLabel
                    control={<Switch />}
                    label="Enable navigation"
                    sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
                  />
                  <FormControlLabel
                    control={<Switch />}
                    label="Show progress bar"
                    sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
                  />
                  <FormControlLabel
                    control={<Switch />}
                    label="Auto-advance slides"
                    sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.875rem' } }}
                  />
                </Stack>
              </>
            )}
          </Paper>
        </Grid>

        {/* Enhanced Slide Editor */}
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

              <Divider />

              {/* Enhanced Styling Options */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <ColorLens color="action" />
                    <Typography variant="subtitle1" fontWeight={600}>
                      Slide Styling & Layout
                    </Typography>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={3}>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          label="Background Color"
                          value={slides[activeSlide].backgroundColor || ''}
                          onChange={(e) => updateSlide(activeSlide, { backgroundColor: e.target.value })}
                          placeholder="#ffffff"
                          InputProps={{
                            startAdornment: (
                              <IconButton size="small">
                                <ColorLens sx={{ color: slides[activeSlide].backgroundColor || 'action.active' }} />
                              </IconButton>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          label="Background Image URL"
                          value={slides[activeSlide].backgroundImage || ''}
                          onChange={(e) => updateSlide(activeSlide, { backgroundImage: e.target.value })}
                          InputProps={{
                            startAdornment: <Wallpaper sx={{ mr: 1, color: 'action.active' }} />,
                            endAdornment: (
                              <Tooltip title="Upload Background Image">
                                <IconButton size="small">
                                  <CloudUpload />
                                </IconButton>
                              </Tooltip>
                            )
                          }}
                        />
                      </Grid>
                    </Grid>

                    {/* Background Preview */}
                    {(slides[activeSlide].backgroundColor || slides[activeSlide].backgroundImage) && (
                      <Paper
                        sx={{
                          height: 120,
                          bgcolor: slides[activeSlide].backgroundColor || 'background.paper',
                          backgroundImage: slides[activeSlide].backgroundImage
                            ? `url(${slides[activeSlide].backgroundImage})`
                            : 'none',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '2px dashed',
                          borderColor: 'divider'
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            bgcolor: 'rgba(255,255,255,0.8)',
                            p: 1,
                            borderRadius: 1,
                            color: 'text.primary'
                          }}
                        >
                          Background Preview
                        </Typography>
                      </Paper>
                    )}

                    {/* Layout Options */}
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Content Alignment
                      </Typography>
                      <RadioGroup
                        row
                        value={slides[activeSlide].content.alignment || 'center'}
                        onChange={(e) => updateSlideContent(activeSlide, { alignment: e.target.value as 'left' | 'center' | 'right' })}
                      >
                        <FormControlLabel value="left" control={<Radio />} label="Left" />
                        <FormControlLabel value="center" control={<Radio />} label="Center" />
                        <FormControlLabel value="right" control={<Radio />} label="Right" />
                      </RadioGroup>
                    </Box>

                    {/* Animation Options */}
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Slide Transition
                      </Typography>
                      <FormControl fullWidth size="small">
                        <Select
                          value={slides[activeSlide].transition || 'slide'}
                          onChange={(e) => updateSlide(activeSlide, { transition: e.target.value })}
                        >
                          <MenuItem value="slide">Slide</MenuItem>
                          <MenuItem value="fade">Fade</MenuItem>
                          <MenuItem value="zoom">Zoom</MenuItem>
                          <MenuItem value="flip">Flip</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </Stack>
                </AccordionDetails>
              </Accordion>

              {/* Enhanced Speaker Notes */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <School color="action" />
                    <Typography variant="subtitle1" fontWeight={600}>
                      Instructor Notes & Settings
                    </Typography>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Speaker Notes"
                      value={slides[activeSlide].notes || ''}
                      onChange={(e) => updateSlide(activeSlide, { notes: e.target.value })}
                      helperText="These notes are only visible to instructors during presentation"
                      placeholder="Add teaching notes, key points to emphasize, timing suggestions..."
                    />

                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Estimated Duration (minutes)"
                          value={slides[activeSlide].duration || ''}
                          onChange={(e) => updateSlide(activeSlide, { duration: parseInt(e.target.value) || 0 })}
                          inputProps={{ min: 0, max: 60 }}
                          helperText="How long should this slide take?"
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <FormControl fullWidth size="small">
                          <InputLabel>Difficulty Level</InputLabel>
                          <Select
                            value={slides[activeSlide].difficulty || 'medium'}
                            onChange={(e) => updateSlide(activeSlide, { difficulty: e.target.value })}
                            label="Difficulty Level"
                          >
                            <MenuItem value="easy">
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'success.main' }} />
                                <Typography>Easy</Typography>
                              </Stack>
                            </MenuItem>
                            <MenuItem value="medium">
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'warning.main' }} />
                                <Typography>Medium</Typography>
                              </Stack>
                            </MenuItem>
                            <MenuItem value="hard">
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'error.main' }} />
                                <Typography>Hard</Typography>
                              </Stack>
                            </MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>

                    {/* Learning Objectives */}
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Learning Objectives
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        placeholder="What should students learn from this slide? (e.g., 'Students will be able to...')"
                        value={slides[activeSlide].learningObjectives || ''}
                        onChange={(e) => updateSlide(activeSlide, { learningObjectives: e.target.value })}
                      />
                    </Box>

                    {/* Tags */}
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Tags (comma-separated)
                      </Typography>
                      <TextField
                        fullWidth
                        placeholder="e.g., vocabulary, grammar, beginner, JLPT-N5"
                        value={slides[activeSlide].tags || ''}
                        onChange={(e) => updateSlide(activeSlide, { tags: e.target.value })}
                        helperText="Tags help organize and search slides"
                      />
                    </Box>
                  </Stack>
                </AccordionDetails>
              </Accordion>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Enhanced Summary */}
      <Paper sx={{ p: 3, mt: 3, bgcolor: 'primary.50', borderRadius: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight={600} color="primary.main">
                📊 Presentation Summary
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'background.paper' }}>
                    <Typography variant="h4" fontWeight={700} color="primary.main">
                      {slides.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Slides
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'background.paper' }}>
                    <Typography variant="h4" fontWeight={700} color="warning.main">
                      {Object.values(validationErrors).reduce((acc, errors) => acc + errors.length, 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Validation Issues
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'background.paper' }}>
                    <Typography variant="h4" fontWeight={700} color="info.main">
                      {slides.filter(s => s.content.type === 'interactive').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Interactive Slides
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'background.paper' }}>
                    <Typography variant="h4" fontWeight={700} color="success.main">
                      {slides.reduce((acc, slide) => acc + (slide.duration || 5), 0)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Est. Minutes
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Slide Type Distribution */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Slide Type Distribution
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {Object.entries(
                    slides.reduce((acc, slide) => {
                      acc[slide.content.type] = (acc[slide.content.type] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([type, count]) => (
                    <Chip
                      key={type}
                      icon={getSlideIcon(type)}
                      label={`${type}: ${count}`}
                      size="small"
                      sx={{
                        bgcolor: getSlideTypeColor(type) + '20',
                        color: getSlideTypeColor(type),
                        fontWeight: 600
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Stack spacing={2}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<PlayArrow />}
                onClick={() => setPreviewMode(true)}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1976D2 30%, #00BCD4 90%)',
                  }
                }}
              >
                Preview Presentation
              </Button>

              <Button
                fullWidth
                variant="outlined"
                startIcon={<Save />}
                sx={{ borderRadius: 2 }}
              >
                Save Draft
              </Button>

              {Object.values(validationErrors).some(errors => errors.length > 0) && (
                <Alert severity="warning" sx={{ borderRadius: 2 }}>
                  <Typography variant="body2" fontWeight={500}>
                    Please fix validation errors before publishing
                  </Typography>
                </Alert>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Preview Dialog */}
      <Dialog
        fullScreen
        open={previewMode}
        onClose={() => setPreviewMode(false)}
        PaperProps={{
          sx: { bgcolor: 'background.default' }
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
            📱 Presentation Preview
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<Visibility />}
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.5)',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              Student View
            </Button>
            <IconButton
              onClick={() => setPreviewMode(false)}
              sx={{ color: 'white' }}
            >
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: '100%' }}>
          <Alert severity="info" sx={{ m: 2, borderRadius: 2 }}>
            <Typography variant="body2">
              🎯 This is a preview of how your slides will appear to students.
              Interactive features are simulated and may not function fully in preview mode.
            </Typography>
          </Alert>

          {/* Here you would render the actual InteractiveSlides component with the slides data */}
          <Box sx={{
            height: 'calc(100% - 80px)',
            bgcolor: 'grey.100',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            m: 2,
            borderRadius: 2
          }}>
            <Stack alignItems="center" spacing={2}>
              <Preview sx={{ fontSize: 64, color: 'text.secondary' }} />
              <Typography variant="h5" color="text.secondary">
                Interactive Slides Preview
              </Typography>
              <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ maxWidth: 400 }}>
                This would show your {slides.length} slides with full interactivity.
                Students would be able to navigate, complete activities, and receive feedback.
              </Typography>
              <Chip
                label={`${slides.length} slides • ${slides.filter(s => s.content.type === 'interactive').length} interactive`}
                color="primary"
              />
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Help Dialog */}
      <Dialog
        open={false} // You can add state to control this
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Help color="primary" />
            <Typography variant="h6">Slides Builder Help</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3}>
            <Typography variant="body1">
              Welcome to the Interactive Slides Builder! Here's how to create engaging educational content:
            </Typography>

            <Stepper orientation="vertical">
              <Step active>
                <StepLabel>Choose Slide Type</StepLabel>
                <StepContent>
                  <Typography variant="body2">
                    Start with basic content (text, images, video) or create interactive activities for student engagement.
                  </Typography>
                </StepContent>
              </Step>
              <Step active>
                <StepLabel>Add Content</StepLabel>
                <StepContent>
                  <Typography variant="body2">
                    Fill in your content, questions, and interactive elements. Use validation messages to ensure quality.
                  </Typography>
                </StepContent>
              </Step>
              <Step active>
                <StepLabel>Customize Settings</StepLabel>
                <StepContent>
                  <Typography variant="body2">
                    Configure feedback messages, difficulty levels, and interactive behaviors.
                  </Typography>
                </StepContent>
              </Step>
              <Step active>
                <StepLabel>Preview & Save</StepLabel>
                <StepContent>
                  <Typography variant="body2">
                    Test your slides in preview mode before publishing to students.
                  </Typography>
                </StepContent>
              </Step>
            </Stepper>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { }}>Got it!</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};