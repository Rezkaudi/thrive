// frontend/src/pages/ClassroomPage.tsx - Enhanced version with menu toggle and small icons
import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Container,
  Card,
  Grid,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Chip,
  LinearProgress,
  Stack,
  Button,
  Paper,
  Drawer,
  IconButton,
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
  Collapse,
} from "@mui/material";
import {
  PlayCircle,
  CheckCircle,
  Lock,
  LockOutlined,
  Menu as MenuIcon,
  Close,
  VideoLibrary,
  PictureAsPdf,
  School,
  EmojiEvents,
  ArrowBack,
  Translate,
  Quiz as QuizIcon,
  Slideshow,
  Star,
  AccessTime,
  TrendingUp,
  AutoAwesome,
  ExpandLess,
  ExpandMore,
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { subscriptionService } from "../services/subscriptionService";
import { KeywordFlashcards } from "../components/classroom/KeywordFlashcards";
import { Quiz } from "../components/classroom/Quiz";
import { InteractiveSlides } from "../components/classroom/InteractiveSlides";
import { fetchDashboardData } from "../store/slices/dashboardSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";

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

// Helper function to get lesson type icon
const getLessonTypeIcon = (lessonType: string, size: "small" | "medium" = "medium") => {
  const iconSize = size === "small" ? 18 : 24;

  switch (lessonType) {
    case "VIDEO":
      return <VideoLibrary sx={{ fontSize: iconSize }} />;
    case "PDF":
      return <PictureAsPdf sx={{ fontSize: iconSize }} />;
    case "QUIZ":
      return <QuizIcon sx={{ fontSize: iconSize }} />;
    case "SLIDES":
      return <Slideshow sx={{ fontSize: iconSize }} />;
    case "KEYWORDS":
      return <Translate sx={{ fontSize: iconSize }} />;
    default:
      return <School sx={{ fontSize: iconSize }} />;
  }
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
          borderRadius: 4,
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

        <CardContent sx={{ p: 3 }}>
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

const VideoPlayer = ({ url }: { url: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && (e.key === "s" || e.key === "a")) ||
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && e.key === "I") ||
        (e.ctrlKey && e.shiftKey && e.key === "C") ||
        (e.ctrlKey && e.key === "u")
      ) {
        e.preventDefault();
        return false;
      }
    };

    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    video.addEventListener("contextmenu", handleContextMenu);
    video.addEventListener("dragstart", handleDragStart);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      video.removeEventListener("contextmenu", handleContextMenu);
      video.removeEventListener("dragstart", handleDragStart);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <Paper
      elevation={3}
      sx={{
        position: "relative",
        paddingTop: "56.25%",
        bgcolor: "black",
        borderRadius: 3,
        overflow: "hidden",
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <video
        ref={videoRef}
        controls
        controlsList="nodownload noremoteplayback"
        disablePictureInPicture
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "auto",
        }}
        src={url}
        onLoadStart={() => {
          if (videoRef.current) {
            videoRef.current.removeAttribute("download");
          }
        }}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      />
    </Paper>
  );
};

