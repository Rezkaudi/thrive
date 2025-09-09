import React from "react";
import {
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Stack,
  Box,
  Paper,
  Skeleton,
  Chip,
} from "@mui/material";
import { ActivityFeed } from "../activity/ActivityFeed";
import {
  RecentActivity,
  CourseProgress,
} from "../../services/dashboardService";

interface ProgressSectionProps {
  courseProgress: CourseProgress[];
  recentActivity: RecentActivity[];
  userLevel: number;
  loading: boolean;
}

export const ProgressSection: React.FC<ProgressSectionProps> = ({
  courseProgress,
  recentActivity,
  userLevel,
  loading,
}) => {
  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h6" fontWeight={600}>
            Current Progress
          </Typography>
          <Chip label={`Level ${userLevel}`} color="primary" size="small" />
        </Stack>

        {loading ? (
          <>
            <Skeleton variant="rectangular" height={40} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={40} />
          </>
        ) : courseProgress && courseProgress.length > 0 ? (
          courseProgress.map((course, index) => (
            <Box key={course.courseId} sx={{ mb: index === 0 ? 3 : 0 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {course.courseTitle}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={2}>
                <LinearProgress
                  variant="determinate"
                  value={course.progressPercentage}
                  sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                  color={index === 0 ? "primary" : "secondary"}
                />
                <Typography variant="body2">
                  {course.progressPercentage}%
                </Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                {course.completedLessons} of {course.totalLessons} lessons
                completed
              </Typography>
            </Box>
          ))
        ) : (
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              No Progress yet
            </Typography>
          </Paper>
        )}
      </CardContent>

      <Card>
        <CardContent>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6" fontWeight={600}>
              Recent Activity
            </Typography>
          </Stack>
          <ActivityFeed
            activities={recentActivity || []}
            loading={loading}
            compact
            maxItems={5}
          />
        </CardContent>
      </Card>
    </Card>
  );
};
