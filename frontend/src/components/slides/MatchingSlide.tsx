import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Paper,
  Alert,
  Grid,
  Fade,
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { SlideComponentProps } from '../../types/slides';

export const MatchingSlide: React.FC<SlideComponentProps> = ({
  slide,
  showFeedback,
  validationResults,
  checkAnswer,
}) => {
  const [connections, setConnections] = useState<Record<string, string>>({});
  const content = slide.content.content;
  const slideId = `matching-${slide.id}`;
  const showSlideFeeback = showFeedback[slideId];
  const validation = validationResults[slideId];

  const handleConnection = (leftItem: string, rightItem: string) => {
    setConnections(prev => ({
      ...prev,
      [leftItem]: rightItem
    }));
  };

  const handleCheckAnswer = () => {
    const correctAnswer: Record<string, string> = {};
    content.items?.forEach((item: any) => {
      correctAnswer[item.left] = item.right;
    });

    checkAnswer(slideId, connections, correctAnswer, 'matching');
  };

  return (
    <Box sx={{ padding: 4, maxWidth: '900px', margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom fontWeight={600} textAlign="center" sx={{ mb: 3 }}>
        {slide.content.title}
      </Typography>

      <Typography variant="body1" sx={{ textAlign: 'center', mb: 4, color: 'text.secondary', fontSize: '1.1rem' }}>
        {content.instruction}
      </Typography>

      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, bgcolor: 'primary.50', borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom textAlign="center" fontWeight={600}>
              🔤 Characters
            </Typography>
            <Stack spacing={2}>
              {content.items?.map((item: any) => (
                <Button
                  key={`left-${item.id}`}
                  variant={connections[item.left] ? "contained" : "outlined"}
                  onClick={() => {
                    const rightItem = content.items?.find((i: any) => i.pair === item.pair);
                    if (rightItem) {
                      handleConnection(item.left, rightItem.right);
                    }
                  }}
                  sx={{
                    p: 3,
                    fontSize: '2rem',
                    fontWeight: 600,
                    minHeight: '80px',
                    borderRadius: 2,
                    backgroundColor: connections[item.left] ? 'success.main' : 'background.paper',
                    color: connections[item.left] ? 'white' : 'text.primary',
                    '&:hover': {
                      backgroundColor: connections[item.left] ? 'success.dark' : 'primary.light',
                      transform: 'scale(1.02)'
                    }
                  }}
                >
                  <Box>
                    <Typography variant="h4" component="div">
                      {item.left}
                    </Typography>
                    {connections[item.left] && (
                      <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                        → {connections[item.left]}
                      </Typography>
                    )}
                  </Box>
                </Button>
              )) || []}
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, bgcolor: 'secondary.50', borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom textAlign="center" fontWeight={600}>
              🔊 Sounds
            </Typography>
            <Stack spacing={2}>
              {content.items?.map((item: any) => {
                const isConnected = Object.values(connections).includes(item.right);
                return (
                  <Paper
                    key={`right-${item.id}`}
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      backgroundColor: isConnected ? 'success.light' : 'background.paper',
                      border: '2px solid',
                      borderColor: isConnected ? 'success.main' : 'divider',
                      borderRadius: 2,
                      minHeight: '80px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <Typography variant="h5" fontWeight={500}>
                      {item.right}
                    </Typography>
                    {isConnected && (
                      <CheckCircle sx={{ ml: 2, color: 'success.main' }} />
                    )}
                  </Paper>
                );
              }) || []}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ textAlign: 'center' }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleCheckAnswer}
          disabled={Object.keys(connections).length !== (content.items?.length || 0)}
          sx={{
            px: 6,
            py: 2,
            fontSize: '1.1rem',
            borderRadius: 3,
            background: 'linear-gradient(45deg, #45B7D1 30%, #96CEB4 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #3A9BC1 30%, #86C3A4 90%)',
            }
          }}
        >
          Check Connections ({Object.keys(connections).length}/{content.items?.length || 0})
        </Button>
      </Box>

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