// frontend/src/components/slides/FlashcardSlide.tsx
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

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {content.items?.map((item: any, index: number) => {
          const isFlipped = flashcardStates[item.id] || false;
          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
              <Box
                sx={{
                  height: 200,
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
                        background:
                          "linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)",
                        boxShadow: 3,
                        borderRadius: 2,
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
                          p: 3,
                        }}
                      >
                        <Typography variant="h5" fontWeight={600} gutterBottom>
                          {item.front}
                        </Typography>
                        {item.category && (
                          <Chip
                            label={item.category}
                            size="small"
                            sx={{
                              mt: 2,
                              bgcolor: "primary.main",
                              color: "white",
                            }}
                          />
                        )}
                        <Typography
                          variant="caption"
                          sx={{ mt: 2, opacity: 0.7 }}
                        >
                          Click to flip
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
                        background:
                          "linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)",
                        boxShadow: 3,
                        borderRadius: 2,
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
                          p: 3,
                        }}
                      >
                        <Typography
                          variant="body1"
                          fontWeight={500}
                          sx={{ mb: 2 }}
                        >
                          {item.back}
                        </Typography>
                        <CheckCircle
                          sx={{ color: "success.main", fontSize: 32, mt: 1 }}
                        />
                        <Typography
                          variant="caption"
                          sx={{ mt: 2, opacity: 0.7 }}
                        >
                          Click to flip back
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
    </Box>
  );
};