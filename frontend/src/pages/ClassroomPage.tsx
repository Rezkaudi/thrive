import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Card,
  Grid,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  Stack,
  Button,
  Paper,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  Alert,
  Avatar,
  Tooltip,
} from "@mui/material";
import {
  PlayCircle,
  CheckCircle,
  School,
  Star,
  AccessTime,
  TrendingUp,
  AutoAwesome,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

interface Course {
  id: string;
  title: string;
  description: string;
  type: string;
  icon: string;
  isActive: boolean;
  freeLessonCount?: number;
}

interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  lessonType: "VIDEO" | "PDF" | "KEYWORDS" | "QUIZ" | "SLIDES";
  contentUrl?: string;
  contentData?: any;
  pointsReward: number;
  requiresReflection: boolean;
  passingScore?: number;
  isCompleted?: boolean;
  completedAt?: string;
  isLocked?: boolean;
  lockReason?: string;
  keywords?: Array<{
    id: string;
    englishText: string;
    japaneseText: string;
    englishAudioUrl?: string;
    japaneseAudioUrl?: string;
  }>;
}

interface Enrollment {
  id: string;
  courseId: string;
  enrolledAt: string;
  course?: Course;
}

interface CourseProgress {
  courseId: string;
  completedLessons: number;
  totalLessons: number;
  completionPercentage: number;
}

// Global color scheme definitions
const gradientColors = {
  JAPAN_IN_CONTEXT: {
    primary: "#5C633A",
    secondary: "#D4BC8C",
    accent: "#D4BC8C",
  },
  JLPT_IN_CONTEXT: {
    primary: "#A6531C",
    secondary: "#7ED4D0",
    accent: "#6DD6CE",
  },
};

// Helper function to get colors for a course type
const getCourseColors = (courseType: string) => {
  return (
    gradientColors[courseType as keyof typeof gradientColors] ||
    gradientColors.JAPAN_IN_CONTEXT
  );
};

