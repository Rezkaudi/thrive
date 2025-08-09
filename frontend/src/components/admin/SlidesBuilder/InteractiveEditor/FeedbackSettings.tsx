import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Typography,
  Chip,
  TextField,
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { InteractiveContent } from '../../../../types/interactive.types';

interface FeedbackSettingsProps {
  interactiveContent: InteractiveContent;
  onUpdateContent: (updates: Partial<InteractiveContent>) => void;
}

export const FeedbackSettings: React.FC<FeedbackSettingsProps> = ({
  interactiveContent,
  onUpdateContent,
}) => {
  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="subtitle1" fontWeight={600}>
            Feedback Messages
          </Typography>
          <Chip label="Important" size="small" color="primary" />
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          <TextField
            fullWidth
            label="Correct Answer Feedback"
            value={interactiveContent.feedback?.correct || ''}
            onChange={(e) => onUpdateContent({
              feedback: {
                ...interactiveContent.feedback,
                correct: e.target.value
              }
            })}
            placeholder="Excellent! You got it right! 🎉"
          />
          <TextField
            fullWidth
            label="Incorrect Answer Feedback"
            value={interactiveContent.feedback?.incorrect || ''}
            onChange={(e) => onUpdateContent({
              feedback: {
                ...interactiveContent.feedback,
                incorrect: e.target.value
              }
            })}
            placeholder="Not quite right. Try again! 💪"
          />
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};