import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Stack,
  Button,
  IconButton,
  Alert,
  Box,
  Chip,
} from '@mui/material';
import {
  Close,
  Visibility,
  Preview,
} from '@mui/icons-material';
import { Slide } from '../../../types/slide.types';

interface PreviewDialogProps {
  open: boolean;
  onClose: () => void;
  slides: Slide[];
}

export const PreviewDialog: React.FC<PreviewDialogProps> = ({
  open,
  onClose,
  slides,
}) => {
  const interactiveSlides = slides.filter(s => s.content.type === 'interactive').length;

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { bgcolor: 'background.default' }
      }}
    >
      <DialogTitle sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        bgcolor: 'primary.main',
        color: 'white'
      }}>
        <Typography variant="h6" fontWeight={600}>
          📱 Presentation Preview
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<Visibility />}
            sx={{
              color: 'white',
              borderColor: 'rgba(255,255,255,0.5)',
              '&:hover': {
                borderColor: 'white',
                bgcolor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            Student View
          </Button>
          <IconButton
            onClick={onClose}
            sx={{ color: 'white' }}
          >
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 0, height: '100%' }}>
        <Alert severity="info" sx={{ m: 2, borderRadius: 2 }}>
          <Typography variant="body2">
            🎯 This is a preview of how your slides will appear to students.
            Interactive features are simulated and may not function fully in preview mode.
          </Typography>
        </Alert>

        {/* Here you would render the actual InteractiveSlides component with the slides data */}
        <Box sx={{
          height: 'calc(100% - 80px)',
          bgcolor: 'grey.100',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          m: 2,
          borderRadius: 2
        }}>
          <Stack alignItems="center" spacing={2}>
            <Preview sx={{ fontSize: 64, color: 'text.secondary' }} />
            <Typography variant="h5" color="text.secondary">
              Interactive Slides Preview
            </Typography>
            <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ maxWidth: 400 }}>
              This would show your {slides.length} slides with full interactivity.
              Students would be able to navigate, complete activities, and receive feedback.
            </Typography>
            <Chip
              label={`${slides.length} slides • ${interactiveSlides} interactive`}
              color="primary"
            />
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
};