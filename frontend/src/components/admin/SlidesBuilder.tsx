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
  Tab,
  Tabs,
  Alert,
  Grid,
  RadioGroup,
  FormControlLabel,
  Radio,
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
          content: { type: 'drag-drop', items: [] },
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
        return (
          <Stack spacing={3}>
            <Alert severity="info">
              Interactive slides support drag-and-drop and fill-in-the-blanks activities.
              This feature is coming soon!
            </Alert>
            <TextField
              fullWidth
              label="Title"
              value={content.title || ''}
              onChange={(e) => updateSlideContent(index, { title: e.target.value })}
            />
          </Stack>
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
                    <MenuItem value="code">Code</MenuItem>
                    <MenuItem value="interactive">Interactive</MenuItem>
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