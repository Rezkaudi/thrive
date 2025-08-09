import React from 'react';
import {
  Stack,
  Alert,
  Paper,
  Avatar,
  Typography,
  Chip,
  Button,
  Card,
  CardContent,
  Grid,
  Box,
} from '@mui/material';
import { Preview, PlayArrow, CheckCircleOutline } from '@mui/icons-material';
import { interactiveTypes } from '../../../../utils/interactiveTypes';
import { InteractiveContent } from '../../../../types/interactive.types';

interface InteractivePreviewProps {
  interactiveContent: InteractiveContent;
}

export const InteractivePreview: React.FC<InteractivePreviewProps> = ({
  interactiveContent,
}) => {
  const currentTypeConfig = interactiveTypes.find(t => t.value === interactiveContent.type);

  return (
    <Stack spacing={3}>
      <Alert severity="info" sx={{ mb: 3 }}>
        Preview functionality shows how this interactive slide appears to students.
        This would render the actual interactive component in preview mode.
      </Alert>
      
      <Paper sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
        <Stack spacing={2} alignItems="center">
          <Avatar
            sx={{
              bgcolor: currentTypeConfig?.color,
              width: 64,
              height: 64
            }}
          >
            {currentTypeConfig?.icon}
          </Avatar>
          
          <Typography variant="h6" gutterBottom>
            Interactive Preview
          </Typography>
          
          <Stack direction="row" spacing={2} alignItems="center">
            <Chip
              label={currentTypeConfig?.label}
              color="primary"
              sx={{ bgcolor: currentTypeConfig?.color + '20', color: currentTypeConfig?.color }}
            />
            <Chip label={`${interactiveContent.items?.length || 0} items`} variant="outlined" />
            <Chip label={currentTypeConfig?.difficulty} size="small" />
          </Stack>
          
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ maxWidth: 400 }}>
            {interactiveContent.instruction || 'No instructions provided yet'}
          </Typography>

          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button
              variant="outlined"
              startIcon={<Preview />}
              disabled={!interactiveContent.items?.length}
            >
              Full Preview
            </Button>
            <Button
              variant="outlined"
              startIcon={<PlayArrow />}
              disabled={!interactiveContent.items?.length}
            >
              Test Activity
            </Button>
          </Stack>
          
          {!interactiveContent.items?.length && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Add some items to enable preview functionality
            </Alert>
          )}
        </Stack>
      </Paper>
      
      {/* Preview Statistics */}
      {interactiveContent.items?.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Activity Statistics
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Box textAlign="center">
                  <Typography variant="h4" color="primary.main">
                    {interactiveContent.items.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Items
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Box textAlign="center">
                  <Typography variant="h4" color="success.main">
                    {Math.max(2, Math.ceil(interactiveContent.items.length * 0.6))}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Est. Duration (min)
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Box textAlign="center">
                  <Typography variant="h4" color="info.main">
                    {currentTypeConfig?.difficulty}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Difficulty
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Box textAlign="center">
                  <CheckCircleOutline sx={{ fontSize: 32, color: 'success.main' }} />
                  <Typography variant="body2" color="text.secondary">
                    Ready to Use
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
};