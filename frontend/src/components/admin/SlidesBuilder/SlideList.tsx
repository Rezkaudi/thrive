import React from 'react';
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
  validationErrors,
  showAdvancedSettings,
  onToggleAdvancedSettings,
}) => {
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
          <SlideListItem
            key={slide.id}
            slide={slide}
            index={index}
            isActive={activeSlide === index}
            hasErrors={(validationErrors[index] || []).length > 0}
            errorCount={(validationErrors[index] || []).length}
            onSelect={() => onSlideSelect(index)}
            onDuplicate={() => onDuplicateSlide(index)}
            onRemove={() => onRemoveSlide(index)}
            canRemove={slides.length > 1}
          />
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