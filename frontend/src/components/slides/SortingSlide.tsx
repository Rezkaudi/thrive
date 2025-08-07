import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Paper,
  Alert,
  Grid,
  Avatar,
  IconButton,
  Fade,
} from "@mui/material";
import { DragIndicator, Close } from "@mui/icons-material";
import { Reorder } from "framer-motion";
import { SlideComponentProps } from "../../types/slide.types";

export const SortingSlide: React.FC<SlideComponentProps> = ({
  slide,
  showFeedback,
  validationResults,
  checkAnswer,
}) => {
  const [sortedItems, setSortedItems] = useState<string[]>([]);
  const content = slide.content.content;
  const slideId = `sorting-${slide.id}`;
  const showSlideFeeback = showFeedback[slideId];
  const validation = validationResults[slideId];

  const handleSort = (newOrder: string[]) => {
    setSortedItems(newOrder);
  };

  const handleCheckAnswer = () => {
    const correctOrder =
      content.items
        ?.sort((a: any, b: any) => a.correctOrder - b.correctOrder)
        .map((item: any) => item.text) || [];

    checkAnswer(slideId, sortedItems, correctOrder, "sorting");
  };

  const resetSort = () => {
    setSortedItems([]);
  };

  const availableItems =
    content.items?.filter((item: any) => !sortedItems.includes(item.text)) ||
    [];

  return (
    <Box sx={{ padding: 4, maxWidth: "900px", margin: "0 auto" }}>
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

      {/* Sorting Area */}
      <Paper
        sx={{
          minHeight: "200px",
          p: 3,
          mb: 4,
          backgroundColor: "primary.50",
          border: "3px dashed",
          borderColor: sortedItems.length > 0 ? "primary.main" : "primary.200",
          borderRadius: 3,
          transition: "all 0.3s ease",
        }}
      >
        <Typography
          variant="h6"
          textAlign="center"
          gutterBottom
          fontWeight={600}
          sx={{ mb: 3 }}
        >
          📋 Correct Order (Drag items here)
        </Typography>

        {sortedItems.length === 0 ? (
          <Typography
            variant="body1"
            color="text.secondary"
            textAlign="center"
            sx={{ fontStyle: "italic", mt: 4 }}
          >
            Drag items from below to arrange them in the correct order ⬇️
          </Typography>
        ) : (
          <Reorder.Group
            axis="y"
            values={sortedItems}
            onReorder={handleSort}
            style={{ listStyle: "none", padding: 0, margin: 0 }}
          >
            {sortedItems.map((item, index) => (
              <Reorder.Item key={item} value={item}>
                <Paper
                  sx={{
                    p: 2,
                    mb: 2,
                    backgroundColor: "white",
                    cursor: "grab",
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    "&:hover": {
                      boxShadow: 3,
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: "primary.main",
                      width: 32,
                      height: 32,
                      fontSize: "0.9rem",
                      fontWeight: 600,
                    }}
                  >
                    {index + 1}
                  </Avatar>
                  <DragIndicator sx={{ color: "text.secondary" }} />
                  <Typography
                    variant="body1"
                    fontWeight={500}
                    sx={{ flexGrow: 1 }}
                  >
                    {item}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() =>
                      setSortedItems((prev) => prev.filter((i) => i !== item))
                    }
                    sx={{ color: "error.main" }}
                  >
                    <Close />
                  </IconButton>
                </Paper>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}
      </Paper>

      {/* Available Items */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3, bgcolor: "grey.50" }}>
        <Typography
          variant="h6"
          gutterBottom
          textAlign="center"
          fontWeight={600}
          sx={{ mb: 3 }}
        >
          📦 Available Items
        </Typography>
        <Grid container spacing={2}>
          {availableItems.map((item: any) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => setSortedItems((prev) => [...prev, item.text])}
                sx={{
                  p: 2,
                  textAlign: "center",
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 500,
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: 2,
                  },
                  transition: "all 0.2s ease",
                }}
              >
                {item.text}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Stack direction="row" spacing={2} justifyContent="center">
        <Button
          variant="outlined"
          size="large"
          onClick={resetSort}
          sx={{ px: 4, py: 1.5, fontSize: "1rem", borderRadius: 3 }}
        >
          🔄 Reset
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={handleCheckAnswer}
          disabled={sortedItems.length !== (content.items?.length || 0)}
          sx={{
            px: 6,
            py: 1.5,
            fontSize: "1.1rem",
            borderRadius: 3,
            background: "linear-gradient(45deg, #9C27B0 30%, #E1BEE7 90%)",
            "&:hover": {
              background: "linear-gradient(45deg, #8E24AA 30%, #D8B4DE 90%)",
            },
          }}
        >
          Check Order ({sortedItems.length}/{content.items?.length || 0})
        </Button>
      </Stack>

      {showSlideFeeback && validation && (
        <Fade in>
          <Alert
            severity={validation.type}
            sx={{ mt: 3, borderRadius: 2, fontSize: "1rem" }}
          >
            {validation.message}
          </Alert>
        </Fade>
      )}
    </Box>
  );
};
