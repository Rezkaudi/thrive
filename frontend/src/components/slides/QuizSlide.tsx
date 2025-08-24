import React, { useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  Fade,
  Paper,
} from "@mui/material";
import { CheckCircle, Error, Quiz as QuizIcon } from "@mui/icons-material";
import { SlideComponentProps } from "../../types/slide.types";

export const QuizSlide: React.FC<SlideComponentProps> = ({
  slide,
  interactiveAnswers,
  setInteractiveAnswers,
  showFeedback,
  validationResults,
  checkAnswer,
}) => {
  const content = slide.content.content;
  const quizId = `quiz-${slide.id}`;
  const userAnswer = interactiveAnswers[quizId];
  const showQuizFeedback = showFeedback[quizId];
  const validation = validationResults[quizId];

  // Check if quiz is already completed correctly
  const isQuizCompleted = validation?.type === "success";
  const hasWrongAnswer = validation?.type === "error";

  // Create randomized options mapping - memoized to prevent re-shuffling on re-renders
  const randomizedMapping = useMemo(() => {
    if (!content.options) return { shuffledOptions: [], indexMap: [] };

    // Create array of indices and shuffle them
    const indices = content.options.map((_: string, index: number) => index);
    
    // Fisher-Yates shuffle algorithm
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    // Create shuffled options array
    const shuffledOptions = indices.map((originalIndex: number) => content.options![originalIndex]);
    
    return {
      shuffledOptions,
      indexMap: indices, // Maps display position to original index
      reverseMap: indices.reduce((acc: Record<number, number>, originalIndex: number, displayIndex: number) => {
        acc[originalIndex] = displayIndex;
        return acc;
      }, {} as Record<number, number>)
    };
  }, [content.options, slide.id]); // Include slide.id to ensure consistent shuffling per slide

  // Convert original answer indices to display indices
  const getDisplayAnswer = (originalAnswer: number | number[] | undefined) => {
    if (originalAnswer === undefined) return originalAnswer;
    
    if (Array.isArray(originalAnswer)) {
      // For multiple choice, map each original index to display index
      return originalAnswer.map((originalIndex: number) => randomizedMapping.reverseMap[originalIndex]);
    } else {
      // For single choice, map original index to display index
      return randomizedMapping.reverseMap[originalAnswer];
    }
  };

  // Convert display answer indices back to original indices
  const getOriginalAnswer = (displayAnswer: number | number[] | undefined) => {
    if (displayAnswer === undefined) return displayAnswer;
    
    if (Array.isArray(displayAnswer)) {
      // For multiple choice, map each display index to original index
      return displayAnswer.map((displayIndex: number) => randomizedMapping.indexMap[displayIndex]);
    } else {
      // For single choice, map display index to original index
      return randomizedMapping.indexMap[displayAnswer];
    }
  };

  // Get the user's answer in display format
  const displayUserAnswer = getDisplayAnswer(userAnswer);

  // Helper function to check if an option is wrong for single choice
  const isOptionWrong = (displayIndex: number) => {
    if (!hasWrongAnswer || !showQuizFeedback) return false;
    
    const originalIndex = randomizedMapping.indexMap[displayIndex];
    
    if (content.type === "single-choice") {
      return userAnswer === originalIndex && originalIndex !== content.correctAnswer;
    }
    
    if (content.type === "multiple-choice") {
      const correctAnswers = content.correctAnswers || [];
      const userAnswers = userAnswer || [];
      
      // Only highlight as wrong if:
      // User selected it but it's NOT a correct answer
      const userSelected = userAnswers.includes(originalIndex);
      const isCorrectAnswer = correctAnswers.includes(originalIndex);
      
      return userSelected && !isCorrectAnswer;
    }
    
    return false;
  };

  // Helper function to check if an option is correct (for highlighting correct answers)
  const isOptionCorrect = (displayIndex: number) => {
    // Don't show correct answer hints for any quiz type - let users figure it out
    return false;
  };

  const handleSingleChoiceAnswer = (displayAnswerIndex: string) => {
    const displayIndex = parseInt(displayAnswerIndex);
    const originalIndex = randomizedMapping.indexMap[displayIndex];
    
    setInteractiveAnswers((prev) => ({
      ...prev,
      [quizId]: originalIndex,
    }));
  };

  const handleMultipleChoiceAnswer = (
    displayAnswerIndex: number,
    isChecked: boolean
  ) => {
    const originalIndex = randomizedMapping.indexMap[displayAnswerIndex];
    
    setInteractiveAnswers((prev) => {
      const currentAnswers = prev[quizId] || [];
      let newAnswers;

      if (isChecked) {
        newAnswers = [...currentAnswers, originalIndex];
      } else {
        newAnswers = currentAnswers.filter(
          (index: number) => index !== originalIndex
        );
      }

      return {
        ...prev,
        [quizId]: newAnswers,
      };
    });
  };

  const handleCheckQuizAnswer = () => {
    if (content.type === "single-choice") {
      const correctAnswer = content.correctAnswer;
      // IMPORTANT: Pass 'quiz' as the interactiveType
      checkAnswer(quizId, userAnswer, correctAnswer, "quiz");
    } else if (content.type === "multiple-choice") {
      const correctAnswers = content.correctAnswers || [];
      const userAnswers = userAnswer || [];
      const sortedUserAnswers = [...userAnswers].sort();
      const sortedCorrectAnswers = [...correctAnswers].sort();
      // IMPORTANT: Pass 'quiz' as the interactiveType
      checkAnswer(quizId, sortedUserAnswers, sortedCorrectAnswers, "quiz");
    }
  };

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: "auto" }}>
      <Typography variant="h3" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
        {slide.content.title || "Quiz Question"}
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ mb: 4, lineHeight: 1.6 }}>
        {content.question}
      </Typography>

     {/* Detailed Feedback (only show after validation) */}
    {showQuizFeedback && validation && (
      <Fade in>
        <Alert
          severity={validation.type}
          sx={{
            mb: 3,
            borderRadius: 2,
            fontSize: "1rem",
            // Conditional styling based on validation type
            ...(validation.type === "success" ? {
              // Green styling for correct answers
              backgroundColor: "#e8f5e8",    // Light green background
              borderColor: "#4caf50",        // Green border
              color: "#000000",              // Black text for correct answers
              "& .MuiAlert-message": {
                fontSize: "1rem",
                color: "#000000",            // Black text for message
              },
              "& .MuiAlert-icon": {
                color: "#4caf50",            // Green icon
              },
            } : {
              // Red styling for incorrect answers  
              backgroundColor: "#f44336",    // Red background
              borderColor: "#d32f2f",        // Darker red border
              color: "#ffffff",              // White text for incorrect answers
              "& .MuiAlert-message": {
                fontSize: "1rem",
                color: "#ffffff",            // White text for message
              },
              "& .MuiAlert-icon": {
                color: "#ffffff",            // White icon
              },
            }),
          }}
          icon={validation.type === "success" ? <CheckCircle /> : <Error />}
        >
          <Typography 
            variant="body1" 
            sx={{ 
              fontWeight: 500,
              color: "inherit", // Inherit the alert's text color
            }}
          >
            {validation.message}
          </Typography>
          {content.explanation && validation.type === "success" && (
            <Typography 
              variant="body2" 
              sx={{ 
                mt: 1, 
                opacity: 0.9,
                color: "inherit", // Inherit the alert's text color
              }}
            >
              💡 {content.explanation}
            </Typography>
          )}
        </Alert>
      </Fade>
    )}

      {/* Single Choice - Radio Buttons */}
      {content.type === "single-choice" && (
        <RadioGroup
          value={displayUserAnswer?.toString() || ""}
          onChange={(e) => handleSingleChoiceAnswer(e.target.value)}
        >
          {randomizedMapping.shuffledOptions?.map((option: string, displayIndex: number) => {
            const isSelected = displayUserAnswer === displayIndex;
            const isWrong = isOptionWrong(displayIndex);
            const isCorrect = isOptionCorrect(displayIndex);
            
            // Determine border and background colors
            let borderColor = "divider";
            let backgroundColor = "background.paper";
            let textColor = "text.primary";
            
            if (showQuizFeedback && isCorrect) {
              borderColor = "success.main";
              backgroundColor = "success.50";
            } else if (isWrong) {
              borderColor = "error.main";
              backgroundColor = "error.50";
              textColor = "error.main";
            } else if (isSelected) {
              borderColor = "primary.main";
              backgroundColor = "primary.50";
            }

            return (
              <FormControlLabel
                key={displayIndex}
                value={displayIndex.toString()}
                control={<Radio color="primary" />}
                label={
                  <Typography
                    variant="body1"
                    sx={{ 
                      fontSize: "1.1rem", 
                      py: 0.5,
                      color: textColor,
                      fontWeight: isWrong ? 500 : 400
                    }}
                  >
                    {option}
                  </Typography>
                }
                sx={{
                  mb: 2,
                  p: 1,
                  borderRadius: 2,
                  border: "2px solid",
                  borderColor: borderColor,
                  backgroundColor: backgroundColor,
                  "&:hover": {
                    bgcolor: isWrong ? "error.100" : "action.hover",
                    borderColor: isWrong ? "error.main" : "primary.light",
                  },
                  transition: "all 0.2s ease",
                  width: "100%",
                  ml: 0,
                  mr: 0,
                }}
              />
            );
          })}
        </RadioGroup>
      )}

      {/* Multiple Choice - Checkboxes */}
      {content.type === "multiple-choice" && (
        <Box>
          <Typography
            variant="body2"
            color="primary.main"
            sx={{ mb: 2, fontWeight: 500 }}
          >
            💡 Select all correct answers
          </Typography>
          {randomizedMapping.shuffledOptions?.map((option: string, displayIndex: number) => {
            const isChecked = (displayUserAnswer || []).includes(displayIndex);
            const isWrong = isOptionWrong(displayIndex);
            const isCorrect = isOptionCorrect(displayIndex);

            // Determine border and background colors
            let borderColor = "divider";
            let backgroundColor = "background.paper";
            let textColor = "text.primary";
            
            if (showQuizFeedback && isCorrect) {
              borderColor = "success.main";
              backgroundColor = "success.50";
            } else if (isWrong) {
              borderColor = "error.main";
              backgroundColor = "error.50";
              textColor = "error.main";
            } else if (isChecked) {
              borderColor = "primary.main";
              backgroundColor = "primary.50";
            }

            return (
              <FormControlLabel
                key={displayIndex}
                control={
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) =>
                      handleMultipleChoiceAnswer(displayIndex, e.target.checked)
                    }
                    style={{
                      width: 20,
                      height: 20,
                      accentColor: isWrong ? "#d32f2f" : "#1976d2",
                      cursor: "pointer",
                      marginRight: "12px",
                    }}
                  />
                }
                label={
                  <Typography
                    variant="body1"
                    sx={{ 
                      fontSize: "1.1rem", 
                      py: 0.5,
                      color: textColor,
                      fontWeight: isWrong ? 500 : 400
                    }}
                  >
                    {option}
                  </Typography>
                }
                sx={{
                  mb: 2,
                  p: 2,
                  borderRadius: 2,
                  border: "2px solid",
                  borderColor: borderColor,
                  backgroundColor: backgroundColor,
                  "&:hover": {
                    bgcolor: isWrong ? "error.100" : "action.hover",
                    borderColor: isWrong ? "error.main" : "primary.light",
                  },
                  transition: "all 0.2s ease",
                  width: "100%",
                  ml: 0,
                  mr: 0,
                  display: "flex",
                  alignItems: "center",
                }}
              />
            );
          })}
        </Box>
      )}

      {/* Check Answer Button */}
      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleCheckQuizAnswer}
          disabled={
            isQuizCompleted || // Disable if already completed
            (content.type === "single-choice"
              ? typeof userAnswer !== "number"
              : content.type === "multiple-choice" &&
                (!userAnswer || userAnswer.length === 0))
          }
          sx={{
            px: 4,
            py: 1.5,
            width: "100%",
            fontSize: "1.1rem",
            borderRadius: 3,
            background: isQuizCompleted
              ? "linear-gradient(45deg, #4caf50 30%, #8bc34a 90%)"
              : "linear-gradient(45deg, primary.main 30%, primary.light 90%)",
            "&:hover": {
              background: isQuizCompleted
                ? "linear-gradient(45deg, #45a049 30%, #7cb342 90%)"
                : "linear-gradient(45deg, primary.dark 30%, primary.main 90%)",
            },
            "&:disabled": {
              background: "linear-gradient(45deg, #9e9e9e 30%, #bdbdbd 90%)",
            },
          }}
        >
          {isQuizCompleted ? "✓ Completed" : "Check Answer"}
          {content.type === "multiple-choice" &&
            userAnswer &&
            !isQuizCompleted && (
              <Chip
                label={`${userAnswer.length} selected`}
                size="small"
                sx={{ ml: 2, bgcolor: "rgba(255,255,255,0.2)", color: "white" }}
              />
            )}
        </Button>
      </Stack>

      {/* Quiz Type Indicator */}
      <Box
        sx={{
          mt: 3,
          p: 2,
          bgcolor: "info.50",
          borderRadius: 2,
          border: "1px solid",
          borderColor: "info.200",
        }}
      >
        <Typography variant="body2" color="info.dark" sx={{ fontWeight: 500 }}>
          📋 Quiz Type:{" "}
          {content.type === "single-choice"
            ? "Single Choice (select one answer)"
            : "Multiple Choice (select all correct answers)"}
        </Typography>
      </Box>

      {/* Navigation hint for incomplete quiz */}
      {/* {!isQuizCompleted && validation?.type === 'warning' && (
        <Alert
          severity="warning"
          sx={{
            mt: 2,
            borderRadius: 2,
          }}
          icon={<QuizIcon />}
        >
          You must complete this quiz correctly before proceeding to the next slide.
        </Alert>
      )} */}
    </Box>
  );
};