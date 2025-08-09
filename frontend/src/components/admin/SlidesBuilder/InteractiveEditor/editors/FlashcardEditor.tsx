import React from 'react';
import { Stack, TextField, Grid, Box, Typography, Paper } from '@mui/material';
import { FlashcardItem } from '../../../../../types/interactive-items.types';

interface FlashcardEditorProps {
  item: FlashcardItem;
  onUpdate: (updates: Partial<FlashcardItem>) => void;
}

export const FlashcardEditor: React.FC<FlashcardEditorProps> = ({ item, onUpdate }) => {
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
            onChange={(e) => onUpdate({ front: e.target.value })}
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
            onChange={(e) => onUpdate({ back: e.target.value })}
            placeholder="e.g., Kanji - Chinese characters"
          />
        </Grid>
      </Grid>
      
      <TextField
        fullWidth
        label="Category"
        value={item.category || ''}
        onChange={(e) => onUpdate({ category: e.target.value })}
        placeholder="e.g., Vocabulary, Grammar"
      />
      
      {/* Flashcard Preview */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" gutterBottom>
          Card Preview:
        </Typography>
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
};