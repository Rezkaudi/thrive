import React from "react";
import { Grid, Alert, Skeleton, Card, CardContent, Box } from "@mui/material";
import { motion } from "framer-motion";
import { Course, CourseProgress } from "../../types/course.types";
import { CourseCard } from "./CourseCard";

interface CourseGridProps {
  courses: Course[];
  loading: boolean;
  error: string | null;
  enrollments: string[];
  progressData: CourseProgress[];
  onCourseClick: (course: Course) => void;
  isMobile: boolean;
}

export const CourseGrid = ({
  courses,
  loading,
  error,
  enrollments,
  progressData,
  onCourseClick,
  isMobile,
}: CourseGridProps) => {
  if (loading) {
    const skeletonCount = isMobile ? 1 : 3;

    return (
      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <Grid size={{ xs: 12, md: 4 }} key={index} sx={{ display: "flex" }}>
            <Card
              sx={{
                width: "100%",
                height: "100%",
                minHeight: 420,
                borderRadius: 1,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Skeleton variant="rectangular" height={180} />
              <CardContent sx={{ p: { xs: 2, sm: 3 }, flex: 1 }}>
                <Skeleton variant="text" width="75%" height={40} />
                <Skeleton
                  variant="text"
                  width="100%"
                  height={20}
                  sx={{ mt: 1 }}
                />
                <Skeleton variant="text" width="85%" height={20} />
                <Box sx={{ mt: 4 }}>
                  <Skeleton
                    variant="rectangular"
                    height={48}
                    sx={{ borderRadius: 2 }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 4, borderRadius: 3 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
      {courses.map((course, index) => {
        const progress = progressData.find((p) => p.courseId === course.id) || {
          completedLessons: 0,
          totalLessons: 0,
          completionPercentage: 0,
        };

        return (
          <Grid size={{ xs: 12, md: 4 }} key={course.id} sx={{ display: "flex" }}>
            <motion.div
              style={{ width: "100%", height: "100%" }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <CourseCard
                course={course}
                isEnrolled={enrollments.includes(course.id)}
                progress={progress.completionPercentage}
                lessonCount={progress.totalLessons}
                completedCount={progress.completedLessons}
                onClick={() => onCourseClick(course)}
              />
            </motion.div>
          </Grid>
        );
      })}
    </Grid>
  );
};
