import React from "react";
import { Add } from "@mui/icons-material";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Course } from "../../services/courseService";

interface ICourseDetailHeaderProps {
  isMobile: boolean;
  selectedCourse: Course | null;
  handleAddNewLesson: () => void;
}

export const CourseDetailHeader = ({
  isMobile,
  selectedCourse,
  handleAddNewLesson,
}: ICourseDetailHeaderProps) => {
  const navigate = useNavigate();
  return (
    <Stack
      direction={isMobile ? "column" : "row"}
      justifyContent="space-between"
      alignItems="center"
      gap={2}
      mb={4}
    >
      <Box>
        <Button onClick={() => navigate("/admin/courses")} sx={{ mb: 1 }}>
          ← Back to Courses
        </Button>
        <Typography variant="h4" fontWeight={700}>
          {selectedCourse?.title} - Lessons
        </Typography>
      </Box>
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={handleAddNewLesson}
        sx={{ color: "white" }}
      >
        Add Lesson
      </Button>
    </Stack>
  );
};
