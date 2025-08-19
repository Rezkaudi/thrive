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

// Enhanced interface to include distractors
interface EnhancedSentenceBuilderItem {
  words: string[];           // Words needed for the correct sentence
  correctOrder: number[];    // Correct order indices
  translation?: string;      // Translation of the sentence
  distractors?: string[];    // Additional incorrect words to choose from
}

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
  availableWords: string[];  // All words including distractors, shuffled
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
  const currentItem = content.items?.[0] as EnhancedSentenceBuilderItem || {
    words: [],
    correctOrder: [],
    translation: "",
    distractors: []
  };

  // Enhanced sentence state to include distractors
  const [sentenceState, setSentenceState] = useState<SentenceState>({
    selectedWords: [],
    isCompleted: false,
    availableWords: [],
    resetTrigger: 0,
  });

  const showSlideFeeback = showFeedback[slideId];
  const validation = validationResults[slideId];

  // Memoized calculations
  const validWords = useMemo(() =>
    getValidWords(currentItem?.words as string[]),
    [currentItem?.words]
  );

  const validDistractors = useMemo(() =>
    getValidWords(currentItem?.distractors as string[]),
    [currentItem?.distractors]
  );

  const correctSentence = useMemo(() =>
    buildCorrectSentence(currentItem?.words as string[], currentItem?.correctOrder || []),
    [currentItem?.words, currentItem?.correctOrder]
  );

  // Combine all available words (correct + distractors)
  const allAvailableWords = useMemo(() => {
    return [...validWords, ...validDistractors];
  }, [validWords, validDistractors]);

  const progressCount = sentenceState.selectedWords.length;
  const totalCorrectWords = validWords.length;
  const totalAvailableWords = allAvailableWords.length;

  // Student needs to select exactly the right number of words
  const isComplete = progressCount === totalCorrectWords && totalCorrectWords > 0;

  // Initialize sentence state with all available words shuffled
  useEffect(() => {
    if (allAvailableWords.length > 0) {
      setSentenceState({
        selectedWords: [],
        isCompleted: false,
        availableWords: shuffleArray(allAvailableWords),
        resetTrigger: 0,
      });
    }
  }, [allAvailableWords]);

  // Simplified validation logic - generic error message
  const getValidationMessage = useCallback((): ValidationResult | null => {
    if (!currentItem || totalCorrectWords === 0) return null;

    const userCount = sentenceState.selectedWords.length;

    // First check if user has selected the right number of words
    if (userCount < totalCorrectWords) {
      return {
        isValid: false,
        type: 'warning',
        message: `Please select exactly ${totalCorrectWords} words to build the sentence. (${userCount}/${totalCorrectWords} selected)`
      };
    }

    // If user has more words than needed
    if (userCount > totalCorrectWords) {
      return {
        isValid: false,
        type: 'error',
        message: `You've selected too many words! Use exactly ${totalCorrectWords} words. Remove ${userCount - totalCorrectWords} word${userCount - totalCorrectWords > 1 ? 's' : ''}.`
      };
    }

    // Check if the selected words are correct and in the right order
    const isCorrectSentence = JSON.stringify(sentenceState.selectedWords) === JSON.stringify(correctSentence);

    if (isCorrectSentence) {
      return {
        isValid: true,
        type: 'success',
        message: '🎉 Perfect! You chose the right words and put them in the correct order!'
      };
    } else {
      // Generic error message - don't specify what's wrong
      return {
        isValid: false,
        type: 'error',
        message: '❌ Not quite right. Try again!'
      };
    }
  }, [currentItem, sentenceState.selectedWords, totalCorrectWords, correctSentence]);

  const displayValidation = getValidationMessage();

  // Auto-reset effect with cleanup - immediate reset on wrong answer
  useEffect(() => {
    if (displayValidation?.type === "error" && showSlideFeeback) {
      const resetTimer = setTimeout(() => {
        handleReset();
      }, 1500); // Immediate reset for wrong answers
      return () => clearTimeout(resetTimer);
    } else if (displayValidation?.type === "success" && showSlideFeeback) {
      setSentenceState(prev => ({ ...prev, isCompleted: true }));
    }
  }, [displayValidation?.type, showSlideFeeback]);

  // Enhanced word selection logic
  const handleWordClick = useCallback((word: string) => {
    if (sentenceState.selectedWords.includes(word)) {
      // Remove word from sentence
      setSentenceState(prev => ({
        ...prev,
        selectedWords: prev.selectedWords.filter((w: string) => w !== word)
      }));
    } else {
      // Add word to sentence only if we haven't reached the limit
      if (sentenceState.selectedWords.length < totalCorrectWords) {
        setSentenceState(prev => ({
          ...prev,
          selectedWords: [...prev.selectedWords, word]
        }));
      }
    }
  }, [sentenceState.selectedWords, totalCorrectWords]);

  const handleRemoveWordFromSentence = useCallback((index: number) => {
    setSentenceState(prev => ({
      ...prev,
      selectedWords: prev.selectedWords.filter((_, i) => i !== index)
    }));
  }, []);

  const handleCheckAnswer = useCallback(() => {
    if (!currentItem || !isComplete) return;

    // Enhanced logging for debugging
    console.group('🔍 Enhanced Sentence Builder Check Answer');
    console.log('User answer:', sentenceState.selectedWords);
    console.log('Correct answer:', correctSentence);
    console.log('Available words:', allAvailableWords);
    console.log('Distractors used:', sentenceState.selectedWords.filter(word => validDistractors.includes(word)));
    console.log('Words match:', JSON.stringify(sentenceState.selectedWords) === JSON.stringify(correctSentence));
    console.groupEnd();

    checkAnswer(slideId, sentenceState.selectedWords, correctSentence, "sentence-builder");
  }, [currentItem, isComplete, correctSentence, slideId, checkAnswer, sentenceState.selectedWords, allAvailableWords, validDistractors]);

  const handleReset = useCallback(() => {
    setSentenceState(prev => ({
      selectedWords: [],
      availableWords: shuffleArray(allAvailableWords),
      resetTrigger: prev.resetTrigger + 1,
      isCompleted: false,
    }));
  }, [allAvailableWords]);

  // Enhanced word status checker
  const getWordStatus = useCallback((word: string) => {
    const isSelected = sentenceState.selectedWords.includes(word);
    const isCorrectWord = validWords.includes(word);
    const isDistractor = validDistractors.includes(word);
    const canSelect = !isSelected && sentenceState.selectedWords.length < totalCorrectWords;

    return {
      isSelected,
      isCorrectWord,
      isDistractor,
      canSelect,
      canInteract: isSelected || canSelect
    };
  }, [sentenceState.selectedWords, validWords, validDistractors, totalCorrectWords]);

  // Early return with better error handling
  if (!currentItem || totalCorrectWords === 0) {
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
        variant="h3"
        sx={{
          textAlign: "center",
          mb: { xs: 3, md: 4 },
          px: { xs: 1, md: 0 },
        }}
      >
        {content.instruction}
      </Typography>

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
            Choose {totalCorrectWords} words to build your sentence ⬇️
          </Typography>
        ) : (
          <>
            {sentenceState.selectedWords.map((word, index) => {
              const wordStatus = getWordStatus(word);
              return (
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
              );
            })}
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
                Current: "{sentenceState.selectedWords.join(' ')}"
              </Typography>
            </Box>
          </>
        )}
      </Paper>

      {/* Enhanced Available Words */}
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
          📝 Available Words
          {validDistractors.length > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Some words are distractors - choose carefully!
            </Typography>
          )}
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: { xs: 1, md: 2 },
            justifyContent: "center",
          }}
        >
          {sentenceState.availableWords.map((word: string, index: number) => {
            const wordStatus = getWordStatus(word);

            return (
              <Button
                key={`word-${sentenceState.resetTrigger}-${index}-${word}`}
                variant={wordStatus.isSelected ? "outlined" : "contained"}
                onClick={() => handleWordClick(word)}
                disabled={!wordStatus.canInteract}
                sx={{
                  fontSize: { xs: "0.9rem", md: "1.1rem" },
                  fontWeight: 600,
                  p: { xs: 1, md: 2 },
                  minWidth: { xs: "70px", md: "90px" },
                  position: "relative",
                  backgroundColor: wordStatus.isSelected
                    ? "transparent"
                    : wordStatus.canSelect
                      ? "secondary.main"
                      : "grey.300",
                  color: wordStatus.isSelected
                    ? "secondary.main"
                    : wordStatus.canSelect
                      ? "white"
                      : "text.disabled",
                  borderColor: wordStatus.isSelected ? "secondary.main" : "transparent",
                  "&:hover": {
                    backgroundColor: wordStatus.canInteract
                      ? wordStatus.isSelected
                        ? "secondary.light"
                        : "secondary.dark"
                      : "grey.300",
                    transform: wordStatus.canInteract ? "scale(1.05)" : "none",
                  },
                  "&:disabled": {
                    backgroundColor: "grey.300",
                    color: "text.disabled",
                  },
                  // Add subtle visual hint for distractors (but don't make it obvious)
                  // opacity: wordStatus.isDistractor && !wordStatus.isSelected ? 0.85 : 1,
                }}
              >
                {word}
                {/* Indicator when selected */}
                {wordStatus.isSelected && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: { xs: -6, md: -8 },
                      right: { xs: -6, md: -8 },
                      backgroundColor: "secondary.main",
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
                    ✓
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
          Select exactly {totalCorrectWords} words to build the sentence
          {validDistractors.length > 0 && " • Not all words should be used"}
        </Typography>
      </Paper>


      {/* Enhanced Progress Display */}
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Typography
          variant={isMobile ? "subtitle1" : "h6"}
          color="secondary.main"
          fontWeight={600}
          sx={{ mb: 1 }}
        >
          Progress: {progressCount}/{totalCorrectWords} words selected
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Choose from {totalAvailableWords} available words
          {validDistractors.length > 0 && ` (${validDistractors.length} are distractors)`}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={totalCorrectWords > 0 ? (progressCount / totalCorrectWords) * 100 : 0}
          color="secondary"
          sx={{
            height: { xs: 8, md: 10 },
            borderRadius: 5,
            maxWidth: { xs: 280, md: 400 },
            mx: "auto"
          }}
        />
      </Box>

      {/* Enhanced Action Buttons */}
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
          Check Sentence ({progressCount}/{totalCorrectWords})
        </Button>
      </Stack>

      {/* Enhanced Feedback Alert */}
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
                Activity will reset automatically in 1.5 seconds...
              </Typography>
            )}
          </Alert>
        </Fade>
      )}
    </Box>
  );
};