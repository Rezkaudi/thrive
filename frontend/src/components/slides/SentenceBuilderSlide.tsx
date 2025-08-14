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
  useTheme,
  useMediaQuery,
  LinearProgress,
} from "@mui/material";
import { SlideComponentProps } from "../../types/slide.types";

// Utility function to shuffle array - Fisher-Yates algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Utility function to filter valid words
const getValidWords = (words: string[]): string[] => 
  words?.filter((word: string) => word && word.trim() !== "") || [];

// Utility function to build correct sentence from order indices
const buildCorrectSentence = (words: string[], correctOrder: number[]): string[] => {
  if (!words || !correctOrder) return [];
  const validWords = getValidWords(words);
  return correctOrder
    .map((index: number) => validWords[index])
    .filter((word: string) => word && word.trim() !== "");
};

interface SentenceState {
  selectedWords: string[];
  isCompleted: boolean;
  shuffledWords: string[];
  resetTrigger: number;
}

interface ValidationResult {
  isValid: boolean;
  type: 'success' | 'error' | 'warning';
  message: string;
}

export const SentenceBuilderSlide: React.FC<SlideComponentProps> = ({
  slide,
  showFeedback,
  validationResults,
  checkAnswer,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const content = slide.content.content;
  const slideId = `sentence-builder-${slide.id}`;
  
  // Get the first item or create a default one
  const currentItem = content.items?.[0] || {
    words: [],
    correctOrder: [],
    translation: ""
  };

  // Single sentence state
  const [sentenceState, setSentenceState] = useState<SentenceState>({
    selectedWords: [],
    isCompleted: false,
    shuffledWords: [],
    resetTrigger: 0,
  });

  const showSlideFeeback = showFeedback[slideId];
  const validation = validationResults[slideId];

  // Memoized calculations
  const validWords = useMemo(() => 
    getValidWords(currentItem?.words as string[]), 
    [currentItem?.words]
  );
  
  const correctSentence = useMemo(() => 
    buildCorrectSentence(currentItem?.words as string[], currentItem?.correctOrder || []), 
    [currentItem?.words, currentItem?.correctOrder]
  );

  const progressCount = sentenceState.selectedWords.length;
  const totalWords = validWords.length;
  const isComplete = progressCount === totalWords && totalWords > 0;

  // Initialize sentence state
  useEffect(() => {
    if (validWords.length > 0) {
      setSentenceState({
        selectedWords: [],
        isCompleted: false,
        shuffledWords: shuffleArray(validWords),
        resetTrigger: 0,
      });
    }
  }, [validWords]);

  // Validation logic
  const getValidationMessage = useCallback((): ValidationResult | null => {
    if (!currentItem || totalWords === 0) return null;
    
    const userCount = sentenceState.selectedWords.length;
    
    // First check if user has selected all words
    if (userCount < totalWords) {
      return {
        isValid: false,
        type: 'warning',
        message: `Please use all ${totalWords} words to build the sentence.`
      };
    }
    
    // If user has more words than expected (shouldn't happen, but defensive programming)
    if (userCount > totalWords) {
      return {
        isValid: false,
        type: 'error',
        message: `You've selected too many words. Please use exactly ${totalWords} words.`
      };
    }
    
    // Check if the order is correct
    const isCorrectOrder = JSON.stringify(sentenceState.selectedWords) === JSON.stringify(correctSentence);
    
    if (isCorrectOrder) {
      return {
        isValid: true,
        type: 'success',
        message: '🎉 Excellent! You built the sentence correctly!'
      };
    } else {
      return {
        isValid: false,
        type: 'error',
        message: '❌ Not quite right. You have all the words, but the order is incorrect. Try again!'
      };
    }
  }, [currentItem, sentenceState.selectedWords, totalWords, correctSentence]);

  const displayValidation = getValidationMessage();

  // Auto-reset effect with cleanup
  useEffect(() => {
    if (displayValidation?.type === "error" && showSlideFeeback) {
      const resetTimer = setTimeout(() => {
        handleReset();
      }, 2000);
      return () => clearTimeout(resetTimer);
    } else if (displayValidation?.type === "success" && showSlideFeeback) {
      setSentenceState(prev => ({ ...prev, isCompleted: true }));
    }
  }, [displayValidation?.type, showSlideFeeback]);

  // Word selection logic
  const handleWordClick = useCallback((word: string) => {
    const wordCount = getWordCount(word);
    
    if (sentenceState.selectedWords.includes(word)) {
      // Remove word from sentence
      setSentenceState(prev => ({
        ...prev,
        selectedWords: prev.selectedWords.filter((w: string) => w !== word)
      }));
    } else if (wordCount.remaining > 0) {
      // Add word to sentence only if available
      setSentenceState(prev => ({
        ...prev,
        selectedWords: [...prev.selectedWords, word]
      }));
    }
  }, [sentenceState.selectedWords]);

  const handleRemoveWordFromSentence = useCallback((index: number) => {
    setSentenceState(prev => ({
      ...prev,
      selectedWords: prev.selectedWords.filter((_, i) => i !== index)
    }));
  }, []);

  const handleCheckAnswer = useCallback(() => {
    if (!currentItem || !isComplete) return;
    
    // Detailed logging for debugging
    console.group('🔍 Sentence Builder Check Answer');
    console.log('User answer:', sentenceState.selectedWords);
    console.log('Correct answer:', correctSentence);
    console.log('Words match:', JSON.stringify(sentenceState.selectedWords) === JSON.stringify(correctSentence));
    console.groupEnd();
    
    checkAnswer(slideId, sentenceState.selectedWords, correctSentence, "sentence-builder");
  }, [currentItem, isComplete, correctSentence, slideId, checkAnswer, sentenceState.selectedWords]);

  const handleReset = useCallback(() => {
    setSentenceState(prev => ({
      selectedWords: [],
      shuffledWords: shuffleArray(validWords),
      resetTrigger: prev.resetTrigger + 1,
      isCompleted: false,
    }));
  }, [validWords]);

  // Word count calculator
  const getWordCount = useCallback((word: string) => {
    const totalCount = validWords.filter((w: string) => w === word).length;
    const usedCount = sentenceState.selectedWords.filter((w: string) => w === word).length;
    return { 
      used: usedCount, 
      total: totalCount, 
      remaining: Math.max(0, totalCount - usedCount)
    };
  }, [validWords, sentenceState.selectedWords]);

  // Early return with better error handling
  if (!currentItem || totalWords === 0) {
    return (
      <Box sx={{ textAlign: "center", p: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No sentence data available. Please add words to build a sentence.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      padding: { xs: 2, sm: 3, md: 4 }, 
      maxWidth: "900px", 
      margin: "0 auto",
      minHeight: { xs: 'auto', md: '100vh' },
    }}>
      {/* Title */}
      <Typography
        variant={isMobile ? "h5" : "h4"}
        gutterBottom
        fontWeight={600}
        textAlign="center"
        sx={{ mb: { xs: 2, md: 3 } }}
      >
        {slide.content.title}
      </Typography>

      {/* Instructions */}
      <Typography
        variant="body1"
        sx={{
          textAlign: "center",
          mb: { xs: 3, md: 4 },
          color: "text.secondary",
          fontSize: { xs: "1rem", md: "1.1rem" },
          px: { xs: 1, md: 0 },
        }}
      >
        {content.instruction}
      </Typography>

      {/* Current sentence progress */}
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Typography 
          variant={isMobile ? "subtitle1" : "h6"} 
          color="secondary.main" 
          fontWeight={600}
          sx={{ mb: 1 }}
        >
          Progress: {progressCount}/{totalWords} words placed
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={totalWords > 0 ? (progressCount / totalWords) * 100 : 0} 
          color="secondary"
          sx={{ 
            height: { xs: 8, md: 10 }, 
            borderRadius: 5, 
            maxWidth: { xs: 280, md: 400 }, 
            mx: "auto" 
          }}
        />
      </Box>

      {/* Sentence Building Area */}
      <Paper
        sx={{
          minHeight: { xs: "120px", md: "140px" },
          p: { xs: 2, md: 3 },
          pb: { xs: '60px' },
          mb: { xs: 3, md: 4 },
          backgroundColor: "grey.50",
          border: "3px dashed",
          borderColor: sentenceState.selectedWords.length > 0 ? "primary.main" : "grey.300",
          borderRadius: 3,
          display: "flex",
          flexWrap: "wrap",
          gap: { xs: 1, md: 2 },
          alignItems: "center",
          justifyContent: sentenceState.selectedWords.length > 0 ? "flex-start" : "center",
          transition: "all 0.3s ease",
          position: "relative",
        }}
      >
        {sentenceState.selectedWords.length === 0 ? (
          <Typography
            variant={isMobile ? "body1" : "h6"}
            color="text.secondary"
            sx={{ fontStyle: "italic", textAlign: "center" }}
          >
            Click words below to build your sentence ⬇️
          </Typography>
        ) : (
          <>
            {sentenceState.selectedWords.map((word, index) => (
              <Chip
                key={`selected-${index}-${word}`}
                label={`${index + 1}. ${word}`}
                onClick={() => handleRemoveWordFromSentence(index)}
                sx={{
                  fontSize: { xs: "0.9rem", md: "1.2rem" },
                  fontWeight: 600,
                  p: { xs: 1, md: 2 },
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
            {/* Current sentence preview */}
            <Box sx={{ 
              position: "absolute", 
              bottom: 8, 
              left: { xs: 8, md: 16 }, 
              right: { xs: 8, md: 16 },
              textAlign: "center" 
            }}>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                sx={{ 
                  fontStyle: "italic",
                  fontSize: { xs: "0.75rem", md: "0.875rem" }
                }}
              >
                Current sentence: "{sentenceState.selectedWords.join(' ')}"
              </Typography>
            </Box>
          </>
        )}
      </Paper>

      {/* Available Words */}
      <Paper sx={{ 
        p: { xs: 2, md: 3 }, 
        mb: { xs: 3, md: 4 }, 
        borderRadius: 3, 
        bgcolor: "background.paper" 
      }}>
        <Typography
          variant={isMobile ? "subtitle1" : "h6"}
          gutterBottom
          textAlign="center"
          fontWeight={600}
          sx={{ mb: { xs: 2, md: 3 } }}
        >
          📝 Available Words (shuffled)
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: { xs: 1, md: 2 },
            justifyContent: "center",
          }}
        >
          {sentenceState.shuffledWords.map((word: string, index: number) => {
            const wordCount = getWordCount(word);
            const isAvailable = wordCount.remaining > 0;
            
            return (
              <Button
                key={`word-${sentenceState.resetTrigger}-${index}-${word}`}
                variant={isAvailable ? "contained" : "outlined"}
                onClick={() => handleWordClick(word)}
                disabled={!isAvailable}
                sx={{
                  fontSize: { xs: "0.9rem", md: "1.1rem" },
                  fontWeight: 600,
                  p: { xs: 1, md: 2 },
                  minWidth: { xs: "70px", md: "90px" },
                  position: "relative",
                  backgroundColor: isAvailable ? "secondary.main" : "grey.200",
                  color: isAvailable ? "white" : "text.disabled",
                  "&:hover": {
                    backgroundColor: isAvailable ? "secondary.dark" : "grey.200",
                    transform: isAvailable ? "scale(1.05)" : "none",
                  },
                  "&:disabled": {
                    backgroundColor: "grey.200",
                    color: "text.disabled",
                  },
                }}
              >
                {word}
                {wordCount.total > 1 && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: { xs: -6, md: -8 },
                      right: { xs: -6, md: -8 },
                      backgroundColor: isAvailable ? "success.main" : "grey.400",
                      color: "white",
                      borderRadius: "50%",
                      width: { xs: 18, md: 22 },
                      height: { xs: 18, md: 22 },
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: { xs: "0.7rem", md: "0.8rem" },
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
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mt: 2, 
            textAlign: "center",
            fontSize: { xs: "0.75rem", md: "0.875rem" }
          }}
        >
          Numbers show remaining uses for repeated words
        </Typography>
      </Paper>

      {/* Translation */}
      {currentItem.translation && (
        <Paper
          sx={{
            p: { xs: 2, md: 3 },
            mb: { xs: 3, md: 4 },
            bgcolor: "info.50",
            border: "1px solid",
            borderColor: "info.200",
            borderRadius: 3,
            textAlign: "center",
          }}
        >
          <Typography
            variant={isMobile ? "subtitle1" : "h6"}
            sx={{ mb: 1, fontWeight: 600, color: "info.dark" }}
          >
            💭 Translation
          </Typography>
          <Typography 
            variant="body1" 
            sx={{ fontSize: { xs: "1rem", md: "1.1rem" } }}
          >
            {currentItem.translation}
          </Typography>
        </Paper>
      )}

      {/* Action Buttons */}
      <Stack 
        direction={{ xs: "column", sm: "row" }} 
        spacing={2} 
        justifyContent="center"
        sx={{ mb: 3 }}
      >
        <Button
          variant="outlined"
          size="large"
          onClick={handleReset}
          sx={{
            px: { xs: 3, md: 4 },
            py: { xs: 1.5, md: 2 },
            fontSize: { xs: "1rem", md: "1.1rem" },
            borderRadius: 3,
            minWidth: { xs: "100%", sm: "auto" },
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
            px: { xs: 4, md: 6 },
            py: { xs: 1.5, md: 2 },
            fontSize: { xs: "1.1rem", md: "1.2rem" },
            borderRadius: 3,
            minWidth: { xs: "100%", sm: "auto" },
            background: isComplete
              ? "linear-gradient(45deg, #FF6348 30%, #D4BC8C 90%)"
              : "grey.400",
            "&:hover": {
              background: isComplete
                ? "linear-gradient(45deg, #E55538 30%, #FF7E7E 90%)"
                : "grey.400",
            },
            "&:disabled": {
              background: "grey.400",
              color: "grey.600",
            },
          }}
        >
          Check Sentence ({progressCount}/{totalWords})
        </Button>
      </Stack>

      {/* Feedback Alert */}
      {showSlideFeeback && displayValidation && (
        <Fade in>
          <Alert
            severity={displayValidation.type}
            sx={{ 
              mt: 3, 
              borderRadius: 2, 
              fontSize: { xs: "1rem", md: "1.1rem" },
              fontWeight: 500,
            }}
          >
            {displayValidation.message}
            {displayValidation.type === "error" && (
              <Typography 
                variant="body2" 
                sx={{ 
                  mt: 1, 
                  opacity: 0.8,
                  fontSize: { xs: "0.85rem", md: "0.9rem" }
                }}
              >
                Activity will reset and shuffle automatically in 2 seconds...
              </Typography>
            )}
          </Alert>
        </Fade>
      )}
    </Box>
  );
};