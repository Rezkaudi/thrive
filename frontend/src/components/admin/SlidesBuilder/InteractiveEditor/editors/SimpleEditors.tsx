// frontend/src/components/admin/SlidesBuilder/InteractiveEditor/editors/SimpleEditors.tsx
import React from 'react';
import {
  Stack,
  TextField,
  Grid,
  Paper,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  VolumeUp,
  CloudUpload,
  PlayArrow
} from '@mui/icons-material';
import { MatchingItem, SortingItem, TimelineItem } from '../../../../../types/interactive-items.types';

// Enhanced Matching Editor with Audio Support
interface MatchingEditorProps {
  item: MatchingItem;
  onUpdate: (updates: Partial<MatchingItem>) => void;
}

export const MatchingEditor: React.FC<MatchingEditorProps> = ({ item, onUpdate }) => {
  const playAudio = (url: string) => {
    if (url) {
      const audio = new Audio(url);
      audio.play().catch(err => console.error('Error playing audio:', err));
    }
  };

  return (
    <Stack spacing={2}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Character/Word (Left Side)"
            value={item.left || ''}
            onChange={(e) => onUpdate({ left: e.target.value })}
            placeholder="e.g., あ, こんにちは, 犬"
            helperText="The text that users will see and match"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Sound Label (Right Side)"
            value={item.right || ''}
            onChange={(e) => onUpdate({ right: e.target.value })}
            placeholder="e.g., Sound of 'a', Greeting, Animal sound"
            helperText="Description of the sound (optional)"
          />
        </Grid>
      </Grid>

      {/* Audio URL Input */}
      <Stack direction="row" spacing={2} alignItems="center">
        <TextField
          fullWidth
          label="Audio URL (MP3)"
          value={item.audioUrl || ''}
          onChange={(e) => onUpdate({ audioUrl: e.target.value })}
          placeholder="https://example.com/audio.mp3 or S3 URL"
          helperText="Upload MP3 file for the sound"
          InputProps={{
            startAdornment: (
              <VolumeUp sx={{ mr: 1, color: 'action.active' }} />
            ),
          }}
        />
        <Tooltip title="Upload Audio">
          <IconButton color="primary" size="large">
            <CloudUpload />
          </IconButton>
        </Tooltip>
        {item.audioUrl && (
          <Tooltip title="Test Audio">
            <IconButton
              color="success"
              size="large"
              onClick={() => playAudio(item.audioUrl!)}
            >
              <PlayArrow />
            </IconButton>
          </Tooltip>
        )}
      </Stack>

      {/* Preview of the matching pair */}
      <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
        <Typography variant="caption" color="text.secondary" gutterBottom>
          Preview:
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Chip
            label={item.left || 'Character'}
            color="primary"
            variant="outlined"
            sx={{ minWidth: 100, fontSize: '1rem' }}
          />
          <Typography variant="body2" color="text.secondary">
            ↔️
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              icon={<VolumeUp />}
              label={item.right || 'Audio'}
              color="secondary"
              variant="outlined"
              sx={{ minWidth: 100 }}
            />
            {!item.audioUrl && (
              <Typography variant="caption" color="error">
                (No audio)
              </Typography>
            )}
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
};

// ... rest of the editors remain the same
// Sorting Editor
interface SortingEditorProps {
  item: SortingItem;
  onUpdate: (updates: Partial<SortingItem>) => void;
}

export const SortingEditor: React.FC<SortingEditorProps> = ({ item, onUpdate }) => {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 8 }}>
        <TextField
          fullWidth
          label="Item to Sort"
          value={item.text || ''}
          onChange={(e) => onUpdate({ text: e.target.value })}
          placeholder="e.g., 一 (one)"
        />
      </Grid>
      <Grid size={{ xs: 4 }}>
        <TextField
          fullWidth
          type="number"
          label="Correct Position"
          value={item.correctOrder || 0}
          onWheel={(e) => (e.target as HTMLInputElement).blur()}
          onChange={(e) => onUpdate({ correctOrder: parseInt(e.target.value) })}
          inputProps={{ min: 1 }}
          helperText="Position in final order"
        />
      </Grid>
    </Grid>
  );
};

// Timeline Editor
interface TimelineEditorProps {
  item: TimelineItem;
  onUpdate: (updates: Partial<TimelineItem>) => void;
}

export const TimelineEditor: React.FC<TimelineEditorProps> = ({ item, onUpdate }) => {
  return (
    <Stack spacing={2}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 8 }}>
          <TextField
            fullWidth
            label="Event"
            value={item.event || ''}
            onChange={(e) => onUpdate({ event: e.target.value })}
            placeholder="e.g., Meiji Restoration"
          />
        </Grid>
        <Grid size={{ xs: 4 }}>
          <TextField
            fullWidth
            label="Date/Year"
            value={item.date || ''}
            onChange={(e) => onUpdate({ date: e.target.value })}
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
        onChange={(e) => onUpdate({ description: e.target.value })}
        placeholder="Brief description of the event"
      />
    </Stack>
  );
};