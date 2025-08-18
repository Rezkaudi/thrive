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
  useTheme,
  useMediaQuery,
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

  // Mobile detection
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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

  // Available Items Component
  const AvailableItemsSection = () => (
    <Paper sx={{
      p: { xs: 2, sm: 3 },
      mb: 4,
      borderRadius: 3,
      bgcolor: "grey.50"
    }}>
      <Typography
        variant="h6"
        gutterBottom
        textAlign="center"
        fontWeight={600}
        sx={{
          mb: 3,
          fontSize: { xs: "1.1rem", sm: "1.25rem" }
        }}
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
                p: { xs: 1.5, sm: 2 },
                textAlign: "center",
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 500,
                fontSize: { xs: "0.875rem", sm: "1rem" },
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
  );

  // Sorting Area Component
  const SortingAreaSection = () => (
    <Paper
      sx={{
        minHeight: { xs: "150px", sm: "200px" },
        p: { xs: 2, sm: 3 },
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
        sx={{
          mb: 3,
          fontSize: { xs: "1.1rem", sm: "1.25rem" }
        }}
      >
        📋 Correct Order {isMobile ? "(Tap items above)" : "(Drag items here)"}
      </Typography>

      {sortedItems.length === 0 ? (
        <Typography
          variant="body1"
          color="text.secondary"
          textAlign="center"
          sx={{
            fontStyle: "italic",
            mt: { xs: 2, sm: 4 },
            fontSize: { xs: "0.875rem", sm: "1rem" }
          }}
        >
          {isMobile
            ? "Tap items from above to arrange them in the correct order ⬆️"
            : "Drag items from below to arrange them in the correct order ⬇️"
          }
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
                  p: { xs: 1.5, sm: 2 },
                  mb: 2,
                  backgroundColor: "white",
                  cursor: isMobile ? "default" : "grab",
                  display: "flex",
                  alignItems: "center",
                  gap: { xs: 1, sm: 2 },
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
                    width: { xs: 28, sm: 32 },
                    height: { xs: 28, sm: 32 },
                    fontSize: { xs: "0.8rem", sm: "0.9rem" },
                    fontWeight: 600,
                  }}
                >
                  {index + 1}
                </Avatar>
                {!isMobile && <DragIndicator sx={{ color: "text.secondary" }} />}
                <Typography
                  variant="body1"
                  fontWeight={500}
                  sx={{
                    flexGrow: 1,
                    fontSize: { xs: "0.875rem", sm: "1rem" }
                  }}
                >
                  {item}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() =>
                    setSortedItems((prev) => prev.filter((i) => i !== item))
                  }
                  sx={{
                    color: "error.main",
                    p: { xs: 0.5, sm: 1 }
                  }}
                >
                  <Close fontSize={isMobile ? "small" : "medium"} />
                </IconButton>
              </Paper>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}
    </Paper>
  );

  return (
    <Box sx={{
      padding: { xs: 2, sm: 3, md: 4 },
      maxWidth: "900px",
      margin: "0 auto"
    }}>
      <Typography
        variant="h4"
        gutterBottom
        fontWeight={600}
        textAlign="center"
        sx={{
          mb: 3,
          fontSize: { xs: "1.75rem", sm: "2.125rem" }
        }}
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
          px: { xs: 1, sm: 0 }
        }}
      >
        {content.instruction}
      </Typography>

      {/* Conditional Layout - Mobile shows Available Items first, Desktop shows Sorting Area first */}
      {isMobile ? (
        <>
          <AvailableItemsSection />
          <SortingAreaSection />
        </>
      ) : (
        <>
          <SortingAreaSection />
          <AvailableItemsSection />
        </>
      )}

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        justifyContent="center"
        sx={{ mt: { xs: 2, sm: 0 } }}
      >
        <Button
          variant="outlined"
          size={isMobile ? "medium" : "large"}
          onClick={resetSort}
          sx={{
            px: { xs: 3, sm: 4 },
            py: { xs: 1, sm: 1.5 },
            fontSize: { xs: "0.9rem", sm: "1rem" },
            borderRadius: 3
          }}
        >
          🔄 Reset
        </Button>
        <Button
          variant="contained"
          size={isMobile ? "medium" : "large"}
          onClick={handleCheckAnswer}
          disabled={sortedItems.length !== (content.items?.length || 0)}
          sx={{
            px: { xs: 4, sm: 6 },
            py: { xs: 1, sm: 1.5 },
            fontSize: { xs: "1rem", sm: "1.1rem" },
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
            sx={{
              mt: 3,
              borderRadius: 2,
              fontSize: { xs: "0.875rem", sm: "1rem" },
              mx: { xs: 1, sm: 0 }
            }}
          >
            {validation.message}
          </Alert>
        </Fade>
      )}
    </Box>
  );
};