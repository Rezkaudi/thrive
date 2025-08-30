// Enhanced FlashcardSlide.tsx with auto-progression when all cards are flipped
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Alert,
  Fade,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { CheckCircle, Refresh, Language } from "@mui/icons-material";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { SlideComponentProps } from "../../types/slide.types";

export const FlashcardSlide: React.FC<SlideComponentProps> = ({
  slide,
  setSlideProgress,
  currentSlide,
  checkAnswer,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [flashcardStates, setFlashcardStates] = useState<Record<string, boolean>>({});
  const [hasTriggeredCompletion, setHasTriggeredCompletion] = useState(false);

  const content = slide.content.content;
  const slideId = `flashcard-${slide.id}`;
  const totalCards = content.items?.length || 0;

  // Calculate progress
  const flippedCards = Object.values(flashcardStates).filter(Boolean).length;
  const progress = totalCards > 0 ? (flippedCards / totalCards) * 100 : 0;
  const allCardsFlipped = flippedCards === totalCards && totalCards > 0;

  // Auto-complete when all cards are flipped
  useEffect(() => {
    if (allCardsFlipped && !hasTriggeredCompletion && totalCards > 0) {
      setHasTriggeredCompletion(true);

      // Mark slide as progressed
      setSlideProgress((prev) => new Set(prev).add(currentSlide));

      // Trigger confetti
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });

      // Use the checkAnswer function to trigger auto-progression
      // For flashcards, we'll pass a simple completion state
      const completionData = {
        allCardsFlipped: true,
        totalCards,
        flippedCards,
        cardStates: flashcardStates
      };

      // Trigger the validation and auto-progression system
      setTimeout(() => {
        checkAnswer(slideId, completionData, completionData, "flashcard");
      }, 500); // Small delay to let confetti show
    }
  }, [allCardsFlipped, hasTriggeredCompletion, totalCards, currentSlide, setSlideProgress, checkAnswer, slideId, flippedCards, flashcardStates]);

  const handleFlipCard = (cardId: string) => {
    setFlashcardStates((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));
  };

  const handleReset = () => {
    setFlashcardStates({});
    setHasTriggeredCompletion(false);
  };

  // Early return if no cards
  if (!content.items || content.items.length === 0) {
    return (
      <Box sx={{
        textAlign: 'center',
        p: 4,
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <Alert severity="info" sx={{ borderRadius: 3 }}>
          <Typography variant="h6" gutterBottom>
            No Flashcards Available
          </Typography>
          <Typography>
            Please add flashcard items to this slide.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{
      padding: { xs: 2, sm: 3, md: 4 },
      maxWidth: "1200px",
      margin: "0 auto"
    }}>
      <Typography
        variant={isMobile ? "h5" : "h4"}
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
          mb: 4,
          // color: "text.secondary",
          // fontSize: "1.1rem",
        }}
      >
        {content.instruction || "Click on each card to reveal the answer"}
      </Typography>

      {/* Progress Section */}
      <Paper sx={{
        p: { xs: 2, md: 3 },
        mb: { xs: 3, md: 4 },
        bgcolor: "primary.50",
        borderRadius: 3
      }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems="center"
          spacing={{ xs: 2, sm: 0 }}
          mb={2}
        >
          <Typography
            variant={isMobile ? "body1" : "h6"}
            fontWeight={600}
            color="primary.main"
            textAlign={{ xs: "center", sm: "left" }}
          >
            Progress: {flippedCards} of {totalCards} cards flipped
          </Typography>
          <Chip
            label={`${Math.round(progress)}%`}
            color={allCardsFlipped ? "success" : "primary"}
            variant={allCardsFlipped ? "filled" : "outlined"}
            size={isMobile ? "small" : "medium"}
            sx={{ fontWeight: 600 }}
          />
        </Stack>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: { xs: 6, md: 8 },
            borderRadius: 4,
            bgcolor: "primary.100",
            "& .MuiLinearProgress-bar": {
              borderRadius: 4,
              bgcolor: allCardsFlipped ? "success.main" : "primary.main",
            },
          }}
        />
      </Paper>


      {/* Completion Message */}
      {allCardsFlipped && (
        <Fade in>
          <Alert
            severity="success"
            sx={{
              mt: 3,
              borderRadius: 3,
              fontSize: { xs: "0.9rem", md: "1rem" },
              "& .MuiAlert-icon": {
                fontSize: { xs: "1.2rem", md: "1.5rem" },
              },
            }}
          >
            <Typography variant="body1" fontWeight={500}>
              🎴 Excellent work! You've flipped all {totalCards} flashcards and reviewed all the content!
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
              The lesson will automatically continue to the next slide...
            </Typography>
          </Alert>
        </Fade>
      )}

      {/* Flashcards Grid */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, md: 4 }, mt: 2 }}>
        {content.items?.map((item: any, index: number) => {
          const isFlipped = flashcardStates[item.id] || false;

          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
              <Box
                sx={{
                  height: { xs: 160, sm: 180, md: 200 },
                  cursor: "pointer",
                  position: "relative",
                  perspective: "1000px",
                }}
                onClick={() => handleFlipCard(item.id)}
              >
                <motion.div
                  style={{
                    width: "100%",
                    height: "100%",
                    position: "relative",
                    transformStyle: "preserve-3d",
                  }}
                  transition={{ duration: 0.7 }}
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                >
                  {/* Front Side */}
                  <motion.div
                    style={{
                      position: "absolute",
                      width: "100%",
                      height: "100%",
                      backfaceVisibility: "hidden",
                    }}
                  >
                    <Card
                      sx={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        textAlign: "center",
                        background: "linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)",
                        boxShadow: 3,
                        borderRadius: 2,
                        border: "2px solid transparent",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          borderColor: "primary.main",
                          transform: "translateY(-4px)",
                          boxShadow: 6,
                        },
                      }}
                    >
                      <CardContent
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                          height: "100%",
                          width: "100%",
                          p: { xs: 2, md: 3 },
                        }}
                      >
                        <Typography
                          variant={isMobile ? "h6" : "h5"}
                          fontWeight={600}
                          gutterBottom
                          sx={{
                            fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
                            wordBreak: "break-word",
                            hyphens: "auto"
                          }}
                        >
                          {item.front}
                        </Typography>
                        {item.category && (
                          <Chip
                            label={item.category}
                            size="small"
                            sx={{
                              mt: 1,
                              bgcolor: "primary.main",
                              color: "white",
                              fontSize: { xs: "0.7rem", md: "0.75rem" }
                            }}
                          />
                        )}
                        <Typography
                          variant="caption"
                          sx={{
                            mt: 2,
                            opacity: 0.7,
                            fontSize: { xs: "0.7rem", md: "0.75rem" }
                          }}
                        >
                          👆 Click to flip
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Back Side */}
                  <motion.div
                    style={{
                      position: "absolute",
                      width: "100%",
                      height: "100%",
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    <Card
                      sx={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        textAlign: "center",
                        background: "linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)",
                        boxShadow: 3,
                        borderRadius: 2,
                        border: "2px solid",
                        borderColor: "success.main",
                      }}
                    >
                      <CardContent
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                          height: "100%",
                          width: "100%",
                          p: { xs: 2, md: 3 },
                        }}
                      >
                        <Typography
                          variant="body1"
                          fontWeight={500}
                          sx={{
                            mb: 2,
                            fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
                            wordBreak: "break-word",
                            hyphens: "auto"
                          }}
                        >
                          {item.back}
                        </Typography>
                        <CheckCircle
                          sx={{
                            color: "success.main",
                            fontSize: { xs: 24, md: 32 },
                            mt: 1
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            mt: 1,
                            opacity: 0.7,
                            fontSize: { xs: "0.7rem", md: "0.75rem" }
                          }}
                        >
                          👆 Click to flip back
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              </Box>
            </Grid>
          );
        }) || []}
      </Grid>

      {/* Action Buttons */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        justifyContent="center"
        alignItems="center"
      >
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleReset}
          size={isMobile ? "medium" : "large"}
          sx={{
            px: { xs: 3, md: 4 },
            py: { xs: 1, md: 1.5 },
            fontSize: { xs: "0.9rem", md: "1rem" },
            borderRadius: 3,
            minWidth: { xs: "100%", sm: "auto" },
          }}
        >
          🔄 Reset All Cards
        </Button>

        {/* Completion Status */}
        {allCardsFlipped && (
          <Paper
            sx={{
              p: { xs: 2, md: 3 },
              bgcolor: "success.light",
              borderRadius: 3,
              border: "2px solid",
              borderColor: "success.main",
              minWidth: { xs: "100%", sm: "auto" },
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1} justifyContent="center">
              <CheckCircle sx={{ color: "success.dark" }} />
              <Typography
                variant={isMobile ? "body1" : "h6"}
                fontWeight={600}
                color="success.dark"
                textAlign="center"
              >
                🎉 All cards completed! Moving to next slide...
              </Typography>
            </Stack>
          </Paper>
        )}
      </Stack>

      {/* Instructions */}
      {/* {flippedCards === 0 && (
        <Paper
          sx={{
            p: { xs: 2, md: 3 },
            mt: 3,
            bgcolor: "info.50",
            border: "1px solid",
            borderColor: "info.200",
            borderRadius: 3,
          }}
        >
          <Typography variant="body2" color="info.dark" sx={{ fontWeight: 500, mb: 1 }}>
            💡 How to use flashcards:
          </Typography>
          <Stack spacing={0.5}>
            <Typography variant="body2" color="info.dark">
              • Click on any card to flip it and reveal the answer
            </Typography>
            <Typography variant="body2" color="info.dark">
              • Review all cards to complete this activity
            </Typography>
            <Typography variant="body2" color="info.dark">
              • Once all cards are flipped, you'll automatically move to the next slide
            </Typography>
          </Stack>
        </Paper>
      )} */}
    </Box>
  );
};