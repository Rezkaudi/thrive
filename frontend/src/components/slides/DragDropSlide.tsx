import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Paper,
  Alert,
  Grid,
  Fade,
} from "@mui/material";
import { CheckCircle, Error, Warning } from "@mui/icons-material";
import { SlideComponentProps } from "../../types/slide.types";

export const DragDropSlide: React.FC<SlideComponentProps> = ({
  slide,
  interactiveAnswers,
  setInteractiveAnswers,
  showFeedback,
  validationResults,
  checkAnswer,
}) => {
  const [draggedItem, setDraggedItem] = useState<any>(null);
  const content = slide.content.content;
  const slideId = `drag-drop-${slide.id}`;
  const userAnswer = interactiveAnswers[slideId] || {};
  const showSlideFeeback = showFeedback[slideId];
  const validation = validationResults[slideId];

  // Auto-reset effect when validation shows error
  useEffect(() => {
    if (validation?.type === "error" && showSlideFeeback) {
      const resetTimer = setTimeout(() => {
        // Clear the user's answers to reset the activity
        setInteractiveAnswers((prev) => ({ ...prev, [slideId]: {} }));
        setDraggedItem(null);
      }, 2000); // Reset after 2 seconds

      return () => clearTimeout(resetTimer);
    }
  }, [validation, showSlideFeeback, slideId, setInteractiveAnswers]);

  const handleDragStart = (e: React.DragEvent, item: any) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, target: string) => {
    e.preventDefault();
    if (draggedItem) {
      const newAnswer = { ...userAnswer, [draggedItem.text]: target };
      setInteractiveAnswers((prev) => ({ ...prev, [slideId]: newAnswer }));
      setDraggedItem(null);
    }
  };

  const handleCheckAnswer = () => {
    const correctAnswer =
      content.items?.reduce((acc: any, item: any) => {
        acc[item.text] = item.target;
        return acc;
      }, {}) || {};

    checkAnswer(slideId, userAnswer, correctAnswer, "drag-drop");
  };

  const handleReset = () => {
    setInteractiveAnswers((prev) => ({ ...prev, [slideId]: {} }));
    setDraggedItem(null);
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
        variant="body1"
        sx={{
          textAlign: "center",
          mb: 4,
          color: "text.secondary",
          fontSize: "1.1rem",
        }}
      >
        {content.instruction}
      </Typography>

      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, bgcolor: "primary.50", borderRadius: 3 }}>
            <Typography
              variant="h6"
              gutterBottom
              textAlign="center"
              fontWeight={600}
            >
              🇯🇵 Japanese Words
            </Typography>
            <Stack spacing={2}>
              {content.items?.map((item: any) => (
                <Paper
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item)}
                  sx={{
                    p: 2.5,
                    cursor: userAnswer[item.text] ? "default" : "grab",
                    textAlign: "center",
                    backgroundColor: userAnswer[item.text]
                      ? "success.light"
                      : "background.paper",
                    opacity: userAnswer[item.text] ? 0.8 : 1,
                    transition: "all 0.3s ease",
                    border: "2px solid transparent",
                    borderColor: userAnswer[item.text]
                      ? "success.main"
                      : "transparent",
                    "&:hover": {
                      transform: userAnswer[item.text]
                        ? "none"
                        : "translateY(-2px)",
                      boxShadow: userAnswer[item.text] ? 1 : 3,
                    },
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight={500}
                    sx={{ fontSize: "1.4rem" }}
                  >
                    {item.text}
                  </Typography>
                  {userAnswer[item.text] && (
                    <Typography
                      variant="body2"
                      color="success.dark"
                      sx={{ mt: 1, fontWeight: 500 }}
                    >
                      ✓ Matched with: {userAnswer[item.text]}
                    </Typography>
                  )}
                </Paper>
              )) || []}
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, bgcolor: "secondary.50", borderRadius: 3 }}>
            <Typography
              variant="h6"
              gutterBottom
              textAlign="center"
              fontWeight={600}
            >
              🇬🇧 English Translations
            </Typography>
            <Stack spacing={2}>
              {content.items?.map((item: any) => {
                const isMatched = Object.values(userAnswer).includes(
                  item.target
                );
                return (
                  <Paper
                    key={`target-${item.id}`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, item.target)}
                    sx={{
                      p: 2.5,
                      textAlign: "center",
                      border: "2px dashed",
                      borderColor: isMatched ? "success.main" : "divider",
                      backgroundColor: isMatched ? "success.light" : "grey.50",
                      minHeight: "70px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        borderColor: isMatched
                          ? "success.dark"
                          : "primary.main",
                        backgroundColor: isMatched
                          ? "success.light"
                          : "primary.50",
                      },
                    }}
                  >
                    <Typography
                      variant="h6"
                      fontWeight={500}
                      sx={{ fontSize: "1.2rem" }}
                    >
                      {item.target}
                    </Typography>
                    {isMatched && (
                      <CheckCircle sx={{ ml: 1, color: "success.main" }} />
                    )}
                  </Paper>
                );
              }) || []}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Stack direction="row" spacing={2} justifyContent="center">
        <Button
          variant="outlined"
          size="large"
          onClick={handleReset}
          sx={{
            px: 4,
            py: 2,
            fontSize: "1rem",
            borderRadius: 3,
          }}
        >
          🔄 Reset
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={handleCheckAnswer}
          sx={{
            px: 6,
            py: 2,
            fontSize: "1.1rem",
            borderRadius: 3,
            background: "linear-gradient(45deg, #5C633A 30%, #D4BC8C 90%)",
            "&:hover": {
              background: "linear-gradient(45deg, #283618 30%, #D4BC8C 90%)",
            },
          }}
        >
          Check Answers ({Object.keys(userAnswer).length}/
          {content.items?.length || 0})
        </Button>
      </Stack>

      {showSlideFeeback && validation && (
        <Fade in>
          <Alert
            severity={validation.type}
            sx={{ mt: 3, borderRadius: 2, fontSize: "1rem" }}
            icon={
              validation.type === "success" ? (
                <CheckCircle />
              ) : validation.type === "error" ? (
                <Error />
              ) : (
                <Warning />
              )
            }
          >
            {validation.message}
            {validation.type === "error" && (
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                Activity will reset automatically in 2 seconds...
              </Typography>
            )}
          </Alert>
        </Fade>
      )}
    </Box>
  );
};