const PDFViewer = ({ url }: { url: string }) => {
  return (
    <Paper
      elevation={3}
      sx={{
        position: "relative",
        height: "80vh",
        bgcolor: "grey.100",
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      <iframe
        src={`${url}#toolbar=0`}
        style={{
          width: "100%",
          height: "100%",
          border: "none",
        }}
        title="PDF Viewer"
      />
    </Paper>
  );
};

export const ClassroomPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [enrollDialog, setEnrollDialog] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [progressExpanded, setProgressExpanded] = useState(true);
  const { hasActiveSubscription } = useSelector((state: RootState) => state.auth);

  const dispatch = useDispatch<AppDispatch>();

  // Get dynamic colors based on selected course
  const selectedCourseColors = selectedCourse
    ? getCourseColors(selectedCourse.type)
    : getCourseColors("JAPAN_IN_CONTEXT");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchLessons(selectedCourse.id);
    }
  }, [selectedCourse]);


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

  const fetchLessons = async (courseId: string) => {
    try {
      setLessonLoading(true);
      const response = await api.get(`/courses/${courseId}/lessons`);

      const lessonsWithLocks = calculateLessonLocks(response.data, selectedCourse);
      setLessons(lessonsWithLocks);

      const firstIncompleteUnlocked = lessonsWithLocks.find(
        (l: Lesson) => !l.isCompleted && !l.isLocked
      );
      if (firstIncompleteUnlocked) {
        setSelectedLesson(firstIncompleteUnlocked);
      } else {
        const firstLesson = lessonsWithLocks.find((l: Lesson) => l.order === 1);
        if (firstLesson) {
          setSelectedLesson(firstLesson);
        }
      }
    } catch (error) {
      console.error("Failed to fetch lessons:", error);
    } finally {
      setLessonLoading(false);
    }
  };

  const handleEnroll = async (course: Course) => {
    try {
      await api.post(`/courses/${course.id}/enroll`);
      await fetchData();
      setEnrollDialog(null);
      setSelectedCourse(course);
    } catch (error: any) {
      if (error.response?.status === 409) {
        setSelectedCourse(course);
      }
    }
  };

  const handleCompleteLesson = async (quizScore?: number) => {
    if (!selectedLesson) return;

    try {
      const requestData: any = {};

      if (selectedLesson.lessonType === "QUIZ" && quizScore !== undefined) {
        requestData.quizScore = quizScore;
      }

      await api.post(
        `/courses/lessons/${selectedLesson.id}/complete`,
        requestData
      );

      await fetchLessons(selectedCourse!.id);
      await fetchCourseProgress(enrollments);
      dispatch(fetchDashboardData());

      const currentIndex = lessons.findIndex((l) => l.id === selectedLesson.id);
      const nextLessons = lessons.slice(currentIndex + 1);
      const nextAvailableLesson = nextLessons.find((l) => !l.isLocked);

      if (nextAvailableLesson) {
        setSelectedLesson(nextAvailableLesson);
      }
    } catch (error) {
      console.error("Failed to complete lesson:", error);
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

  const calculateLessonLocks = (
    lessons: Lesson[],
    course: Course | null
  ): Lesson[] => {
    if (!lessons.length || !course) return lessons;

    const sortedLessons = [...lessons].sort((a, b) => a.order - b.order);
    const freeLessonCount = course.freeLessonCount || 0;

    return sortedLessons.map((lesson, index) => {
      let isLocked = false;
      let lockReason = '';

      if (hasActiveSubscription) {
        // If user has subscription, only lock if previous lesson isn't completed
        if (index > 0) {
          const previousLesson = sortedLessons[index - 1];
          isLocked = !previousLesson.isCompleted;
          lockReason = isLocked ? 'Complete previous lesson to unlock' : '';
        }
      } else {
        // If no subscription, lock lessons beyond free limit or if previous isn't completed
        if (index >= freeLessonCount) {
          isLocked = true;
          lockReason = 'Subscribe to unlock';
        } else if (index > 0) {
          const previousLesson = sortedLessons[index - 1];
          isLocked = !previousLesson.isCompleted;
          lockReason = isLocked ? 'Complete previous lesson to unlock' : '';
        }
      }

      return { ...lesson, isLocked, lockReason };
    });
  };

  const handleLockedLessonClick = (lesson: Lesson) => {
    if (lesson.lockReason === 'Subscribe to unlock') {
      setShowSubscriptionModal(true);
    }
  };

  const LessonSidebar = () => {
    const currentProgress = selectedCourse
      ? getCourseProgress(selectedCourse.id)
      : null;

    return (
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header with collapse toggle */}
        <Box sx={{
          p: sidebarCollapsed ? 1 : 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          transition: 'padding 0.3s ease-in-out'
        }}>
          <Stack
            direction={sidebarCollapsed ? "column" : "row"}
            justifyContent="space-between"
            alignItems="center"
            spacing={sidebarCollapsed ? 1 : 0}
            mb={sidebarCollapsed ? 0 : 1}
          >
            {/* Course Avatar/Icon for collapsed state */}
            {sidebarCollapsed && selectedCourse && (
              <Tooltip title={selectedCourse.title} placement="right" arrow>
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    background: `linear-gradient(135deg, ${selectedCourseColors.primary} 0%, ${selectedCourseColors.secondary} 100%)`,
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: `0 4px 12px ${selectedCourseColors.primary}40`
                    }
                  }}
                  onClick={() => setSidebarCollapsed(false)}
                >
                  {selectedCourse.icon}
                </Avatar>
              </Tooltip>
            )}

            {!sidebarCollapsed && (
              <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1.1rem' }}>
                {selectedCourse?.title || "Select a Course"}
              </Typography>
            )}

            <Stack direction={sidebarCollapsed ? "column" : "row"} spacing={0.5}>
              {!isMobile && (
                <Tooltip
                  title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                  placement={sidebarCollapsed ? "right" : "top"}
                  arrow
                >
                  <IconButton
                    size="small"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    sx={{
                      bgcolor: selectedCourseColors.primary + '20',
                      color: selectedCourseColors.primary,
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        bgcolor: selectedCourseColors.primary + '30',
                        transform: 'scale(1.05)',
                      }
                    }}
                  >
                    {sidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
                  </IconButton>
                </Tooltip>
              )}
              {isMobile && (
                <IconButton size="small" onClick={() => setDrawerOpen(false)}>
                  <Close />
                </IconButton>
              )}
            </Stack>
          </Stack>

          {/* Collapsed Progress Indicator */}
          {sidebarCollapsed && selectedCourse && isEnrolled(selectedCourse.id) && currentProgress && (
            <Tooltip
              title={`${currentProgress.completionPercentage}% Complete (${currentProgress.completedLessons}/${currentProgress.totalLessons})`}
              placement="right"
              arrow
            >
              <Paper
                elevation={0}
                sx={{
                  p: 1,
                  marginTop: "10px",
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${selectedCourseColors.primary} 0%, ${selectedCourseColors.secondary} 100%)`,
                  color: "white",
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.02)',
                    boxShadow: `0 4px 12px ${selectedCourseColors.primary}40`
                  }
                }}
                onClick={() => setSidebarCollapsed(false)}
              >
                <Stack alignItems="center" spacing={0.5}>
                  <TrendingUp sx={{ fontSize: 16 }} />
                  <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.7rem' }}>
                    {currentProgress.completionPercentage}%
                  </Typography>
                  <Box sx={{ width: '100%', height: 3, borderRadius: 1.5, bgcolor: 'rgba(255,255,255,0.3)' }}>
                    <Box
                      sx={{
                        width: `${currentProgress.completionPercentage}%`,
                        height: '100%',
                        borderRadius: 1.5,
                        bgcolor: 'white',
                        transition: 'width 0.3s ease-in-out'
                      }}
                    />
                  </Box>
                </Stack>
              </Paper>
            </Tooltip>
          )}

          {/* Expanded Course Progress */}
          {selectedCourse &&
            isEnrolled(selectedCourse.id) &&
            currentProgress && !sidebarCollapsed && (
              <Paper
                elevation={0}
                sx={{
                  overflow: 'hidden',
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${selectedCourseColors.primary} 0%, ${selectedCourseColors.secondary} 100%)`,
                  color: "white",
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.1)'
                    },
                  }}
                  onClick={() => setProgressExpanded(!progressExpanded)}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <TrendingUp sx={{ fontSize: 18 }} />
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Progress
                      </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="h6" fontWeight={700}>
                        {currentProgress.completionPercentage}%
                      </Typography>
                      <Box
                        sx={{
                          transition: 'transform 0.2s ease-in-out',
                          transform: progressExpanded ? 'rotate(0deg)' : 'rotate(-90deg)'
                        }}
                      >
                        <ExpandLess />
                      </Box>
                    </Stack>
                  </Stack>
                </Box>

                <Collapse in={progressExpanded}>
                  <Box sx={{ px: 2, pb: 2 }}>
                    <Box sx={{ position: "relative", mb: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={currentProgress.completionPercentage}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: "rgba(255,255,255,0.2)",
                          "& .MuiLinearProgress-bar": {
                            bgcolor: "white",
                            borderRadius: 4,
                            transition: 'width 0.3s ease-in-out'
                          },
                        }}
                      />
                    </Box>

                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <CheckCircle sx={{ fontSize: 16 }} />
                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                          {currentProgress.completedLessons} done
                        </Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <School sx={{ fontSize: 16 }} />
                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                          {currentProgress.totalLessons} total
                        </Typography>
                      </Stack>
                    </Stack>
                  </Box>
                </Collapse>
              </Paper>
            )}
        </Box>

        {/* Lessons List */}
        <Box sx={{ flexGrow: 1, overflowY: "auto", p: sidebarCollapsed ? 0.5 : 2 }}>
          {lessonLoading ? (
            <Stack spacing={sidebarCollapsed ? 1 : 2}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  height={sidebarCollapsed ? 48 : 72}
                  sx={{
                    borderRadius: sidebarCollapsed ? 3 : 2,
                    mx: sidebarCollapsed ? 0.5 : 0
                  }}
                />
              ))}
            </Stack>
          ) : (
            <List sx={{ p: 0 }}>
              {lessons.map((lesson, index) => {
                const isDisabled =
                  !isEnrolled(selectedCourse?.id || "") ||
                  (lesson.isLocked && lesson.lockReason !== 'Subscribe to unlock');
                const isSelected = selectedLesson?.id === lesson.id;

                return (
                  <motion.div
                    key={lesson.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ListItem
                      disablePadding
                      sx={{
                        mb: sidebarCollapsed ? 0.5 : 1,
                        px: sidebarCollapsed ? 0.5 : 0
                      }}
                    >
                      <Tooltip
                        title={sidebarCollapsed ? (
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {lesson.title}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.8 }}>
                              {lesson.lessonType.charAt(0) + lesson.lessonType.slice(1).toLowerCase()}
                              {lesson.pointsReward > 0 && ` • +${lesson.pointsReward} pts`}
                            </Typography>
                            {lesson.isLocked && (
                              <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 0.5 }}>
                                {lesson.lockReason}
                              </Typography>
                            )}
                          </Box>
                        ) : ""}
                        placement="right"
                        arrow
                        PopperProps={{
                          sx: {
                            '& .MuiTooltip-tooltip': {
                              bgcolor: 'grey.900',
                              color: 'white',
                              fontSize: '0.75rem',
                              maxWidth: 200
                            }
                          }
                        }}
                      >
                        <ListItemButton
                          selected={isSelected}
                          disabled={isDisabled}
                          onClick={() => {
                            if (!isDisabled && !lesson.isLocked) {
                              setSelectedLesson(lesson);
                            } else if (lesson.lockReason === 'Subscribe to unlock') {
                              navigate("/subscription");
                            }
                          }}
                          sx={{
                            borderRadius: sidebarCollapsed ? 3 : 2,
                            opacity: lesson.isLocked ? 0.7 : 1,
                            minHeight: sidebarCollapsed ? 48 : 72,
                            px: sidebarCollapsed ? 1 : 2,
                            py: sidebarCollapsed ? 1 : 1.5,
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                            position: 'relative',
                            overflow: 'hidden',
                            justifyContent: sidebarCollapsed ? 'center' : 'flex-start',

                            "&.Mui-selected": {
                              background: `linear-gradient(135deg, ${selectedCourseColors.primary} 0%, ${selectedCourseColors.secondary} 100%)`,
                              color: "white",
                              transform: sidebarCollapsed ? 'scale(1.05)' : 'translateX(4px)',
                              boxShadow: sidebarCollapsed
                                ? `0 4px 12px ${selectedCourseColors.primary}40`
                                : `4px 0 12px ${selectedCourseColors.primary}30`,
                              "&:hover": {
                                background: `linear-gradient(135deg, ${selectedCourseColors.primary} 0%, ${selectedCourseColors.secondary} 100%)`,
                                transform: sidebarCollapsed ? 'scale(1.08)' : 'translateX(6px)',
                              },
                              "& .MuiListItemIcon-root": {
                                color: "white",
                              },

                              // Glowing border effect for collapsed selected items
                              ...(sidebarCollapsed && {
                                '&::before': {
                                  content: '""',
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  borderRadius: 3,
                                  border: `2px solid ${selectedCourseColors.primary}60`,
                                  pointerEvents: 'none',
                                }
                              })
                            },

                            "&:hover:not(.Mui-selected)": lesson.lockReason === 'Subscribe to unlock' ? {
                              bgcolor: "action.hover",
                              cursor: 'pointer',
                              transform: sidebarCollapsed ? 'scale(1.02)' : 'translateX(2px)',
                            } : {
                              bgcolor: "action.hover",
                              transform: sidebarCollapsed ? 'scale(1.02)' : 'translateX(2px)',
                            },

                            // Lesson number indicator for collapsed state
                            ...(sidebarCollapsed && {
                              '&::after': {
                                content: `"${lesson.order}"`,
                                position: 'absolute',
                                top: 2,
                                right: 2,
                                fontSize: '0.6rem',
                                fontWeight: 700,
                                color: isSelected ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                                backgroundColor: isSelected ? 'rgba(255,255,255,0.1)' : 'action.hover',
                                borderRadius: '50%',
                                width: 16,
                                height: 16,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                lineHeight: 1,
                              }
                            })
                          }}
                        >
                          {lesson.lockReason === 'Subscribe to unlock' && (
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(2px)',
                                zIndex: 1,
                              }}
                            />
                          )}

                          <ListItemIcon sx={{
                            minWidth: sidebarCollapsed ? 0 : 40,
                            zIndex: 2,
                            justifyContent: 'center',
                            position: 'relative'
                          }}>
                            {lesson.isCompleted ? (
                              <CheckCircle
                                color={isSelected ? "inherit" : "success"}
                                sx={{
                                  fontSize: sidebarCollapsed ? 22 : 24,
                                  filter: sidebarCollapsed && isSelected ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' : 'none'
                                }}
                              />
                            ) : lesson.isLocked ? (
                              <Lock
                                color="disabled"
                                sx={{
                                  fontSize: sidebarCollapsed ? 20 : 24,
                                  filter: sidebarCollapsed ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' : 'none'
                                }}
                              />
                            ) : !isEnrolled(selectedCourse?.id || "") ? (
                              <Lock
                                color="disabled"
                                sx={{
                                  fontSize: sidebarCollapsed ? 20 : 24,
                                  filter: sidebarCollapsed ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' : 'none'
                                }}
                              />
                            ) : (
                              <Box sx={{
                                color: isSelected ? "inherit" : "action.active",
                                filter: sidebarCollapsed && isSelected ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' : 'none'
                              }}>
                                {getLessonTypeIcon(lesson.lessonType, sidebarCollapsed ? "small" : "medium")}
                              </Box>
                            )}

                            {/* Completion indicator dot for collapsed state */}
                            {sidebarCollapsed && lesson.isCompleted && (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: -2,
                                  right: -2,
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  bgcolor: 'success.main',
                                  border: '2px solid white',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }}
                              />
                            )}

                            {/* Points indicator for collapsed state */}
                            {sidebarCollapsed && lesson.pointsReward > 0 && !lesson.isLocked && !lesson.isCompleted && (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  bottom: -2,
                                  right: -2,
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  bgcolor: selectedCourseColors.primary,
                                  border: '2px solid white',
                                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                }}
                              />
                            )}
                          </ListItemIcon>

                          {!sidebarCollapsed && (
                            <ListItemText
                              sx={{ zIndex: 2 }}
                              primary={
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  spacing={1}
                                  flexWrap="wrap"
                                >
                                  <Typography
                                    variant="body2"
                                    fontWeight={isSelected ? 600 : 500}
                                    sx={{
                                      flexGrow: 1,
                                      lineHeight: 1.3,
                                      display: "-webkit-box",
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: "vertical",
                                      overflow: "hidden",
                                    }}
                                  >
                                    {lesson.title}
                                  </Typography>
                                  {lesson.isLocked && (
                                    <Chip
                                      size="small"
                                      label={lesson.lockReason === 'Subscribe to unlock' ? 'Pro' : 'Locked'}
                                      icon={lesson.lockReason === 'Subscribe to unlock' ?
                                        <LockOutlined sx={{ fontSize: '12px !important' }} /> : undefined
                                      }
                                      sx={{
                                        height: 18,
                                        fontSize: "0.6rem",
                                        bgcolor: lesson.lockReason === 'Subscribe to unlock' ? 'primary.main' : 'grey.300',
                                        color: lesson.lockReason === 'Subscribe to unlock' ? 'white' : 'grey.600',
                                        '& .MuiChip-label': {
                                          px: 1
                                        }
                                      }}
                                    />
                                  )}
                                  {lesson.pointsReward > 0 && !lesson.isLocked && (
                                    <Chip
                                      size="small"
                                      icon={
                                        <EmojiEvents
                                          sx={{ fontSize: "12px !important" }}
                                        />
                                      }
                                      label={`+${lesson.pointsReward}`}
                                      sx={{
                                        height: 18,
                                        fontSize: "0.6rem",
                                        bgcolor: isSelected
                                          ? "rgba(255,255,255,0.2)"
                                          : `${selectedCourseColors.primary}20`,
                                        color: isSelected
                                          ? "inherit"
                                          : selectedCourseColors.primary,
                                        '& .MuiChip-label': {
                                          px: 1
                                        }
                                      }}
                                    />
                                  )}
                                </Stack>
                              }
                              secondary={
                                <Typography
                                  variant="caption"
                                  color={isSelected ? "inherit" : "text.secondary"}
                                  sx={{
                                    opacity: isSelected ? 0.8 : 0.7,
                                    fontSize: '0.7rem'
                                  }}
                                >
                                  {lesson.isLocked
                                    ? lesson.lockReason || "Complete previous lesson"
                                    : `Lesson ${lesson.order} • ${lesson.lessonType.charAt(0) +
                                    lesson.lessonType.slice(1).toLowerCase()
                                    }`}
                                </Typography>
                              }
                            />
                          )}
                        </ListItemButton>
                      </Tooltip>
                    </ListItem>
                  </motion.div>
                );
              })}
            </List>
          )}
        </Box>
      </Box>
    );
  };

  // Loading state with improved skeletons
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Stack spacing={4}>
          <Box>
            <Skeleton variant="text" width={300} height={50} sx={{ mb: 2 }} />
            <Skeleton variant="text" width={500} height={30} />
          </Box>
          <Grid container spacing={4}>
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
  if (!selectedCourse) {
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
              Welcome to Your Classroom
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
              Choose a course to begin your learning journey
            </Typography>
          </Box>
        </motion.div>

        {error && (
          <Alert severity="error" sx={{ mb: 4, borderRadius: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={4}>
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
                        setSelectedCourse(course);
                      } else {
                        setEnrollDialog(course);
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
  }

  // Course lesson view
  return (
    <Box
      sx={{
        display: "flex",
        height: "calc(100vh - 64px)",
        bgcolor: "background.default",
      }}
    >
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Paper
          elevation={2}
          sx={{
            width: sidebarCollapsed ? 80 : 380,
            borderRadius: 0,
            borderRight: "1px solid",
            borderColor: "divider",
            overflowY: "auto",
            transition: 'width 0.3s ease-in-out',
          }}
        >
          <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => {
                setSelectedCourse(null);
                setLessons([]);
                setSelectedLesson(null);
                setSidebarCollapsed(false);
              }}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 500,
                ...(sidebarCollapsed && {
                  minWidth: 'auto',
                  px: 1,
                  '& .MuiButton-startIcon': {
                    mr: 0
                  }
                })
              }}
            >
              {!sidebarCollapsed && "Back to Courses"}
            </Button>
          </Box>
          <LessonSidebar />
        </Paper>
      )}

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          display: { md: "none" },
          "& .MuiDrawer-paper": { width: 380 },
        }}
      >
        <Box sx={{ p: 3, borderBottom: "1px solid", borderColor: "divider" }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => {
              setSelectedCourse(null);
              setLessons([]);
              setSelectedLesson(null);
              setDrawerOpen(false);
            }}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 500,
            }}
          >
            Back to Courses
          </Button>
        </Box>
        <LessonSidebar />
      </Drawer>

      {/* Main Content Area */}
      <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {isMobile && (
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
              <IconButton
                onClick={() => setDrawerOpen(true)}
                sx={{
                  bgcolor: 'action.hover',
                  '&:hover': {
                    bgcolor: 'action.selected'
                  }
                }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" fontWeight={600}>
                {selectedCourse?.title}
              </Typography>
            </Stack>
          )}

          {selectedLesson ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedLesson.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.4 }}
              >
                {/* Lesson Header with dynamic gradient */}
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

                    <Stack
                      direction="row"
                      spacing={2}
                      alignItems="center"
                      flexWrap="wrap"
                    >
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

                    <Typography
                      variant="body1"
                      sx={{ opacity: 0.9, lineHeight: 1.6 }}
                    >
                      {selectedLesson.description}
                    </Typography>
                  </Stack>
                </Paper>

                {/* Lesson Content */}
                {selectedLesson.isLocked && selectedLesson.lockReason === 'Subscribe to unlock' ? (
                  <Paper
                    elevation={0}
                    sx={{ textAlign: "center", py: 8, borderRadius: 4 }}
                  >
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Paper
                        sx={{
                          p: 6,
                          maxWidth: 500,
                          mx: 'auto',
                          background: 'linear-gradient(135deg, #5C633A 0%, #D4BC8C 100%)',
                          color: 'white',
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
                            navigate('/subscription', {
                              state: {
                                courseId: selectedCourse?.id,
                                returnUrl: `/classroom`
                              }
                            });
                          }}
                          sx={{
                            backgroundColor: 'white',
                            color: 'white',
                            fontWeight: 600,
                            px: 4,
                            py: 1.5,
                            '&:hover': {
                              backgroundColor: 'grey.100',
                            },
                          }}
                        >
                          Unlock with Subscription
                        </Button>
                        <Typography variant="body2" sx={{ mt: 2, opacity: 0.8 }}>
                          Starting at ¥19,980/month
                        </Typography>
                      </Paper>
                    </motion.div>
                  </Paper>
                ) : selectedLesson.isLocked ? (
                  <Paper
                    elevation={0}
                    sx={{ textAlign: "center", py: 8, borderRadius: 4 }}
                  >
                    <Lock
                      sx={{ fontSize: 80, color: "text.secondary", mb: 3 }}
                    />
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
                      Complete the previous lesson to unlock this content and
                      continue your learning journey
                    </Typography>
                  </Paper>
                ) : !isEnrolled(selectedCourse.id) ? (
                  <Paper
                    elevation={0}
                    sx={{ textAlign: "center", py: 8, borderRadius: 4 }}
                  >
                    <Lock
                      sx={{ fontSize: 80, color: "text.secondary", mb: 3 }}
                    />
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
                      Join this course to unlock all lessons and start your
                      learning journey
                    </Typography>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => setEnrollDialog(selectedCourse)}
                      sx={{
                        borderRadius: 3,
                        px: 4,
                        background: `linear-gradient(135deg, ${selectedCourseColors.primary} 0%, ${selectedCourseColors.secondary} 100%)`,
                      }}
                    >
                      Enroll Now
                    </Button>
                  </Paper>
                ) : (
                  <>
                    {/* Keywords Lesson */}
                    {selectedLesson.lessonType === "KEYWORDS" &&
                      (selectedLesson.keywords &&
                        selectedLesson.keywords.length > 0 ? (
                        <KeywordFlashcards
                          keywords={selectedLesson.keywords}
                          pointsReward={selectedLesson.pointsReward}
                          onComplete={() => handleCompleteLesson()}
                          isLessonCompleted={!!selectedLesson.isCompleted}
                        />
                      ) : (
                        <Alert
                          severity="warning"
                          sx={{ mb: 4, borderRadius: 3 }}
                        >
                          No keywords available for this lesson. Please contact
                          support.
                        </Alert>
                      ))}

                    {/* Quiz Lesson */}
                    {selectedLesson.lessonType === "QUIZ" &&
                      (selectedLesson.contentData?.questions ? (
                        <Quiz
                          questions={selectedLesson.contentData.questions}
                          passingScore={selectedLesson.passingScore || 70}
                          timeLimit={selectedLesson.contentData.timeLimit}
                          pointsReward={selectedLesson.pointsReward}
                          onComplete={(score, passed) => {
                            if (passed) {
                              handleCompleteLesson(score);
                            }
                          }}
                          isLessonCompleted={!!selectedLesson.isCompleted}
                        />
                      ) : (
                        <Alert
                          severity="warning"
                          sx={{ mb: 4, borderRadius: 3 }}
                        >
                          No quiz data available for this lesson. Please contact
                          support.
                        </Alert>
                      ))}

                    {/* Slides Lesson */}
                    {selectedLesson.lessonType === "SLIDES" &&
                      (selectedLesson.contentData?.slides ? (
                        <InteractiveSlides
                          slides={selectedLesson.contentData.slides}
                          pointsReward={selectedLesson.pointsReward}
                          onComplete={() => handleCompleteLesson()}
                          isLessonCompleted={!!selectedLesson.isCompleted}
                        />
                      ) : (
                        <Alert
                          severity="warning"
                          sx={{ mb: 4, borderRadius: 3 }}
                        >
                          No slides data available for this lesson. Please
                          contact support.
                        </Alert>
                      ))}

                    {/* Video/PDF Lesson */}
                    {(selectedLesson.lessonType === "VIDEO" ||
                      selectedLesson.lessonType === "PDF") && (
                        <>
                          {selectedLesson.contentUrl ? (
                            selectedLesson.lessonType === "VIDEO" ? (
                              <VideoPlayer url={selectedLesson.contentUrl} />
                            ) : (
                              <PDFViewer url={selectedLesson.contentUrl} />
                            )
                          ) : (
                            <Alert
                              severity="warning"
                              sx={{ mb: 4, borderRadius: 3 }}
                            >
                              Content URL not available. Please contact support.
                            </Alert>
                          )}

                          {/* Action buttons for Video/PDF only */}
                          <Paper
                            elevation={0}
                            sx={{
                              p: 3,
                              mt: 4,
                              borderRadius: 3,
                              bgcolor: "background.default",
                            }}
                          >
                            <Stack
                              direction="row"
                              spacing={2}
                              justifyContent="flex-end"
                              alignItems="center"
                            >
                              {selectedLesson.lessonType === "PDF" &&
                                selectedLesson.contentUrl && (
                                  <Button
                                    variant="outlined"
                                    href={selectedLesson.contentUrl}
                                    download
                                    target="_blank"
                                    sx={{ borderRadius: 2 }}
                                  >
                                    Download PDF
                                  </Button>
                                )}

                              <Button
                                variant="contained"
                                size="large"
                                disabled={selectedLesson.isCompleted}
                                onClick={() => handleCompleteLesson()}
                                startIcon={
                                  selectedLesson.isCompleted ? (
                                    <CheckCircle />
                                  ) : (
                                    <EmojiEvents />
                                  )
                                }
                                sx={{
                                  borderRadius: 2,
                                  px: 4,
                                  background: selectedLesson.isCompleted
                                    ? "linear-gradient(135deg, #4caf50 0%, #8bc34a 100%)"
                                    : `linear-gradient(135deg, ${selectedCourseColors.primary} 0%, ${selectedCourseColors.secondary} 100%)`,
                                }}
                              >
                                {selectedLesson.isCompleted
                                  ? "Lesson Completed"
                                  : "Mark as Complete"}
                              </Button>
                            </Stack>

                            {selectedLesson.requiresReflection &&
                              !selectedLesson.isCompleted && (
                                <Alert
                                  severity="info"
                                  sx={{ mt: 3, borderRadius: 2 }}
                                >
                                  💭 This lesson requires a reflection. You'll be
                                  prompted to write one after marking it complete.
                                </Alert>
                              )}
                          </Paper>
                        </>
                      )}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          ) : (
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
          )}
        </Container>
      </Box>

      {/* Subscription Modal */}
      <Dialog
        open={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <LockOutlined color="primary" />
            <Typography variant="h6">Unlock All Lessons</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3}>
            <Typography variant="body1">
              You've reached the free lesson limit for this course. Subscribe to
              unlock all lessons and features!
            </Typography>

            <Box sx={{ bgcolor: "grey.50", p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                With a subscription, you'll get:
              </Typography>
              <Stack spacing={1} sx={{ mt: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CheckCircle color="success" fontSize="small" />
                  <Typography variant="body2">
                    Unlimited access to all lessons
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CheckCircle color="success" fontSize="small" />
                  <Typography variant="body2">
                    Live speaking practice sessions
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CheckCircle color="success" fontSize="small" />
                  <Typography variant="body2">
                    Downloadable resources
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CheckCircle color="success" fontSize="small" />
                  <Typography variant="body2">
                    Certificate of completion
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSubscriptionModal(false)}>
            Maybe Later
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              navigate("/subscription", {
                state: {
                  courseId: selectedCourse?.id,
                  returnUrl: `/classroom`,
                },
              });
            }}
            sx={{ color: "white" }}
          >
            View Subscription Plans
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};