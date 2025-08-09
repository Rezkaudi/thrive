import React from 'react';
import { Stack, TextField } from '@mui/material';
import { FillBlanksItem } from '../../../../../types/interactive-items.types';

interface FillBlanksEditorProps {
  item: FillBlanksItem;
  onUpdate: (updates: Partial<FillBlanksItem>) => void;
}

export const FillBlanksEditor: React.FC<FillBlanksEditorProps> = ({ item, onUpdate }) => {
  return (
    <Stack spacing={2}>
      <TextField
        fullWidth
        label="Sentence with Blanks"
        value={item.sentence || ''}
        onChange={(e) => onUpdate({ sentence: e.target.value })}
        placeholder="Use ___ for blanks: I am ___ student"
        helperText="Use underscores (___) to mark where students should fill in words"
      />
      <TextField
        fullWidth
        label="Correct Answers (comma-separated)"
        value={Array.isArray(item.blanks) ? item.blanks.join(', ') : ''}
        onChange={(e) => onUpdate({ 
          blanks: e.target.value.split(',').map(s => s.trim()).filter(Boolean) 
        })}
        placeholder="e.g., a, student, learning"
        helperText="Multiple correct answers separated by commas"
      />
      <TextField
        fullWidth
        label="Translation (optional)"
        value={item.translation || ''}
        onChange={(e) => onUpdate({ translation: e.target.value })}
        placeholder="e.g., I am a student"
      />
    </Stack>
  );
};