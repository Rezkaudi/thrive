import React from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Paper,
  Alert,
  TextField,
  Fade,
} from "@mui/material";
import { CheckCircle, Error, Warning } from "@mui/icons-material";
import { SlideComponentProps } from "../../types/slide.types";

export const FillBlanksSlide: React.FC<SlideComponentProps> = ({
  slide,
  interactiveAnswers,
  setInteractiveAnswers,
  showFeedback,
  validationResults,
  checkAnswer,
}) => {
  const content = slide.content.content;
  const slideId = `fill-blanks-${slide.id}`;
  const userAnswer = interactiveAnswers[slideId] || {};
  const showSlideFeeback = showFeedback[slideId];
  const validation = validationResults[slideId];

  const handleInputChange = (
    itemId: number,
    blankIndex: number,
    value: string
  ) => {
    const newAnswer = {
      ...userAnswer,
      [`${itemId}-${blankIndex}`]: value,
    };
    setInteractiveAnswers((prev) => ({ ...prev, [slideId]: newAnswer }));
  };

  const handleCheckAnswer = () => {
    const correctAnswer: Record<string, string> = {};
    content.items?.forEach((item: any) => {
      item.blanks?.forEach((blank: string, index: number) => {
        correctAnswer[`${item.id}-${index}`] = blank;
      });
    });

    checkAnswer(slideId, userAnswer, correctAnswer, "fill-blanks");
  };

  const renderSentenceWithBlanks = (item: any) => {
    const parts = item.sentence?.split("___") || [];
    const result = [];

    for (let i = 0; i < parts.length; i++) {
      result.push(
        <span key={`text-${i}`} style={{ fontSize: "1.5rem", fontWeight: 500 }}>
          {parts[i]}
        </span>
      );

      if (i < parts.length - 1) {
        result.push(
          <TextField
            key={`blank-${i}`}
            size="medium"
            value={userAnswer[`${item.id}-${i}`] || ""}
            onChange={(e) => handleInputChange(item.id, i, e.target.value)}
            sx={{
              mx: 1,
              width: "140px",
              "& .MuiOutlinedInput-root": {
                height: "50px",
                fontSize: "1.2rem",
                textAlign: "center",
                backgroundColor: "background.paper",
                "&:hover": {
                  backgroundColor: "primary.50",
                },
                "&.Mui-focused": {
                  backgroundColor: "primary.50",
                },
              },
            }}
            placeholder="?"
          />
        );
      }
    }

    return <div style={{ lineHeight: 2.5 }}>{result}</div>;
  };

  return (
    <Box sx={{ padding: 4, maxWidth: "900px", margin: "0 auto" }}>
      <Typography
        variant="h4"
        gutterBottom
        fontWeight={600}
        textAlign="center"
        sx={{ mb: 3 }}
      >
        {slide.content.title}
      </Typography>

      <Typography
        variant="h3"
        sx={{
          textAlign: "center",
          mb: 4,
          // color: "text.secondary",
          // fontSize: "1.1rem",
        }}
      >
        {content.instruction}
      </Typography>

      {showSlideFeeback && validation && (
        <Fade in>
          <Alert
            severity={validation.type}
            sx={{
              mt: 3,
              borderRadius: 2,
              fontSize: "1rem",
              "& .MuiAlert-icon": {
                fontSize: "1.5rem",
              },
            }}
          >
            {validation.message}
          </Alert>
        </Fade>
      )}

      <Stack spacing={4} sx={{ mb: 4 }}>
        {content.items?.map((item: any, index: number) => (
          <Paper
            key={item.id}
            sx={{
              p: 4,
              textAlign: "center",
              borderRadius: 3,
              background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
              border: "2px solid transparent",
              "&:hover": {
                border: "2px solid",
                borderColor: "primary.light",
              },
            }}
          >
            <Typography
              variant="h6"
              sx={{ mb: 3, color: "text.secondary", fontWeight: 500 }}
            >
              Sentence {index + 1}
            </Typography>
            <Box sx={{ mb: 3 }}>{renderSentenceWithBlanks(item)}</Box>
            {item.translation && (
              <Typography
                variant="body1"
                sx={{
                  color: "text.secondary",
                  fontStyle: "italic",
                  fontSize: "1rem",
                  mt: 2,
                  p: 2,
                  backgroundColor: "primary.50",
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "primary.200",
                }}
              >
                💭 Translation: {item.translation}
              </Typography>
            )}
          </Paper>
        )) || []}
      </Stack>

      <Box sx={{ textAlign: "center" }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleCheckAnswer}
          sx={{
            px: 6,
            py: 2,
            fontSize: "1.1rem",
            borderRadius: 3,
            background: "linear-gradient(45deg, #A6531C 30%, #7ED4D0 90%)",
            "&:hover": {
              background: "linear-gradient(45deg, #3BA59E 30%, #6DD6CE 90%)",
            },
          }}
        >
          Check My Answers
        </Button>
      </Box>

    </Box>
  );
};
