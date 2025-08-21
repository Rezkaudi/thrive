import React, { useState, useEffect } from 'react';
import { Stack, TextField, Grid, Box, Typography, Button, Paper } from '@mui/material';
import { CloudUpload, Image as ImageIcon } from '@mui/icons-material';
import { HotspotItem } from '../../../../../types/interactive-items.types';

interface HotspotEditorProps {
  item: HotspotItem;
  onUpdate: (updates: Partial<HotspotItem>) => void;
  currentTypeConfig?: { color?: string };
  // Optional props for slide-level settings
  slideSettings?: any;
  onSlideSettingsUpdate?: (settings: any) => void;
}

export const HotspotEditor: React.FC<HotspotEditorProps> = ({ 
  item, 
  onUpdate, 
  currentTypeConfig,
  slideSettings,
  onSlideSettingsUpdate
}) => {
  // Local state to manage image URL when parent props aren't available
  const [localImageUrl, setLocalImageUrl] = useState('');
  
  // Use slide settings if available, otherwise use local state
  const imageUrl = slideSettings?.imageUrl || localImageUrl;
  const canUpload = !!onSlideSettingsUpdate;

  // Load any existing image URL from localStorage as a fallback
  useEffect(() => {
    const savedUrl = localStorage.getItem('hotspot-temp-image-url');
    if (savedUrl && !slideSettings?.imageUrl) {
      setLocalImageUrl(savedUrl);
    }
  }, [slideSettings]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (onSlideSettingsUpdate) {
          onSlideSettingsUpdate({
            ...slideSettings,
            imageUrl: dataUrl
          });
        } else {
          setLocalImageUrl(dataUrl);
          localStorage.setItem('hotspot-temp-image-url', dataUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (url: string) => {
    if (onSlideSettingsUpdate) {
      onSlideSettingsUpdate({
        ...slideSettings,
        imageUrl: url
      });
    } else {
      setLocalImageUrl(url);
      localStorage.setItem('hotspot-temp-image-url', url);
    }
  };

  return (
    <Stack spacing={3}>
      {/* Image Upload/URL Section */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Background Image
        </Typography>
        
        <Stack spacing={2}>
          {/* Image Upload Button */}
          <Button
            component="label"
            variant="outlined"
            startIcon={<CloudUpload />}
            sx={{ alignSelf: 'flex-start' }}
          >
            Upload Image
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageUpload}
            />
          </Button>
          
          {/* Image URL Input */}
          <TextField
            fullWidth
            label="Or enter Image URL"
            value={imageUrl}
            onChange={(e) => handleImageUrlChange(e.target.value)}
            placeholder="https://picsum.photos/800/600"
            helperText={canUpload ? "Upload a file or enter an image URL" : "Enter an image URL (settings will be saved temporarily)"}
          />
          
          {/* Image Preview */}
          {imageUrl && (
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Current Image:
              </Typography>
              <Box
                component="img"
                src={imageUrl}
                alt="Hotspot background"
                sx={{
                  width: '100%',
                  maxWidth: 300,
                  height: 'auto',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'grey.300'
                }}
                onError={(e) => {
                  console.error('Failed to load image:', imageUrl);
                  e.currentTarget.style.display = 'none';
                }}
              />
            </Paper>
          )}
          
          {!imageUrl && (
            <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
              <ImageIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Upload an image or enter a URL to get started
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Try: https://picsum.photos/800/600 for testing
              </Typography>
            </Paper>
          )}
        </Stack>
      </Box>

      {/* Hotspot Configuration */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Hotspot Position & Content
        </Typography>
        
        <Grid container spacing={2}>
          <Grid size={{ xs: 4 }}>
            <TextField
              fullWidth
              type="number"
              label="X Position (%)"
              value={item.x || 50}
              onWheel={(e) => (e.target as HTMLInputElement).blur()}
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
              onWheel={(e) => (e.target as HTMLInputElement).blur()}
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
          sx={{ mt: 2 }}
        />
      </Box>
      
      {/* Visual Position Preview */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Position Preview
        </Typography>
        <Box
          sx={{
            width: '100%',
            height: 200,
            bgcolor: imageUrl ? 'transparent' : 'grey.100',
            borderRadius: 1,
            border: '1px dashed',
            borderColor: 'grey.400',
            position: 'relative',
            backgroundImage: imageUrl ? `url(${imageUrl})` : 'none',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center'
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
              color: 'text.primary',
              bgcolor: 'rgba(255,255,255,0.8)',
              px: 1,
              borderRadius: 0.5
            }}
          >
            {item.x || 50}%, {item.y || 50}%
          </Typography>
        </Box>
      </Box>
    </Stack>
  );
};