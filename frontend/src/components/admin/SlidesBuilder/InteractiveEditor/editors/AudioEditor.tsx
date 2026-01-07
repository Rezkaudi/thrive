import React, { memo, useCallback, useRef } from "react";
import {
  Stack,
  TextField,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  FormControlLabel,
  Radio,
  RadioGroup,
  Alert,
  Divider,
} from "@mui/material";
import {
  CloudUpload,
  VolumeUp,
  Add,
  Delete,
  DragIndicator,
} from "@mui/icons-material";

import {
  ListeningItem,
  PronunciationItem,
} from "../../../../../types/interactive-items.types";

interface AudioEditorProps {
  item: PronunciationItem | ListeningItem;
  onUpdate: (updates: Partial<PronunciationItem | ListeningItem>) => void;
  type: "pronunciation" | "listening";
}

export const AudioEditor: React.FC<AudioEditorProps> = memo(
  ({ item, onUpdate, type }) => {
    const listeningItem = item as ListeningItem;
    const pronunciationItem = item as PronunciationItem;

    // Refs for text inputs
    const textRef = useRef(pronunciationItem.text || "");
    const pronunciationRef = useRef(pronunciationItem.pronunciation || "");
    const audioUrlRef = useRef((item as any).audioUrl || "");
    const questionRef = useRef(listeningItem.question || "");

    const addOption = useCallback(() => {
      const newOptions = [
        ...(listeningItem.options || []),
        `Option ${(listeningItem.options?.length || 0) + 1}`,
      ];
      onUpdate({ options: newOptions });
    }, [listeningItem.options, onUpdate]);

    const updateOption = useCallback(
      (optionIndex: number, value: string) => {
        const newOptions = [...(listeningItem.options || [])];
        newOptions[optionIndex] = value;
        onUpdate({ options: newOptions });
      },
      [listeningItem.options, onUpdate]
    );

    const removeOption = useCallback(
      (optionIndex: number) => {
        if ((listeningItem.options?.length || 0) <= 2) return; // Keep minimum 2 options

        const newOptions =
          listeningItem.options?.filter(
            (_: any, i: number) => i !== optionIndex
          ) || [];
        let updates: any = { options: newOptions };

        // Adjust correctAnswer if needed
        if (listeningItem.correct >= optionIndex && listeningItem.correct > 0) {
          updates.correct = listeningItem.correct - 1;
        } else if (listeningItem.correct === optionIndex) {
          updates.correct = 0; // Reset to first option if deleted option was selected
        }

        onUpdate(updates);
      },
      [listeningItem.options, listeningItem.correct, onUpdate]
    );

    const handleCorrectChange = useCallback(
      (optionIndex: number) => {
        onUpdate({ correct: optionIndex });
      },
      [onUpdate]
    );

    // Initialize with default values if needed - moved outside conditional
    React.useEffect(() => {
      if (
        type === "listening" &&
        (!listeningItem.options || listeningItem.options.length === 0)
      ) {
        onUpdate({
          options: ["Option A", "Option B"],
          correct: 0,
        });
      }
    }, [type]);

    // Blur handlers for pronunciation type
    const handleTextBlur = useCallback(() => {
      if (textRef.current !== (pronunciationItem.text || "")) {
        onUpdate({ text: textRef.current });
      }
    }, [pronunciationItem.text, onUpdate]);

    const handlePronunciationBlur = useCallback(() => {
      if (
        pronunciationRef.current !== (pronunciationItem.pronunciation || "")
      ) {
        onUpdate({ pronunciation: pronunciationRef.current });
      }
    }, [pronunciationItem.pronunciation, onUpdate]);

    const handleAudioUrlBlur = useCallback(() => {
      if (audioUrlRef.current !== ((item as any).audioUrl || "")) {
        onUpdate({ audioUrl: audioUrlRef.current });
      }
    }, [item, onUpdate]);

    const handleQuestionBlur = useCallback(() => {
      if (questionRef.current !== (listeningItem.question || "")) {
        onUpdate({ question: questionRef.current });
      }
    }, [listeningItem.question, onUpdate]);

    // Handle pronunciation type
    if (type === "pronunciation") {
      return (
        <Stack spacing={2}>
          <TextField
            fullWidth
            label="Text to Pronounce"
            defaultValue={pronunciationItem.text || ""}
            onChange={(e) => {
              textRef.current = e.target.value;
            }}
            onBlur={handleTextBlur}
            placeholder="e.g., おはようございます"
          />
          <TextField
            fullWidth
            label="Pronunciation Guide"
            defaultValue={pronunciationItem.pronunciation || ""}
            onChange={(e) => {
              pronunciationRef.current = e.target.value;
            }}
            onBlur={handlePronunciationBlur}
            placeholder="e.g., ohayou gozaimasu"
            helperText="Romanization or phonetic guide for pronunciation"
          />
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              fullWidth
              label="Reference Audio URL"
              defaultValue={pronunciationItem.audioUrl || ""}
              onChange={(e) => {
                audioUrlRef.current = e.target.value;
              }}
              onBlur={handleAudioUrlBlur}
              placeholder="S3 URL for reference pronunciation"
            />
            <Tooltip title="Upload Audio File">
              <IconButton color="primary">
                <CloudUpload />
              </IconButton>
            </Tooltip>
            <Tooltip title="Listen to Audio">
              <IconButton
                color="success"
                disabled={!pronunciationItem.audioUrl?.trim()}
              >
                <VolumeUp />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      );
    }

    return (
      <Stack spacing={3}>
        {/* Audio Upload Section */}
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            fullWidth
            label="Audio URL"
            defaultValue={listeningItem.audioUrl || ""}
            onChange={(e) => {
              audioUrlRef.current = e.target.value;
            }}
            onBlur={handleAudioUrlBlur}
            placeholder="S3 URL for audio file"
            error={!listeningItem.audioUrl?.trim()}
            helperText={
              !listeningItem.audioUrl?.trim() ? "Audio URL is required" : ""
            }
          />
          <Tooltip title="Upload Audio File">
            <IconButton color="primary">
              <CloudUpload />
            </IconButton>
          </Tooltip>
          <Tooltip title="Listen to Audio">
            <IconButton
              color="success"
              disabled={!listeningItem.audioUrl?.trim()}
            >
              <VolumeUp />
            </IconButton>
          </Tooltip>
        </Stack>

        {/* Question Section */}
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Listening Question"
          defaultValue={listeningItem.question || ""}
          onChange={(e) => {
            questionRef.current = e.target.value;
          }}
          onBlur={handleQuestionBlur}
          error={!listeningItem.question?.trim()}
          helperText={
            !listeningItem.question?.trim() ? "Question is required" : ""
          }
          placeholder="What did you hear in the audio? / Listen and choose the correct answer..."
        />

        {/* Answer Options Section */}
        <Card variant="outlined" sx={{ p: 3 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography variant="h6" fontWeight={600}>
              Answer Options (Single Choice)
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={addOption}
              size="small"
              sx={{ borderRadius: 2 }}
              disabled={(listeningItem.options?.length || 0) >= 6}
            >
              Add Option
            </Button>
          </Stack>

          <Stack spacing={2}>
            {(listeningItem.options || []).map(
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
                    <FormControlLabel
                      control={
                        <Radio
                          checked={listeningItem.correct === optionIndex}
                          onChange={() => handleCorrectChange(optionIndex)}
                          color="success"
                        />
                      }
                      label=""
                      sx={{ mr: 0 }}
                    />
                  </Box>

                  <TextField
                    fullWidth
                    label={`Option ${String.fromCharCode(65 + optionIndex)}`}
                    defaultValue={option}
                    onBlur={(e) => updateOption(optionIndex, e.target.value)}
                    error={!option.trim()}
                    helperText={
                      listeningItem.correct === optionIndex
                        ? "✓ Correct Answer"
                        : ""
                    }
                    placeholder={`Enter option ${String.fromCharCode(
                      65 + optionIndex
                    )}...`}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor:
                          listeningItem.correct === optionIndex
                            ? "success.light"
                            : "transparent",
                      },
                    }}
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
                        disabled={(listeningItem.options?.length || 0) <= 2}
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
              💡 Select the radio button next to the correct answer. Students
              will listen to the audio and choose one answer.
            </Typography>
          </Alert>
        </Card>

        {/* Optional Notes Section - removing transcript since it doesn't exist in ListeningItem */}
        <TextField
          fullWidth
          multiline
          rows={2}
          label="Additional Notes (optional)"
          value={""}
          onChange={(e) => {
            // You can store this in a custom field if needed
            // onUpdate({ notes: e.target.value });
          }}
          placeholder="Any additional notes about this listening exercise..."
          helperText="Additional information about the exercise"
          disabled
          sx={{ opacity: 0.5 }}
        />

        {/* Listening Exercise Preview */}
        <Card sx={{ bgcolor: "grey.50", borderRadius: 2 }}>
          <CardContent>
            <Typography variant="subtitle2" gutterBottom fontWeight={600}>
              🎧 Listening Exercise Preview
            </Typography>
            <Divider sx={{ my: 2 }} />

            {/* Audio Player Simulation */}
            <Box
              sx={{
                p: 2,
                bgcolor: "primary.main",
                color: "white",
                borderRadius: 2,
                mb: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <VolumeUp />
                <Typography variant="body2">
                  {listeningItem.audioUrl ? "Audio Ready" : "No audio uploaded"}
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="secondary"
                size="small"
                disabled={!listeningItem.audioUrl}
              >
                ▶ Play
              </Button>
            </Box>

            <Typography variant="h6" gutterBottom>
              {listeningItem.question ||
                "Your listening question will appear here..."}
            </Typography>

            {/* Preview Options */}
            <RadioGroup>
              {(listeningItem.options || []).map(
                (option: string, optionIndex: number) => (
                  <FormControlLabel
                    key={optionIndex}
                    value={optionIndex}
                    control={<Radio disabled />}
                    label={
                      option ||
                      `Option ${String.fromCharCode(65 + optionIndex)}`
                    }
                    sx={{
                      bgcolor:
                        listeningItem.correct === optionIndex
                          ? "success.light"
                          : "transparent",
                      borderRadius: 1,
                      px: 1,
                      border:
                        listeningItem.correct === optionIndex
                          ? "2px solid"
                          : "none",
                      borderColor: "success.main",
                    }}
                  />
                )
              )}
            </RadioGroup>

            {/* Removed transcript section since it doesn't exist in ListeningItem */}
          </CardContent>
        </Card>
      </Stack>
    );
  }
);

AudioEditor.displayName = "AudioEditor";
