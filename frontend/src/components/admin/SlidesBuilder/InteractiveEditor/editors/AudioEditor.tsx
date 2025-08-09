import React from 'react';
import { Stack, TextField, Grid, IconButton, Tooltip } from '@mui/material';
import { CloudUpload, VolumeUp } from '@mui/icons-material';
import { ListeningItem, PronunciationItem } from '../../../../../types/interactive-items.types';

interface AudioEditorProps {
  item: PronunciationItem | ListeningItem;
  onUpdate: (updates: Partial<PronunciationItem | ListeningItem>) => void;
  type: 'pronunciation' | 'listening';
}

export const AudioEditor: React.FC<AudioEditorProps> = ({ item, onUpdate, type }) => {
  if (type === 'pronunciation') {
    const pronunciationItem = item as PronunciationItem;
    return (
      <Stack spacing={2}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <TextField
              fullWidth
              label="Text to Pronounce"
              value={pronunciationItem.text || ''}
              onChange={(e) => onUpdate({ text: e.target.value })}
              placeholder="e.g., おはようございます"
            />
          </Grid>
          <Grid size={{ xs: 6 }}>
            <TextField
              fullWidth
              label="Romanization"
              value={pronunciationItem.pronunciation || ''}
              onChange={(e) => onUpdate({ pronunciation: e.target.value })}
              placeholder="e.g., ohayou gozaimasu"
            />
          </Grid>
        </Grid>
        
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            fullWidth
            label="Reference Audio URL"
            value={pronunciationItem.audioUrl || ''}
            onChange={(e) => onUpdate({ audioUrl: e.target.value })}
            placeholder="S3 URL for reference pronunciation"
          />
          <Tooltip title="Upload Audio File">
            <IconButton color="primary">
              <CloudUpload />
            </IconButton>
          </Tooltip>
          {pronunciationItem.audioUrl && (
            <Tooltip title="Test Audio">
              <IconButton color="success">
                <VolumeUp />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Stack>
    );
  }

  // Listening type
  const listeningItem = item as ListeningItem;
  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2} alignItems="center">
        <TextField
          fullWidth
          label="Audio URL"
          value={listeningItem.audioUrl || ''}
          onChange={(e) => onUpdate({ audioUrl: e.target.value })}
          placeholder="S3 URL for audio file"
        />
        <Tooltip title="Upload Audio File">
          <IconButton color="primary">
            <CloudUpload />
          </IconButton>
        </Tooltip>
        {listeningItem.audioUrl && (
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
        value={listeningItem.question || ''}
        onChange={(e) => onUpdate({ question: e.target.value })}
        placeholder="What did you hear?"
      />
      
      <TextField
        fullWidth
        label="Answer Options (comma-separated)"
        value={Array.isArray(listeningItem.options) ? listeningItem.options.join(', ') : ''}
        onChange={(e) => onUpdate({ 
          options: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
        })}
        placeholder="e.g., Hello, Goodbye, Thank you"
      />
      
      <TextField
        fullWidth
        type="number"
        label="Correct Answer Index (0-based)"
        value={listeningItem.correct || 0}
        onChange={(e) => onUpdate({ correct: parseInt(e.target.value) })}
        inputProps={{ min: 0, max: (listeningItem.options?.length || 1) - 1 }}
        helperText="Index of the correct option (starting from 0)"
      />
    </Stack>
  );
};