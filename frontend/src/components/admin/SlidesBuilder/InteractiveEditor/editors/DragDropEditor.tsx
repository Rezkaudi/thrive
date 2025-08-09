import React from 'react';
import { Stack, TextField, Grid } from '@mui/material';
import { DragDropItem } from '../../../../../types/interactive-items.types';


interface DragDropEditorProps {
  item: DragDropItem;
  onUpdate: (updates: Partial<DragDropItem>) => void;
}

export const DragDropEditor: React.FC<DragDropEditorProps> = ({ item, onUpdate }) => {
  return (
    <Stack spacing={2}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 6 }}>
          <TextField
            fullWidth
            label="Draggable Item"
            value={item.text || ''}
            onChange={(e) => onUpdate({ text: e.target.value })}
            placeholder="e.g., こんにちは"
          />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <TextField
            fullWidth
            label="Target/Answer"
            value={item.target || ''}
            onChange={(e) => onUpdate({ target: e.target.value })}
            placeholder="e.g., Hello"
          />
        </Grid>
      </Grid>
      <TextField
        fullWidth
        label="Category (optional)"
        value={item.category || ''}
        onChange={(e) => onUpdate({ category: e.target.value })}
        placeholder="e.g., Greetings"
        helperText="Group related items together"
      />
    </Stack>
  );
};