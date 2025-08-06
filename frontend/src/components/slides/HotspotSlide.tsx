import { useState } from "react";
import { SlideComponentProps } from "../../types/slides";
import { Alert, Box, Button, Fade, IconButton, LinearProgress, Paper, Stack, Tooltip, Typography } from "@mui/material";
import { CheckCircle, Image, TouchApp } from "@mui/icons-material";

export const HotspotSlide: React.FC<SlideComponentProps> = ({
  slide,
  showFeedback,
  validationResults,
  checkAnswer,
}) => {
  const [hotspotClicks, setHotspotClicks] = useState<Set<string>>(new Set());
  const content = slide.content.content;
  const slideId = `hotspot-${slide.id}`;
  const showSlideFeeback = showFeedback[slideId];
  const validation = validationResults[slideId];

  const handleHotspotClick = (hotspotId: string) => {
    setHotspotClicks(prev => new Set(prev).add(hotspotId));
  };

  const handleCheckAnswer = () => {
    const correctHotspots = content.items?.map((item: any) => item.id.toString()) || [];
    const clickedHotspots = Array.from(hotspotClicks);

    checkAnswer(slideId, clickedHotspots.sort(), correctHotspots.sort(), 'hotspot');
  };

  const resetHotspots = () => {
    setHotspotClicks(new Set());
  };

  return (
    <Box sx={{ padding: 4, maxWidth: '1000px', margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom fontWeight={600} textAlign="center" sx={{ mb: 3 }}>
        {slide.content.title}
      </Typography>

      <Typography variant="body1" sx={{ textAlign: 'center', mb: 4, color: 'text.secondary', fontSize: '1.1rem' }}>
        {content.instruction}
      </Typography>

      {/* Image with Hotspots */}
      <Paper sx={{ position: 'relative', borderRadius: 3, overflow: 'hidden', mb: 4 }}>
        {content.settings?.imageUrl ? (
          <Box sx={{ position: 'relative', width: '100%', paddingTop: '60%' }}>
            <Box
              component="img"
              src={content.settings.imageUrl}
              alt="Interactive image"
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />

            {/* Hotspot Indicators */}
            {content.items?.map((item: any) => (
              <Tooltip
                key={item.id}
                title={hotspotClicks.has(item.id.toString()) ? item.feedback : item.label}
                arrow
                placement="top"
              >
                <IconButton
                  onClick={() => handleHotspotClick(item.id.toString())}
                  sx={{
                    position: 'absolute',
                    left: `${item.x}%`,
                    top: `${item.y}%`,
                    transform: 'translate(-50%, -50%)',
                    width: 40,
                    height: 40,
                    bgcolor: hotspotClicks.has(item.id.toString()) ? 'success.main' : 'primary.main',
                    color: 'white',
                    boxShadow: 3,
                    animation: content.settings?.showAllHotspots || hotspotClicks.has(item.id.toString())
                      ? 'none' : 'pulse 2s infinite',
                    '&:hover': {
                      bgcolor: hotspotClicks.has(item.id.toString()) ? 'success.dark' : 'primary.dark',
                      transform: 'translate(-50%, -50%) scale(1.1)',
                    },
                    '@keyframes pulse': {
                      '0%': { boxShadow: '0 0 0 0 rgba(25, 118, 210, 0.7)' },
                      '70%': { boxShadow: '0 0 0 10px rgba(25, 118, 210, 0)' },
                      '100%': { boxShadow: '0 0 0 0 rgba(25, 118, 210, 0)' }
                    }
                  }}
                >
                  {hotspotClicks.has(item.id.toString()) ? <CheckCircle /> : <TouchApp />}
                </IconButton>
              </Tooltip>
            ))}
          </Box>
        ) : (
          <Box sx={{ p: 8, textAlign: 'center', bgcolor: 'grey.100' }}>
            <Image sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No background image provided
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Progress Indicator */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: 'info.50', borderRadius: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body1" fontWeight={500}>
            Progress: {hotspotClicks.size} of {content.items?.length || 0} hotspots found
          </Typography>
          <LinearProgress
            variant="determinate"
            value={(hotspotClicks.size / (content.items?.length || 1)) * 100}
            sx={{ width: 200, height: 8, borderRadius: 4 }}
          />
        </Stack>
      </Paper>

      <Stack direction="row" spacing={2} justifyContent="center">
        <Button
          variant="outlined"
          size="large"
          onClick={resetHotspots}
          sx={{ px: 4, py: 1.5, fontSize: '1rem', borderRadius: 3 }}
        >
          🔄 Reset
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={handleCheckAnswer}
          disabled={hotspotClicks.size !== (content.items?.length || 0)}
          sx={{
            px: 6,
            py: 1.5,
            fontSize: '1.1rem',
            borderRadius: 3,
            background: 'linear-gradient(45deg, #FF9800 30%, #FFB74D 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #F57C00 30%, #FF9800 90%)',
            }
          }}
        >
          Check Hotspots ({hotspotClicks.size}/{content.items?.length || 0})
        </Button>
      </Stack>

      {showSlideFeeback && validation && (
        <Fade in>
          <Alert
            severity={validation.type}
            sx={{ mt: 3, borderRadius: 2, fontSize: '1rem' }}
          >
            {validation.message}
          </Alert>
        </Fade>
      )}
    </Box>
  );
};