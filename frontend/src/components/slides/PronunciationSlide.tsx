// components/slides/PronunciationSlide.tsx
import React, { useState, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Paper,
  Alert,
  CircularProgress,
  Chip,
  LinearProgress,
} from "@mui/material";
import {
  PlayArrow,
  Stop,
  Mic,
  VolumeUp,
  CheckCircle,
  Refresh,
} from "@mui/icons-material";
import confetti from "canvas-confetti";
import { SlideComponentProps } from "../../types/slide.types";

interface RecordingState {
  isRecording: boolean;
  audioUrl: string | null;
  mediaRecorder: MediaRecorder | null;
  audioChunks: Blob[];
}

export const PronunciationSlide: React.FC<SlideComponentProps> = ({
  slide,
  setSlideProgress,
  currentSlide,
}) => {
  // Track recording state for each item separately
  const [recordingStates, setRecordingStates] = useState<Record<string, RecordingState>>({});
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

  const content = slide.content.content;
  const totalItems = content.items?.length || 0;
  const completedCount = completedItems.size;
  const progress = totalItems > 0 ? (completedCount / totalItems) * 100 : 0;

  // Get recording state for a specific item
  const getRecordingState = (itemId: string): RecordingState => {
    return recordingStates[itemId] || {
      isRecording: false,
      audioUrl: null,
      mediaRecorder: null,
      audioChunks: [],
    };
  };

  // Update recording state for a specific item
  const updateRecordingState = (itemId: string, updates: Partial<RecordingState>) => {
    setRecordingStates(prev => ({
      ...prev,
      [itemId]: {
        ...getRecordingState(itemId),
        ...updates,
      },
    }));
  };

  const startRecording = async (itemId: string) => {
    try {
      // Stop any other recordings first
      Object.entries(recordingStates).forEach(([id, state]) => {
        if (id !== itemId && state.isRecording && state.mediaRecorder) {
          state.mediaRecorder.stop();
        }
      });

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        const audioUrl = URL.createObjectURL(audioBlob);

        updateRecordingState(itemId, {
          audioUrl,
          isRecording: false,
          mediaRecorder: null,
          audioChunks: [],
        });

        // Mark item as completed when recording is done
        setCompletedItems(prev => new Set(prev).add(itemId));

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();

      updateRecordingState(itemId, {
        isRecording: true,
        mediaRecorder,
        audioChunks,
      });
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please check your permissions.");
    }
  };

  const stopRecording = (itemId: string) => {
    const state = getRecordingState(itemId);
    if (state.mediaRecorder && state.isRecording) {
      state.mediaRecorder.stop();
    }
  };

  const playAudio = (url: string) => {
    if (currentAudio) {
      currentAudio.pause();
    }
    const audio = new Audio(url);
    setCurrentAudio(audio);
    audio.play();
  };

  const resetRecording = (itemId: string) => {
    const state = getRecordingState(itemId);

    // Revoke the old URL to free memory
    if (state.audioUrl) {
      URL.revokeObjectURL(state.audioUrl);
    }

    updateRecordingState(itemId, {
      isRecording: false,
      audioUrl: null,
      mediaRecorder: null,
      audioChunks: [],
    });

    // Remove from completed items
    setCompletedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
  };

  const handleMarkComplete = () => {
    setSlideProgress((prev) => new Set(prev).add(currentSlide));
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });
  };

  // Cleanup audio URLs when component unmounts
  React.useEffect(() => {
    return () => {
      Object.values(recordingStates).forEach(state => {
        if (state.audioUrl) {
          URL.revokeObjectURL(state.audioUrl);
        }
      });
    };
  }, []);

  return (
    <Box sx={{ padding: 4, maxWidth: "800px", margin: "0 auto" }}>
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

      {/* Progress Indicator */}
      <Paper
        sx={{
          p: 2,
          mb: 4,
          bgcolor: "primary.50",
          borderRadius: 3,
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <Typography variant="body2" fontWeight={500}>
            Progress: {completedCount} of {totalItems} items recorded
          </Typography>
          <Chip
            label={`${Math.round(progress)}%`}
            size="small"
            color={progress === 100 ? "success" : "primary"}
            sx={{ fontWeight: 600 }}
          />
        </Stack>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: "primary.100",
            "& .MuiLinearProgress-bar": {
              borderRadius: 4,
              bgcolor: progress === 100 ? "success.main" : "primary.main",
            },
          }}
        />
      </Paper>

      <Stack spacing={4}>
        {content.items?.map((item: any, index: number) => {
          const itemId = item.id || `item-${index}`;
          const state = getRecordingState(itemId);
          const isCompleted = completedItems.has(itemId);

          return (
            <Paper
              key={itemId}
              sx={{
                p: 4,
                borderRadius: 3,
                bgcolor: "background.paper",
                border: isCompleted ? "2px solid" : "1px solid",
                borderColor: isCompleted ? "success.main" : "divider",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Completion Badge */}
              {isCompleted && (
                <Chip
                  icon={<CheckCircle />}
                  label="Recorded"
                  size="small"
                  color="success"
                  sx={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    fontWeight: 600,
                  }}
                />
              )}

              <Typography
                variant="h5"
                fontWeight={600}
                textAlign="center"
                gutterBottom
                sx={{ mb: 3 }}
              >
                {item.text}
              </Typography>

              <Typography
                variant="body1"
                textAlign="center"
                color="text.secondary"
                sx={{ mb: 3, fontSize: "1.1rem" }}
              >
                Pronunciation: <strong>{item.pronunciation}</strong>
              </Typography>

              <Stack
                direction="row"
                spacing={2}
                justifyContent="center"
                alignItems="center"
                sx={{ mb: 3 }}
                gap={1}
                flexWrap="wrap"
              >
                {item.audioUrl && (
                  <Button
                    variant="outlined"
                    startIcon={<VolumeUp />}
                    onClick={() => playAudio(item.audioUrl)}
                    sx={{ borderRadius: 3, px: 3 }}
                  >
                    Listen to Reference
                  </Button>
                )}

                <Button
                  variant={state.isRecording ? "contained" : "outlined"}
                  color={state.isRecording ? "error" : "primary"}
                  startIcon={state.isRecording ? <Stop /> : <Mic />}
                  onClick={() => state.isRecording ? stopRecording(itemId) : startRecording(itemId)}
                  sx={{
                    borderRadius: 3,
                    px: 3,
                    minWidth: 180,
                  }}
                >
                  {state.isRecording ? "Stop Recording" : "Start Recording"}
                </Button>

                {state.audioUrl && (
                  <>
                    <Button
                      variant="outlined"
                      startIcon={<PlayArrow />}
                      onClick={() => playAudio(state.audioUrl!)}
                      sx={{ borderRadius: 3, px: 3 }}
                    >
                      Play My Recording
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      startIcon={<Refresh />}
                      onClick={() => resetRecording(itemId)}
                      sx={{ borderRadius: 3, px: 2 }}
                      size="small"
                    >
                      Re-record
                    </Button>
                  </>
                )}
              </Stack>

              {state.isRecording && (
                <Box sx={{ textAlign: "center", mb: 2 }}>
                  <CircularProgress size={24} />
                  <Typography variant="body2" color="error.main" sx={{ mt: 1 }}>
                    Recording... Speak clearly into your microphone
                  </Typography>
                </Box>
              )}

              {state.audioUrl && !state.isRecording && (
                <Alert
                  severity="success"
                  sx={{
                    borderRadius: 2,
                    "& .MuiAlert-icon": {
                      fontSize: 28,
                    },
                  }}
                >
                  Great! Your pronunciation has been recorded. Compare it with the
                  reference audio or re-record if you'd like to try again.
                </Alert>
              )}
            </Paper>
          );
        }) || []}
      </Stack>

      {/* Complete Button */}
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleMarkComplete}
          disabled={completedCount === 0}
          startIcon={completedCount === totalItems ? <CheckCircle /> : null}
          sx={{
            px: 6,
            py: 2,
            fontSize: "1.1rem",
            borderRadius: 3,
            background: completedCount === totalItems
              ? "linear-gradient(45deg, #4caf50 30%, #8bc34a 90%)"
              : "linear-gradient(45deg, #1976D2 30%, #42A5F5 90%)",
            "&:hover": {
              background: completedCount === totalItems
                ? "linear-gradient(45deg, #45a049 30%, #7cb342 90%)"
                : "linear-gradient(45deg, #1565C0 30%, #2196F3 90%)",
            },
            "&:disabled": {
              background: "linear-gradient(45deg, #9e9e9e 30%, #bdbdbd 90%)",
            },
          }}
        >
          {completedCount === 0
            ? "Record at least one item to continue"
            : completedCount === totalItems
              ? "Complete Pronunciation Practice"
              : `Complete Practice (${completedCount}/${totalItems} recorded)`}
        </Button>
      </Box>

      {/* Instructions */}
      <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
        <Typography variant="body2">
          💡 <strong>Tip:</strong> Record yourself pronouncing each word and compare with the reference audio.
          You can re-record as many times as you like. Record at least one item to complete this slide.
        </Typography>
      </Alert>
    </Box>
  );
};