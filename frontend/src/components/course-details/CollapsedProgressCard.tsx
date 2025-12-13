import React from "react";
import { Box, Paper, Stack, Tooltip, Typography } from "@mui/material";
import { TrendingUp } from "@mui/icons-material";

interface CollapsedProgressCardProps {
  selectedCourse?: any;
  selectedCourseColors: { primary: string; secondary: string };
  currentProgress: any;
  setSidebarCollapsed: (v: boolean) => void;
}

export const CollapsedProgressCard: React.FC<CollapsedProgressCardProps> = ({
  selectedCourse,
  selectedCourseColors,
  currentProgress,
  setSidebarCollapsed,
}) => {
  if (!selectedCourse || !currentProgress) return null;

  return (
    <Tooltip
      title={`${currentProgress.completionPercentage}% Complete (${currentProgress.completedLessons}/${currentProgress.totalLessons})`}
      placement="right"
      arrow
    >
      <Paper
        elevation={0}
        sx={{
          p: 1,
          marginTop: "10px",
          borderRadius: 2,
          background: `linear-gradient(135deg, ${selectedCourseColors.primary} 0%, ${selectedCourseColors.secondary} 100%)`,
          color: "white",
          cursor: "pointer",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            transform: "scale(1.02)",
            boxShadow: `0 4px 12px ${selectedCourseColors.primary}40`,
          },
        }}
        onClick={() => setSidebarCollapsed(false)}
      >
        <Stack alignItems="center" spacing={0.5}>
          <TrendingUp sx={{ fontSize: 16 }} />
          <Typography
            variant="caption"
            fontWeight={700}
            sx={{ fontSize: "0.7rem" }}
          >
            {currentProgress.completionPercentage}%
          </Typography>
          <Box
            sx={{
              width: "100%",
              height: 3,
              borderRadius: 1.5,
              bgcolor: "rgba(255,255,255,0.3)",
            }}
          >
            <Box
              sx={{
                width: `${currentProgress.completionPercentage}%`,
                height: "100%",
                borderRadius: 1.5,
                bgcolor: "white",
                transition: "width 0.3s ease-in-out",
              }}
            />
          </Box>
        </Stack>
      </Paper>
    </Tooltip>
  );
};

export default CollapsedProgressCard;
