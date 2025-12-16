import React from "react";
import { Paper, Typography, Button } from "@mui/material";
import { Lock } from "@mui/icons-material";

interface Props {
  selectedCourseColors: { primary: string; secondary: string };
  onEnroll: () => void;
}

export const EnrollNoticeCard: React.FC<Props> = ({
  selectedCourseColors,
  onEnroll,
}) => {
  return (
    <Paper elevation={0} sx={{ textAlign: "center", py: 8, borderRadius: 4 }}>
      <Lock sx={{ fontSize: 80, color: "text.secondary", mb: 3 }} />
      <Typography
        variant="h5"
        color="text.secondary"
        gutterBottom
        fontWeight={600}
      >
        Enroll to access this content
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mb: 4, maxWidth: 400, mx: "auto" }}
      >
        Join this course to unlock all lessons and start your learning journey
      </Typography>
      <Button
        variant="contained"
        size="large"
        onClick={onEnroll}
        sx={{
          borderRadius: 3,
          px: 4,
          background: `linear-gradient(135deg, ${selectedCourseColors.primary} 0%, ${selectedCourseColors.secondary} 100%)`,
        }}
      >
        Enroll Now
      </Button>
    </Paper>
  );
};
