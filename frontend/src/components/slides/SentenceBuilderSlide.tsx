import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Paper,
  Alert,
  Chip,
  Fade,
} from "@mui/material";
import { SlideComponentProps } from "../../types/slide.types";

export const SentenceBuilderSlide: React.FC<SlideComponentProps> = ({
  slide,
  showFeedback,
  validationResults,
  checkAnswer,
}) => {
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const content = slide.content.content;
  const slideId = `sentence-builder-${slide.id}`;
  const showSlideFeeback = showFeedback[slideId];
  const validation = validationResults[slideId];
  const item = content.items?.[0];

  // Auto-reset effect when validation shows error
  useEffect(() => {
    if (validation?.type === "error" && showSlideFeeback) {
      const resetTimer = setTimeout(() => {
        // Clear the selected words to reset the activity
        setSelectedWords([]);
      }, 2000); // Reset after 2 seconds

      return () => clearTimeout(resetTimer);
    }
  }, [validation, showSlideFeeback]);

  const handleWordClick = (word: string) => {
    if (selectedWords.includes(word)) {
      setSelectedWords((prev) => prev.filter((w) => w !== word));
    } else {
      setSelectedWords((prev) => [...prev, word]);
    }
  };

  const handleCheckAnswer = () => {
    if (!item) return;
    const correctSentence =
      item.correctOrder?.map((index: number) => item.words[index]) || [];
    checkAnswer(slideId, selectedWords, correctSentence, "sentence-builder");
  };

  const resetSentence = () => {
    setSelectedWords([]);
  };

  if (!item) {
    return (
      <Box sx={{ textAlign: "center", p: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No sentence data available
        </Typography>
      </Box>
    );
  }

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

      {/* Sentence Building Area */}
      <Paper
        sx={{
          minHeight: "120px",
          p: 3,
          mb: 4,
          backgroundColor: "grey.50",
          border: "3px dashed",
          borderColor: selectedWords.length > 0 ? "primary.main" : "grey.300",
          borderRadius: 3,
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.3s ease",
        }}
      >
        {selectedWords.length === 0 ? (
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ fontStyle: "italic" }}
          >
            Click words below to build your sentence ⬇️
          </Typography>
        ) : (
          selectedWords.map((word, index) => (
            <Chip
              key={`selected-${index}`}
              label={word}
              onClick={() =>
                setSelectedWords((prev) => prev.filter((_, i) => i !== index))
              }
              sx={{
                fontSize: "1.2rem",
                fontWeight: 600,
                p: 2,
                height: "auto",
                backgroundColor: "primary.main",
                color: "white",
                "&:hover": {
                  backgroundColor: "primary.dark",
                  transform: "scale(1.05)",
                },
              }}
              clickable
            />
          ))
        )}
      </Paper>

      {/* Available Words */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3, bgcolor: "background.paper" }}>
        <Typography
          variant="h6"
          gutterBottom
          textAlign="center"
          fontWeight={600}
          sx={{ mb: 3 }}
        >
          📝 Available Words
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            justifyContent: "center",
          }}
        >
          {item.words?.map((word: string, index: number) => (
            <Button
              key={`word-${index}`}
              variant={selectedWords.includes(word) ? "outlined" : "contained"}
              onClick={() => handleWordClick(word)}
              disabled={selectedWords.includes(word)}
              sx={{
                fontSize: "1.1rem",
                fontWeight: 600,
                p: 2,
                minWidth: "80px",
                backgroundColor: selectedWords.includes(word)
                  ? "grey.200"
                  : "secondary.main",
                color: selectedWords.includes(word) ? "text.disabled" : "white",
                "&:hover": {
                  backgroundColor: selectedWords.includes(word)
                    ? "grey.200"
                    : "secondary.dark",
                  transform: selectedWords.includes(word)
                    ? "none"
                    : "scale(1.05)",
                },
              }}
            >
              {word}
            </Button>
          )) || []}
        </Box>
      </Paper>

      {/* Translation */}
      <Paper
        sx={{
          p: 3,
          mb: 4,
          bgcolor: "info.50",
          border: "1px solid",
          borderColor: "info.200",
          borderRadius: 3,
          textAlign: "center",
        }}
      >
        <Typography
          variant="h6"
          sx={{ mb: 1, fontWeight: 600, color: "info.dark" }}
        >
          💭 Translation
        </Typography>
        <Typography variant="body1" sx={{ fontSize: "1.1rem" }}>
          {item.translation}
        </Typography>
      </Paper>

      <Stack direction="row" spacing={2} justifyContent="center">
        <Button
          variant="outlined"
          size="large"
          onClick={resetSentence}
          sx={{
            px: 4,
            py: 1.5,
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
          disabled={selectedWords.length !== (item.words?.length || 0)}
          sx={{
            px: 6,
            py: 1.5,
            fontSize: "1.1rem",
            borderRadius: 3,
            background: "linear-gradient(45deg, #FF6348 30%, #D4BC8C 90%)",
            "&:hover": {
              background: "linear-gradient(45deg, #E55538 30%, #FF7E7E 90%)",
            },
          }}
        >
          Check Sentence ({selectedWords.length}/{item.words?.length || 0})
        </Button>
      </Stack>

      {showSlideFeeback && validation && (
        <Fade in>
          <Alert
            severity={validation.type}
            sx={{ mt: 3, borderRadius: 2, fontSize: "1rem" }}
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