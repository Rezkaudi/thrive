import React from "react";
import { Paper, Stack, Typography, Chip } from "@mui/material";
import { EmojiEvents, CheckCircle } from "@mui/icons-material";
import { Lesson } from "./types";

interface Props {
  selectedLesson: Lesson;
  selectedCourseColors: { primary: string; secondary: string };
  getLessonTypeIcon: (
    lessonType: string,
    size?: "small" | "medium"
  ) => React.ReactElement;
}

export const CourseLessonHeader: React.FC<Props> = ({
  selectedLesson,
  selectedCourseColors,
  getLessonTypeIcon,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        mb: 4,
        borderRadius: 4,
        background: `linear-gradient(135deg, ${selectedCourseColors.primary} 0%, ${selectedCourseColors.secondary} 100%)`,
        color: "white",
      }}
    >
      <Stack spacing={2}>
        <Typography variant="h3" fontWeight={700}>
          {selectedLesson.title}
        </Typography>

        <Stack direction="row" gap={2} alignItems="center" flexWrap="wrap">
          <Chip
            icon={getLessonTypeIcon(selectedLesson.lessonType)}
            label={
              selectedLesson.lessonType === "VIDEO"
                ? "Video Lesson"
                : selectedLesson.lessonType === "PDF"
                ? "PDF Resource"
                : selectedLesson.lessonType === "QUIZ"
                ? "Interactive Quiz"
                : selectedLesson.lessonType === "SLIDES"
                ? "Interactive Slides"
                : "Keywords Practice"
            }
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              color: "white",
              "& .MuiChip-icon": { color: "white" },
            }}
          />

          {selectedLesson.pointsReward > 0 && (
            <Chip
              icon={<EmojiEvents />}
              label={`+${selectedLesson.pointsReward} points`}
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                color: "white",
                "& .MuiChip-icon": { color: "white" },
              }}
            />
          )}

          {selectedLesson.isCompleted && (
            <Chip
              icon={<CheckCircle />}
              label="Completed"
              sx={{
                bgcolor: "rgba(76, 175, 80, 0.2)",
                color: "white",
                "& .MuiChip-icon": { color: "white" },
              }}
            />
          )}
        </Stack>

        <Typography variant="body1" sx={{ opacity: 0.9, lineHeight: 1.6 }}>
          {selectedLesson.description}
        </Typography>
      </Stack>
    </Paper>
  );
};
