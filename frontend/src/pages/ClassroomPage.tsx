// frontend/src/pages/ClassroomPage.tsx - Fixed version with subscription logic
import React, { useState, useEffect, useRef } from 'react';
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
} from '@mui/material';
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
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { subscriptionService } from '../services/subscriptionService';
import { KeywordFlashcards } from '../components/classroom/KeywordFlashcards';
import { Quiz } from '../components/classroom/Quiz';
import { InteractiveSlides } from '../components/classroom/InteractiveSlides';

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
  lessonType: 'VIDEO' | 'PDF' | 'KEYWORDS' | 'QUIZ' | 'SLIDES';
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

const CourseCard = ({
  course,
  onClick,
  isEnrolled,
  progress = 0
}: {
  course: Course;
  onClick: () => void;
  isEnrolled: boolean;
  progress?: number;
}) => (
  <motion.div whileHover={{ y: -8 }} whileTap={{ scale: 0.98 }}>
    <Card
      sx={{
        cursor: 'pointer',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
      onClick={onClick}
    >
      <Box
        sx={{
          height: 200,
          background: `linear-gradient(135deg, ${course.type === 'JAPAN_IN_CONTEXT' ? '#FF6B6B' : '#4ECDC4'
            } 0%, ${course.type === 'JAPAN_IN_CONTEXT' ? '#FFB7C5' : '#7ED4D0'} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <Typography variant="h1" sx={{ fontSize: '4rem', opacity: 0.8 }}>
          {course.icon}
        </Typography>
        {isEnrolled && (
          <Chip
            label="Enrolled"
            size="small"
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              bgcolor: 'rgba(255, 255, 255, 0.9)',
            }}
          />
        )}
        {isEnrolled && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 4,
              bgcolor: 'background.paper',
            }}
          >
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: '100%' }}
            />
          </Box>
        )}
      </Box>
      <CardContent>
        <Typography variant="h5" gutterBottom fontWeight={600}>
          {course.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {course.description}
        </Typography>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          {isEnrolled ? (
            <>
              <Chip label={`${progress}% Complete`} size="small" />
              <Button endIcon={<PlayCircle />}>Continue</Button>
            </>
          ) : (
            <Button fullWidth variant="contained">
              Preview Course
            </Button>
          )}
        </Stack>
      </CardContent>
    </Card>
  </motion.div>
);

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
        (e.ctrlKey && (e.key === 's' || e.key === 'a')) ||
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.shiftKey && e.key === 'C') ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault();
        return false;
      }
    };

    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    video.addEventListener('contextmenu', handleContextMenu);
    video.addEventListener('dragstart', handleDragStart);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      video.removeEventListener('contextmenu', handleContextMenu);
      video.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <Box
      sx={{
        position: 'relative',
        paddingTop: '56.25%',
        bgcolor: 'black',
        borderRadius: 2,
        overflow: 'hidden',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <video
        ref={videoRef}
        controls
        controlsList="nodownload noremoteplayback"
        disablePictureInPicture
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'auto',
        }}
        src={url}
        onLoadStart={() => {
          if (videoRef.current) {
            videoRef.current.removeAttribute('download');
          }
        }}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      />
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
    </Box>
  );
};

const PDFViewer = ({ url }: { url: string }) => {
  return (
    <Box
      sx={{
        position: 'relative',
        height: '80vh',
        bgcolor: 'grey.100',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <iframe
        src={`${url}#toolbar=0`}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        title="PDF Viewer"
      />
    </Box>
  );
};

export const ClassroomPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [enrollDialog, setEnrollDialog] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  useEffect(() => {
    fetchData();
    checkSubscriptionStatus();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchLessons(selectedCourse.id);
    }
  }, [selectedCourse, hasSubscription]);

  const checkSubscriptionStatus = async () => {
    try {
      setCheckingSubscription(true);
      const response = await subscriptionService.checkSubscriptionStatus();
      setHasSubscription(response.hasActiveSubscription);
    } catch (error) {
      console.error('Failed to check subscription:', error);
      setHasSubscription(false);
    } finally {
      setCheckingSubscription(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesRes, enrollmentsRes] = await Promise.all([
        api.get('/courses'),
        api.get('/courses/my-enrollments'),
      ]);
      setCourses(coursesRes.data);
      setEnrollments(enrollmentsRes.data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      setError('Failed to load courses');
    } finally {
      setLoading(false);
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
      console.error('Failed to fetch lessons:', error);
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

      if (selectedLesson.lessonType === 'QUIZ' && quizScore !== undefined) {
        requestData.quizScore = quizScore;
      }

      await api.post(`/courses/lessons/${selectedLesson.id}/complete`, requestData);
      await fetchLessons(selectedCourse!.id);

      const currentIndex = lessons.findIndex(l => l.id === selectedLesson.id);
      const nextLessons = lessons.slice(currentIndex + 1);
      const nextAvailableLesson = nextLessons.find(l => !l.isLocked);

      if (nextAvailableLesson) {
        setSelectedLesson(nextAvailableLesson);
      }
    } catch (error) {
      console.error('Failed to complete lesson:', error);
    }
  };

  const isEnrolled = (courseId: string) => {
    return enrollments.some(e => e.courseId === courseId);
  };

  const calculateProgress = (courseId: string) => {
    const courseLessons = lessons.filter(l => l.courseId === courseId);
    if (courseLessons.length === 0) return 0;

    const completed = courseLessons.filter(l => l.isCompleted).length;
    return Math.round((completed / courseLessons.length) * 100);
  };

  const calculateLessonLocks = (lessons: Lesson[], course: Course | null): Lesson[] => {
    if (!lessons.length || !course) return lessons;

    const sortedLessons = [...lessons].sort((a, b) => a.order - b.order);
    const freeLessonCount = course.freeLessonCount || 0;

    return sortedLessons.map((lesson, index) => {
      let isLocked = false;
      let lockReason = '';

      if (hasSubscription) {
        if (index > 0) {
          const previousLesson = sortedLessons[index - 1];
          isLocked = !previousLesson.isCompleted;
          lockReason = isLocked ? 'Complete previous lesson to unlock' : '';
        }
      } else {
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

  const LessonSidebar = () => (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6" fontWeight={600}>
          {selectedCourse?.title || 'Select a Course'}
        </Typography>
        {isMobile && (
          <IconButton onClick={() => setDrawerOpen(false)}>
            <Close />
          </IconButton>
        )}
      </Stack>

      {lessonLoading ? (
        <Stack spacing={2}>
          {[1, 2, 3].map(i => (
            <Skeleton key={i} variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
          ))}
        </Stack>
      ) : (
        <List>
          {lessons.map((lesson, index) => {
            const isDisabled = !isEnrolled(selectedCourse?.id || '') || (lesson.isLocked && lesson.lockReason !== 'Subscribe to unlock');

            return (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ListItem disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    selected={selectedLesson?.id === lesson.id}
                    disabled={isDisabled}
                    onClick={() => {
                      if (!isDisabled && !lesson.isLocked) {
                        setSelectedLesson(lesson);
                      } else if (lesson.lockReason === 'Subscribe to unlock') {
                        handleLockedLessonClick(lesson);
                      }
                    }}
                    sx={{
                      borderRadius: 2,
                      opacity: lesson.isLocked ? 0.7 : 1,
                      position: 'relative',
                      overflow: 'hidden',
                      '&.Mui-selected': {
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'primary.dark',
                        },
                        '& .MuiListItemIcon-root': {
                          color: 'white',
                        },
                      },
                      '&:hover': lesson.lockReason === 'Subscribe to unlock' ? {
                        bgcolor: 'action.hover',
                        cursor: 'pointer',
                      } : {},
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

                    <ListItemIcon sx={{ zIndex: 2 }}>
                      {lesson.isCompleted ? (
                        <CheckCircle color={selectedLesson?.id === lesson.id ? 'inherit' : 'success'} />
                      ) : lesson.isLocked ? (
                        <Lock color="disabled" />
                      ) : !isEnrolled(selectedCourse?.id || '') ? (
                        <Lock color="disabled" />
                      ) : lesson.lessonType === 'VIDEO' ? (
                        <VideoLibrary color={selectedLesson?.id === lesson.id ? 'inherit' : 'action'} />
                      ) : lesson.lessonType === 'PDF' ? (
                        <PictureAsPdf color={selectedLesson?.id === lesson.id ? 'inherit' : 'action'} />
                      ) : lesson.lessonType === 'QUIZ' ? (
                        <QuizIcon color={selectedLesson?.id === lesson.id ? 'inherit' : 'action'} />
                      ) : lesson.lessonType === 'SLIDES' ? (
                        <Slideshow color={selectedLesson?.id === lesson.id ? 'inherit' : 'action'} />
                      ) : (
                        <Translate color={selectedLesson?.id === lesson.id ? 'inherit' : 'action'} />
                      )}
                    </ListItemIcon>

                    <ListItemText
                      sx={{ zIndex: 2 }}
                      primary={
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="body1">{lesson.title}</Typography>
                          {lesson.isLocked && (
                            <Chip
                              size="small"
                              label={lesson.lockReason === 'Subscribe to unlock' ? 'Pro' : 'Locked'}
                              icon={lesson.lockReason === 'Subscribe to unlock' ? <LockOutlined /> : undefined}
                              sx={{
                                height: 20,
                                fontSize: '0.6rem',
                                bgcolor: lesson.lockReason === 'Subscribe to unlock' ? 'primary.main' : 'grey.300',
                                color: lesson.lockReason === 'Subscribe to unlock' ? 'white' : 'grey.600',
                              }}
                            />
                          )}
                          {lesson.pointsReward > 0 && !lesson.isLocked && (
                            <Chip
                              size="small"
                              icon={<EmojiEvents />}
                              label={`+${lesson.pointsReward}`}
                              sx={{
                                height: 20,
                                fontSize: '0.7rem',
                                bgcolor: selectedLesson?.id === lesson.id ? 'rgba(255,255,255,0.2)' : 'primary.light',
                                color: selectedLesson?.id === lesson.id ? 'inherit' : 'primary.dark',
                              }}
                            />
                          )}
                        </Stack>
                      }
                      secondary={lesson.lockReason || lesson.lessonType}
                      secondaryTypographyProps={{
                        color: selectedLesson?.id === lesson.id ? 'inherit' : 'text.secondary',
                        fontSize: '0.75rem',
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              </motion.div>
            );
          })}
        </List>
      )}
    </Box>
  );

  if (loading || checkingSubscription) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={2}>
          <Skeleton variant="text" width={200} height={40} />
          <Grid container spacing={4}>
            {[1, 2].map(i => (
              <Grid size={{ xs: 12, md: 6 }} key={i}>
                <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Container>
    );
  }

  if (!selectedCourse) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h3" gutterBottom fontWeight={700}>
          My Classroom
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Choose a course to begin your learning journey
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={4}>
          {courses.map((course) => (
            <Grid size={{ xs: 12, md: 6 }} key={course.id}>
              <CourseCard
                course={course}
                isEnrolled={isEnrolled(course.id)}
                progress={calculateProgress(course.id)}
                onClick={() => {
                  if (isEnrolled(course.id)) {
                    setSelectedCourse(course);
                  } else {
                    setEnrollDialog(course);
                  }
                }}
              />
            </Grid>
          ))}
        </Grid>

        <Dialog open={!!enrollDialog} onClose={() => setEnrollDialog(null)} maxWidth="sm" fullWidth>
          <DialogTitle>Enroll in {enrollDialog?.title}</DialogTitle>
          <DialogContent>
            <Stack spacing={2}>
              <Typography variant="body1">
                {enrollDialog?.description}
              </Typography>
              <Alert severity="info">
                This course is free! Enroll now to start learning and earning points.
              </Alert>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEnrollDialog(null)}>Cancel</Button>
            <Button variant="contained" onClick={() => enrollDialog && handleEnroll(enrollDialog)}>
              Enroll Now
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
      {!isMobile && (
        <Paper
          sx={{
            width: 320,
            borderRadius: 0,
            borderRight: '1px solid',
            borderColor: 'divider',
            overflowY: 'auto',
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => {
                setSelectedCourse(null);
                setLessons([]);
                setSelectedLesson(null);
              }}
            >
              Back to Courses
            </Button>
          </Box>
          <LessonSidebar />
        </Paper>
      )}

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          display: { md: 'none' },
          '& .MuiDrawer-paper': { width: 320 },
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => {
              setSelectedCourse(null);
              setLessons([]);
              setSelectedLesson(null);
              setDrawerOpen(false);
            }}
          >
            Back to Courses
          </Button>
        </Box>
        <LessonSidebar />
      </Drawer>

      <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
        <Container maxWidth="md" sx={{ py: 4 }}>
          {isMobile && (
            <IconButton
              onClick={() => setDrawerOpen(true)}
              sx={{ mb: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {selectedLesson ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedLesson.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Typography variant="h4" gutterBottom fontWeight={600}>
                  {selectedLesson.title}
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                  <Chip
                    icon={
                      selectedLesson.lessonType === 'VIDEO' ? <VideoLibrary /> :
                        selectedLesson.lessonType === 'PDF' ? <PictureAsPdf /> :
                          selectedLesson.lessonType === 'QUIZ' ? <QuizIcon /> :
                            selectedLesson.lessonType === 'SLIDES' ? <Slideshow /> :
                              <Translate />
                    }
                    label={
                      selectedLesson.lessonType === 'VIDEO' ? 'Video Lesson' :
                        selectedLesson.lessonType === 'PDF' ? 'PDF Resource' :
                          selectedLesson.lessonType === 'QUIZ' ? 'Quiz' :
                            selectedLesson.lessonType === 'SLIDES' ? 'Interactive Slides' :
                              'Keywords Practice'
                    }
                  />
                  {selectedLesson.pointsReward > 0 && (
                    <Chip
                      icon={<EmojiEvents />}
                      label={`+${selectedLesson.pointsReward} points`}
                      color="primary"
                    />
                  )}
                  {selectedLesson.isLocked && (
                    <Chip
                      icon={<Lock />}
                      label="Locked"
                      color="error"
                    />
                  )}
                </Stack>

                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  {selectedLesson.description}
                </Typography>

                {selectedLesson.isLocked && selectedLesson.lockReason === 'Subscribe to unlock' ? (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
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
                          background: 'linear-gradient(135deg, #FF6B6B 0%, #FFB7C5 100%)',
                          color: 'white',
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
                            '&:hover': {
                              backgroundColor: 'grey.100',
                            },
                          }}
                        >
                          Unlock with Subscription
                        </Button>
                        <Typography variant="body2" sx={{ mt: 2, opacity: 0.8 }}>
                          Starting at ￥19,980/month
                        </Typography>
                      </Paper>
                    </motion.div>
                  </Box>
                ) : selectedLesson.isLocked ? (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Lock sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      This lesson is locked
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Complete the previous lesson to unlock this content
                    </Typography>
                  </Box>
                ) : !isEnrolled(selectedCourse.id) ? (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Lock sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      This content is locked
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Enroll in this course to access all lessons
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => setEnrollDialog(selectedCourse)}
                    >
                      Enroll Now
                    </Button>
                  </Box>
                ) : (
                  <>
                    {selectedLesson.lessonType === 'KEYWORDS' && (
                      selectedLesson.keywords && selectedLesson.keywords.length > 0 ? (
                        <KeywordFlashcards
                          keywords={selectedLesson.keywords}
                          pointsReward={selectedLesson.pointsReward}
                          onComplete={() => handleCompleteLesson()}
                          isLessonCompleted={!!selectedLesson.isCompleted}
                        />
                      ) : (
                        <Alert severity="warning" sx={{ mb: 4 }}>
                          No keywords available for this lesson. Please contact support.
                        </Alert>
                      )
                    )}

                    {selectedLesson.lessonType === 'QUIZ' && (
                      selectedLesson.contentData?.questions ? (
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
                        <Alert severity="warning" sx={{ mb: 4 }}>
                          No quiz data available for this lesson. Please contact support.
                        </Alert>
                      )
                    )}

                    {selectedLesson.lessonType === 'SLIDES' && (
                      selectedLesson.contentData?.slides ? (
                        <InteractiveSlides
                          slides={selectedLesson.contentData.slides}
                          pointsReward={selectedLesson.pointsReward}
                          onComplete={() => handleCompleteLesson()}
                          isLessonCompleted={!!selectedLesson.isCompleted}
                        />
                      ) : (
                        <Alert severity="warning" sx={{ mb: 4 }}>
                          No slides data available for this lesson. Please contact support.
                        </Alert>
                      )
                    )}

                    {(selectedLesson.lessonType === 'VIDEO' || selectedLesson.lessonType === 'PDF') && (
                      selectedLesson.contentUrl ? (
                        selectedLesson.lessonType === 'VIDEO' ? (
                          <VideoPlayer url={selectedLesson.contentUrl} />
                        ) : (
                          <PDFViewer url={selectedLesson.contentUrl} />
                        )
                      ) : (
                        <Alert severity="warning" sx={{ mb: 4 }}>
                          Content URL not available. Please contact support.
                        </Alert>
                      )
                    )}

                    {(selectedLesson.lessonType === 'VIDEO' || selectedLesson.lessonType === 'PDF') && (
                      <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 4 }}>
                        {selectedLesson.lessonType === 'PDF' && selectedLesson.contentUrl && (
                          <Button
                            variant="outlined"
                            href={selectedLesson.contentUrl}
                            download
                            target="_blank"
                          >
                            Download PDF
                          </Button>
                        )}
                        <Button
                          variant="contained"
                          disabled={selectedLesson.isCompleted}
                          onClick={() => handleCompleteLesson()}
                        >
                          {selectedLesson.isCompleted ? 'Completed' : 'Mark as Complete'}
                        </Button>
                      </Stack>
                    )}

                    {selectedLesson.requiresReflection && !selectedLesson.isCompleted && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        This lesson requires a reflection. You'll be prompted to write one after marking it complete.
                      </Alert>
                    )}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <School sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Select a lesson to begin
              </Typography>
            </Box>
          )}
        </Container>
      </Box>

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
              You've reached the free lesson limit for this course.
              Subscribe to unlock all lessons and features!
            </Typography>

            <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                With a subscription, you'll get:
              </Typography>
              <Stack spacing={1} sx={{ mt: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CheckCircle color="success" fontSize="small" />
                  <Typography variant="body2">Unlimited access to all lessons</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CheckCircle color="success" fontSize="small" />
                  <Typography variant="body2">Live speaking practice sessions</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CheckCircle color="success" fontSize="small" />
                  <Typography variant="body2">Downloadable resources</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CheckCircle color="success" fontSize="small" />
                  <Typography variant="body2">Certificate of completion</Typography>
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
              navigate('/subscription', {
                state: {
                  courseId: selectedCourse?.id,
                  returnUrl: `/classroom`
                }
              });
            }}
            sx={{ color: 'white' }}
          >
            View Subscription Plans
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};