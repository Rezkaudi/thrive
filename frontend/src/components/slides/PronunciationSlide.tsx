// components/slides/PronunciationSlide.tsx
import React, { useState, useRef, useEffect } from "react";
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
  useTheme,
  useMediaQuery,
  Fade,
} from "@mui/material";
import {
  PlayArrow,
  Stop,
  Mic,
  VolumeUp,
  CheckCircle,
  Refresh,
  CheckCircleOutline,
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
  currentSlide,
  interactiveAnswers,
  setInteractiveAnswers,
  showFeedback,
  validationResults,
  setSlideProgress,
  checkAnswer,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Track recording state for each item separately
  const [recordingStates, setRecordingStates] = useState<Record<string, RecordingState>>({});
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [isSlideCompleted, setIsSlideCompleted] = useState(false);
  const [isProcessingCompletion, setIsProcessingCompletion] = useState(false);

  const content = slide.content.content;
  const slideId = `pronunciation-${slide.id}`;
  const totalItems = content.items?.length || 0;
  const completedCount = completedItems.size;
  const progress = totalItems > 0 ? (completedCount / totalItems) * 100 : 0;

  // Get feedback and validation state
  const userAnswer = interactiveAnswers[slideId];
  const showSlideFeeback = showFeedback[slideId];
  const validation = validationResults[slideId];

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

  // Load existing state when component mounts or userAnswer changes
  useEffect(() => {
    if (userAnswer && typeof userAnswer === 'object') {
      
      const recordedItems = new Set<string>();
      Object.keys(userAnswer).forEach(itemId => {
        if (itemId !== 'completed' && userAnswer[itemId]) {
          recordedItems.add(itemId);
        }
      });
      
      setCompletedItems(recordedItems);
      
      // Check if slide was marked as completed
      if (userAnswer.completed === true) {
        setIsSlideCompleted(true);
      }
    }
  }, [userAnswer]);

  // Check validation state for completion
  useEffect(() => {
    if (validation?.type === 'success' && validation?.isValid) {
      setIsSlideCompleted(true);
      setIsProcessingCompletion(false);
    }
  }, [validation]);

  const startRecording = async (itemId: string) => {
    if (isSlideCompleted) return;

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

        // Mark item as completed and update answers
        setCompletedItems(prev => {
          const newSet = new Set(prev).add(itemId);
          
          // Update interactive answers immediately
          setInteractiveAnswers(prevAnswers => {
            const newAnswers = {
              ...prevAnswers,
              [slideId]: {
                ...(prevAnswers[slideId] || {}),
                [itemId]: audioUrl,
              }
            };
            return newAnswers;
          });
          
          return newSet;
        });

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
    if (isSlideCompleted) return;

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

    // Remove from completed items and update answers
    setCompletedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      
      // Update interactive answers
      setInteractiveAnswers(prevAnswers => {
        const newAnswers = { ...prevAnswers };
        if (newAnswers[slideId]) {
          const slideAnswers = { ...newAnswers[slideId] };
          delete slideAnswers[itemId];
          // If no items left, remove completed flag too
          if (Object.keys(slideAnswers).filter(key => key !== 'completed').length === 0) {
            delete slideAnswers.completed;
          }
          newAnswers[slideId] = slideAnswers;
        }
        return newAnswers;
      });
      
      return newSet;
    });
  };

  const handleMarkComplete = () => {
    if (completedCount === 0 || isSlideCompleted || isProcessingCompletion) {
      return;
    }

    setIsProcessingCompletion(true);

    // Create the answer object with all recorded items
    const completedAnswer: Record<string, any> = {
      completed: true // Mark as completed
    };
    
    completedItems.forEach(itemId => {
      const state = getRecordingState(itemId);
      if (state.audioUrl) {
        completedAnswer[itemId] = state.audioUrl;
      }
    });

    // Update the answers first
    setInteractiveAnswers(prev => ({
      ...prev,
      [slideId]: completedAnswer
    }));

    // Mark slide as progressed
    setSlideProgress(prev => new Set(prev).add(currentSlide));

    // Show immediate confetti for user feedback
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });

    // Use checkAnswer to integrate with the slide system
    setTimeout(() => {
      // For pronunciation, we don't need a "correct" answer since it's subjective
      // Pass the completed answer as both user answer and correct answer
      const success = checkAnswer(slideId, completedAnswer, completedAnswer, 'pronunciation');
      
      if (success) {
        setIsSlideCompleted(true);
      }
      setIsProcessingCompletion(false);
    }, 100); // Small delay to ensure state is updated
  };

  // Reset completion state if user removes all recordings
  useEffect(() => {
    if (completedCount === 0 && isSlideCompleted) {
      setIsSlideCompleted(false);
      
      // Clear the completed flag from answers
      setInteractiveAnswers(prev => {
        const newAnswers = { ...prev };
        if (newAnswers[slideId]) {
          const slideAnswers = { ...newAnswers[slideId] };
          delete slideAnswers.completed;
          if (Object.keys(slideAnswers).length === 0) {
            delete newAnswers[slideId];
          } else {
            newAnswers[slideId] = slideAnswers;
          }
        }
        return newAnswers;
      });
    }
  }, [completedCount, isSlideCompleted, setInteractiveAnswers, slideId]);

  // Cleanup audio URLs when component unmounts
  useEffect(() => {
    return () => {
      Object.values(recordingStates).forEach(state => {
        if (state.audioUrl) {
          URL.revokeObjectURL(state.audioUrl);
        }
      });
    };
  }, [recordingStates]);

  return (
    <Box
      sx={{
        padding: {
          xs: 2,    // 16px on mobile
          sm: 3,    // 24px on small screens
          md: 4     // 32px on medium and larger
        },
        maxWidth: {
          xs: "100%",   // Full width on mobile
          sm: "600px",  // Constrained on small screens
          md: "800px"   // Original width on medium and up
        },
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        opacity: isSlideCompleted ? 0.8 : 1,
        transition: "opacity 0.3s ease"
      }}
    >
      <Typography
        variant={isMobile ? "h5" : "h4"}
        gutterBottom
        fontWeight={600}
        textAlign="center"
        sx={{
          mb: { xs: 2, sm: 3 },
          fontSize: {
            xs: "1.5rem",   // 24px on mobile
            sm: "1.75rem",  // 28px on small screens
            md: "2.125rem"  // 34px on medium and up
          }
        }}
      >
        {slide.content.title}
      </Typography>

      <Typography
        variant="h3"
        sx={{
          textAlign: "center",
          mb: { xs: 3, sm: 4 },
          // color: "text.secondary",
          // fontSize: {
          //   xs: "1rem",      // 16px on mobile
          //   sm: "1.05rem",   // 17px on small screens
          //   md: "1.1rem"     // 18px on medium and up
          // },
          px: { xs: 1, sm: 2 }  // Extra padding on mobile for readability
        }}
      >
        {isSlideCompleted 
          ? "✅ Pronunciation practice completed successfully!"
          : content.instruction
        }
      </Typography>

      {/* Progress Indicator */}
      <Paper
        sx={{
          p: { xs: 1.5, sm: 2 },
          mb: { xs: 3, sm: 4 },
          bgcolor: isSlideCompleted ? "success.50" : "primary.50",
          borderRadius: 3,
        }}
      >
        <Stack
          direction={isMobile ? "column" : "row"}
          justifyContent="space-between"
          alignItems={isMobile ? "stretch" : "center"}
          spacing={isMobile ? 1 : 0}
          mb={1}
        >
          <Typography
            variant="body2"
            fontWeight={500}
            textAlign={isMobile ? "center" : "left"}
            sx={{
              fontSize: { xs: "0.875rem", sm: "0.875rem" }
            }}
          >
            Progress: {completedCount} of {totalItems} items recorded
          </Typography>
          <Chip
            label={isSlideCompleted ? "Completed!" : `${Math.round(progress)}%`}
            size="small"
            color={isSlideCompleted || progress === 100 ? "success" : "primary"}
            sx={{ 
              fontWeight: 600,
              alignSelf: isMobile ? "center" : "auto"
            }}
          />
        </Stack>
        <LinearProgress
          variant="determinate"
          value={isSlideCompleted ? 100 : progress}
          sx={{
            height: { xs: 6, sm: 8 },
            borderRadius: 4,
            bgcolor: isSlideCompleted ? "success.100" : "primary.100",
            "& .MuiLinearProgress-bar": {
              borderRadius: 4,
              bgcolor: isSlideCompleted || progress === 100 ? "success.main" : "primary.main",
            },
          }}
        />
      </Paper>

      <Stack spacing={{ xs: 3, sm: 4 }} sx={{ flex: 1 }}>
        {content.items?.map((item: any, index: number) => {
          const itemId = item.id || `item-${index}`;
          const state = getRecordingState(itemId);
          const isCompleted = completedItems.has(itemId);

          return (
            <Paper
              key={itemId}
              sx={{
                p: {
                  xs: 2,    // 16px on mobile
                  sm: 3,    // 24px on small screens
                  md: 4     // 32px on medium and up
                },
                borderRadius: 3,
                bgcolor: "background.paper",
                border: isCompleted ? "2px solid" : "1px solid",
                borderColor: isCompleted ? "success.main" : "divider",
                position: "relative",
                overflow: "hidden",
                opacity: isSlideCompleted ? 0.7 : 1,
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
                    top: { xs: 8, sm: 16 },
                    right: { xs: 8, sm: 16 },
                    fontWeight: 600,
                    fontSize: { xs: "0.75rem", sm: "0.8125rem" }
                  }}
                />
              )}

              <Typography
                variant={isMobile ? "h6" : "h5"}
                fontWeight={600}
                textAlign="center"
                gutterBottom
                sx={{
                  mb: { xs: 2, sm: 3 },
                  fontSize: {
                    xs: "1.25rem",   // 20px on mobile
                    sm: "1.375rem",  // 22px on small screens
                    md: "1.5rem"     // 24px on medium and up
                  },
                }}
              >
                {item.text}
              </Typography>

              <Typography
                variant="body1"
                textAlign="center"
                color="text.secondary"
                sx={{
                  mb: { xs: 2, sm: 3 },
                  fontSize: {
                    xs: "0.95rem",   // 15px on mobile
                    sm: "1rem",      // 16px on small screens
                    md: "1.1rem"     // 18px on medium and up
                  }
                }}
              >
                Pronunciation: <strong>{item.pronunciation}</strong>
              </Typography>

              {/* Button Stack - Responsive Layout */}
              <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                {/* Main Action Buttons Row */}
                <Stack
                  direction={isMobile ? "column" : "row"}
                  spacing={isMobile ? 1.5 : 2}
                  justifyContent="center"
                  alignItems="center"
                  sx={{ mb: state.audioUrl && !isMobile ? 2 : 0 }}
                >
                  {item.audioUrl && (
                    <Button
                      variant="outlined"
                      startIcon={<VolumeUp />}
                      onClick={() => playAudio(item.audioUrl)}
                      fullWidth={isMobile}
                      sx={{
                        borderRadius: 3,
                        px: { xs: 2, sm: 3 },
                        py: { xs: 1, sm: 1.5 },
                        fontSize: { xs: "0.875rem", sm: "0.875rem" },
                        minWidth: isMobile ? "auto" : 180
                      }}
                    >
                      {isMobile ? "Listen" : "Listen to Reference"}
                    </Button>
                  )}

                  <Button
                    variant={state.isRecording ? "contained" : "outlined"}
                    color={state.isRecording ? "error" : "primary"}
                    startIcon={state.isRecording ? <Stop /> : <Mic />}
                    onClick={() => state.isRecording ? stopRecording(itemId) : startRecording(itemId)}
                    fullWidth={isMobile}
                    disabled={isSlideCompleted}
                    sx={{
                      borderRadius: 3,
                      px: { xs: 2, sm: 3 },
                      py: { xs: 1, sm: 1.5 },
                      fontSize: { xs: "0.875rem", sm: "0.875rem" },
                      minWidth: isMobile ? "auto" : 180,
                    }}
                  >
                    {state.isRecording ? "Stop Recording" : "Start Recording"}
                  </Button>
                </Stack>

                {/* Recording Playback Buttons Row */}
                {state.audioUrl && (
                  <Stack
                    direction={isMobile ? "column" : "row"}
                    spacing={isMobile ? 1.5 : 2}
                    justifyContent="center"
                    alignItems="center"
                    sx={{
                      mt: isMobile ? "12px" : 0,
                      width: isMobile ? "100%" : "auto"
                    }}
                  >
                    <Button
                      variant="outlined"
                      startIcon={<PlayArrow />}
                      onClick={() => playAudio(state.audioUrl!)}
                      fullWidth={isMobile}
                      sx={{
                        borderRadius: 3,
                        px: { xs: 2, sm: 3 },
                        py: { xs: 1, sm: 1.5 },
                        fontSize: { xs: "0.875rem", sm: "0.875rem" },
                        minWidth: isMobile ? "auto" : 160
                      }}
                    >
                      {isMobile ? "Play Recording" : "Play My Recording"}
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      startIcon={<Refresh />}
                      onClick={() => resetRecording(itemId)}
                      fullWidth={isMobile}
                      disabled={isSlideCompleted}
                      sx={{ 
                        borderRadius: 3, 
                        px: { xs: 2, sm: 2 },
                        py: { xs: 1, sm: 1.5 },
                        fontSize: { xs: "0.875rem", sm: "0.875rem" }
                      }}
                    >
                      Re-record
                    </Button>
                  </Stack>
                )}
              </Box>

              {state.isRecording && (
                <Box sx={{ textAlign: "center", mb: 2 }}>
                  <CircularProgress size={isMobile ? 20 : 24} />
                  <Typography
                    variant="body2"
                    color="error.main"
                    sx={{
                      mt: 1,
                      fontSize: { xs: "0.8125rem", sm: "0.875rem" }
                    }}
                  >
                    Recording... Speak clearly into your microphone
                  </Typography>
                </Box>
              )}

              {state.audioUrl && !state.isRecording && !isSlideCompleted && (
                <Alert
                  severity="success"
                  sx={{
                    borderRadius: 2,
                    fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                    "& .MuiAlert-icon": {
                      fontSize: { xs: 24, sm: 28 },
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
      <Box sx={{ textAlign: "center", mt: { xs: 3, sm: 4 } }}>
        <Button
          variant="contained"
          size={isMobile ? "medium" : "large"}
          onClick={handleMarkComplete}
          disabled={completedCount === 0 || isSlideCompleted || isProcessingCompletion}
          startIcon={isSlideCompleted ? <CheckCircle /> : isProcessingCompletion ? <CircularProgress size={16} /> : <CheckCircleOutline />}
          fullWidth={isMobile}
          sx={{
            px: { xs: 4, sm: 6 },
            py: { xs: 1.5, sm: 2 },
            fontSize: { xs: "1rem", sm: "1.1rem" },
            borderRadius: 3,
            maxWidth: isMobile ? "100%" : "auto",
            background: isSlideCompleted
              ? "linear-gradient(45deg, #4caf50 30%, #8bc34a 90%)"
              : completedCount > 0 && !isProcessingCompletion
                ? "linear-gradient(45deg, #1976D2 30%, #42A5F5 90%)"
                : "linear-gradient(45deg, #9e9e9e 30%, #bdbdbd 90%)",
            "&:hover": {
              background: isSlideCompleted
                ? "linear-gradient(45deg, #4caf50 30%, #8bc34a 90%)"
                : completedCount > 0 && !isProcessingCompletion
                  ? "linear-gradient(45deg, #1565C0 30%, #2196F3 90%)"
                  : "linear-gradient(45deg, #9e9e9e 30%, #bdbdbd 90%)",
            },
            "&:disabled": {
              color: "white",
            },
          }}
        >
          {isMobile ? (
            // Shorter text for mobile
            isProcessingCompletion
              ? "Processing..."
              : isSlideCompleted
                ? "✅ Completed"
                : completedCount === 0
                  ? "Record to continue"
                  : `Complete (${completedCount}/${totalItems})`
          ) : (
            // Full text for larger screens
            isProcessingCompletion
              ? "Processing completion..."
              : isSlideCompleted
                ? "✅ Pronunciation Practice Completed"
                : completedCount === 0
                  ? "Record at least one item to continue"
                  : `Complete Practice (${completedCount}/${totalItems} recorded)`
          )}
        </Button>
      </Box>

      {/* Feedback display */}
      {showSlideFeeback && validation && (
        <Fade in>
          <Alert
            severity={validation.type}
            sx={{
              mt: { xs: 2, md: 3 },
              borderRadius: 2,
              fontSize: { xs: "0.9rem", md: "1rem" }
            }}
            icon={
              validation.type === "success" ? <CheckCircle /> : undefined
            }
          >
            <Typography variant="body1" fontWeight={500}>
              {validation.message}
            </Typography>
            {validation.type === "success" && (
              <Typography
                variant="body2"
                sx={{ mt: 1, opacity: 0.8, color: "success.dark" }}
              >
                🎯 Excellent pronunciation practice! Moving to next slide...
              </Typography>
            )}
          </Alert>
        </Fade>
      )}

      {/* Instructions */}
      {!isSlideCompleted && (
        <Alert 
          severity="info" 
          sx={{ 
            mt: { xs: 2, sm: 3 }, 
            borderRadius: 2,
            fontSize: { xs: "0.8125rem", sm: "0.875rem" }
          }}
        >
          <Typography 
            variant="body2"
            sx={{ fontSize: { xs: "0.8125rem", sm: "0.875rem" } }}
          >
            💡 <strong>Tip:</strong> Record yourself pronouncing each word and compare with the reference audio.
            You can re-record as many times as you like. Record at least one item to complete this slide.
          </Typography>
        </Alert>
      )}
    </Box>
  );
};