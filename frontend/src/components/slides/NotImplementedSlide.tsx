import React from 'react';
import { Box, Typography, Alert, Paper, Stack } from '@mui/material';
import { Construction, Info } from '@mui/icons-material';

interface NotImplementedSlideProps {
  interactiveType: string;
  instruction?: string;
  title?: string;
}

export const NotImplementedSlide: React.FC<NotImplementedSlideProps> = ({
  interactiveType,
  instruction,
  title
}) => {
  return (
    <Box sx={{ 
      textAlign: 'center', 
      p: 4, 
      maxWidth: '800px', 
      margin: '0 auto',
      minHeight: '400px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }}>
      <Paper sx={{ 
        p: 6, 
        borderRadius: 4, 
        bgcolor: 'grey.50',
        border: '2px dashed',
        borderColor: 'grey.300'
      }}>
        <Stack spacing={3} alignItems="center">
          {/* Icon */}
          <Construction 
            sx={{ 
              fontSize: 72, 
              color: 'warning.main',
              opacity: 0.8
            }} 
          />

          {/* Title */}
          <Typography variant="h4" gutterBottom sx={{ color: 'text.primary', fontWeight: 600 }}>
            {title || `Interactive Activity: ${interactiveType}`}
          </Typography>

          {/* Instruction */}
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ 
              fontSize: '1.1rem', 
              lineHeight: 1.6,
              maxWidth: '600px' 
            }}
          >
            {instruction || 'Complete the interactive activity.'}
          </Typography>

          {/* Not Implemented Alert */}
          <Alert 
            severity="info" 
            icon={<Info />}
            sx={{ 
              mt: 3,
              borderRadius: 3,
              fontSize: '1rem',
              maxWidth: '500px',
              '& .MuiAlert-message': {
                fontSize: '1rem'
              }
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              🚧 Coming Soon!
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              This interactive type <strong>"{interactiveType}"</strong> is currently under development and will be available in a future update.
            </Typography>
          </Alert>

          {/* Additional Info */}
          <Paper sx={{ 
            p: 3, 
            bgcolor: 'info.50', 
            borderRadius: 3,
            maxWidth: '500px',
            border: '1px solid',
            borderColor: 'info.200'
          }}>
            <Typography variant="body2" color="info.dark" sx={{ fontWeight: 500, mb: 1 }}>
              💡 Development Status
            </Typography>
            <Typography variant="body2" color="info.dark">
              We're continuously adding new interactive slide types. Check back soon for updates, or contact support if you need this feature prioritized.
            </Typography>
          </Paper>
        </Stack>
      </Paper>
    </Box>
  );
};