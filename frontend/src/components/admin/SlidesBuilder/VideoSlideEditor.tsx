import React, { useState } from 'react';
import {
  TextField,
  Stack,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Grid,
  FormControlLabel,
  Switch,
  Alert,
  Chip,
} from '@mui/material';
import { 
  CloudUpload, 
  VideoLibrary, 
  PlayArrow, 
  Stop,
  VolumeUp,
  VolumeOff,
  Fullscreen,
  Settings
} from '@mui/icons-material';
import { Slide, SlideContent } from '../../../types/slide.types';

interface VideoSlideEditorProps {
  slide: Slide;
  index: number;
  onUpdate: (index: number, updates: Partial<Slide>) => void;
  onUpdateContent: (index: number, contentUpdates: Partial<SlideContent>) => void;
}

export const VideoSlideEditor: React.FC<VideoSlideEditorProps> = ({
  slide,
  index,
  onUpdateContent,
}) => {
  const { content } = slide;
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Get video settings or set defaults
  const videoSettings = content.content?.settings || {};
  
  const updateVideoSettings = (newSettings: any) => {
    onUpdateContent(index, {
      content: {
        ...content.content,
        settings: { ...videoSettings, ...newSettings }
      }
    });
  };

  const getVideoType = (url: string) => {
    if (!url) return 'unknown';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('vimeo.com')) return 'vimeo';
    if (url.includes('.mp4') || url.includes('.webm') || url.includes('.ogg')) return 'direct';
    if (url.includes('s3.') || url.includes('amazonaws.com')) return 's3';
    return 'unknown';
  };

  const videoType = getVideoType(content.content?.url || '');

  return (
    <Stack spacing={3}>
      {/* Basic Video Info */}
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
        placeholder="Optional subtitle or description"
      />
      
      {/* Video URL Input */}
      <Stack direction="row" spacing={2} alignItems="center">
        <TextField
          fullWidth
          label="Video URL"
          value={content.content?.url || ''}
          onChange={(e) => onUpdateContent(index, {
            content: { ...content.content, url: e.target.value }
          })}
          error={!content.content?.url?.trim()}
          helperText={
            !content.content?.url?.trim() 
              ? 'Video URL is required' 
              : `Detected: ${videoType === 'youtube' ? 'YouTube' : 
                           videoType === 'vimeo' ? 'Vimeo' : 
                           videoType === 'direct' ? 'Direct Video' :
                           videoType === 's3' ? 'S3 Storage' : 'Unknown format'}`
          }
          placeholder="https://youtube.com/watch?v=... or direct video URL"
        />
        <Tooltip title="Upload Video File">
          <IconButton color="primary" size="large">
            <CloudUpload />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Video Type Info */}
      {content.content?.url && (
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label={videoType.toUpperCase()}
              color={videoType === 'youtube' || videoType === 'vimeo' ? 'success' : 
                     videoType === 'direct' || videoType === 's3' ? 'primary' : 'warning'}
              size="small"
            />
            {videoType === 'unknown' && (
              <Alert severity="warning" sx={{ flex: 1 }}>
                Video format not recognized. Please ensure URL is correct.
              </Alert>
            )}
          </Stack>
        </Box>
      )}

      {/* Video Settings */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Video Settings
          </Typography>
          
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={videoSettings.autoplay || false}
                    onChange={(e) => updateVideoSettings({ autoplay: e.target.checked })}
                  />
                }
                label="Auto-play video"
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={videoSettings.controls !== false}
                    onChange={(e) => updateVideoSettings({ controls: e.target.checked })}
                  />
                }
                label="Show video controls"
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={videoSettings.muted || false}
                    onChange={(e) => updateVideoSettings({ muted: e.target.checked })}
                  />
                }
                label="Start muted"
              />
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={videoSettings.loop || false}
                    onChange={(e) => updateVideoSettings({ loop: e.target.checked })}
                  />
                }
                label="Loop video"
              />
            </Grid>
          </Grid>

          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Start Time (seconds)"
              type="number"
              value={videoSettings.startTime || ''}
              onWheel={(e) => (e.target as HTMLInputElement).blur()}
              onChange={(e) => updateVideoSettings({ startTime: parseInt(e.target.value) || 0 })}
              inputProps={{ min: 0 }}
              helperText="Video will start at this time"
            />
            
            <TextField
              fullWidth
              label="End Time (seconds)"
              type="number"
              value={videoSettings.endTime || ''}
              onWheel={(e) => (e.target as HTMLInputElement).blur()}
              onChange={(e) => updateVideoSettings({ endTime: parseInt(e.target.value) || 0 })}
              inputProps={{ min: 0 }}
              helperText="Video will stop at this time (leave empty for full video)"
            />
          </Stack>
        </CardContent>
      </Card>

      {/* Video Description/Transcript */}
      <TextField
        fullWidth
        multiline
        rows={3}
        label="Video Description / Transcript"
        value={content.content?.description || ''}
        onChange={(e) => onUpdateContent(index, {
          content: { ...content.content, description: e.target.value }
        })}
        placeholder="Optional description or transcript for accessibility"
        helperText="This helps with SEO and accessibility"
      />
      
      {/* Video Preview */}
      {content.content?.url && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle2">
                Video Preview
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={isPlaying ? <Stop /> : <PlayArrow />}
                  size="small"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? 'Stop' : 'Play'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Settings />}
                  size="small"
                >
                  Test Settings
                </Button>
              </Stack>
            </Stack>

            <Box
              sx={{
                width: '100%',
                height: 300,
                bgcolor: 'grey.100',
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid',
                borderColor: 'divider',
                position: 'relative',
                cursor: 'pointer'
              }}
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {videoType === 'youtube' || videoType === 'vimeo' ? (
                // For YouTube/Vimeo, show embedded preview
                <Stack alignItems="center" spacing={2}>
                  <VideoLibrary sx={{ fontSize: 48, color: 'primary.main' }} />
                  <Typography variant="body1" color="primary.main" fontWeight={600}>
                    {videoType === 'youtube' ? 'YouTube Video' : 'Vimeo Video'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" textAlign="center">
                    Click to test video playback
                  </Typography>
                </Stack>
              ) : (
                // For direct videos, show video player simulation
                <Stack alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: isPlaying ? 'error.main' : 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {isPlaying ? <Stop sx={{ color: 'white', fontSize: 32 }} /> : 
                                <PlayArrow sx={{ color: 'white', fontSize: 32 }} />}
                  </Box>
                  <Typography variant="body1" color="text.primary" fontWeight={600}>
                    Video Player Preview
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {isPlaying ? 'Video is playing...' : 'Click to preview video'}
                  </Typography>
                </Stack>
              )}

              {/* Video Controls Overlay */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  left: 8,
                  right: 8,
                  bgcolor: 'rgba(0,0,0,0.7)',
                  borderRadius: 1,
                  p: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  opacity: videoSettings.controls !== false ? 1 : 0.3
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <IconButton size="small" sx={{ color: 'white' }}>
                    {isPlaying ? <Stop /> : <PlayArrow />}
                  </IconButton>
                  <Typography variant="caption" sx={{ color: 'white' }}>
                    0:00 / 0:00
                  </Typography>
                </Stack>
                
                <Stack direction="row" spacing={1}>
                  <IconButton size="small" sx={{ color: 'white' }}>
                    {videoSettings.muted ? <VolumeOff /> : <VolumeUp />}
                  </IconButton>
                  <IconButton size="small" sx={{ color: 'white' }}>
                    <Fullscreen />
                  </IconButton>
                </Stack>
              </Box>
            </Box>

            {/* Video Settings Summary */}
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">
                <strong>Settings:</strong>{' '}
                {videoSettings.autoplay ? 'Auto-play enabled' : 'Manual play'} •{' '}
                {videoSettings.controls !== false ? 'Controls visible' : 'No controls'} •{' '}
                {videoSettings.muted ? 'Muted' : 'Audio enabled'} •{' '}
                {videoSettings.loop ? 'Looping' : 'Single play'}
                {videoSettings.startTime && ` • Starts at ${videoSettings.startTime}s`}
                {videoSettings.endTime && ` • Ends at ${videoSettings.endTime}s`}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
};