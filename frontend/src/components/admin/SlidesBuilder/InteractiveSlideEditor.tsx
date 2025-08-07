import React, { useState } from 'react';
import {
  Stack,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Box,
  Chip,
  Tabs,
  Tab,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Alert,
  FormControlLabel,
  Switch,
  Slider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Badge,
} from '@mui/material';
import {
  CheckCircle,
  Add,
  Delete,
  DragIndicator,
  ContentCopy,
  ExpandMore,
  Preview,
  TouchApp,
  LinearScale,
  CompareArrows,
  SortByAlpha,
  Timeline,
  SwapHoriz,
  RecordVoiceOver,
  Hearing,
  Category,
  PhotoLibrary,
  CloudUpload,
  VolumeUp,
  PlayArrow,
  Stop,
  Settings as SettingsIcon,
  Info,
  Warning,
  CheckCircleOutline,
} from '@mui/icons-material';
import { Slide, SlideContent } from '../../../types/slide.types';
import { getDefaultInstruction, interactiveTypes } from '../../../utils/interactiveTypes';
import { InteractiveContent } from '../../../types/interactive.types';
import { getDefaultInteractiveItem } from '../../../utils/lideDefaults';


interface InteractiveSlideEditorProps {
  slide: Slide;
  index: number;
  onUpdate: (index: number, updates: Partial<Slide>) => void;
  onUpdateContent: (index: number, contentUpdates: Partial<SlideContent>) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const InteractiveSlideEditor: React.FC<InteractiveSlideEditorProps> = ({
  slide,
  index,
  onUpdateContent,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [previewItem, setPreviewItem] = useState<number | null>(null);
  
  const interactiveContent = slide.content.content as InteractiveContent || {
    type: 'drag-drop',
    instruction: 'Complete the interactive activity',
    items: [],
    settings: {},
    feedback: {
      correct: 'Excellent! You got it right! 🎉',
      incorrect: 'Not quite right. Try again! 💪'
    }
  };

  const currentTypeConfig = interactiveTypes.find(t => t.value === interactiveContent.type);

  const updateInteractiveContent = (updates: Partial<InteractiveContent>) => {
    onUpdateContent(index, {
      content: {
        ...interactiveContent,
        ...updates
      }
    });
  };

  const addInteractiveItem = () => {
    const newItem = getDefaultInteractiveItem(interactiveContent.type);
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

  const duplicateInteractiveItem = (itemIndex: number) => {
    const item = interactiveContent.items[itemIndex];
    const duplicatedItem = { ...item, id: Date.now() + Math.random() };
    const newItems = [...interactiveContent.items];
    newItems.splice(itemIndex + 1, 0, duplicatedItem);
    updateInteractiveContent({ items: newItems });
  };

  const moveItem = (itemIndex: number, direction: 'up' | 'down') => {
    const newItems = [...interactiveContent.items];
    const targetIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
    
    if (targetIndex >= 0 && targetIndex < newItems.length) {
      [newItems[itemIndex], newItems[targetIndex]] = [newItems[targetIndex], newItems[itemIndex]];
      updateInteractiveContent({ items: newItems });
    }
  };

  const renderInteractiveTypeSelector = () => {
    const currentType = interactiveContent.type || 'drag-drop';

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
                      updateInteractiveContent({
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
                      position: 'relative',
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

  const renderInteractiveItemEditor = (item: any, itemIndex: number) => {
    const currentType = interactiveContent.type;
    
    switch (currentType) {
      case 'drag-drop':
        return (
          <Stack spacing={2}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  label="Draggable Item"
                  value={item.text || ''}
                  onChange={(e) => updateInteractiveItem(itemIndex, { text: e.target.value })}
                  placeholder="e.g., こんにちは"
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  label="Target/Answer"
                  value={item.target || ''}
                  onChange={(e) => updateInteractiveItem(itemIndex, { target: e.target.value })}
                  placeholder="e.g., Hello"
                />
              </Grid>
            </Grid>
            <TextField
              fullWidth
              label="Category (optional)"
              value={item.category || ''}
              onChange={(e) => updateInteractiveItem(itemIndex, { category: e.target.value })}
              placeholder="e.g., Greetings"
              helperText="Group related items together"
            />
          </Stack>
        );

      case 'fill-blanks':
        return (
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Sentence with Blanks"
              value={item.sentence || ''}
              onChange={(e) => updateInteractiveItem(itemIndex, { sentence: e.target.value })}
              placeholder="Use ___ for blanks: I am ___ student"
              helperText="Use underscores (___) to mark where students should fill in words"
            />
            <TextField
              fullWidth
              label="Correct Answers (comma-separated)"
              value={Array.isArray(item.blanks) ? item.blanks.join(', ') : ''}
              onChange={(e) => updateInteractiveItem(itemIndex, { 
                blanks: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) 
              })}
              placeholder="e.g., a, student, learning"
              helperText="Multiple correct answers separated by commas"
            />
            <TextField
              fullWidth
              label="Translation (optional)"
              value={item.translation || ''}
              onChange={(e) => updateInteractiveItem(itemIndex, { translation: e.target.value })}
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
                onChange={(e) => updateInteractiveItem(itemIndex, { left: e.target.value })}
                placeholder="e.g., ありがとう"
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                label="Right Item (Match)"
                value={item.right || ''}
                onChange={(e) => updateInteractiveItem(itemIndex, { right: e.target.value })}
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
                onChange={(e) => updateInteractiveItem(itemIndex, { text: e.target.value })}
                placeholder="e.g., 一 (one)"
              />
            </Grid>
            <Grid size={{ xs: 4 }}>
              <TextField
                fullWidth
                type="number"
                label="Correct Position"
                value={item.correctOrder || 0}
                onChange={(e) => updateInteractiveItem(itemIndex, { correctOrder: parseInt(e.target.value) })}
                inputProps={{ min: 1, max: interactiveContent.items?.length || 1 }}
                helperText="Position in final order"
              />
            </Grid>
          </Grid>
        );

      case 'hotspot':
        return (
          <Stack spacing={2}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 4 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="X Position (%)"
                  value={item.x || 50}
                  onChange={(e) => updateInteractiveItem(itemIndex, { x: parseInt(e.target.value) })}
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>
              <Grid size={{ xs: 4 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="Y Position (%)"
                  value={item.y || 50}
                  onChange={(e) => updateInteractiveItem(itemIndex, { y: parseInt(e.target.value) })}
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>
              <Grid size={{ xs: 4 }}>
                <TextField
                  fullWidth
                  label="Label"
                  value={item.label || ''}
                  onChange={(e) => updateInteractiveItem(itemIndex, { label: e.target.value })}
                  placeholder="e.g., 目 (eye)"
                />
              </Grid>
            </Grid>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Feedback Text"
              value={item.feedback || ''}
              onChange={(e) => updateInteractiveItem(itemIndex, { feedback: e.target.value })}
              placeholder="Feedback when this hotspot is clicked"
            />
            
            {/* Visual Position Preview */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>Position Preview:</Typography>
              <Box
                sx={{
                  width: '100%',
                  height: 120,
                  bgcolor: 'grey.100',
                  borderRadius: 1,
                  border: '1px dashed',
                  borderColor: 'grey.400',
                  position: 'relative'
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    left: `${item.x || 50}%`,
                    top: `${item.y || 50}%`,
                    transform: 'translate(-50%, -50%)',
                    width: 20,
                    height: 20,
                    bgcolor: currentTypeConfig?.color || 'primary.main',
                    borderRadius: '50%',
                    border: '2px solid white',
                    boxShadow: 2
                  }}
                />
                <Typography 
                  variant="caption" 
                  sx={{ 
                    position: 'absolute', 
                    bottom: 4, 
                    right: 4, 
                    color: 'text.secondary' 
                  }}
                >
                  {item.x || 50}%, {item.y || 50}%
                </Typography>
              </Box>
            </Box>
          </Stack>
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
                  onChange={(e) => updateInteractiveItem(itemIndex, { event: e.target.value })}
                  placeholder="e.g., Meiji Restoration"
                />
              </Grid>
              <Grid size={{ xs: 4 }}>
                <TextField
                  fullWidth
                  label="Date/Year"
                  value={item.date || ''}
                  onChange={(e) => updateInteractiveItem(itemIndex, { date: e.target.value })}
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
              onChange={(e) => updateInteractiveItem(itemIndex, { description: e.target.value })}
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
                  onChange={(e) => updateInteractiveItem(itemIndex, { front: e.target.value })}
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
                  onChange={(e) => updateInteractiveItem(itemIndex, { back: e.target.value })}
                  placeholder="e.g., Kanji - Chinese characters"
                />
              </Grid>
            </Grid>
            <TextField
              fullWidth
              label="Category"
              value={item.category || ''}
              onChange={(e) => updateInteractiveItem(itemIndex, { category: e.target.value })}
              placeholder="e.g., Vocabulary, Grammar"
            />
            
            {/* Flashcard Preview */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" gutterBottom>Card Preview:</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Paper 
                  sx={{ 
                    p: 2, 
                    minHeight: 100, 
                    flex: 1, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    bgcolor: 'primary.light',
                    color: 'primary.contrastText'
                  }}
                >
                  <Typography variant="body1" textAlign="center">
                    {item.front || 'Front'}
                  </Typography>
                </Paper>
                <Paper 
                  sx={{ 
                    p: 2, 
                    minHeight: 100, 
                    flex: 1, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    bgcolor: 'secondary.light'
                  }}
                >
                  <Typography variant="body1" textAlign="center">
                    {item.back || 'Back'}
                  </Typography>
                </Paper>
              </Box>
            </Box>
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
                  onChange={(e) => updateInteractiveItem(itemIndex, { text: e.target.value })}
                  placeholder="e.g., おはようございます"
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  label="Romanization"
                  value={item.pronunciation || ''}
                  onChange={(e) => updateInteractiveItem(itemIndex, { pronunciation: e.target.value })}
                  placeholder="e.g., ohayou gozaimasu"
                />
              </Grid>
            </Grid>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                fullWidth
                label="Reference Audio URL"
                value={item.audioUrl || ''}
                onChange={(e) => updateInteractiveItem(itemIndex, { audioUrl: e.target.value })}
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
                onChange={(e) => updateInteractiveItem(itemIndex, { audioUrl: e.target.value })}
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
              onChange={(e) => updateInteractiveItem(itemIndex, { question: e.target.value })}
              placeholder="What did you hear?"
            />
            <TextField
              fullWidth
              label="Answer Options (comma-separated)"
              value={Array.isArray(item.options) ? item.options.join(', ') : ''}
              onChange={(e) => updateInteractiveItem(itemIndex, { 
                options: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean)
              })}
              placeholder="e.g., Hello, Goodbye, Thank you"
            />
            <TextField
              fullWidth
              type="number"
              label="Correct Answer Index (0-based)"
              value={item.correct || 0}
              onChange={(e) => updateInteractiveItem(itemIndex, { correct: parseInt(e.target.value) })}
              inputProps={{ min: 0, max: (item.options?.length || 1) - 1 }}
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
              onChange={(e) => updateInteractiveItem(itemIndex, { 
                words: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean)
              })}
              placeholder="e.g., 私, は, 学生, です"
            />
            <TextField
              fullWidth
              label="Correct Order (comma-separated indices)"
              value={Array.isArray(item.correctOrder) ? item.correctOrder.join(', ') : ''}
              onChange={(e) => updateInteractiveItem(itemIndex, { 
                correctOrder: e.target.value.split(',').map((s: string) => parseInt(s.trim())).filter(n => !isNaN(n))
              })}
              placeholder="e.g., 0, 1, 2, 3 (order of words above)"
              helperText="Indices start from 0. Order corresponds to word positions above."
            />
            <TextField
              fullWidth
              label="Translation"
              value={item.translation || ''}
              onChange={(e) => updateInteractiveItem(itemIndex, { translation: e.target.value })}
              placeholder="e.g., I am a student"
            />
            
            {/* Sentence Preview */}
            {item.words && item.correctOrder && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>Sentence Preview:</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {item.correctOrder.map((wordIndex: number, i: number) => (
                    <Chip
                      key={i}
                      label={item.words[wordIndex] || `Word ${wordIndex}`}
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Stack>
                {item.translation && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Translation: {item.translation}
                  </Typography>
                )}
              </Box>
            )}
          </Stack>
        );

      default:
        return (
          <TextField
            fullWidth
            label="Content"
            value={item.text || ''}
            onChange={(e) => updateInteractiveItem(itemIndex, { text: e.target.value })}
          />
        );
    }
  };

  const renderTypeSpecificSettings = () => {
    const currentType = interactiveContent.type;
    const settings = interactiveContent.settings || {};
    
    const updateSettings = (newSettings: any) => {
      updateInteractiveContent({
        settings: { ...settings, ...newSettings }
      });
    };

    switch (currentType) {
      case 'drag-drop':
        return (
          <Stack spacing={3}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Drag & Drop Settings
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.showHints || false}
                  onChange={(e) => updateSettings({ showHints: e.target.checked })}
                />
              }
              label="Show hints for target areas"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.snapToTarget !== false}
                  onChange={(e) => updateSettings({ snapToTarget: e.target.checked })}
                />
              }
              label="Snap items to targets when dropped nearby"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.allowMultipleAttempts !== false}
                  onChange={(e) => updateSettings({ allowMultipleAttempts: e.target.checked })}
                />
              }
              label="Allow multiple attempts"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.shuffleItems || false}
                  onChange={(e) => updateSettings({ shuffleItems: e.target.checked })}
                />
              }
              label="Shuffle draggable items"
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
              value={settings.imageUrl || ''}
              onChange={(e) => updateSettings({ imageUrl: e.target.value })}
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
                  checked={settings.showAllHotspots || false}
                  onChange={(e) => updateSettings({ showAllHotspots: e.target.checked })}
                />
              }
              label="Show all hotspot indicators initially"
            />
            <Box>
              <Typography gutterBottom>Hotspot Size</Typography>
              <Slider
                value={settings.hotspotSize || 40}
                onChange={(e, value) => updateSettings({ hotspotSize: value })}
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
                  checked={settings.enableRecording !== false}
                  onChange={(e) => updateSettings({ enableRecording: e.target.checked })}
                />
              }
              label="Enable student recording"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.showWaveform || false}
                  onChange={(e) => updateSettings({ showWaveform: e.target.checked })}
                />
              }
              label="Show audio waveform visualization"
            />
            <Box>
              <Typography gutterBottom>Recording Time Limit (seconds)</Typography>
              <Slider
                value={settings.recordingTimeLimit || 30}
                onChange={(e, value) => updateSettings({ recordingTimeLimit: value })}
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
                  checked={settings.shuffleCards || false}
                  onChange={(e) => updateSettings({ shuffleCards: e.target.checked })}
                />
              }
              label="Shuffle cards on each attempt"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.autoAdvance || false}
                  onChange={(e) => updateSettings({ autoAdvance: e.target.checked })}
                />
              }
              label="Auto-advance to next card after 3 seconds"
            />
            <Box>
              <Typography gutterBottom>Cards per session</Typography>
              <Slider
                value={settings.cardsPerSession || 10}
                onChange={(e, value) => updateSettings({ cardsPerSession: value })}
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
                  checked={settings.allowReplay !== false}
                  onChange={(e) => updateSettings({ allowReplay: e.target.checked })}
                />
              }
              label="Allow students to replay audio"
            />
            <Box>
              <Typography gutterBottom>Maximum Replays</Typography>
              <Slider
                value={settings.maxReplays || 3}
                onChange={(e, value) => updateSettings({ maxReplays: value })}
                min={1}
                max={10}
                valueLabelDisplay="auto"
                disabled={!settings.allowReplay}
              />
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.showTranscript || false}
                  onChange={(e) => updateSettings({ showTranscript: e.target.checked })}
                />
              }
              label="Show transcript after completion"
            />
          </Stack>
        );

      case 'matching':
        return (
          <Stack spacing={3}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Matching Settings
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.shuffleItems !== false}
                  onChange={(e) => updateSettings({ shuffleItems: e.target.checked })}
                />
              }
              label="Shuffle matching items"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.showLines || false}
                  onChange={(e) => updateSettings({ showLines: e.target.checked })}
                />
              }
              label="Show connection lines"
            />
          </Stack>
        );

      case 'sorting':
        return (
          <Stack spacing={3}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Sorting Settings
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.shuffleItems !== false}
                  onChange={(e) => updateSettings({ shuffleItems: e.target.checked })}
                />
              }
              label="Shuffle items initially"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.showNumbers || false}
                  onChange={(e) => updateSettings({ showNumbers: e.target.checked })}
                />
              }
              label="Show position numbers"
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

  const getValidationStatus = () => {
    const errors = [];
    const warnings = [];
    
    if (!interactiveContent.instruction?.trim()) {
      errors.push('Instructions are required');
    }
    
    if (!interactiveContent.items?.length) {
      errors.push('At least one interactive item is required');
    }
    
    if (interactiveContent.items?.length && interactiveContent.items.length < 2) {
      warnings.push('Consider adding more items for better engagement');
    }
    
    return { errors, warnings };
  };

  const { errors, warnings } = getValidationStatus();

  return (
    <Box>
      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab label="Type Selection" />
        <Tab 
          label={
            <Badge badgeContent={errors.length} color="error">
              Content
            </Badge>
          } 
        />
        <Tab label="Settings" />
        <Tab label="Preview" />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        {renderInteractiveTypeSelector()}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Stack spacing={3}>
          {/* Validation Status */}
          {(errors.length > 0 || warnings.length > 0) && (
            <Stack spacing={1}>
              {errors.map((error, i) => (
                <Alert key={`error-${i}`} severity="error" icon={<Warning />}>
                  {error}
                </Alert>
              ))}
              {warnings.map((warning, i) => (
                <Alert key={`warning-${i}`} severity="warning" icon={<Info />}>
                  {warning}
                </Alert>
              ))}
            </Stack>
          )}

          <TextField
            fullWidth
            label="Instructions"
            multiline
            rows={3}
            value={interactiveContent.instruction || ''}
            onChange={(e) => updateInteractiveContent({ instruction: e.target.value })}
            helperText="Clear instructions for students on what to do"
            error={!interactiveContent.instruction?.trim()}
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
                  value={interactiveContent.feedback?.correct || ''}
                  onChange={(e) => updateInteractiveContent({
                    feedback: {
                      ...interactiveContent.feedback,
                      correct: e.target.value
                    }
                  })}
                  placeholder="Excellent! You got it right! 🎉"
                />
                <TextField
                  fullWidth
                  label="Incorrect Answer Feedback"
                  value={interactiveContent.feedback?.incorrect || ''}
                  onChange={(e) => updateInteractiveContent({
                    feedback: {
                      ...interactiveContent.feedback,
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
                {currentTypeConfig?.label} Items ({interactiveContent.items?.length || 0})
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
                  {currentTypeConfig?.icon}
                </Box>
                <Typography color="text.secondary" gutterBottom>
                  No items added yet. Click "Add Item" to get started.
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {currentTypeConfig?.example}
                </Typography>
              </Paper>
            ) : (
              <Stack spacing={3}>
                {interactiveContent.items.map((item: any, itemIndex: number) => (
                  <Card key={item.id || itemIndex} variant="outlined" sx={{
                    border: '2px solid',
                    borderColor: previewItem === itemIndex ? 'primary.main' : 'divider',
                    borderRadius: 2,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      boxShadow: 2
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
                          <Tooltip title="Move Up">
                            <IconButton
                              size="small"
                              onClick={() => moveItem(itemIndex, 'up')}
                              disabled={itemIndex === 0}
                            >
                              <Box sx={{ transform: 'rotate(180deg)' }}>
                                <ExpandMore fontSize="small" />
                              </Box>
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Move Down">
                            <IconButton
                              size="small"
                              onClick={() => moveItem(itemIndex, 'down')}
                              disabled={itemIndex === interactiveContent.items.length - 1}
                            >
                              <ExpandMore fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Preview Item">
                            <IconButton
                              size="small"
                              onClick={() => setPreviewItem(previewItem === itemIndex ? null : itemIndex)}
                              color={previewItem === itemIndex ? 'primary' : 'default'}
                            >
                              <Preview fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Duplicate Item">
                            <IconButton
                              size="small"
                              onClick={() => duplicateInteractiveItem(itemIndex)}
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

                      {renderInteractiveItemEditor(item, itemIndex)}

                      {previewItem === itemIndex && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                          <Typography variant="body2" fontWeight={600} color="primary.main">
                            📱 Item Preview: This is how students will see this item
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </Card>

          {/* Quick Actions */}
          {interactiveContent.items && interactiveContent.items.length > 0 && (
            <Card sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" gutterBottom>Quick Actions</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    // Add 3 more default items
                    const newItems = [];
                    for (let i = 0; i < 3; i++) {
                      newItems.push(getDefaultInteractiveItem(interactiveContent.type));
                    }
                    updateInteractiveContent({
                      items: [...interactiveContent.items, ...newItems]
                    });
                  }}
                >
                  Add 3 More Items
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    // Clear all items
                    updateInteractiveContent({ items: [] });
                  }}
                  color="error"
                >
                  Clear All Items
                </Button>
              </Stack>
            </Card>
          )}
        </Stack>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {renderTypeSpecificSettings()}
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Stack spacing={3}>
          <Alert severity="info" sx={{ mb: 3 }}>
            Preview functionality shows how this interactive slide appears to students.
            This would render the actual interactive component in preview mode.
          </Alert>
          
          <Paper sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
            <Stack spacing={2} alignItems="center">
              <Avatar
                sx={{
                  bgcolor: currentTypeConfig?.color,
                  width: 64,
                  height: 64
                }}
              >
                {currentTypeConfig?.icon}
              </Avatar>
              
              <Typography variant="h6" gutterBottom>
                Interactive Preview
              </Typography>
              
              <Stack direction="row" spacing={2} alignItems="center">
                <Chip
                  label={currentTypeConfig?.label}
                  color="primary"
                  sx={{ bgcolor: currentTypeConfig?.color + '20', color: currentTypeConfig?.color }}
                />
                <Chip label={`${interactiveContent.items?.length || 0} items`} variant="outlined" />
                <Chip label={currentTypeConfig?.difficulty} size="small" />
              </Stack>
              
              <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ maxWidth: 400 }}>
                {interactiveContent.instruction || 'No instructions provided yet'}
              </Typography>

              <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<Preview />}
                  disabled={!interactiveContent.items?.length}
                >
                  Full Preview
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PlayArrow />}
                  disabled={!interactiveContent.items?.length}
                >
                  Test Activity
                </Button>
              </Stack>
              
              {!interactiveContent.items?.length && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Add some items to enable preview functionality
                </Alert>
              )}
            </Stack>
          </Paper>
          
          {/* Preview Statistics */}
          {interactiveContent.items?.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Activity Statistics
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="primary.main">
                        {interactiveContent.items.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Items
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="success.main">
                        {Math.max(2, Math.ceil(interactiveContent.items.length * 0.6))}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Est. Duration (min)
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="info.main">
                        {currentTypeConfig?.difficulty}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Difficulty
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <Box textAlign="center">
                      <CheckCircleOutline sx={{ fontSize: 32, color: 'success.main' }} />
                      <Typography variant="body2" color="text.secondary">
                        Ready to Use
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
        </Stack>
      </TabPanel>
    </Box>
  );
};