import React, { memo, useCallback } from "react";
import {
  TextField,
  Stack,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Tooltip,
  FormControlLabel,
  Radio,
  RadioGroup,
  Alert,
  Divider,
  Box,
  Chip,
  Switch,
} from "@mui/material";
import {
  Add,
  Delete,
  RadioButtonChecked,
  CheckBox,
  DragIndicator,
  Timer,
  Psychology,
} from "@mui/icons-material";
import { Slide, SlideContent } from "../../../types/slide.types";

interface QuizSlideEditorProps {
  slide: Slide;
  index: number;
  onUpdate: (index: number, updates: Partial<Slide>) => void;
  onUpdateContent: (
    index: number,
    contentUpdates: Partial<SlideContent>
  ) => void;
}

export const QuizSlideEditor: React.FC<QuizSlideEditorProps> = memo(
  ({ slide, index, onUpdateContent }) => {
    const { content } = slide;
    const quizContent = content.content || {};

    const updateQuizContent = useCallback(
      (updates: any) => {
        onUpdateContent(index, {
          content: { ...quizContent, ...updates },
        });
      },
      [index, quizContent, onUpdateContent]
    );

    const addOption = () => {
      const newOptions = [
        ...(quizContent.options || []),
        `Option ${(quizContent.options?.length || 0) + 1}`,
      ];
      updateQuizContent({ options: newOptions });
    };

    const updateOption = (optionIndex: number, value: string) => {
      const newOptions = [...(quizContent.options || [])];
      newOptions[optionIndex] = value;
      updateQuizContent({ options: newOptions });
    };

    const removeOption = (optionIndex: number) => {
      if ((quizContent.options?.length || 0) <= 2) return; // Keep minimum 2 options

      const newOptions =
        quizContent.options?.filter((_: any, i: number) => i !== optionIndex) ||
        [];
      let updates: any = { options: newOptions };

      // Handle single choice - adjust correctAnswer if needed
      if (quizContent.type === "single-choice") {
        if (
          quizContent.correctAnswer >= optionIndex &&
          quizContent.correctAnswer > 0
        ) {
          updates.correctAnswer = quizContent.correctAnswer - 1;
        } else if (quizContent.correctAnswer === optionIndex) {
          updates.correctAnswer = 0; // Reset to first option if deleted option was selected
        }
      }

      // Handle multiple choice - remove from correctAnswers array and adjust indices
      if (quizContent.type === "multiple-choice") {
        const currentCorrect = quizContent.correctAnswers || [];
        const newCorrect = currentCorrect
          .filter((i: number) => i !== optionIndex) // Remove the deleted option
          .map((i: number) => (i > optionIndex ? i - 1 : i)); // Adjust indices
        updates.correctAnswers = newCorrect;
      }

      updateQuizContent(updates);
    };

    const toggleMultipleChoiceAnswer = (optionIndex: number) => {
      const currentCorrect = quizContent.correctAnswers || [];
      const newCorrect = currentCorrect.includes(optionIndex)
        ? currentCorrect.filter((i: number) => i !== optionIndex)
        : [...currentCorrect, optionIndex];

      updateQuizContent({ correctAnswers: newCorrect });
    };

    // Initialize with default values if needed
    React.useEffect(() => {
      if (!quizContent.type) {
        updateQuizContent({
          type: "single-choice",
          options: ["Option 1", "Option 2"],
          correctAnswer: 0,
        });
      }
    }, []);

    return (
      <Stack spacing={3}>
        {/* Basic Quiz Info */}
        <TextField
          fullWidth
          label="Title"
          defaultValue={content.title || ""}
          onBlur={(e) => onUpdateContent(index, { title: e.target.value })}
          error={!content.title?.trim()}
          helperText={!content.title?.trim() ? "Title is required" : ""}
        />

        <TextField
          fullWidth
          multiline
          rows={3}
          label="Question"
          defaultValue={quizContent.question || ""}
          onBlur={(e) => updateQuizContent({ question: e.target.value })}
          error={!quizContent.question?.trim()}
          helperText={
            !quizContent.question?.trim() ? "Question is required" : ""
          }
          placeholder="Enter your quiz question here..."
        />

        {/* Quiz Type Selection - Only Single and Multiple Choice */}
        <FormControl fullWidth>
          <InputLabel>Quiz Type</InputLabel>
          <Select
            value={quizContent.type || "single-choice"}
            label="Quiz Type"
            onChange={(e) => {
              const newType = e.target.value;
              let updates: any = { type: newType };

              // Convert between types
              if (
                newType === "single-choice" &&
                quizContent.type === "multiple-choice"
              ) {
                // Convert multiple choice to single choice - use first correct answer
                const firstCorrect = quizContent.correctAnswers?.[0] || 0;
                updates.correctAnswer = firstCorrect;
                updates.correctAnswers = undefined;
              } else if (
                newType === "multiple-choice" &&
                quizContent.type === "single-choice"
              ) {
                // Convert single choice to multiple choice - use current correct answer
                const currentCorrect = quizContent.correctAnswer || 0;
                updates.correctAnswers = [currentCorrect];
                updates.correctAnswer = undefined;
              }

              updateQuizContent(updates);
            }}
          >
            <MenuItem value="single-choice">
              <Stack direction="row" alignItems="center" spacing={1}>
                <RadioButtonChecked color="primary" />
                <Box>
                  <Typography>Single Choice</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Students select one correct answer
                  </Typography>
                </Box>
              </Stack>
            </MenuItem>
            <MenuItem value="multiple-choice">
              <Stack direction="row" alignItems="center" spacing={1}>
                <CheckBox color="primary" />
                <Box>
                  <Typography>Multiple Choice</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Students can select multiple correct answers
                  </Typography>
                </Box>
              </Stack>
            </MenuItem>
          </Select>
        </FormControl>

        {/* Quiz Options */}
        <Card variant="outlined" sx={{ p: 3 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography variant="h6" fontWeight={600}>
              Answer Options
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={addOption}
              size="small"
              sx={{ borderRadius: 2 }}
              disabled={(quizContent.options?.length || 0) >= 8}
            >
              Add Option
            </Button>
          </Stack>

          <Stack spacing={2}>
            {(quizContent.options || []).map(
              (option: string, optionIndex: number) => (
                <Stack
                  key={optionIndex}
                  direction="row"
                  spacing={2}
                  alignItems="center"
                >
                  <Box
                    sx={{ display: "flex", alignItems: "center", minWidth: 40 }}
                  >
                    {quizContent.type === "single-choice" ? (
                      <FormControlLabel
                        control={
                          <Radio
                            checked={quizContent.correctAnswer === optionIndex}
                            onChange={() =>
                              updateQuizContent({ correctAnswer: optionIndex })
                            }
                            color="success"
                          />
                        }
                        label=""
                        sx={{ mr: 0 }}
                      />
                    ) : (
                      <FormControlLabel
                        control={
                          <input
                            type="checkbox"
                            checked={
                              quizContent.correctAnswers?.includes(
                                optionIndex
                              ) || false
                            }
                            onChange={() =>
                              toggleMultipleChoiceAnswer(optionIndex)
                            }
                            style={{
                              width: 20,
                              height: 20,
                              accentColor: "#4caf50",
                              cursor: "pointer",
                            }}
                          />
                        }
                        label=""
                        sx={{ mr: 0 }}
                      />
                    )}
                  </Box>

                  <TextField
                    fullWidth
                    label={`Option ${String.fromCharCode(65 + optionIndex)}`}
                    defaultValue={option}
                    onBlur={(e) => updateOption(optionIndex, e.target.value)}
                    error={!option.trim()}
                    helperText={
                      quizContent.type === "single-choice"
                        ? quizContent.correctAnswer === optionIndex
                          ? "Correct Answer"
                          : ""
                        : quizContent.correctAnswers?.includes(optionIndex)
                        ? "Correct Answer"
                        : ""
                    }
                    placeholder={`Enter option ${String.fromCharCode(
                      65 + optionIndex
                    )}...`}
                  />

                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Tooltip title="Drag to reorder">
                      <IconButton size="small" color="default">
                        <DragIndicator />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Option">
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => removeOption(optionIndex)}
                        disabled={(quizContent.options?.length || 0) <= 2}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Stack>
              )
            )}
          </Stack>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              {quizContent.type === "single-choice"
                ? "💡 Select the radio button next to the correct answer. Students will see these options in random order."
                : "💡 Check all correct answers. Students can select multiple options."}
            </Typography>
          </Alert>
        </Card>

        {/* Quiz Settings */}
        <Card variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Quiz Settings
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Time Limit (seconds)"
                value={quizContent.timeLimit || ""}
                onWheel={(e) => (e.target as HTMLInputElement).blur()}
                onChange={(e) =>
                  updateQuizContent({
                    timeLimit: parseInt(e.target.value) || 0,
                  })
                }
                inputProps={{ min: 0 }}
                helperText="0 = no time limit"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Points"
                value={quizContent.points || 1}
                onWheel={(e) => (e.target as HTMLInputElement).blur()}
                onChange={(e) =>
                  updateQuizContent({ points: parseInt(e.target.value) || 1 })
                }
                inputProps={{ min: 1 }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={quizContent.randomizeOptions || false}
                    onChange={(e) =>
                      updateQuizContent({ randomizeOptions: e.target.checked })
                    }
                  />
                }
                label="Randomize option order"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={quizContent.allowRetry || true}
                    onChange={(e) =>
                      updateQuizContent({ allowRetry: e.target.checked })
                    }
                  />
                }
                label="Allow retry"
              />
            </Grid>
          </Grid>
        </Card>

        {/* Explanation */}
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Explanation (optional)"
          defaultValue={quizContent.explanation || ""}
          onBlur={(e) => updateQuizContent({ explanation: e.target.value })}
          placeholder="Explain why this is the correct answer..."
          helperText="This explanation will be shown to students after they answer"
        />

        {/* Quiz Preview */}
        <Card sx={{ bgcolor: "grey.50", borderRadius: 2 }}>
          <CardContent>
            <Typography variant="subtitle2" gutterBottom fontWeight={600}>
              📋 Quiz Preview
            </Typography>
            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                flexWrap="wrap"
              >
                <Chip
                  label={
                    quizContent.type === "single-choice"
                      ? "Single Choice"
                      : "Multiple Choice"
                  }
                  color="primary"
                  size="small"
                />
                {quizContent.timeLimit > 0 && (
                  <Chip
                    icon={<Timer />}
                    label={`${quizContent.timeLimit}s`}
                    color="warning"
                    size="small"
                  />
                )}
                <Chip
                  icon={<Psychology />}
                  label={`${quizContent.points || 1} pts`}
                  color="success"
                  size="small"
                />
              </Stack>
            </Box>

            <Typography variant="h6" gutterBottom>
              {quizContent.question || "Your question will appear here..."}
            </Typography>

            {/* Preview Options */}
            {quizContent.type === "single-choice" && (
              <RadioGroup>
                {(quizContent.options || []).map(
                  (option: string, optionIndex: number) => (
                    <FormControlLabel
                      key={optionIndex}
                      value={optionIndex}
                      control={<Radio disabled />}
                      label={option || `Option ${optionIndex + 1}`}
                      sx={{
                        bgcolor:
                          quizContent.correctAnswer === optionIndex
                            ? "success.light"
                            : "transparent",
                        borderRadius: 1,
                        px: 1,
                        border:
                          quizContent.correctAnswer === optionIndex
                            ? "2px solid"
                            : "none",
                        borderColor: "success.main",
                      }}
                    />
                  )
                )}
              </RadioGroup>
            )}

            {quizContent.type === "multiple-choice" && (
              <Stack spacing={1}>
                {(quizContent.options || []).map(
                  (option: string, optionIndex: number) => (
                    <FormControlLabel
                      key={optionIndex}
                      control={
                        <input
                          type="checkbox"
                          disabled
                          checked={
                            quizContent.correctAnswers?.includes(optionIndex) ||
                            false
                          }
                          style={{
                            width: 16,
                            height: 16,
                            accentColor: "#4caf50",
                          }}
                        />
                      }
                      label={option || `Option ${optionIndex + 1}`}
                      sx={{
                        bgcolor: quizContent.correctAnswers?.includes(
                          optionIndex
                        )
                          ? "success.light"
                          : "transparent",
                        borderRadius: 1,
                        px: 1,
                        border: quizContent.correctAnswers?.includes(
                          optionIndex
                        )
                          ? "2px solid"
                          : "none",
                        borderColor: "success.main",
                      }}
                    />
                  )
                )}
              </Stack>
            )}

            {quizContent.explanation && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Explanation:</strong> {quizContent.explanation}
                </Typography>
              </Alert>
            )}
          </CardContent>
        </Card>
      </Stack>
    );
  }
);

QuizSlideEditor.displayName = "QuizSlideEditor";
