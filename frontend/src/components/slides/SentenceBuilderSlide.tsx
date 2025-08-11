import React, { useState, useEffect, useCallback, useMemo } from "react";
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

// Utility function to shuffle array
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const SentenceBuilderSlide: React.FC<SlideComponentProps> = ({
  slide,
  showFeedback,
  validationResults,
  checkAnswer,
}) => {
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [resetTrigger, setResetTrigger] = useState(0);
  
  const content = slide.content.content;
  const slideId = `sentence-builder-${slide.id}`;
  const showSlideFeeback = showFeedback[slideId];
  const validation = validationResults[slideId];
  const item = content.items?.[0];

  // Memoized shuffled words that re-shuffle when resetTrigger changes
  const shuffledWords = useMemo(() => {
    return item?.words ? shuffleArray(item.words as string[]) : [];
  }, [item?.words, resetTrigger]);

  // Auto-reset effect when validation shows error
  useEffect(() => {
    if (validation?.type === "error" && showSlideFeeback) {
      const resetTimer = setTimeout(() => {
        handleReset();
      }, 2000);

      return () => clearTimeout(resetTimer);
    }
  }, [validation, showSlideFeeback]);

  const handleWordClick = useCallback((word: string) => {
    if (selectedWords.includes(word)) {
      // Remove word from selected list
      setSelectedWords((prev) => prev.filter((w: string) => w !== word));
    } else {
      // Add word to selected list
      setSelectedWords((prev) => [...prev, word]);
    }
  }, [selectedWords]);

  const handleRemoveWordFromSentence = useCallback((index: number) => {
    setSelectedWords((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleCheckAnswer = useCallback(() => {
    if (!item) return;
    
    // Get the correct sentence based on the correctOrder indices
    const correctSentence =
      item.correctOrder?.map((index: number) => (item.words as string[])[index]) || [];
    
    // Debug logging to help identify the issue
    console.log('User answer:', selectedWords);
    console.log('Correct answer:', correctSentence);
    console.log('Words array:', item.words);
    console.log('Correct order indices:', item.correctOrder);
    
    // The selectedWords should match the correctSentence exactly in order
    // selectedWords represents the sentence the user built in order
    checkAnswer(slideId, selectedWords, correctSentence, "sentence-builder");
  }, [item, selectedWords, slideId, checkAnswer]);

  const handleReset = useCallback(() => {
    setSelectedWords([]);
    setResetTrigger(prev => prev + 1); // Trigger re-shuffle
  }, []);

  // Calculate progress
  const isComplete = selectedWords.length === ((item?.words as string[])?.length || 0);
  const progressCount = selectedWords.length;
  const totalWords = (item?.words as string[])?.length || 0;

  // Get remaining words count for each word
  const getWordCount = useCallback((word: string) => {
    const totalCount = (item?.words as string[])?.filter((w: string) => w === word).length || 0;
    const usedCount = selectedWords.filter((w: string) => w === word).length;
    return { used: usedCount, total: totalCount, remaining: totalCount - usedCount };
  }, [item?.words, selectedWords]);

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

      {/* Progress indicator */}
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Typography variant="h6" color="primary.main" fontWeight={600}>
          Progress: {progressCount}/{totalWords} words placed
        </Typography>
      </Box>

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
          justifyContent: selectedWords.length > 0 ? "flex-start" : "center",
          transition: "all 0.3s ease",
          position: "relative",
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
          <>
            {selectedWords.map((word, index) => (
              <Chip
                key={`selected-${index}`}
                label={`${index + 1}. ${word}`}
                onClick={() => handleRemoveWordFromSentence(index)}
                sx={{
                  fontSize: "1.2rem",
                  fontWeight: 600,
                  p: 2,
                  height: "auto",
                  backgroundColor: "primary.main",
                  color: "white",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: "primary.dark",
                    transform: "scale(1.05)",
                  },
                }}
                clickable
              />
            ))}
            {/* Current sentence display */}
            <Box sx={{ 
              position: "absolute", 
              bottom: 8, 
              left: 16, 
              right: 16,
              textAlign: "center" 
            }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                Current sentence: "{selectedWords.join(' ')}"
              </Typography>
            </Box>
          </>
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
          📝 Available Words (shuffled)
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            justifyContent: "center",
          }}
        >
          {shuffledWords.map((word: string, index: number) => {
            const wordCount = getWordCount(word);
            const isAvailable = wordCount.remaining > 0;
            
            return (
              <Button
                key={`word-${index}-${word}`}
                variant={isAvailable ? "contained" : "outlined"}
                onClick={() => handleWordClick(word)}
                disabled={!isAvailable}
                sx={{
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  p: 2,
                  minWidth: "80px",
                  position: "relative",
                  backgroundColor: isAvailable
                    ? "secondary.main"
                    : "grey.200",
                  color: isAvailable ? "white" : "text.disabled",
                  "&:hover": {
                    backgroundColor: isAvailable
                      ? "secondary.dark"
                      : "grey.200",
                    transform: isAvailable ? "scale(1.05)" : "none",
                  },
                }}
              >
                {word}
                {wordCount.total > 1 && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: -8,
                      right: -8,
                      backgroundColor: isAvailable ? "success.main" : "grey.400",
                      color: "white",
                      borderRadius: "50%",
                      width: 20,
                      height: 20,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                    }}
                  >
                    {wordCount.remaining}
                  </Box>
                )}
              </Button>
            );
          })}
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: "center" }}>
          Numbers show remaining uses for repeated words
        </Typography>
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
          onClick={handleReset}
          sx={{
            px: 4,
            py: 1.5,
            fontSize: "1rem",
            borderRadius: 3,
          }}
        >
          🔄 Reset & Shuffle
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={handleCheckAnswer}
          disabled={!isComplete}
          sx={{
            px: 6,
            py: 1.5,
            fontSize: "1.1rem",
            borderRadius: 3,
            background: isComplete
              ? "linear-gradient(45deg, #FF6348 30%, #D4BC8C 90%)"
              : "grey.400",
            "&:hover": {
              background: isComplete
                ? "linear-gradient(45deg, #E55538 30%, #FF7E7E 90%)"
                : "grey.400",
            },
          }}
        >
          Check Sentence ({progressCount}/{totalWords})
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
                Activity will reset and shuffle automatically in 2 seconds...
              </Typography>
            )}
          </Alert>
        </Fade>
      )}
    </Box>
  );
};