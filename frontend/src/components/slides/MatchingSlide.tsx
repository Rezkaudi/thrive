// frontend/src/components/slides/MatchingSlide.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Paper,
  Alert,
  Grid,
  Fade,
  Chip,
  useTheme,
  useMediaQuery,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  Refresh,
  VolumeUp,
  PlayArrow,
  Stop,
  Headphones
} from "@mui/icons-material";
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

interface Connection {
  leftIndex: number;
  rightIndex: number;
  leftText: string;
  rightText: string;
}

export const MatchingSlide: React.FC<SlideComponentProps> = ({
  slide,
  showFeedback,
  validationResults,
  checkAnswer,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [selectedRight, setSelectedRight] = useState<number | null>(null);
  const [shuffledLeft, setShuffledLeft] = useState<any[]>([]);
  const [shuffledRight, setShuffledRight] = useState<any[]>([]);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [playingAudio, setPlayingAudio] = useState<number | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const content = slide.content.content;
  const slideId = `matching-${slide.id}`;
  const showSlideFeeback = showFeedback[slideId];
  const validation = validationResults[slideId];

  // Canvas ref for drawing lines
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize shuffled arrays
  useEffect(() => {
    if (content.items && content.items.length > 0) {
      const leftItems = content.items.map((item: any, index: number) => ({
        ...item,
        originalIndex: index,
        text: item.left
      }));
      const rightItems = content.items.map((item: any, index: number) => ({
        ...item,
        originalIndex: index,
        text: item.right,
        audioUrl: item.audioUrl
      }));

      setShuffledLeft(shuffleArray(leftItems));
      setShuffledRight(shuffleArray(rightItems));
    }
  }, [content.items, resetTrigger]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.src = '';
      }
    };
  }, [currentAudio]);

  // Play audio function
  const playAudio = (audioUrl: string, index: number) => {
    // Stop any currently playing audio
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.src = '';
    }

    if (playingAudio === index) {
      // Stop if clicking the same audio
      setPlayingAudio(null);
      setCurrentAudio(null);
      return;
    }

    const audio = new Audio(audioUrl);
    audio.addEventListener('ended', () => {
      setPlayingAudio(null);
      setCurrentAudio(null);
    });

    audio.addEventListener('error', () => {
      console.error('Error playing audio');
      setPlayingAudio(null);
      setCurrentAudio(null);
    });

    audio.play().then(() => {
      setPlayingAudio(index);
      setCurrentAudio(audio);
    }).catch(err => {
      console.error('Error playing audio:', err);
      setPlayingAudio(null);
    });
  };

  // Handle selection
  const handleLeftClick = (index: number) => {

    if (selectedLeft === index) {
      setSelectedLeft(null);
    } else {
      setSelectedLeft(index);
      if (selectedRight !== null) {
        createConnection(index, selectedRight);
      }
    }
  };

  const handleRightClick = (index: number) => {

    if (selectedRight === index) {
      setSelectedRight(null);
    } else {
      setSelectedRight(index);
      if (selectedLeft !== null) {
        createConnection(selectedLeft, index);
      }
    }
  };

  const createConnection = (leftIdx: number, rightIdx: number) => {
    const leftItem = shuffledLeft[leftIdx];
    const rightItem = shuffledRight[rightIdx];

    // Check if either item is already connected
    const existingConnection = connections.find(
      conn => conn.leftIndex === leftIdx || conn.rightIndex === rightIdx
    );

    if (existingConnection) {
      // Remove existing connection
      setConnections(prev => prev.filter(
        conn => conn.leftIndex !== leftIdx && conn.rightIndex !== rightIdx
      ));
    }

    // Add new connection
    const newConnection: Connection = {
      leftIndex: leftIdx,
      rightIndex: rightIdx,
      leftText: leftItem.text,
      rightText: rightItem.text
    };

    setConnections(prev => [...prev, newConnection]);
    setSelectedLeft(null);
    setSelectedRight(null);
  };

  const removeConnection = (connection: Connection) => {
    setConnections(prev => prev.filter(conn => conn !== connection));
  };

  const handleCheckAnswer = () => {
    const userAnswer: Record<string, string> = {};
    connections.forEach(conn => {
      userAnswer[conn.leftText] = conn.rightText;
    });

    const correctAnswer: Record<string, string> = {};
    content.items?.forEach((item: any) => {
      correctAnswer[item.left] = item.right;
    });

    let sortedUserAnswer: { [key: string]: string } = {};

    Object.keys(correctAnswer).forEach(key => {
      sortedUserAnswer[key] = userAnswer[key];
    });


    checkAnswer(slideId, sortedUserAnswer, correctAnswer, "matching");
  };

  const handleReset = () => {
    setConnections([]);
    setSelectedLeft(null);
    setSelectedRight(null);
    setResetTrigger(prev => prev + 1);
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.src = '';
    }
    setPlayingAudio(null);
    setCurrentAudio(null);
  };

  // Draw connection lines (desktop only)
  useEffect(() => {
    if (!isMobile && canvasRef.current && containerRef.current) {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx) return;

      // Set canvas size
      canvas.width = container.offsetWidth;
      canvas.height = container.offsetHeight;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      connections.forEach(conn => {
        const leftEl = document.getElementById(`left-${conn.leftIndex}`);
        const rightEl = document.getElementById(`right-${conn.rightIndex}`);

        if (leftEl && rightEl) {
          const leftRect = leftEl.getBoundingClientRect();
          const rightRect = rightEl.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();

          const startX = leftRect.right - containerRect.left;
          const startY = leftRect.top + leftRect.height / 2 - containerRect.top;
          const endX = rightRect.left - containerRect.left;
          const endY = rightRect.top + rightRect.height / 2 - containerRect.top;

          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.strokeStyle = theme.palette.primary.main;
          ctx.lineWidth = 3;
          ctx.stroke();

          // Draw endpoints
          ctx.beginPath();
          ctx.arc(startX, startY, 5, 0, 2 * Math.PI);
          ctx.fillStyle = theme.palette.primary.main;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(endX, endY, 5, 0, 2 * Math.PI);
          ctx.fill();
        }
      });
    }
  }, [connections, isMobile, theme]);

  // Check if an item is connected
  const isLeftConnected = (index: number) =>
    connections.some(conn => conn.leftIndex === index);

  const isRightConnected = (index: number) =>
    connections.some(conn => conn.rightIndex === index);

  return (
    <Box sx={{
      padding: { xs: 2, sm: 3, md: 4 },
      maxWidth: "1000px",
      margin: "0 auto"
    }}>
      <Typography
        variant={isSmallMobile ? "h5" : "h4"}
        gutterBottom
        fontWeight={600}
        textAlign="center"
        sx={{ mb: 3 }}
      >
        {slide.content.title}
      </Typography>

      <Typography
        variant="h3"
        sx={{
          textAlign: "center",
          mb: 4,
          // color: "text.secondary",
          // fontSize: { xs: "1rem", sm: "1.1rem" },
        }}
      >
        {content.instruction || "Listen to the sounds and match them with the correct characters"}
      </Typography>

      {/* Instructions Alert */}
      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
        <Typography variant="body2">
          🎧 Click the play button to listen to each sound, then match it with the correct character on the left
        </Typography>
      </Alert>

      {/* Progress indicator */}
      {/* <Paper sx={{
        p: 2,
        mb: 3,
        bgcolor: "primary.50",
        borderRadius: 2
      }}>
        <Stack
          direction={isSmallMobile ? "column" : "row"}
          justifyContent="space-between"
          alignItems="center"
          spacing={1}
        >
          <Typography variant="body2" fontWeight={500}>
            Connections: {connections.length} of {content.items?.length || 0}
          </Typography>
          {connections.length > 0 && (
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {connections.map((conn, idx) => (
                <Chip
                  key={idx}
                  label={`${conn.leftText} ↔️ 🔊`}
                  size="small"
                  onDelete={() => removeConnection(conn)}
                  sx={{
                    m: 0.5,
                    maxWidth: isSmallMobile ? '150px' : 'auto',
                    '& .MuiChip-label': {
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }
                  }}
                />
              ))}
            </Stack>
          )}
        </Stack>
      </Paper> */}

      {/* Matching Area */}
      <Box ref={containerRef} sx={{ position: 'relative', mb: 4 }}>
        {!isMobile && (
          <canvas
            ref={canvasRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              pointerEvents: 'none',
              zIndex: 1
            }}
          />
        )}

        <Grid container spacing={isMobile ? 2 : 4}>
          {/* Left side - Characters */}
          <Grid size={{ xs: 6 }}>
            <Paper sx={{
              p: { xs: 1.5, sm: 2, md: 3 },
              bgcolor: "primary.50",
              borderRadius: 3
            }}>
              <Typography
                variant={isSmallMobile ? "body1" : "h6"}
                gutterBottom
                textAlign="center"
                fontWeight={600}
                sx={{ mb: { xs: 2, md: 3 } }}
              >
                🔤 Characters
              </Typography>
              <Stack spacing={{ xs: 1.5, md: 2 }}>
                {shuffledLeft.map((item: any, index: number) => (
                  <Button
                    key={`left-${index}`}
                    id={`left-${index}`}
                    variant={isLeftConnected(index) ? "contained" : "outlined"}
                    onClick={() => handleLeftClick(index)}
                    disabled={isLeftConnected(index)}
                    sx={{
                      p: { xs: 1.5, sm: 2, md: 3 },
                      fontSize: { xs: "1.2rem", sm: "1.5rem", md: "2rem" },
                      fontWeight: 600,
                      minHeight: { xs: "100px", md: "120px" },
                      borderRadius: 2,
                      backgroundColor:
                        selectedLeft === index
                          ? "primary.main"
                          : isLeftConnected(index)
                            ? "success.main"
                            : "background.paper",
                      color:
                        selectedLeft === index || isLeftConnected(index)
                          ? "white"
                          : "text.primary",
                      borderWidth: 2,
                      borderColor:
                        selectedLeft === index
                          ? "primary.dark"
                          : isLeftConnected(index)
                            ? "success.main"
                            : "divider",
                      "&:hover": {
                        backgroundColor:
                          isLeftConnected(index)
                            ? "success.dark"
                            : selectedLeft === index
                              ? "primary.dark"
                              : "primary.light",
                        transform: isLeftConnected(index) ? "none" : "scale(1.02)",
                      },
                      transition: "all 0.2s ease",
                      position: 'relative',
                      zIndex: 2,
                      wordBreak: 'break-word',
                      textAlign: 'center',
                      width: '100%'
                    }}
                  >
                    {item.text}
                    {isLeftConnected(index) && (
                      <CheckCircle
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          fontSize: { xs: 16, md: 20 }
                        }}
                      />
                    )}
                  </Button>
                ))}
              </Stack>
            </Paper>
          </Grid>

          {/* Right side - Sounds */}
          <Grid size={{ xs: 6 }}>
            <Paper sx={{
              p: { xs: 1.5, sm: 2, md: 3 },
              bgcolor: "secondary.50",
              borderRadius: 3
            }}>
              <Typography
                variant={isSmallMobile ? "body1" : "h6"}
                gutterBottom
                textAlign="center"
                fontWeight={600}
                sx={{ mb: { xs: 2, md: 3 } }}
              >
                🔊 Sounds
              </Typography>
              <Stack spacing={{ xs: 1.5, md: 2 }}>
                {shuffledRight.map((item: any, index: number) => (
                  <Paper
                    key={`right-${index}`}
                    id={`right-${index}`}
                    elevation={selectedRight === index ? 4 : 1}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      p: { xs: 1.5, sm: 2, md: 3 },
                      fontSize: { xs: "1.2rem", sm: "1.5rem", md: "2rem" },
                      fontWeight: 600,
                      minHeight: { xs: "100px", md: "120px" },
                      borderRadius: 2,
                      backgroundColor:
                        selectedRight === index
                          ? "primary.main"
                          : isRightConnected(index)
                            ? "primary.main"
                            : "background.paper",
                      border: '2px solid',
                      borderColor:
                        selectedRight === index
                          ? "secondary.main"
                          : isRightConnected(index)
                            ? "success.main"
                            : "transparent",
                      cursor: isRightConnected(index) ? 'default' : 'pointer',
                      transition: "all 0.2s ease",
                      position: 'relative',
                      zIndex: 2,
                      wordBreak: 'break-word',
                      textAlign: 'center',
                      width: '100%',
                      '&:hover': {
                        borderColor: isRightConnected(index)
                          ? 'success.main'
                          : 'secondary.main',
                        transform: isRightConnected(index) ? "none" : "scale(1.02)",
                      }
                    }}
                    onClick={() => !isRightConnected(index) && handleRightClick(index)}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      justifyContent="center"
                    >
                      {/* Play Audio Button */}
                      <IconButton
                        size={isSmallMobile ? "medium" : "large"}
                        color={playingAudio === index ? "error" : "primary"}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.audioUrl) {
                            playAudio(item.audioUrl, index);
                          }
                        }}
                        disabled={!item.audioUrl}
                        sx={{
                          bgcolor: playingAudio === index
                            ? 'error.light'
                            : isRightConnected(index)
                              ? 'success.light'
                              : 'primary.light',
                          '&:hover': {
                            bgcolor: playingAudio === index
                              ? 'error.main'
                              : 'primary.main',
                            color: 'white'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {playingAudio === index ? (
                          <Stop sx={{ fontSize: { xs: 24, md: 32 } }} />
                        ) : (
                          <PlayArrow sx={{ fontSize: { xs: 24, md: 32 } }} />
                        )}
                      </IconButton>

                      {/* Sound Label (if provided) */}
                      {item.text && (
                        <Typography
                          variant={isSmallMobile ? "body2" : "body1"}
                          fontWeight={500}
                          sx={{
                            display: { xs: 'none', sm: 'block' },
                            color: isRightConnected(index)
                              ? 'success.dark'
                              : 'text.primary'
                          }}
                        >
                          {item.text}
                        </Typography>
                      )}

                      {/* Audio indicator */}
                      {!item.audioUrl && (
                        <Typography
                          variant="caption"
                          color="error"
                          sx={{ position: 'absolute', bottom: 4, fontSize: '0.7rem' }}
                        >
                          No audio
                        </Typography>
                      )}

                      {isRightConnected(index) && (
                        <CheckCircle
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            fontSize: { xs: 16, md: 20 },
                            color: 'success.main'
                          }}
                        />
                      )}

                      {playingAudio === index && (
                        <CircularProgress
                          size={20}
                          sx={{
                            position: 'absolute',
                            bottom: 4,
                            right: 4
                          }}
                        />
                      )}
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Action Buttons */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        justifyContent="center"
      >
        <Button
          variant="outlined"
          size={isSmallMobile ? "medium" : "large"}
          onClick={handleReset}
          startIcon={<Refresh />}
          sx={{
            px: { xs: 3, md: 4 },
            py: { xs: 1, md: 1.5 },
            fontSize: { xs: "0.9rem", md: "1rem" },
            borderRadius: 3
          }}
        >
          Reset & Shuffle
        </Button>
        <Button
          variant="contained"
          size={isSmallMobile ? "medium" : "large"}
          onClick={handleCheckAnswer}
          disabled={connections.length !== (content.items?.length || 0)}
          startIcon={connections.length === (content.items?.length || 0) ? <CheckCircle /> : <Headphones />}
          sx={{
            px: { xs: 4, md: 6 },
            py: { xs: 1, md: 1.5 },
            fontSize: { xs: "1rem", md: "1.1rem" },
            borderRadius: 3,
            background: connections.length === (content.items?.length || 0)
              ? "linear-gradient(45deg, #45B7D1 30%, #96CEB4 90%)"
              : "grey.400",
            "&:hover": {
              background: connections.length === (content.items?.length || 0)
                ? "linear-gradient(45deg, #3A9BC1 30%, #86C3A4 90%)"
                : "grey.400",
            },
          }}
        >
          Check Matches ({connections.length}/{content.items?.length || 0})
        </Button>
      </Stack>

      {/* Feedback */}
      {showSlideFeeback && validation && (
        <Fade in>
          <Alert
            severity={validation.type}
            sx={{
              mt: 3,
              borderRadius: 2,
              fontSize: { xs: "0.9rem", md: "1rem" }
            }}
          >
            {validation.message}
          </Alert>
        </Fade>
      )}
    </Box>
  );
};