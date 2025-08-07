import React, { useState } from "react";
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
} from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { SlideComponentProps } from "../../types/slide.types";

export const FlashcardSlide: React.FC<SlideComponentProps> = ({
  slide,
  setSlideProgress,
  currentSlide,
}) => {
  const [flashcardStates, setFlashcardStates] = useState<
    Record<string, boolean>
  >({});
  const content = slide.content.content;

  const handleFlipCard = (cardId: string) => {
    setFlashcardStates((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));
  };

  const handleMarkComplete = () => {
    setSlideProgress((prev) => new Set(prev).add(currentSlide));
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
    });
  };

  return (
    <Box sx={{ padding: 4, maxWidth: "1000px", margin: "0 auto" }}>
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

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {content.items?.map((item: any, index: number) => {
          const isFlipped = flashcardStates[item.id] || false;
          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card
                  onClick={() => handleFlipCard(item.id)}
                  sx={{
                    height: 200,
                    cursor: "pointer",
                    position: "relative",
                    transformStyle: "preserve-3d",
                    transition: "transform 0.6s",
                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                    boxShadow: 4,
                    "&:hover": {
                      boxShadow: 8,
                    },
                  }}
                >
                  {/* Front Side */}
                  <CardContent
                    sx={{
                      position: "absolute",
                      width: "100%",
                      height: "100%",
                      backfaceVisibility: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      textAlign: "center",
                      background:
                        "linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)",
                      p: 3,
                    }}
                  >
                    <Typography variant="h5" fontWeight={600} gutterBottom>
                      {item.front}
                    </Typography>
                    <Chip
                      label={item.category}
                      size="small"
                      sx={{ mt: 2, bgcolor: "primary.main", color: "white" }}
                    />
                    <Typography variant="caption" sx={{ mt: 2, opacity: 0.7 }}>
                      Click to flip
                    </Typography>
                  </CardContent>

                  {/* Back Side */}
                  <CardContent
                    sx={{
                      position: "absolute",
                      width: "100%",
                      height: "100%",
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      textAlign: "center",
                      background:
                        "linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)",
                      p: 3,
                    }}
                  >
                    <Typography variant="body1" fontWeight={500} sx={{ mb: 2 }}>
                      {item.back}
                    </Typography>
                    <CheckCircle
                      sx={{ color: "success.main", fontSize: 32, mt: 1 }}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          );
        }) || []}
      </Grid>

      {/* Progress Indicator */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: "success.50", borderRadius: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="body1" fontWeight={500}>
            Cards reviewed: {Object.keys(flashcardStates).length} of{" "}
            {content.items?.length || 0}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={
              (Object.keys(flashcardStates).length /
                (content.items?.length || 1)) *
              100
            }
            sx={{ width: 200, height: 8, borderRadius: 4 }}
          />
        </Stack>
      </Paper>

      <Box sx={{ textAlign: "center" }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleMarkComplete}
          disabled={
            Object.keys(flashcardStates).length !== (content.items?.length || 0)
          }
          sx={{
            px: 6,
            py: 2,
            fontSize: "1.1rem",
            borderRadius: 3,
            background: "linear-gradient(45deg, #1976D2 30%, #42A5F5 90%)",
            "&:hover": {
              background: "linear-gradient(45deg, #1565C0 30%, #2196F3 90%)",
            },
          }}
        >
          Complete Pronunciation Practice
        </Button>
      </Box>
    </Box>
  );
};
