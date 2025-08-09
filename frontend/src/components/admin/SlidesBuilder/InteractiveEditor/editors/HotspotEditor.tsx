import React from 'react';
import { Stack, TextField, Grid, Box, Typography } from '@mui/material';
import { HotspotItem } from '../../../../../types/interactive-items.types';

interface HotspotEditorProps {
  item: HotspotItem;
  onUpdate: (updates: Partial<HotspotItem>) => void;
  currentTypeConfig?: { color?: string };
}

export const HotspotEditor: React.FC<HotspotEditorProps> = ({ 
  item, 
  onUpdate, 
  currentTypeConfig 
}) => {
  return (
    <Stack spacing={2}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 4 }}>
          <TextField
            fullWidth
            type="number"
            label="X Position (%)"
            value={item.x || 50}
            onChange={(e) => onUpdate({ x: parseInt(e.target.value) })}
            inputProps={{ min: 0, max: 100 }}
          />
        </Grid>
        <Grid size={{ xs: 4 }}>
          <TextField
            fullWidth
            type="number"
            label="Y Position (%)"
            value={item.y || 50}
            onChange={(e) => onUpdate({ y: parseInt(e.target.value) })}
            inputProps={{ min: 0, max: 100 }}
          />
        </Grid>
        <Grid size={{ xs: 4 }}>
          <TextField
            fullWidth
            label="Label"
            value={item.label || ''}
            onChange={(e) => onUpdate({ label: e.target.value })}
            placeholder="e.g., 目 (eye)"
          />
        </Grid>
      </Grid>
      
      <TextField
        fullWidth
        multiline
        rows={2}
        label="Feedback Text"
        value={item.feedback || ''}
        onChange={(e) => onUpdate({ feedback: e.target.value })}
        placeholder="Feedback when this hotspot is clicked"
      />
      
      {/* Visual Position Preview */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" gutterBottom>
          Position Preview:
        </Typography>
        <Box
          sx={{
            width: '100%',
            height: 120,
            bgcolor: 'grey.100',
            borderRadius: 1,
            border: '1px dashed',
            borderColor: 'grey.400',
            position: 'relative'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              left: `${item.x || 50}%`,
              top: `${item.y || 50}%`,
              transform: 'translate(-50%, -50%)',
              width: 20,
              height: 20,
              bgcolor: currentTypeConfig?.color || 'primary.main',
              borderRadius: '50%',
              border: '2px solid white',
              boxShadow: 2
            }}
          />
          <Typography 
            variant="caption" 
            sx={{ 
              position: 'absolute', 
              bottom: 4, 
              right: 4, 
              color: 'text.secondary' 
            }}
          >
            {item.x || 50}%, {item.y || 50}%
          </Typography>
        </Box>
      </Box>
    </Stack>
  );
};