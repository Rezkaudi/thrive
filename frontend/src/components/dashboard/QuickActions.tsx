import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Paper,
  IconButton,
  Box,
} from "@mui/material";
import { ArrowForward } from "@mui/icons-material";
import {
  CourseProgress,
  UpcomingSession,
} from "../../services/dashboardService";

interface QuickActionsProps {
  courseProgress: CourseProgress[];
  upcomingSessions: UpcomingSession[];
  onNavigate: (path: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  courseProgress,
  upcomingSessions,
  onNavigate,
}) => {
  const hasProgress = courseProgress && courseProgress.length > 0;
  const hasUpcomingSessions = upcomingSessions && upcomingSessions.length > 0;

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Quick Actions
        </Typography>
        <Stack spacing={2}>
          <Paper
            sx={{
              p: 2,
              cursor: "pointer",
              "&:hover": { bgcolor: "action.hover" },
            }}
            onClick={() => onNavigate("/classroom")}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Typography variant="body1" fontWeight={500}>
                  Continue Learning
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {hasProgress
                    ? `Next lesson in ${courseProgress[0].courseTitle}`
                    : "Start your first lesson"}
                </Typography>
              </Box>
              <IconButton color="primary">
                <ArrowForward />
              </IconButton>
            </Stack>
          </Paper>

          <Paper
            sx={{
              p: 2,
              cursor: "pointer",
              "&:hover": { bgcolor: "action.hover" },
            }}
            onClick={() => onNavigate("/calendar")}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Typography variant="body1" fontWeight={500}>
                  Book Session
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {hasUpcomingSessions
                    ? `${upcomingSessions.length} upcoming`
                    : "Practice speaking"}
                </Typography>
              </Box>
              <IconButton color="secondary">
                <ArrowForward />
              </IconButton>
            </Stack>
          </Paper>
        </Stack>
      </CardContent>
    </Card>
  );
};
