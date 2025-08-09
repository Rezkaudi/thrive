import React from 'react';
import { Stack, TextField, Box, Typography, Chip } from '@mui/material';
import { SentenceBuilderItem } from '../../../../../types/interactive-items.types';

interface SentenceBuilderEditorProps {
  item: SentenceBuilderItem;
  onUpdate: (updates: Partial<SentenceBuilderItem>) => void;
}

export const SentenceBuilderEditor: React.FC<SentenceBuilderEditorProps> = ({ 
  item, 
  onUpdate 
}) => {
  return (
    <Stack spacing={2}>
      <TextField
        fullWidth
        label="Word Blocks (comma-separated)"
        value={Array.isArray(item.words) ? item.words.join(', ') : ''}
        onChange={(e) => onUpdate({ 
          words: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
        })}
        placeholder="e.g., 私, は, 学生, です"
      />
      
      <TextField
        fullWidth
        label="Correct Order (comma-separated indices)"
        value={Array.isArray(item.correctOrder) ? item.correctOrder.join(', ') : ''}
        onChange={(e) => onUpdate({ 
          correctOrder: e.target.value
            .split(',')
            .map(s => parseInt(s.trim()))
            .filter(n => !isNaN(n))
        })}
        placeholder="e.g., 0, 1, 2, 3 (order of words above)"
        helperText="Indices start from 0. Order corresponds to word positions above."
      />
      
      <TextField
        fullWidth
        label="Translation"
        value={item.translation || ''}
        onChange={(e) => onUpdate({ translation: e.target.value })}
        placeholder="e.g., I am a student"
      />
      
      {/* Sentence Preview */}
      {item.words && item.correctOrder && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" gutterBottom>
            Sentence Preview:
          </Typography>
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
};