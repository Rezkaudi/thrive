import { useState } from "react";
import { SlideComponentProps } from "../../types/slide.types";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Fade,
  Grid,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Reorder } from "framer-motion";
import { Close, DragIndicator } from "@mui/icons-material";

export const TimelineSlide: React.FC<SlideComponentProps> = ({
  slide,
  showFeedback,
  validationResults,
  checkAnswer,
}) => {
  const [timelineOrder, setTimelineOrder] = useState<any[]>([]);
  const content = slide.content.content;
  const slideId = `timeline-${slide.id}`;
  const showSlideFeeback = showFeedback[slideId];
  const validation = validationResults[slideId];

  const handleTimelineOrder = (newOrder: any[]) => {
    setTimelineOrder(newOrder);
  };

  const handleCheckAnswer = () => {
    const correctOrder =
      content.items
        ?.sort(
          (a: any, b: any) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        )
        .map((item: any) => item.id) || [];
    const userOrder = timelineOrder.map((item) => item.id);

    checkAnswer(slideId, userOrder, correctOrder, "timeline");
  };

  const resetTimeline = () => {
    setTimelineOrder([]);
  };

  const availableEvents =
    content.items?.filter(
      (item: any) => !timelineOrder.find((t) => t.id === item.id)
    ) || [];

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
        {content.instruction}
      </Typography>

      {/* Timeline Area */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3, bgcolor: "primary.50" }}>
        <Typography
          variant="h6"
          textAlign="center"
          gutterBottom
          fontWeight={600}
          sx={{ mb: 3 }}
        >
          ⏰ Timeline (Chronological Order)
        </Typography>

        {timelineOrder.length === 0 ? (
          <Typography
            variant="body1"
            color="text.secondary"
            textAlign="center"
            sx={{ fontStyle: "italic", py: 4 }}
          >
            Drag events from below to arrange them chronologically ⬇️
          </Typography>
        ) : (
          <Box sx={{ position: "relative" }}>
            {/* Timeline Line */}
            <Box
              sx={{
                position: "absolute",
                left: 32,
                top: 0,
                bottom: 0,
                width: 4,
                bgcolor: "primary.main",
                borderRadius: 2,
                zIndex: 0,
              }}
            />

            <Reorder.Group
              axis="y"
              values={timelineOrder}
              onReorder={handleTimelineOrder}
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                position: "relative",
                zIndex: 1,
              }}
            >
              {timelineOrder.map((item, index) => (
                <Reorder.Item key={item.id} value={item}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    {/* Timeline Dot */}
                    <Avatar
                      sx={{
                        bgcolor: "primary.main",
                        width: 48,
                        height: 48,
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        mr: 3,
                        boxShadow: 3,
                      }}
                    >
                      {index + 1}
                    </Avatar>

                    {/* Event Card */}
                    <Paper
                      sx={{
                        p: 3,
                        flexGrow: 1,
                        cursor: "grab",
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        "&:hover": {
                          boxShadow: 6,
                          transform: "translateY(-2px)",
                        },
                        transition: "all 0.2s ease",
                      }}
                    >
                      <DragIndicator sx={{ color: "text.secondary" }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          {item.event}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          {item.date}
                        </Typography>
                        <Typography variant="body2">
                          {item.description}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() =>
                          setTimelineOrder((prev) =>
                            prev.filter((t) => t.id !== item.id)
                          )
                        }
                        sx={{ color: "error.main" }}
                      >
                        <Close />
                      </IconButton>
                    </Paper>
                  </Box>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </Box>
        )}
      </Paper>

      {/* Available Events */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 3, bgcolor: "grey.50" }}>
        <Typography
          variant="h6"
          gutterBottom
          textAlign="center"
          fontWeight={600}
          sx={{ mb: 3 }}
        >
          📅 Historical Events
        </Typography>
        <Grid container spacing={2}>
          {availableEvents.map((item: any) => (
            <Grid size={{ xs: 12, md: 4 }} key={item.id}>
              <Card
                onClick={() => setTimelineOrder((prev) => [...prev, item])}
                sx={{
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {item.event}
                  </Typography>
                  <Typography variant="body2" color="primary.main" gutterBottom>
                    {item.date}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Stack direction="row" spacing={2} justifyContent="center">
        <Button
          variant="outlined"
          size="large"
          onClick={resetTimeline}
          sx={{ px: 4, py: 1.5, fontSize: "1rem", borderRadius: 3 }}
        >
          🔄 Reset
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={handleCheckAnswer}
          disabled={timelineOrder.length !== (content.items?.length || 0)}
          sx={{
            px: 6,
            py: 1.5,
            fontSize: "1.1rem",
            borderRadius: 3,
            background: "linear-gradient(45deg, #795548 30%, #A1887F 90%)",
            "&:hover": {
              background: "linear-gradient(45deg, #6D4C41 30%, #8D6E63 90%)",
            },
          }}
        >
          Check Timeline ({timelineOrder.length}/{content.items?.length || 0})
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
