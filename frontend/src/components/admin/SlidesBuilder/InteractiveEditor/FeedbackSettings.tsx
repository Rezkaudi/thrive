import React, { memo, useCallback, useRef } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Typography,
  Chip,
  TextField,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { InteractiveContent } from "../../../../types/interactive.types";

interface FeedbackSettingsProps {
  interactiveContent: InteractiveContent;
  onUpdateContent: (updates: Partial<InteractiveContent>) => void;
}

export const FeedbackSettings: React.FC<FeedbackSettingsProps> = memo(
  ({ interactiveContent, onUpdateContent }) => {
    const correctRef = useRef(interactiveContent.feedback?.correct || "");
    const incorrectRef = useRef(interactiveContent.feedback?.incorrect || "");

    const handleCorrectBlur = useCallback(() => {
      if (correctRef.current !== (interactiveContent.feedback?.correct || "")) {
        onUpdateContent({
          feedback: {
            ...interactiveContent.feedback,
            correct: correctRef.current,
          },
        });
      }
    }, [interactiveContent.feedback, onUpdateContent]);

    const handleIncorrectBlur = useCallback(() => {
      if (
        incorrectRef.current !== (interactiveContent.feedback?.incorrect || "")
      ) {
        onUpdateContent({
          feedback: {
            ...interactiveContent.feedback,
            incorrect: incorrectRef.current,
          },
        });
      }
    }, [interactiveContent.feedback, onUpdateContent]);

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
              defaultValue={interactiveContent.feedback?.correct || ""}
              onChange={(e) => {
                correctRef.current = e.target.value;
              }}
              onBlur={handleCorrectBlur}
              placeholder="Excellent! You got it right! 🎉"
            />
            <TextField
              fullWidth
              label="Incorrect Answer Feedback"
              defaultValue={interactiveContent.feedback?.incorrect || ""}
              onChange={(e) => {
                incorrectRef.current = e.target.value;
              }}
              onBlur={handleIncorrectBlur}
              placeholder="Not quite right. Try again! 💪"
            />
          </Stack>
        </AccordionDetails>
      </Accordion>
    );
  }
);

FeedbackSettings.displayName = "FeedbackSettings";
