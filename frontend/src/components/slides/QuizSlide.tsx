// Updated QuizSlide.tsx to properly handle quiz validation with improved feedback and wrong answer styling

import React from "react";
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

  // Helper function to check if an option is wrong for single choice
  const isOptionWrong = (optionIndex: number) => {
    if (!hasWrongAnswer || !showQuizFeedback) return false;
    
    if (content.type === "single-choice") {
      return userAnswer === optionIndex && optionIndex !== content.correctAnswer;
    }
    
    if (content.type === "multiple-choice") {
      const correctAnswers = content.correctAnswers || [];
      const userAnswers = userAnswer || [];
      
      // Only highlight as wrong if:
      // User selected it but it's NOT a correct answer
      const userSelected = userAnswers.includes(optionIndex);
      const isCorrectAnswer = correctAnswers.includes(optionIndex);
      
      return userSelected && !isCorrectAnswer;
    }
    
    return false;
  };

  // Helper function to check if an option is correct (for highlighting correct answers)
  const isOptionCorrect = (optionIndex: number) => {
    // Don't show correct answer hints for any quiz type - let users figure it out
    return false;
  };

  const handleSingleChoiceAnswer = (answerIndex: string) => {
    setInteractiveAnswers((prev) => ({
      ...prev,
      [quizId]: parseInt(answerIndex),
    }));
  };

  const handleMultipleChoiceAnswer = (
    answerIndex: number,
    isChecked: boolean
  ) => {
    setInteractiveAnswers((prev) => {
      const currentAnswers = prev[quizId] || [];
      let newAnswers;

      if (isChecked) {
        newAnswers = [...currentAnswers, answerIndex];
      } else {
        newAnswers = currentAnswers.filter(
          (index: number) => index !== answerIndex
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
              "& .MuiAlert-message": {
                fontSize: "1rem",
              },
            }}
            icon={validation.type === "success" ? <CheckCircle /> : <Error />}
          >
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {validation.message}
            </Typography>
            {content.explanation && validation.type === "success" && (
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                💡 {content.explanation}
              </Typography>
            )}
          </Alert>
        </Fade>
      )}

      {/* Single Choice - Radio Buttons */}
      {content.type === "single-choice" && (
        <RadioGroup
          value={userAnswer?.toString() || ""}
          onChange={(e) => handleSingleChoiceAnswer(e.target.value)}
        >
          {content.options?.map((option: string, index: number) => {
            const isSelected = userAnswer === index;
            const isWrong = isOptionWrong(index);
            const isCorrect = isOptionCorrect(index);
            
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
                key={index}
                value={index.toString()}
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
          {content.options?.map((option: string, index: number) => {
            const isChecked = (userAnswer || []).includes(index);
            const isWrong = isOptionWrong(index);
            const isCorrect = isOptionCorrect(index);

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
                key={index}
                control={
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) =>
                      handleMultipleChoiceAnswer(index, e.target.checked)
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