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
  FormLabel,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Tooltip,
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
  CheckBox,
  Timeline,
  CompareArrows,
  Translate,
  RecordVoiceOver,
  Hearing,
  School,
  SortByAlpha,
  Category,
  ExpandMore,
  Info,
  Preview,
} from '@mui/icons-material';

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

  const updateSlide = (index: number, updates: Partial<Slide>) => {
    const newSlides = [...slides];
    newSlides[index] = { ...newSlides[index], ...updates };
    setSlides(newSlides);
    onChange(newSlides);
  };

  const updateSlideContent = (index: number, contentUpdates: Partial<SlideContent>) => {
    const newSlides = [...slides];
    newSlides[index].content = { ...newSlides[index].content, ...contentUpdates };
    setSlides(newSlides);
    onChange(newSlides);
  };

  const addSlide = (type: SlideContent['type'] = 'text') => {
    const newSlide: Slide = {
      id: Date.now().toString(),
      content: getDefaultContent(type),
    };
    setSlides([...slides, newSlide]);
    setActiveSlide(slides.length);
    onChange([...slides, newSlide]);
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
        return { type: 'text', content: '', title: '', subtitle: '' };
      case 'image':
        return { type: 'image', content: { url: '', alt: '', caption: '' }, title: '' };
      case 'video':
        return { type: 'video', content: { url: '' }, title: '' };
      case 'quiz':
        return {
          type: 'quiz',
          content: {
            question: '',
            type: 'multiple-choice',
            options: ['', '', '', ''],
            correctAnswer: 0,
            explanation: '',
          },
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
          title: '',
        };
      case 'code':
        return {
          type: 'code',
          content: { code: '', language: 'javascript' },
          title: '',
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
      example: 'Match Japanese words to their English translations'
    },
    {
      value: 'fill-blanks',
      label: 'Fill in the Blanks',
      icon: <LinearScale />,
      description: 'Students fill missing words in sentences',
      example: 'Complete the Japanese sentence: "私は___です"'
    },
    {
      value: 'matching',
      label: 'Matching Pairs',
      icon: <CompareArrows />,
      description: 'Connect related items with lines',
      example: 'Match hiragana characters to their sounds'
    },
    {
      value: 'sorting',
      label: 'Sort & Order',
      icon: <SortByAlpha />,
      description: 'Arrange items in correct order',
      example: 'Order Japanese numbers from 1 to 10'
    },
    {
      value: 'hotspot',
      label: 'Hotspot Click',
      icon: <TouchApp />,
      description: 'Click on specific areas of an image',
      example: 'Click on body parts in Japanese'
    },
    {
      value: 'timeline',
      label: 'Timeline',
      icon: <Timeline />,
      description: 'Arrange events chronologically',
      example: 'Order Japanese historical periods'
    },
    {
      value: 'flashcard',
      label: 'Interactive Flashcards',
      icon: <SwapHoriz />,
      description: 'Flip cards to reveal answers',
      example: 'Kanji flashcards with readings'
    },
    {
      value: 'pronunciation',
      label: 'Pronunciation Practice',
      icon: <RecordVoiceOver />,
      description: 'Record and compare pronunciation',
      example: 'Practice Japanese pronunciation'
    },
    {
      value: 'listening',
      label: 'Listening Exercise',
      icon: <Hearing />,
      description: 'Audio-based comprehension',
      example: 'Listen and identify Japanese words'
    },
    {
      value: 'sentence-builder',
      label: 'Sentence Builder',
      icon: <Category />,
      description: 'Build sentences from word blocks',
      example: 'Construct Japanese sentences with correct grammar'
    }
  ];

  const renderInteractiveEditor = (slide: Slide, index: number) => {
    const interactiveContent = slide.content.content as InteractiveContent;
    const currentType = interactiveContent?.type || 'drag-drop';

    const updateInteractiveContent = (updates: Partial<InteractiveContent>) => {
      updateSlideContent(index, {
        content: {
          ...interactiveContent,
          ...updates
        }
      });
    };

    const addInteractiveItem = () => {
      const newItem = getDefaultInteractiveItem(currentType);
      updateInteractiveContent({
        items: [...(interactiveContent.items || []), newItem]
      });
    };

    const updateInteractiveItem = (itemIndex: number, updates: any) => {
      const newItems = [...(interactiveContent.items || [])];
      newItems[itemIndex] = { ...newItems[itemIndex], ...updates };
      updateInteractiveContent({ items: newItems });
    };

    const removeInteractiveItem = (itemIndex: number) => {
      const newItems = (interactiveContent.items || []).filter((_, i) => i !== itemIndex);
      updateInteractiveContent({ items: newItems });
    };

    const getDefaultInteractiveItem = (type: string) => {
      switch (type) {
        case 'drag-drop':
          return { id: Date.now(), text: '', target: '', category: '' };
        case 'fill-blanks':
          return { id: Date.now(), sentence: 'I am ___ student', blanks: ['a'], position: 0 };
        case 'matching':
          return { id: Date.now(), left: '', right: '', pair: Date.now() };
        case 'sorting':
          return { id: Date.now(), text: '', correctOrder: 0 };
        case 'hotspot':
          return { id: Date.now(), x: 50, y: 50, label: '', feedback: '' };
        case 'timeline':
          return { id: Date.now(), event: '', date: '', description: '' };
        case 'flashcard':
          return { id: Date.now(), front: '', back: '', category: 'vocabulary' };
        case 'pronunciation':
          return { id: Date.now(), text: '', pronunciation: '', audioUrl: '' };
        case 'listening':
          return { id: Date.now(), audioUrl: '', question: '', options: [''], correct: 0 };
        case 'sentence-builder':
          return { id: Date.now(), words: [''], correctOrder: [], translation: '' };
        default:
          return { id: Date.now(), text: '' };
      }
    };

    return (
      <Stack spacing={3}>
        <TextField
          fullWidth
          label="Title"
          value={slide.content.title || ''}
          onChange={(e) => updateSlideContent(index, { title: e.target.value })}
        />

        <FormControl fullWidth>
          <InputLabel>Interactive Type</InputLabel>
          <Select
            value={currentType}
            label="Interactive Type"
            onChange={(e) => {
              const newType = e.target.value;
              updateInteractiveContent({
                type: newType as any,
                items: [],
                settings: {},
                instruction: getDefaultInstruction(newType),
                feedback: {
                  correct: 'Excellent! You got it right! 🎉',
                  incorrect: 'Not quite right. Try again! 💪'
                }
              });
            }}
          >
            {interactiveTypes.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                <Stack direction="row" spacing={1} alignItems="center">
                  {type.icon}
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {type.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {type.description}
                    </Typography>
                  </Box>
                </Stack>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Show example for selected type */}
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2" fontWeight={600} gutterBottom>
            Example Use Case:
          </Typography>
          <Typography variant="body2">
            {interactiveTypes.find(t => t.value === currentType)?.example}
          </Typography>
        </Alert>

        <TextField
          fullWidth
          label="Instructions"
          multiline
          rows={2}
          value={interactiveContent?.instruction || ''}
          onChange={(e) => updateInteractiveContent({ instruction: e.target.value })}
          helperText="Clear instructions for students on what to do"
        />

        {/* Feedback Settings */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="subtitle1" fontWeight={600}>
              Feedback Messages
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Correct Answer Feedback"
                value={interactiveContent?.feedback?.correct || ''}
                onChange={(e) => updateInteractiveContent({
                  feedback: {
                    ...interactiveContent?.feedback,
                    correct: e.target.value
                  }
                })}
              />
              <TextField
                fullWidth
                label="Incorrect Answer Feedback"
                value={interactiveContent?.feedback?.incorrect || ''}
                onChange={(e) => updateInteractiveContent({
                  feedback: {
                    ...interactiveContent?.feedback,
                    incorrect: e.target.value
                  }
                })}
              />
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Type-specific content editors */}
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight={600}>
              {interactiveTypes.find(t => t.value === currentType)?.label} Items
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={addInteractiveItem}
              size="small"
            >
              Add Item
            </Button>
          </Stack>

          {(!interactiveContent.items || interactiveContent.items.length === 0) ? (
            <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
              <Typography color="text.secondary" gutterBottom>
                No items added yet. Click "Add Item" to get started.
              </Typography>
            </Paper>
          ) : (
            <Stack spacing={2}>
              {interactiveContent.items.map((item: any, itemIndex: number) => (
                <Card key={item.id || itemIndex} variant="outlined">
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Item {itemIndex + 1}
                      </Typography>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removeInteractiveItem(itemIndex)}
                      >
                        <Delete />
                      </IconButton>
                    </Stack>

                    {renderInteractiveItemEditor(currentType, item, itemIndex, updateInteractiveItem)}
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </Box>

        {/* Additional Settings for specific types */}
        {renderTypeSpecificSettings(currentType, interactiveContent, updateInteractiveContent)}
      </Stack>
    );
  };

  const getDefaultInstruction = (type: string): string => {
    switch (type) {
      case 'drag-drop': return 'Drag each item to its correct position';
      case 'fill-blanks': return 'Fill in the missing words to complete the sentences';
      case 'matching': return 'Connect the related items by drawing lines between them';
      case 'sorting': return 'Arrange the items in the correct order';
      case 'hotspot': return 'Click on the correct areas in the image';
      case 'timeline': return 'Arrange the events in chronological order';
      case 'flashcard': return 'Click on the cards to flip them and test your knowledge';
      case 'pronunciation': return 'Listen to the audio and practice your pronunciation';
      case 'listening': return 'Listen carefully and answer the questions';
      case 'sentence-builder': return 'Build the sentence using the word blocks provided';
      default: return 'Complete the interactive activity';
    }
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
            <TextField
              fullWidth
              label="Reference Audio URL"
              value={item.audioUrl || ''}
              onChange={(e) => updateItem(itemIndex, { audioUrl: e.target.value })}
              placeholder="S3 URL for reference pronunciation"
            />
          </Stack>
        );

      case 'listening':
        return (
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Audio URL"
              value={item.audioUrl || ''}
              onChange={(e) => updateItem(itemIndex, { audioUrl: e.target.value })}
              placeholder="S3 URL for audio file"
            />
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
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle1" fontWeight={600}>
                Drag & Drop Settings
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
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
              </Stack>
            </AccordionDetails>
          </Accordion>
        );

      case 'hotspot':
        return (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle1" fontWeight={600}>
                Hotspot Settings
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Background Image URL"
                  value={content.settings?.imageUrl || ''}
                  onChange={(e) => updateContent({
                    settings: { ...content.settings, imageUrl: e.target.value }
                  })}
                  placeholder="S3 URL for the background image"
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
              </Stack>
            </AccordionDetails>
          </Accordion>
        );

      case 'pronunciation':
        return (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle1" fontWeight={600}>
                Pronunciation Settings
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
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
              </Stack>
            </AccordionDetails>
          </Accordion>
        );

      case 'flashcard':
        return (
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle1" fontWeight={600}>
                Flashcard Settings
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
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
              </Stack>
            </AccordionDetails>
          </Accordion>
        );

      default:
        return null;
    }
  };

  const renderSlideEditor = (slide: Slide, index: number) => {
    const { content } = slide;

    switch (content.type) {
      case 'text':
        return (
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Title"
              value={content.title || ''}
              onChange={(e) => updateSlideContent(index, { title: e.target.value })}
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
          </Stack>
        );

      case 'image':
        return (
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Title"
              value={content.title || ''}
              onChange={(e) => updateSlideContent(index, { title: e.target.value })}
            />
            <TextField
              fullWidth
              label="Image URL"
              value={content.content.url || ''}
              onChange={(e) => updateSlideContent(index, {
                content: { ...content.content, url: e.target.value }
              })}
            />
            <TextField
              fullWidth
              label="Alt Text"
              value={content.content.alt || ''}
              onChange={(e) => updateSlideContent(index, {
                content: { ...content.content, alt: e.target.value }
              })}
            />
            <TextField
              fullWidth
              label="Caption"
              value={content.content.caption || ''}
              onChange={(e) => updateSlideContent(index, {
                content: { ...content.content, caption: e.target.value }
              })}
            />
          </Stack>
        );

      case 'video':
        return (
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Title"
              value={content.title || ''}
              onChange={(e) => updateSlideContent(index, { title: e.target.value })}
            />
            <TextField
              fullWidth
              label="Video URL"
              value={content.content.url || ''}
              onChange={(e) => updateSlideContent(index, {
                content: { ...content.content, url: e.target.value }
              })}
              helperText="Provide a direct link to the video file"
            />
          </Stack>
        );

      case 'quiz':
        return (
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Question"
              value={content.content.question || ''}
              onChange={(e) => updateSlideContent(index, {
                content: { ...content.content, question: e.target.value }
              })}
              multiline
              rows={2}
            />
            <FormControl>
              <InputLabel>Question Type</InputLabel>
              <Select
                value={content.content.type || 'multiple-choice'}
                label="Question Type"
                onChange={(e) => updateSlideContent(index, {
                  content: { ...content.content, type: e.target.value }
                })}
              >
                <MenuItem value="multiple-choice">Multiple Choice</MenuItem>
                <MenuItem value="text">Text Answer</MenuItem>
              </Select>
            </FormControl>
            
            {content.content.type === 'multiple-choice' && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Options (Select the correct answer)
                </Typography>
                <RadioGroup
                  value={content.content.correctAnswer?.toString() || '0'}
                  onChange={(e) => updateSlideContent(index, {
                    content: { ...content.content, correctAnswer: parseInt(e.target.value) }
                  })}
                >
                  {(content.content.options || ['', '', '', '']).map((option: string, oIndex: number) => (
                    <Stack key={oIndex} direction="row" spacing={2} alignItems="center">
                      <FormControlLabel
                        value={oIndex.toString()}
                        control={<Radio />}
                        label=""
                      />
                      <TextField
                        fullWidth
                        size="small"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...(content.content.options || [])];
                          newOptions[oIndex] = e.target.value;
                          updateSlideContent(index, {
                            content: { ...content.content, options: newOptions }
                          });
                        }}
                        placeholder={`Option ${oIndex + 1}`}
                      />
                    </Stack>
                  ))}
                </RadioGroup>
              </Box>
            )}
            
            {content.content.type === 'text' && (
              <TextField
                fullWidth
                label="Correct Answer"
                value={content.content.correctAnswer || ''}
                onChange={(e) => updateSlideContent(index, {
                  content: { ...content.content, correctAnswer: e.target.value }
                })}
                multiline
                rows={2}
              />
            )}
            
            <TextField
              fullWidth
              label="Explanation"
              value={content.content.explanation || ''}
              onChange={(e) => updateSlideContent(index, {
                content: { ...content.content, explanation: e.target.value }
              })}
              multiline
              rows={2}
            />
          </Stack>
        );

      case 'code':
        return (
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Title"
              value={content.title || ''}
              onChange={(e) => updateSlideContent(index, { title: e.target.value })}
            />
            <FormControl>
              <InputLabel>Language</InputLabel>
              <Select
                value={content.content.language || 'javascript'}
                label="Language"
                onChange={(e) => updateSlideContent(index, {
                  content: { ...content.content, language: e.target.value }
                })}
              >
                <MenuItem value="javascript">JavaScript</MenuItem>
                <MenuItem value="typescript">TypeScript</MenuItem>
                <MenuItem value="python">Python</MenuItem>
                <MenuItem value="java">Java</MenuItem>
                <MenuItem value="cpp">C++</MenuItem>
                <MenuItem value="html">HTML</MenuItem>
                <MenuItem value="css">CSS</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              multiline
              rows={10}
              label="Code"
              value={content.content.code || ''}
              onChange={(e) => updateSlideContent(index, {
                content: { ...content.content, code: e.target.value }
              })}
              sx={{ fontFamily: 'monospace' }}
            />
          </Stack>
        );

      case 'interactive':
        return renderInteractiveEditor(slide, index);

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
      case 'interactive': return <Extension />;
      case 'code': return <Code />;
      default: return <TextFields />;
    }
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Slide List */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Slides
            </Typography>
            <Stack spacing={1}>
              {slides.map((slide, index) => (
                <Paper
                  key={slide.id}
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    bgcolor: activeSlide === index ? 'primary.light' : 'background.paper',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                  onClick={() => setActiveSlide(index)}
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <IconButton size="small" sx={{ cursor: 'grab' }}>
                      <DragIndicator />
                    </IconButton>
                    {getSlideIcon(slide.content.type)}
                    <Typography variant="body2" sx={{ flexGrow: 1 }}>
                      Slide {index + 1}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateSlide(index);
                      }}
                    >
                      <ContentCopy fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSlide(index);
                      }}
                      disabled={slides.length === 1}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Stack>
                </Paper>
              ))}
            </Stack>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" gutterBottom>
              Add New Slide
            </Typography>
            <Grid container spacing={1}>
              {(['text', 'image', 'video', 'quiz', 'code', 'interactive'] as const).map(type => (
                <Grid size={4} key={type}>
                  <Button
                    fullWidth
                    size="small"
                    onClick={() => addSlide(type)}
                    sx={{ flexDirection: 'column', py: 1 }}
                  >
                    {getSlideIcon(type)}
                    <Typography variant="caption">{type}</Typography>
                  </Button>
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
                <Typography variant="h6">
                  Edit Slide {activeSlide + 1}
                </Typography>
                <FormControl size="small" sx={{ width: 150 }}>
                  <InputLabel>Slide Type</InputLabel>
                  <Select
                    value={slides[activeSlide].content.type}
                    label="Slide Type"
                    onChange={(e) => changeSlideType(activeSlide, e.target.value as any)}
                  >
                    <MenuItem value="text">Text</MenuItem>
                    <MenuItem value="image">Image</MenuItem>
                    <MenuItem value="video">Video</MenuItem>
                    <MenuItem value="quiz">Quiz</MenuItem>
                    <MenuItem value="interactive">Interactive</MenuItem>
                    <MenuItem value="code">Code</MenuItem>
                  </Select>
                </FormControl>
              </Stack>

              <Divider />

              {/* Content Editor */}
              {renderSlideEditor(slides[activeSlide], activeSlide)}

              <Divider />

              {/* Styling Options */}
              <Typography variant="subtitle1" fontWeight={600}>
                Slide Styling
              </Typography>
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Background Color"
                  value={slides[activeSlide].backgroundColor || ''}
                  onChange={(e) => updateSlide(activeSlide, { backgroundColor: e.target.value })}
                  placeholder="#ffffff"
                  InputProps={{
                    startAdornment: <ColorLens sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
                <TextField
                  label="Background Image URL"
                  value={slides[activeSlide].backgroundImage || ''}
                  onChange={(e) => updateSlide(activeSlide, { backgroundImage: e.target.value })}
                  sx={{ flexGrow: 1 }}
                  InputProps={{
                    startAdornment: <Wallpaper sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
              </Stack>

              {/* Speaker Notes */}
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Speaker Notes"
                value={slides[activeSlide].notes || ''}
                onChange={(e) => updateSlide(activeSlide, { notes: e.target.value })}
                helperText="These notes are only visible to instructors"
              />
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Summary */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="subtitle2">
          Presentation Summary: {slides.length} slides
        </Typography>
      </Alert>
    </Box>
  );
};