const CourseCard = ({
  course,
  onClick,
  isEnrolled,
  progress = 0,
  lessonCount = 0,
  completedCount = 0,
}: {
  course: Course;
  onClick: () => void;
  isEnrolled: boolean;
  progress?: number;
  lessonCount?: number;
  completedCount?: number;
}) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const isCompleted = progress === 100;
  const theme = useTheme();

  const colors = getCourseColors(course.type);

  return (
    <motion.div
      whileHover={{ y: -12, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <Card
        sx={{
          cursor: "pointer",
          height: "100%",
          position: "relative",
          overflow: "hidden",
          borderRadius: 2,
          boxShadow: isEnrolled
            ? `0 8px 32px ${colors.primary}20`
            : "0 4px 20px rgba(0,0,0,0.08)",
          border: isCompleted ? `2px solid ${colors.primary}` : "none",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            boxShadow: `0 12px 40px ${colors.primary}30`,
          },
        }}
        onClick={onClick}
      >
        {/* Header with gradient and course icon */}
        <Box
          sx={{
            height: 180,
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative background pattern */}
          <Box
            sx={{
              position: "absolute",
              top: -20,
              right: -20,
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.1)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: -30,
              left: -30,
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
            }}
          />

          {/* Course Icon */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Typography
              variant="h1"
              sx={{ fontSize: "4rem", opacity: 0.9, zIndex: 2 }}
            >
              {course.icon}
            </Typography>
          </motion.div>

          {/* Status badges */}
          <Stack
            direction="row"
            spacing={1}
            sx={{ position: "absolute", top: 16, right: 16 }}
          >
            {isCompleted && (
              <Tooltip title="Course Completed!" arrow>
                <Chip
                  icon={<AutoAwesome />}
                  label="Completed"
                  size="small"
                  sx={{
                    bgcolor: "rgba(255, 255, 255, 0.95)",
                    color: colors.primary,
                    fontWeight: 600,
                    "& .MuiChip-icon": { color: colors.primary },
                  }}
                />
              </Tooltip>
            )}
            {isEnrolled && !isCompleted && (
              <Chip
                label="In Progress"
                size="small"
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.9)",
                  color: colors.primary,
                  fontWeight: 500,
                }}
              />
            )}
          </Stack>

          {/* Progress indicator at bottom */}
          {isEnrolled && (
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 6,
                bgcolor: "rgba(255, 255, 255, 0.3)",
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                style={{
                  height: "100%",
                  background: "rgba(255, 255, 255, 0.9)",
                  borderRadius: "0 3px 3px 0",
                }}
              />
            </Box>
          )}
        </Box>

        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="h5" gutterBottom fontWeight={700}
            sx={{
              mb: 1,
              lineHeight: 1.6,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}


          >
            {course.title}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 3,
              lineHeight: 1.6,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {course.description}
          </Typography>

          {/* Progress Information - Enhanced Layout */}
          {isEnrolled && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                mb: 3,
                bgcolor: `${colors.primary}08`,
                borderRadius: 2,
                border: `1px solid ${colors.primary}20`,
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={1}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight={500}
                >
                  Learning Progress
                </Typography>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <TrendingUp sx={{ fontSize: 16, color: colors.primary }} />
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    color={colors.primary}
                  >
                    {progress}%
                  </Typography>
                </Stack>
              </Stack>

              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: `${colors.primary}20`,
                  "& .MuiLinearProgress-bar": {
                    bgcolor: colors.primary,
                    borderRadius: 4,
                  },
                }}
              />

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mt={1}
              >
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <CheckCircle sx={{ fontSize: 16, color: "success.main" }} />
                  <Typography variant="caption" color="text.secondary">
                    {completedCount} completed
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <School sx={{ fontSize: 16, color: "text.secondary" }} />
                  <Typography variant="caption" color="text.secondary">
                    {lessonCount} total lessons
                  </Typography>
                </Stack>
              </Stack>
            </Paper>
          )}

          {/* Action Button */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            {isEnrolled ? (
              <>
                <Stack direction="row" spacing={1}>
                  <Chip
                    label={isCompleted ? "Complete" : "In Progress"}
                    size="small"
                    color={isCompleted ? "success" : "primary"}
                    variant={isCompleted ? "filled" : "outlined"}
                    icon={isCompleted ? <Star sx={{ fontSize: 16 }} /> : <AccessTime sx={{ fontSize: 16 }} />}
                  />
                </Stack>
                <Button
                  endIcon={isCompleted ? <Star /> : <PlayCircle />}
                  variant={isCompleted ? "outlined" : "contained"}
                  sx={{
                    borderRadius: 3,
                    textTransform: "none",
                    fontWeight: 600,
                    px: 3,
                    ...(!isCompleted && {
                      color: "white",
                      background: `linear-gradient(45deg, ${colors.primary} 30%, ${colors.accent} 90%)`,
                      "&:hover": {
                        background: `linear-gradient(45deg, ${colors.primary} 60%, ${colors.accent} 100%)`,
                      },
                    }),
                  }}
                >
                  {isCompleted ? "Review Course" : "Continue Learning"}
                </Button>
              </>
            ) : (
              <Button
                fullWidth
                variant="contained"
                size="large"
                sx={{
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 600,
                  py: 1.5,
                  color: "white",
                  background: `linear-gradient(45deg, ${colors.primary} 30%, ${colors.accent} 90%)`,
                  "&:hover": {
                    background: `linear-gradient(45deg, ${colors.primary} 60%, ${colors.accent} 100%)`,
                  },
                }}
              >
                Explore Course
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const ClassroomPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);
  const [enrollDialog, setEnrollDialog] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesRes, enrollmentsRes] = await Promise.all([
        api.get("/courses"),
        api.get("/courses/my-enrollments"),
      ]);
      setCourses(coursesRes.data);
      setEnrollments(enrollmentsRes.data);

      await fetchCourseProgress(enrollmentsRes.data);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      setError("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseProgress = async (enrollments: Enrollment[]) => {
    try {
      const progressPromises = enrollments.map(async (enrollment) => {
        const response = await api.get(
          `/courses/${enrollment.courseId}/lessons`
        );
        const lessons = response.data;
        const completedLessons = lessons.filter(
          (l: Lesson) => l.isCompleted
        ).length;
        const totalLessons = lessons.length;
        const completionPercentage =
          totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0;

        return {
          courseId: enrollment.courseId,
          completedLessons,
          totalLessons,
          completionPercentage,
        };
      });

      const progressData = await Promise.all(progressPromises);
      setCourseProgress(progressData);
    } catch (error) {
      console.error("Failed to fetch course progress:", error);
    }
  };

  const handleEnroll = async (course: Course) => {
    try {
      await api.post(`/courses/${course.id}/enroll`);
      // await fetchData();
      // setEnrollDialog(null);
      navigate(`/classroom/${course.id}`)
    } catch (error: any) {
      if (error.response?.status === 409) {
        navigate(`/classroom/${course.id}`)
      }
    }
  };

  const isEnrolled = (courseId: string) => {
    return enrollments.some((e) => e.courseId === courseId);
  };

  const getCourseProgress = (courseId: string) => {
    const progress = courseProgress.find((p) => p.courseId === courseId);
    return (
      progress || {
        completedLessons: 0,
        totalLessons: 0,
        completionPercentage: 0,
      }
    );
  };

  // Loading state with improved skeletons
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
        <Stack spacing={4}>
          <Box>
            <Skeleton variant="text" width={300} height={50} sx={{ mb: 2 }} />
            <Skeleton variant="text" width={isMobile ? 320 : 500} height={30} />
          </Box>
          <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
            {[1, 2].map((i) => (
              <Grid size={{ xs: 12, md: 6 }} key={i}>
                <Card sx={{ height: 400, borderRadius: 4 }}>
                  <Skeleton variant="rectangular" height={180} />
                  <CardContent>
                    <Skeleton variant="text" width="80%" height={32} />
                    <Skeleton
                      variant="text"
                      width="100%"
                      height={20}
                      sx={{ mt: 1 }}
                    />
                    <Skeleton variant="text" width="100%" height={20} />
                    <Box sx={{ mt: 3 }}>
                      <Skeleton
                        variant="rectangular"
                        height={40}
                        sx={{ borderRadius: 2 }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Container>
    );
  }

  // Course selection view
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Header with improved typography and spacing */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            variant="h2"
            gutterBottom
            fontWeight={800}
            sx={{
              background: "linear-gradient(135deg, #5C633A 0%, #D4BC8C 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 2,
            }}
          >
            Welcome to the Classroom
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              mb: 4,
              maxWidth: 600,
              mx: "auto",
              lineHeight: 1.6,
            }}
          >
            All the tools to Thrive at your fingertips . . .
          </Typography>
        </Box>
      </motion.div>

      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
        {courses.map((course, index) => {
          const progress = getCourseProgress(course.id);
          return (
            <Grid size={{ xs: 12, md: 6 }} key={course.id}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <CourseCard
                  course={course}
                  isEnrolled={isEnrolled(course.id)}
                  progress={progress.completionPercentage}
                  lessonCount={progress.totalLessons}
                  completedCount={progress.completedLessons}
                  onClick={() => {
                    if (isEnrolled(course.id)) {
                      navigate(`/classroom/${course.id}`)
                    } else {
                      setEnrollDialog(course);
                      // navigate(`/classroom/${course.id}`)
                    }
                  }}
                />
              </motion.div>
            </Grid>
          );
        })}
      </Grid>

      {/* Enhanced Enrollment Dialog */}
      <Dialog
        open={!!enrollDialog}
        onClose={() => setEnrollDialog(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 4 },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                background: enrollDialog
                  ? `linear-gradient(135deg, ${getCourseColors(enrollDialog.type).primary
                  } 0%, ${getCourseColors(enrollDialog.type).secondary
                  } 100%)`
                  : "primary.main",
              }}
            >
              {enrollDialog?.icon}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight={600}>
                Enroll in {enrollDialog?.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Start your learning journey today
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={3}>
            {enrollDialog?.description.split('\n').map((item, index) =>
              <Typography key={index} variant="body1" sx={{ lineHeight: 1.6 }}>
                {item}
              </Typography>
            )}

            <Alert
              severity="success"
              sx={{
                borderRadius: 2,
                "& .MuiAlert-icon": {
                  fontSize: 24,
                },
              }}
            >
              <Typography variant="body2" fontWeight={500}>
                🎉 This course is completely free! Enroll now to start
                learning and earning points.
              </Typography>
            </Alert>

            <Paper
              elevation={0}
              sx={{ p: 3, bgcolor: "background.default", borderRadius: 2 }}
            >
              <Typography
                variant="subtitle2"
                gutterBottom
                color="text.secondary"
              >
                What you'll get:
              </Typography>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CheckCircle color="success" sx={{ fontSize: 20 }} />
                  <Typography variant="body2">
                    Interactive lessons and quizzes
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CheckCircle color="success" sx={{ fontSize: 20 }} />
                  <Typography variant="body2">
                    Track your learning progress
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CheckCircle color="success" sx={{ fontSize: 20 }} />
                  <Typography variant="body2">
                    Earn points and achievements
                  </Typography>
                </Stack>
              </Stack>
            </Paper>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() => setEnrollDialog(null)}
            sx={{ borderRadius: 2 }}
          >
            Maybe Later
          </Button>
          <Button
            variant="contained"
            onClick={() => enrollDialog && handleEnroll(enrollDialog)}
            sx={{
              borderRadius: 2,
              px: 4,
              background: enrollDialog
                ? `linear-gradient(135deg, ${getCourseColors(enrollDialog.type).primary
                } 0%, ${getCourseColors(enrollDialog.type).secondary} 100%)`
                : "linear-gradient(135deg, #5C633A 0%, #D4BC8C 100%)",
              "&:hover": {
                background: enrollDialog
                  ? `linear-gradient(135deg, ${getCourseColors(enrollDialog.type).primary
                  } 20%, ${getCourseColors(enrollDialog.type).secondary
                  } 120%)`
                  : "linear-gradient(135deg, #5C633A 20%, #D4BC8C 120%)",
              },
            }}
          >
            Enroll Now
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );

};