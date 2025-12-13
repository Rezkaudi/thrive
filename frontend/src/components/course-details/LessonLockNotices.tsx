import React from "react";
import { Paper, Typography, Button } from "@mui/material";
import { Lock, LockOutlined } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { Lesson } from "./types";

interface Props {
  selectedLesson: Lesson;
  selectedCourseColors: { primary: string; secondary: string };
  selectedCourseId?: string | null;
  onEnroll: () => void;
}

export const LessonLockNotices: React.FC<Props> = ({
  selectedLesson,
  selectedCourseColors,
  selectedCourseId,
  onEnroll,
}) => {
  const navigate = useNavigate();

  if (
    selectedLesson.isLocked &&
    selectedLesson.lockReason === "Subscribe to unlock"
  ) {
    return (
      <Paper elevation={0} sx={{ textAlign: "center", py: 8, borderRadius: 4 }}>
        <Paper
          sx={{
            p: 6,
            maxWidth: 500,
            mx: "auto",
            background: `linear-gradient(135deg, #5C633A 0%, #D4BC8C 100%)`,
            color: "white",
            borderRadius: 4,
          }}
        >
          <LockOutlined sx={{ fontSize: 64, mb: 2 }} />
          <Typography variant="h5" fontWeight={600} gutterBottom>
            This Lesson is Locked
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, opacity: 0.9 }}>
            Subscribe to unlock all lessons and continue your learning journey
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => {
              navigate("/subscription", {
                state: {
                  courseId: selectedCourseId ?? undefined,
                  returnUrl: `/classroom`,
                },
              });
            }}
            sx={{
              backgroundColor: "white",
              color: "white",
              fontWeight: 600,
              px: 4,
              py: 1.5,
              "&:hover": { backgroundColor: "grey.100" },
            }}
          >
            Unlock with Subscription
          </Button>
        </Paper>
      </Paper>
    );
  }

  if (selectedLesson.isLocked) {
    return (
      <Paper elevation={0} sx={{ textAlign: "center", py: 8, borderRadius: 4 }}>
        <Lock sx={{ fontSize: 80, color: "text.secondary", mb: 3 }} />
        <Typography
          variant="h5"
          color="text.secondary"
          gutterBottom
          fontWeight={600}
        >
          This lesson is locked
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 4, maxWidth: 400, mx: "auto" }}
        >
          Complete the previous lesson to unlock this content and continue your
          learning journey
        </Typography>
      </Paper>
    );
  }

  return null;
};
