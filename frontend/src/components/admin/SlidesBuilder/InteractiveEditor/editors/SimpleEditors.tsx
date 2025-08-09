import React from 'react';
import { Stack, TextField, Grid } from '@mui/material';
import { MatchingItem, SortingItem, TimelineItem } from '../../../../../types/interactive-items.types';

// Matching Editor
interface MatchingEditorProps {
  item: MatchingItem;
  onUpdate: (updates: Partial<MatchingItem>) => void;
}

export const MatchingEditor: React.FC<MatchingEditorProps> = ({ item, onUpdate }) => {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 6 }}>
        <TextField
          fullWidth
          label="Left Item"
          value={item.left || ''}
          onChange={(e) => onUpdate({ left: e.target.value })}
          placeholder="e.g., ありがとう"
        />
      </Grid>
      <Grid size={{ xs: 6 }}>
        <TextField
          fullWidth
          label="Right Item (Match)"
          value={item.right || ''}
          onChange={(e) => onUpdate({ right: e.target.value })}
          placeholder="e.g., Thank you"
        />
      </Grid>
    </Grid>
  );
};

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