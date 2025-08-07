import React from 'react';
import { TextField, Stack } from '@mui/material';
import { Slide, SlideContent } from '../../../types/slide.types';

interface TextSlideEditorProps {
  slide: Slide;
  index: number;
  onUpdate: (index: number, updates: Partial<Slide>) => void;
  onUpdateContent: (index: number, contentUpdates: Partial<SlideContent>) => void;
}

export const TextSlideEditor: React.FC<TextSlideEditorProps> = ({
  slide,
  index,
  onUpdateContent,
}) => {
  const { content } = slide;

  return (
    <Stack spacing={3}>
      <TextField
        fullWidth
        label="Title"
        value={content.title || ''}
        onChange={(e) => onUpdateContent(index, { title: e.target.value })}
        error={!content.title?.trim()}
        helperText={!content.title?.trim() ? 'Title is required' : ''}
      />
      
      <TextField
        fullWidth
        label="Subtitle"
        value={content.subtitle || ''}
        onChange={(e) => onUpdateContent(index, { subtitle: e.target.value })}
      />
      
      <TextField
        fullWidth
        multiline
        rows={6}
        label="Content"
        value={content.content || ''}
        onChange={(e) => onUpdateContent(index, { content: e.target.value })}
      />
    </Stack>
  );
};