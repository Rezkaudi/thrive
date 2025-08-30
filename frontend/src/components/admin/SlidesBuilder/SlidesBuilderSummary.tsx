import React from 'react';
import {
  Paper,
  Grid,
  Typography,
  Stack,
  Chip,
  Alert,
  Box,
} from '@mui/material';
import {
  TextFields,
  Image,
  VideoLibrary,
  Quiz,
  Code,
  Extension,
} from '@mui/icons-material';
import { Slide } from '../../../types/slide.types';

interface SlidesBuilderSummaryProps {
  slides: Slide[];
  totalErrors: number;
  onPreview: () => void;
  hasValidationErrors: boolean;
}

const getSlideIcon = (type: string) => {
  switch (type) {
    case 'text': return <TextFields />;
    case 'image': return <Image />;
    case 'video': return <VideoLibrary />;
    case 'quiz': return <Quiz />;
    case 'interactive': return <Extension />;
    case 'code': return <Code />;
    default: return <TextFields />;
  }
};

const getSlideTypeColor = (type: string) => {
  switch (type) {
    case 'text': return '#1976D2';
    case 'image': return '#388E3C';
    case 'video': return '#F57C00';
    case 'quiz': return '#7B1FA2';
    case 'interactive': return '#C2185B';
    case 'code': return '#5D4037';
    default: return '#757575';
  }
};

export const SlidesBuilderSummary: React.FC<SlidesBuilderSummaryProps> = ({
  slides,
  totalErrors,
  onPreview,
  hasValidationErrors,
}) => {
  const slideTypeDistribution = slides.reduce((acc, slide) => {
    acc[slide.content.type] = (acc[slide.content.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const estimatedDuration = slides.reduce((acc, slide) => acc + (slide.duration || 5), 0);
  const interactiveSlides = slides.filter(s => s.content.type === 'interactive').length;

  return (
    <Paper sx={{ p: 3, mt: 3, bgcolor: 'primary.50', borderRadius: 3 }}>
      <Grid container spacing={3} alignItems="center">
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2}>
            <Typography variant="h6" fontWeight={600} color="primary.main">
              📊 Presentation Summary
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'background.paper' }}>
                  <Typography variant="h4" fontWeight={700} color="primary.main">
                    {slides.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Slides
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'background.paper' }}>
                  <Typography variant="h4" fontWeight={700} color="warning.main">
                    {totalErrors}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Validation Issues
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'background.paper' }}>
                  <Typography variant="h4" fontWeight={700} color="info.main">
                    {interactiveSlides}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Interactive Slides
                  </Typography>
                </Paper>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'background.paper' }}>
                  <Typography variant="h4" fontWeight={700} color="success.main">
                    {estimatedDuration}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Est. Minutes
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Slide Type Distribution */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Slide Type Distribution
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {Object.entries(slideTypeDistribution).map(([type, count]) => (
                  <Chip
                    key={type}
                    icon={getSlideIcon(type)}
                    label={`${type}: ${count}`}
                    size="small"
                    sx={{
                      bgcolor: getSlideTypeColor(type) + '20',
                      color: getSlideTypeColor(type),
                      fontWeight: 600
                    }}
                  />
                ))}
              </Stack>
            </Box>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <Stack spacing={2}>
            {/* <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<PlayArrow />}
              onClick={onPreview}
              sx={{
                py: 1.5,
                borderRadius: 2,
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976D2 30%, #00BCD4 90%)',
                }
              }}
            >
              Preview Presentation
            </Button>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<Save />}
              sx={{ borderRadius: 2 }}
            >
              Save Draft
            </Button> */}

            {hasValidationErrors && (
              <Alert severity="warning" sx={{ borderRadius: 2 }}>
                <Typography variant="body2" fontWeight={500}>
                  Please fix validation errors before publishing
                </Typography>
              </Alert>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
};