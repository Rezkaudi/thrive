import { Box, Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import { PublicProfile } from "../../types/public-profile.types";
import { CourseItem } from "./CourseItem";

// 1. Define colors in one place for easy maintenance


interface ICourseProgressSectionProps {
  courseProgress: PublicProfile["courseProgress"];
}

export const CourseProgressSection = ({ courseProgress }: ICourseProgressSectionProps) => {
  const hasCourses = courseProgress.length > 0;

  return (
    <Grid size={{ xs: 12, md: 6 }}>
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Course Progress
          </Typography>

          {hasCourses ? (
            <Stack spacing={3}>
              {courseProgress.slice(0, 4).map((course, index) => (
                <CourseItem
                  key={index}
                  title={course.courseTitle}
                  completed={course.completedLessons}
                  total={course.totalLessons}
                  percentage={course.progressPercentage}
                />
              ))}
            </Stack>
          ) : (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                No courses enrolled yet.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Grid>
  );
};