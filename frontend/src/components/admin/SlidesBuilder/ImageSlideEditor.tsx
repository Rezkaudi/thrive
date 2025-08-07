import React from 'react';
import {
  TextField,
  Stack,
  Grid,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Typography,
  Box,
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { Slide, SlideContent } from '../../../types/slide.types';

interface ImageSlideEditorProps {
  slide: Slide;
  index: number;
  onUpdate: (index: number, updates: Partial<Slide>) => void;
  onUpdateContent: (index: number, contentUpdates: Partial<SlideContent>) => void;
}

export const ImageSlideEditor: React.FC<ImageSlideEditorProps> = ({
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
      
      <Stack direction="row" spacing={2} alignItems="center">
        <TextField
          fullWidth
          label="Image URL"
          value={content.content?.url || ''}
          onChange={(e) => onUpdateContent(index, {
            content: { ...content.content, url: e.target.value }
          })}
          error={!content.content?.url?.trim()}
          helperText={!content.content?.url?.trim() ? 'Image URL is required' : ''}
          placeholder="https://example.com/image.jpg or S3 URL"
        />
        <Tooltip title="Upload Image">
          <IconButton color="primary" size="large">
            <CloudUpload />
          </IconButton>
        </Tooltip>
      </Stack>
      
      <Grid container spacing={2}>
        <Grid size={{ xs: 6 }}>
          <TextField
            fullWidth
            label="Alt Text"
            value={content.content?.alt || ''}
            onChange={(e) => onUpdateContent(index, {
              content: { ...content.content, alt: e.target.value }
            })}
            placeholder="Describe the image for accessibility"
            helperText="Important for screen readers and SEO"
          />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <TextField
            fullWidth
            label="Caption"
            value={content.content?.caption || ''}
            onChange={(e) => onUpdateContent(index, {
              content: { ...content.content, caption: e.target.value }
            })}
            placeholder="Optional caption text"
          />
        </Grid>
      </Grid>
      
      {/* Image Preview */}
      {content.content?.url && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>
              Image Preview
            </Typography>
            <Box
              component="img"
              src={content.content.url}
              alt={content.content.alt || 'Preview'}
              sx={{
                width: '100%',
                maxHeight: 300,
                objectFit: 'contain',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider'
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            {content.content.caption && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {content.content.caption}
              </Typography>
            )}
          </CardContent>
        </Card>
      )}
    </Stack>
  );
};