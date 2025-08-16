// frontend/src/components/admin/SlidesBuilder/SlideList.tsx
import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Stack,
  Divider,
  Grid,
  Button,
  Tooltip,
  IconButton,
  FormControlLabel,
  Switch,
  Box,
} from '@mui/material';
import {
  Settings,
  TextFields,
  Image,
  VideoLibrary,
  Quiz,
  Code,
  Extension,
} from '@mui/icons-material';
import { Slide, SlideContent } from '../../../types/slide.types';
import { SlideListItem } from './SlideListItem';

interface SlideListProps {
  slides: Slide[];
  activeSlide: number;
  onSlideSelect: (index: number) => void;
  onAddSlide: (type?: SlideContent['type']) => void;
  onDuplicateSlide: (index: number) => void;
  onRemoveSlide: (index: number) => void;
  onReorderSlides?: (slides: Slide[]) => void; // New prop for reordering
  validationErrors: Record<string, string[]>;
  showAdvancedSettings: boolean;
  onToggleAdvancedSettings: () => void;
}

const slideTypeConfigs = [
  { type: 'text' as const, icon: TextFields, color: '#1976D2' },
  { type: 'image' as const, icon: Image, color: '#388E3C' },
  { type: 'video' as const, icon: VideoLibrary, color: '#F57C00' },
  { type: 'quiz' as const, icon: Quiz, color: '#7B1FA2' },
  { type: 'code' as const, icon: Code, color: '#5D4037' },
  { type: 'interactive' as const, icon: Extension, color: '#C2185B' },
];

export const SlideList: React.FC<SlideListProps> = ({
  slides,
  activeSlide,
  onSlideSelect,
  onAddSlide,
  onDuplicateSlide,
  onRemoveSlide,
  onReorderSlides,
  validationErrors,
  showAdvancedSettings,
  onToggleAdvancedSettings,
}) => {
  // Drag and drop state
  const [draggedSlide, setDraggedSlide] = useState<Slide | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, slide: Slide, index: number) => {
    setDraggedSlide(slide);
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', ''); // Required for Firefox

    // Add visual feedback
    if (e.currentTarget) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    setDraggedSlide(null);
    setDraggedIndex(null);
    setDragOverIndex(null);

    // Reset visual feedback
    if (e.currentTarget) {
      e.currentTarget.style.opacity = '1';
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    // Only clear if we're leaving the entire drop zone
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();

    if (draggedSlide === null || draggedIndex === null) return;
    if (draggedIndex === dropIndex) {
      setDraggedSlide(null);
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Create new array with reordered slides
    const newSlides = [...slides];
    const [draggedItem] = newSlides.splice(draggedIndex, 1);
    newSlides.splice(dropIndex, 0, draggedItem);

    // Call the reorder callback if provided
    if (onReorderSlides) {
      onReorderSlides(newSlides);
    }

    // Update active slide index if needed
    if (activeSlide === draggedIndex) {
      onSlideSelect(dropIndex);
    } else if (draggedIndex < activeSlide && dropIndex >= activeSlide) {
      onSlideSelect(activeSlide - 1);
    } else if (draggedIndex > activeSlide && dropIndex <= activeSlide) {
      onSlideSelect(activeSlide + 1);
    }

    // Clean up
    setDraggedSlide(null);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <Paper sx={{ p: 2, height: 'fit-content', position: 'sticky', top: 20 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" gutterBottom>
          Slides ({slides.length})
        </Typography>
        <Tooltip title="Toggle Advanced Settings">
          <IconButton
            size="small"
            onClick={onToggleAdvancedSettings}
            color={showAdvancedSettings ? 'primary' : 'default'}
          >
            <Settings />
          </IconButton>
        </Tooltip>
      </Stack>

      <Stack spacing={1} sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
        {slides.map((slide, index) => (
          <Box
            key={slide.id}
            draggable
            onDragStart={(e) => handleDragStart(e, slide, index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            sx={{
              position: 'relative',
              cursor: 'move',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: -4,
                left: 0,
                right: 0,
                height: 4,
                bgcolor: 'primary.main',
                opacity: dragOverIndex === index && draggedIndex !== index ? 1 : 0,
                transition: 'opacity 0.2s ease',
              },
            }}
          >
            <SlideListItem
              slide={slide}
              index={index}
              isActive={activeSlide === index}
              hasErrors={(validationErrors[index] || []).length > 0}
              errorCount={(validationErrors[index] || []).length}
              onSelect={() => onSlideSelect(index)}
              onDuplicate={() => onDuplicateSlide(index)}
              onRemove={() => onRemoveSlide(index)}
              canRemove={slides.length > 1}
              isDragging={draggedIndex === index}
              isDragOver={dragOverIndex === index && draggedIndex !== index}
            />
          </Box>
        ))}
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle2" gutterBottom>
        Add New Slide
      </Typography>
      <Grid container spacing={1}>
        {slideTypeConfigs.map(({ type, icon: Icon, color }) => (
          <Grid size={{ xs: 4 }} key={type}>
            <Tooltip title={`Add ${type} slide`}>
              <Button
                fullWidth
                size="small"
                onClick={() => onAddSlide(type)}
                sx={{
                  flexDirection: 'column',
                  py: 1,
                  color: color,
                  borderColor: color + '40',
                  '&:hover': {
                    borderColor: color,
                    bgcolor: color + '10'
                  }
                }}
                variant="outlined"
              >
                <Icon />
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
  );
};