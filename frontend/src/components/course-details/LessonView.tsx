import React from "react";
import { Paper, Typography, CircularProgress } from "@mui/material";
import { School } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { CourseLessonHeader } from "./CourseLessonHeader";
import { LessonLockNotices } from "./LessonLockNotices";
import { EnrollNoticeCard } from "./EnrollNoticeCard";
import { LessonContentRenderer } from "./LessonContentRenderer";
import { Lesson, Course } from "../../types/course-details.types";
import { getCourseColors, getLessonIcon } from "../../utils/course-details";

interface LessonViewProps {
  selectedLesson: Lesson | null;
  selectedCourse: Course | null;
  isEnrolled: boolean;
  onEnroll: () => void;
  onComplete: (score?: number) => void;
  isLoadingNextLesson?: boolean;
}

export const LessonView: React.FC<LessonViewProps> = ({
  selectedLesson,
  selectedCourse,
  isEnrolled,
  onEnroll,
  onComplete,
  isLoadingNextLesson = false,
}) => {
  const selectedCourseColors = getCourseColors(selectedCourse?.type || "");

  // Loading state when completing lesson and fetching next
  if (isLoadingNextLesson) {
    return (
      <Paper
        elevation={0}
        sx={{
          textAlign: "center",
          py: 12,
          borderRadius: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
        }}
      >
        <CircularProgress
          size={60}
          sx={{ color: selectedCourseColors.primary || "primary.main" }}
        />
        <Typography variant="h5" color="text.secondary" fontWeight={600}>
          Loading next lesson...
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Great job! Preparing your next lesson
        </Typography>
      </Paper>
    );
  }

  if (!selectedLesson) {
    return (
      <Paper
        elevation={0}
        sx={{ textAlign: "center", py: 12, borderRadius: 4 }}
      >
        <School sx={{ fontSize: 100, color: "text.secondary", mb: 3 }} />
        <Typography
          variant="h4"
          color="text.secondary"
          gutterBottom
          fontWeight={600}
        >
          Select a lesson to begin
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Choose from the lessons in the sidebar to start learning
        </Typography>
      </Paper>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={selectedLesson.id}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <CourseLessonHeader
          selectedLesson={selectedLesson}
          selectedCourseColors={selectedCourseColors}
          getLessonTypeIcon={getLessonIcon}
        />

        {/* Content Logic */}
        {selectedLesson.isLocked ? (
          <LessonLockNotices
            selectedLesson={selectedLesson}
            selectedCourseColors={selectedCourseColors}
            selectedCourseId={selectedCourse?.id ?? null}
            onEnroll={onEnroll}
          />
        ) : !isEnrolled ? (
          <EnrollNoticeCard
            selectedCourseColors={selectedCourseColors}
            onEnroll={onEnroll}
          />
        ) : (
          <LessonContentRenderer
            selectedLesson={selectedLesson}
            onCompleteLesson={onComplete}
            selectedCourseColors={selectedCourseColors}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
};
