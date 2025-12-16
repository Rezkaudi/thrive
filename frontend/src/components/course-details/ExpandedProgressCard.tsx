import React from "react";
import {
  Box,
  Collapse,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import {
  CheckCircle,
  ExpandLess,
  School,
  TrendingUp,
} from "@mui/icons-material";

interface ExpandedProgressCardProps {
  currentProgress: any;
  progressExpanded: boolean;
  setProgressExpanded: (v: boolean) => void;
  selectedCourseColors: { primary: string; secondary: string };
}

export const ExpandedProgressCard: React.FC<ExpandedProgressCardProps> = ({
  currentProgress,
  progressExpanded,
  setProgressExpanded,
  selectedCourseColors,
}) => {
  if (!currentProgress) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        overflow: "hidden",
        borderRadius: 3,
        background: `linear-gradient(135deg, ${selectedCourseColors.primary} 0%, ${selectedCourseColors.secondary} 100%)`,
        color: "white",
      }}
    >
      <Box
        sx={{
          p: 2,
          cursor: "pointer",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            bgcolor: "rgba(255,255,255,0.1)",
          },
        }}
        onClick={() => setProgressExpanded(!progressExpanded)}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <TrendingUp sx={{ fontSize: 18 }} />
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Progress
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h6" fontWeight={700}>
              {currentProgress.completionPercentage}%
            </Typography>
            <Box
              sx={{
                transition: "transform 0.2s ease-in-out",
                transform: progressExpanded ? "rotate(0deg)" : "rotate(-90deg)",
              }}
            >
              <ExpandLess />
            </Box>
          </Stack>
        </Stack>
      </Box>

      <Collapse in={progressExpanded}>
        <Box sx={{ px: 2, pb: 2 }}>
          <Box sx={{ position: "relative", mb: 2 }}>
            <LinearProgress
              variant="determinate"
              value={currentProgress.completionPercentage}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: "rgba(255,255,255,0.2)",
                "& .MuiLinearProgress-bar": {
                  bgcolor: "white",
                  borderRadius: 4,
                  transition: "width 0.3s ease-in-out",
                },
              }}
            />
          </Box>

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <CheckCircle sx={{ fontSize: 16 }} />
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                {currentProgress.completedLessons} done
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <School sx={{ fontSize: 16 }} />
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                {currentProgress.totalLessons} total
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default ExpandedProgressCard;
