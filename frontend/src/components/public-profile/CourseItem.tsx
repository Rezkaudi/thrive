import { Box, LinearProgress, Stack, Typography } from "@mui/material";

const PROGRESS_COLORS = {
  complete: "#483C32",
  active: "#5C633A",
  background: "action.hover",
};

interface CourseItemProps {
  title: string;
  completed: number;
  total: number;
  percentage: number;
}

export const CourseItem = ({
  title,
  completed,
  total,
  percentage,
}: CourseItemProps) => {
  const isComplete = percentage === 100;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" mb={1}>
        <Typography variant="body2" fontWeight={500}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {completed}/{total}
        </Typography>
      </Stack>

      <LinearProgress
        variant="determinate"
        value={percentage}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: PROGRESS_COLORS.background,
          "& .MuiLinearProgress-bar": {
            borderRadius: 4,
            backgroundColor: isComplete
              ? PROGRESS_COLORS.complete
              : PROGRESS_COLORS.active,
          },
        }}
      />

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 0.5, display: "block" }}
      >
        {percentage}% Complete
      </Typography>
    </Box>
  );
};
