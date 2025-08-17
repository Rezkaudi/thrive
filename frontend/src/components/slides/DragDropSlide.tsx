import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Paper,
  Alert,
  Grid,
  Fade,
  LinearProgress,
  Chip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  CheckCircle,
  Error,
  Warning,
  Refresh,
  DragIndicator,
  CheckCircleOutline,
} from "@mui/icons-material";
import { SlideComponentProps } from "../../types/slide.types";

// Enhanced utility function to shuffle array with better randomization
const shuffleArray = <T,>(array: T[]): T[] => {
  if (!array || array.length === 0) return [];

  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Type definitions for better type safety
interface DragDropItem {
  id: string | number;
  text: string;
  target: string;
}

interface DragDropContent {
  instruction?: string;
  items?: DragDropItem[];
}

interface UserAnswers {
  [itemText: string]: string;
}

interface CorrectAnswers {
  [itemText: string]: string;
}

export const DragDropSlide: React.FC<SlideComponentProps> = ({
  slide,
  interactiveAnswers,
  setInteractiveAnswers,
  showFeedback,
  validationResults,
  checkAnswer,
}) => {
  const [draggedItem, setDraggedItem] = useState<DragDropItem | null>(null);
  const [isDragOver, setIsDragOver] = useState<string | null>(null);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [autoResetTimer, setAutoResetTimer] = useState<NodeJS.Timeout | null>(
    null
  );
  const [isValidating, setIsValidating] = useState(false);
  const [localValidation, setLocalValidation] = useState<any>(null);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Mobile detection
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const content = slide.content.content as DragDropContent;
  const slideId = `drag-drop-${slide.id}`;
  const userAnswer = (interactiveAnswers[slideId] as UserAnswers) || {};
  const showSlideFeeback = showFeedback[slideId];
  const validation = validationResults[slideId];

  // Validate content structure
  const items = useMemo(() => {
    if (!content.items || !Array.isArray(content.items)) {
      console.warn("Invalid or missing items in drag-drop content");
      return [];
    }

    // Validate each item has required properties
    return content.items.filter(
      (item) =>
        item &&
        typeof item === "object" &&
        "id" in item &&
        "text" in item &&
        "target" in item &&
        item.text &&
        item.target
    );
  }, [content.items]);

  // Create a stable correct answers mapping
  const correctAnswers = useMemo<CorrectAnswers>(() => {
    const answers: CorrectAnswers = {};
    items.forEach((item) => {
      // Normalize strings by trimming whitespace and converting to lowercase for comparison
      const normalizedText = item.text.trim();
      const normalizedTarget = item.target.trim();
      answers[normalizedText] = normalizedTarget;
    });
    console.log("Correct answers mapping:", answers);
    return answers;
  }, [items]);

  // Memoized shuffled items that re-shuffle when resetTrigger changes
  const shuffledItems = useMemo(() => {
    return shuffleArray(items);
  }, [items, resetTrigger]);

  // Shuffled targets for the right side
  const shuffledTargets = useMemo(() => {
    const targets = items.map((item) => ({
      id: item.id,
      target: item.target,
    }));
    return shuffleArray(targets);
  }, [items, resetTrigger]);

  // Clear auto-reset timer on unmount or when validation changes
  useEffect(() => {
    return () => {
      if (autoResetTimer) {
        clearTimeout(autoResetTimer);
      }
    };
  }, [autoResetTimer]);

  // Sync local validation with props and handle state updates
  useEffect(() => {
    // Only use parent validation if we don't have local validation or if it's a success
    if (validation && !localValidation) {
      console.log("=== PARENT VALIDATION STATE UPDATE ===");
      console.log("Parent validation:", validation);
      console.log("Local validation:", localValidation);
      console.log("Using parent validation since no local validation exists");

      setLocalValidation(validation);
      setForceUpdate((prev) => prev + 1);
    } else if (validation && localValidation) {
      console.log("=== VALIDATION CONFLICT ===");
      console.log("Parent validation:", validation);
      console.log("Local validation:", localValidation);
      console.log("Keeping local validation (it takes priority)");
    }
  }, [validation, showSlideFeeback]);

  // Auto-reset effect when validation shows error - RESET IMMEDIATELY on wrong answer
  useEffect(() => {
    // Clear any existing timer
    if (autoResetTimer) {
      clearTimeout(autoResetTimer);
      setAutoResetTimer(null);
    }

    if (localValidation?.type === "error" && showSlideFeeback) {
      console.log("=== AUTO-RESET TRIGGERED ===");
      console.log("Error validation detected, setting reset timer");

      // Reset immediately when there's an error
      const timer = setTimeout(() => {
        console.log("Executing auto-reset...");
        handleReset();
        setIsValidating(false);
        setLocalValidation(null);
      }, 2000); // Quick reset for wrong answers

      setAutoResetTimer(timer);
    } else if (localValidation?.type === "success") {
      console.log("Success validation - stopping validation state");
      setIsValidating(false);

      // Reset with celebration animation after success
      const successTimer = setTimeout(() => {
        console.log(
          "Success celebration complete - resetting for next attempt"
        );
        handleReset();
      }, 3000); // Longer delay for success to let user see the success message

      setAutoResetTimer(successTimer);
    }
  }, [localValidation, showSlideFeeback]);

  const handleDragStart = useCallback(
    (e: React.DragEvent, item: DragDropItem) => {
      // Don't allow dragging if item is already matched or during validation
      if (userAnswer[item.text] || isValidating) {
        e.preventDefault();
        return;
      }

      setDraggedItem(item);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", JSON.stringify(item));

      // Add visual feedback with proper typing
      const target = e.currentTarget as HTMLElement;
      target.style.opacity = "0.5";
    },
    [userAnswer, isValidating]
  );

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    setDraggedItem(null);
    setIsDragOver(null);

    // Reset visual feedback with proper typing
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = "1";
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDragEnter = useCallback(
    (e: React.DragEvent, target: string) => {
      e.preventDefault();
      // Only show drag over effect if target isn't already matched and not validating
      if (!Object.values(userAnswer).includes(target) && !isValidating) {
        setIsDragOver(target);
      }
    },
    [userAnswer, isValidating]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only clear drag over if we're actually leaving the drop zone
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragOver(null);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, target: string) => {
      e.preventDefault();
      setIsDragOver(null);

      // Don't allow drops during validation
      if (isValidating) {
        setDraggedItem(null);
        return;
      }

      try {
        const draggedData = e.dataTransfer.getData("text/plain");
        const item = JSON.parse(draggedData) as DragDropItem;

        if (!item || !item.text) {
          console.error("Invalid dragged item data");
          return;
        }

        // Don't allow drop if target is already occupied
        if (Object.values(userAnswer).includes(target)) {
          return;
        }

        // Create new answer state
        const updatedAnswer = { ...userAnswer };

        // Remove any previous mapping for this dragged item
        delete updatedAnswer[item.text];

        // Add new mapping - ensure we use the exact text as it appears
        updatedAnswer[item.text] = target;

        console.log("=== DROP ACTION ===");
        console.log("Dropping item:", item.text);
        console.log("Onto target:", target);
        console.log("Updated answer state:", updatedAnswer);
        console.log("Correct answer for this item:", correctAnswers[item.text]);
        console.log(
          "Is this match correct?",
          correctAnswers[item.text] === target
        );
        console.log("==================");

        setInteractiveAnswers((prev) => ({
          ...prev,
          [slideId]: updatedAnswer,
        }));
      } catch (error) {
        console.error("Error handling drop:", error);
      }

      setDraggedItem(null);
    },
    [userAnswer, slideId, setInteractiveAnswers, correctAnswers, isValidating]
  );

  const handleCheckAnswer = useCallback(() => {
    if (items.length === 0) {
      console.error("No items available for validation");
      return;
    }

    setIsValidating(true);
    setLocalValidation(null); // Clear previous validation

    // Use the pre-computed correct answers
    const correctAnswerForValidation = { ...correctAnswers };

    console.log("=== COMPREHENSIVE ANSWER VALIDATION ===");
    console.log("Items from content:", items);
    console.log("User answers:", userAnswer);
    console.log("Correct answers:", correctAnswerForValidation);

    // Check if all items are answered
    const userAnswerKeys = Object.keys(userAnswer);
    const expectedKeys = Object.keys(correctAnswerForValidation);

    console.log("User answer keys:", userAnswerKeys);
    console.log("Expected keys:", expectedKeys);
    console.log("User answer count:", userAnswerKeys.length);
    console.log("Expected count:", expectedKeys.length);

    // Detailed validation of each answer
    let correctCount = 0;
    const detailedResults: string[] = [];

    expectedKeys.forEach((key) => {
      const userValue = userAnswer[key];
      const correctValue = correctAnswerForValidation[key];
      const isCorrect = userValue === correctValue;

      if (isCorrect) correctCount++;

      const status = isCorrect ? "✅ CORRECT" : "❌ WRONG";
      const result = `${key} -> "${userValue}" | Expected: "${correctValue}" | ${status}`;
      detailedResults.push(result);
      console.log(result);
    });

    const allCorrect = correctCount === expectedKeys.length;
    console.log(`\nSUMMARY: ${correctCount}/${expectedKeys.length} correct`);
    console.log("All answers correct?", allCorrect);

    // Create our own validation result
    const localValidationResult = {
      type: allCorrect ? ("success" as const) : ("error" as const),
      message: allCorrect
        ? "🎉 Excellent! All matches are correct!"
        : `❌ ${correctCount}/${expectedKeys.length} matches are correct. Try again!`,
      isValid: allCorrect,
    };

    console.log("LOCAL validation result:", localValidationResult);

    // Set our local validation immediately
    setLocalValidation(localValidationResult);
    setIsValidating(false);

    // Also try to update parent state, but don't rely on it
    try {
      checkAnswer(slideId, userAnswer, correctAnswerForValidation, "drag-drop");
      console.log("Parent checkAnswer called");
    } catch (error) {
      console.error("Error calling parent checkAnswer:", error);
    }

    console.log("=====================================");

    // Force a state update to ensure fresh validation
    setForceUpdate((prev) => prev + 1);
  }, [items, userAnswer, slideId, checkAnswer, correctAnswers]);

  const handleReset = useCallback(() => {
    console.log("=== RESETTING DRAG-DROP ===");

    // Clear any existing timer
    if (autoResetTimer) {
      clearTimeout(autoResetTimer);
      setAutoResetTimer(null);
    }

    // Reset all state
    setInteractiveAnswers((prev) => ({ ...prev, [slideId]: {} }));
    setDraggedItem(null);
    setIsDragOver(null);
    setIsValidating(false);
    setLocalValidation(null);
    setResetTrigger((prev) => prev + 1);
    setForceUpdate((prev) => prev + 1);

    console.log("Reset completed - all answers cleared");
    console.log("========================");
  }, [slideId, setInteractiveAnswers, autoResetTimer]);

  // Remove specific item from answers
  const handleRemoveMatch = useCallback(
    (itemText: string) => {
      if (isValidating) return; // Don't allow removal during validation

      const updatedAnswer = { ...userAnswer };
      delete updatedAnswer[itemText];
      setInteractiveAnswers((prev) => ({
        ...prev,
        [slideId]: updatedAnswer,
      }));

      console.log("Removed match for:", itemText);
      console.log("Updated answers:", updatedAnswer);
    },
    [userAnswer, slideId, setInteractiveAnswers, isValidating]
  );

  // Computed values
  const matchedCount = Object.keys(userAnswer).length;
  const totalCount = items.length;
  const isComplete = matchedCount === totalCount && totalCount > 0;
  const progressPercentage =
    totalCount > 0 ? (matchedCount / totalCount) * 100 : 0;

  // Handle empty or invalid content
  if (items.length === 0) {
    return (
      <Box sx={{ padding: { xs: 2, md: 4 }, maxWidth: "900px", margin: "0 auto" }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          <Typography variant="h6">Content Error</Typography>
          <Typography>
            No valid drag-drop items found. Please check the slide
            configuration.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{
      padding: { xs: 2, sm: 3, md: 4 },
      maxWidth: "900px",
      margin: "0 auto"
    }}>
      <Typography
        variant="h3"
        gutterBottom
        fontWeight={600}
        textAlign="center"
        sx={{ mb: { xs: 2, md: 3 } }}
      >
        {slide.content.title}
      </Typography>

      <Typography
        variant="h3"
        sx={{
          textAlign: "center",
          mb: { xs: 3, md: 4 },
          // color: "text.secondary",
          // fontSize: { xs: "1rem", md: "1.1rem" },
          px: { xs: 1, sm: 0 }
        }}
      >
        {content.instruction ||
          "Drag the items from the left to match them with their correct translations on the right."}
      </Typography>

      {/* Progress indicator with visual progress bar */}
      <Box sx={{ mb: { xs: 3, md: 4 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography
            variant={isMobile ? "body1" : "h6"}
            color="primary.main"
            fontWeight={600}
          >
            Progress: {matchedCount}/{totalCount} matched
          </Typography>
          <Chip
            label={`${Math.round(progressPercentage)}%`}
            color={isComplete ? "success" : "primary"}
            variant={isComplete ? "filled" : "outlined"}
            size={isMobile ? "small" : "medium"}
          />
        </Box>
        <LinearProgress
          variant="determinate"
          value={progressPercentage}
          sx={{
            height: { xs: 6, md: 8 },
            borderRadius: 4,
            bgcolor: "grey.200",
            "& .MuiLinearProgress-bar": {
              borderRadius: 4,
              bgcolor: isComplete ? "success.main" : "primary.main",
            },
          }}
        />
      </Box>

      <Grid container spacing={{ xs: 2, md: 4 }} sx={{ mb: { xs: 3, md: 4 } }}>
        {/* Left side - Items to drag */}
        <Grid size={{ xs: 6, md: 6 }}>
          <Paper sx={{
            p: { xs: 2, md: 3 },
            bgcolor: "primary.50",
            borderRadius: { xs: 2, md: 3 },
            height: '100%'
          }}>
            <Typography
              variant={isMobile ? "body1" : "h6"}
              gutterBottom
              textAlign="center"
              fontWeight={600}
              sx={{ mb: { xs: 1.5, md: 2 } }}
            >
              🇯🇵 {isMobile ? "JP" : "Japanese Words"}
            </Typography>
            <Stack spacing={{ xs: 1.5, md: 2 }}>
              {shuffledItems.map((item) => {
                const isMatched = !!userAnswer[item.text];
                const isDragging = draggedItem?.id === item.id;

                return (
                  <Paper
                    key={item.id}
                    draggable={!isMatched && !isValidating}
                    onDragStart={(e) => handleDragStart(e, item)}
                    onDragEnd={handleDragEnd}
                    sx={{
                      p: { xs: 1.5, sm: 2, md: 2.5 },
                      cursor: isMatched || isValidating ? "default" : "grab",
                      textAlign: "center",
                      backgroundColor: isMatched
                        ? "success.light"
                        : isDragging
                          ? "primary.light"
                          : "background.paper",
                      opacity: isDragging
                        ? 0.5
                        : isValidating && !isMatched
                          ? 0.6
                          : 1,
                      transition: "all 0.3s ease",
                      border: "2px solid",
                      borderColor: isMatched
                        ? "success.main"
                        : isDragging
                          ? "primary.main"
                          : "transparent",
                      transform: isDragging
                        ? "rotate(3deg) scale(0.98)"
                        : "none",
                      "&:hover": {
                        transform:
                          isMatched || isValidating
                            ? "none"
                            : isDragging
                              ? "rotate(3deg) scale(0.98)"
                              : isMobile ? "none" : "translateY(-2px)",
                        boxShadow: isMatched ? 1 : 3,
                      },
                      "&:active": {
                        cursor:
                          isMatched || isValidating ? "default" : "grabbing",
                      },
                      position: "relative",
                    }}
                  >
                    {!isMatched && !isValidating && !isMobile && (
                      <DragIndicator
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          color: "text.disabled",
                          fontSize: "1rem",
                        }}
                      />
                    )}
                    <Typography
                      variant={isMobile ? "body1" : "h6"}
                      fontWeight={500}
                      sx={{
                        fontSize: { xs: "1.1rem", sm: "1.2rem", md: "1.4rem" },
                        wordBreak: "break-word"
                      }}
                    >
                      {item.text}
                    </Typography>
                    {isMatched && !isMobile && (
                      <Box
                        sx={{
                          mt: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 1,
                        }}
                      >
                        <Typography
                          variant="body2"
                          color="success.dark"
                          sx={{ fontWeight: 500 }}
                        >
                          ✓ Matched
                        </Typography>
                        {!isValidating && (
                          <Button
                            size="small"
                            onClick={() => handleRemoveMatch(item.text)}
                            sx={{
                              minWidth: "auto",
                              p: 0.5,
                              color: "text.secondary",
                              "&:hover": { color: "error.main" },
                            }}
                          >
                            ✕
                          </Button>
                        )}
                      </Box>
                    )}
                    {isMatched && isMobile && (
                      <CheckCircleOutline
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          color: "success.main",
                          fontSize: "1rem"
                        }}
                      />
                    )}
                  </Paper>
                );
              })}
            </Stack>
          </Paper>
        </Grid>

        {/* Right side - Drop targets */}
        <Grid size={{ xs: 6, md: 6 }}>
          <Paper sx={{
            p: { xs: 2, md: 3 },
            bgcolor: "secondary.50",
            borderRadius: { xs: 2, md: 3 },
            height: '100%'
          }}>
            <Typography
              variant={isMobile ? "body1" : "h6"}
              gutterBottom
              textAlign="center"
              fontWeight={600}
              sx={{ mb: { xs: 1.5, md: 2 } }}
            >
              🇬🇧 {isMobile ? "EN" : "English Translations"}
            </Typography>
            <Stack spacing={{ xs: 1.5, md: 2 }}>
              {shuffledTargets.map((targetItem) => {
                const isMatched = Object.values(userAnswer).includes(
                  targetItem.target
                );
                const isDraggedOver = isDragOver === targetItem.target;
                const matchedItem = isMatched
                  ? Object.keys(userAnswer).find(
                    (key) => userAnswer[key] === targetItem.target
                  )
                  : null;

                return (
                  <Paper
                    key={`target-${targetItem.id}`}
                    onDragOver={!isValidating ? handleDragOver : undefined}
                    onDragEnter={
                      !isValidating
                        ? (e) => handleDragEnter(e, targetItem.target)
                        : undefined
                    }
                    onDragLeave={!isValidating ? handleDragLeave : undefined}
                    onDrop={
                      !isValidating
                        ? (e) => handleDrop(e, targetItem.target)
                        : undefined
                    }
                    sx={{
                      p: { xs: 1.5, sm: 2, md: 2.5 },
                      textAlign: "center",
                      border: "2px dashed",
                      borderColor: isMatched
                        ? "success.main"
                        : isDraggedOver && !isValidating
                          ? "primary.main"
                          : "divider",
                      backgroundColor: isMatched
                        ? "success.light"
                        : isDraggedOver && !isValidating
                          ? "primary.light"
                          : "grey.50",
                      minHeight: { xs: "60px", md: "70px" },
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.3s ease",
                      transform:
                        isDraggedOver && !isValidating ? "scale(1.03)" : "none",
                      opacity: isValidating ? 0.8 : 1,
                      "&:hover": {
                        borderColor: isMatched
                          ? "success.dark"
                          : !isValidating
                            ? "primary.main"
                            : "divider",
                        backgroundColor: isMatched
                          ? "success.light"
                          : !isValidating && !isMobile
                            ? "primary.50"
                            : "grey.50",
                      },
                      position: "relative",
                    }}
                  >
                    <Typography
                      variant={isMobile ? "body2" : "h6"}
                      fontWeight={500}
                      sx={{
                        fontSize: { xs: "0.95rem", sm: "1rem", md: "1.2rem" },
                        wordBreak: "break-word"
                      }}
                    >
                      {targetItem.target}
                    </Typography>
                    {isMatched && matchedItem && !isMobile && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mt: 0.5,
                        }}
                      >
                        <CheckCircleOutline
                          sx={{ color: "success.main", fontSize: "1rem" }}
                        />
                        <Typography
                          variant="caption"
                          color="success.dark"
                          fontWeight={500}
                        >
                          {matchedItem}
                        </Typography>
                      </Box>
                    )}
                    {isMatched && isMobile && (
                      <Typography
                        variant="caption"
                        sx={{
                          position: 'absolute',
                          bottom: 2,
                          fontSize: '0.7rem',
                          color: 'success.dark',
                          fontWeight: 600
                        }}
                      >
                        ✓
                      </Typography>
                    )}
                  </Paper>
                );
              })}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Action buttons */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        justifyContent="center"
      >
        <Button
          variant="outlined"
          size={isMobile ? "medium" : "large"}
          onClick={handleReset}
          disabled={isValidating}
          startIcon={<Refresh />}
          sx={{
            px: { xs: 3, md: 4 },
            py: { xs: 1, md: 2 },
            fontSize: { xs: "0.9rem", md: "1rem" },
            borderRadius: 3,
          }}
        >
          {localValidation?.type === "success"
            ? isMobile ? "Reset" : "Reset & Practice Again"
            : isMobile ? "Reset" : "Reset & Shuffle"}
        </Button>
        <Button
          variant="contained"
          size={isMobile ? "medium" : "large"}
          onClick={handleCheckAnswer}
          disabled={!isComplete || isValidating}
          startIcon={isComplete ? <CheckCircle /> : <CheckCircleOutline />}
          sx={{
            px: { xs: 4, md: 6 },
            py: { xs: 1, md: 2 },
            fontSize: { xs: "1rem", md: "1.1rem" },
            borderRadius: 3,
            background:
              isComplete && !isValidating
                ? "linear-gradient(45deg, #5C633A 30%, #D4BC8C 90%)"
                : "grey.400",
            "&:hover": {
              background:
                isComplete && !isValidating
                  ? "linear-gradient(45deg, #283618 30%, #D4BC8C 90%)"
                  : "grey.400",
            },
            "&:disabled": {
              color: "white",
            },
          }}
        >
          {isValidating
            ? "Checking..."
            : isComplete
              ? isMobile ? "Check" : "Check Answers"
              : `Complete (${matchedCount}/${totalCount})`}
        </Button>
      </Stack>

      {/* Feedback display - Prioritize local validation */}
      {showSlideFeeback && localValidation && (
        <Fade in key={`${forceUpdate}-${localValidation.type}`}>
          <Alert
            severity={localValidation.type}
            sx={{
              mt: { xs: 2, md: 3 },
              borderRadius: 2,
              fontSize: { xs: "0.9rem", md: "1rem" }
            }}
            icon={
              localValidation.type === "success" ? (
                <CheckCircle />
              ) : localValidation.type === "error" ? (
                <Error />
              ) : (
                <Warning />
              )
            }
          >
            <Typography variant="body1" fontWeight={500}>
              {localValidation.message}
            </Typography>
            {localValidation.type === "error" && (
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                Activity will reset automatically in 2 seconds to try again...
              </Typography>
            )}
            {localValidation.type === "success" && (
              <Typography
                variant="body2"
                sx={{ mt: 1, opacity: 0.8, color: "success.dark" }}
              >
                🎯 Perfect match! Resetting in 3 seconds for next practice...
              </Typography>
            )}
          </Alert>
        </Fade>
      )}
    </Box>
  );
};