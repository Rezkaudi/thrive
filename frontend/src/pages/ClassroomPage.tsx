// frontend/src/pages/ClassroomPage.tsx
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
import api from '../services/api';
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

    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable keyboard shortcuts that might allow saving
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable Ctrl+S, Ctrl+A, F12, etc.
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

    // Disable drag and drop
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // Add event listeners
    video.addEventListener('contextmenu', handleContextMenu);
    video.addEventListener('dragstart', handleDragStart);
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
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
        paddingTop: '56.25%', // 16:9 aspect ratio
        bgcolor: 'black',
        borderRadius: 2,
        overflow: 'hidden',
        // Disable text selection
        userSelect: 'none',
        // Disable highlighting
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
          // Disable drag
          pointerEvents: 'auto',
        }}
        src={url}
        onLoadStart={() => {
          // Additional protection: remove download attribute if somehow added
          if (videoRef.current) {
            videoRef.current.removeAttribute('download');
          }
        }}
        // Disable right-click and drag
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
      />

      {/* Invisible overlay to prevent direct video access */}
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

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchLessons(selectedCourse.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourse]);

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
      console.log('Lessons response:', response.data);

      // Apply locking logic to lessons
      const lessonsWithLocks = calculateLessonLocks(response.data);
      setLessons(lessonsWithLocks);

      // Auto-select first incomplete and unlocked lesson
      const firstIncompleteUnlocked = lessonsWithLocks.find(
        (l: Lesson) => !l.isCompleted && !l.isLocked
      );
      if (firstIncompleteUnlocked) {
        console.log('Selected lesson:', firstIncompleteUnlocked);
        setSelectedLesson(firstIncompleteUnlocked);
      } else {
        // If no incomplete unlocked lessons, select the first lesson
        const firstLesson = lessonsWithLocks.find((l: Lesson) => l.order === 1);
        if (firstLesson) {
          console.log('Selected first lesson:', firstLesson);
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
        // Already enrolled
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

      // Refresh lessons to get updated completion status and recalculate locks
      await fetchLessons(selectedCourse!.id);

      // Move to next available lesson (unlocked and incomplete)
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

  const calculateLessonLocks = (lessons: Lesson[]): Lesson[] => {
    if (!lessons.length) return lessons;

    // Sort lessons by order to ensure proper sequence
    const sortedLessons = [...lessons].sort((a, b) => a.order - b.order);

    return sortedLessons.map((lesson, index) => {
      // First lesson is never locked
      if (index === 0) {
        return { ...lesson, isLocked: false };
      }

      // Check if previous lesson is completed
      const previousLesson = sortedLessons[index - 1];
      const isLocked = !previousLesson.isCompleted;

      return { ...lesson, isLocked };
    });
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
            const isDisabled = !isEnrolled(selectedCourse?.id || '') || lesson.isLocked;

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
                    onClick={() => !isDisabled && setSelectedLesson(lesson)}
                    sx={{
                      borderRadius: 2,
                      opacity: lesson.isLocked ? 0.5 : 1,
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
                    }}
                  >
                    <ListItemIcon>
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
                      primary={
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="body1">{lesson.title}</Typography>
                          {lesson.isLocked && (
                            <Chip
                              size="small"
                              label="Locked"
                              sx={{
                                height: 20,
                                fontSize: '0.6rem',
                                bgcolor: 'grey.300',
                                color: 'grey.600',
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
                      secondary={
                        lesson.isLocked
                          ? "Complete previous lesson to unlock"
                          : lesson.lessonType
                      }
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

  if (loading) {
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

        {/* Enrollment Dialog */}
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
      {/* Sidebar for desktop */}
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

      {/* Mobile drawer */}
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

      {/* Main content */}
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

                {/* Content Display */}
                {selectedLesson.isLocked ? (
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
                    {/* Keywords Lesson */}
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
                    
                    {/* Quiz Lesson */}
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
                    
                    {/* Slides Lesson */}
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
                    
                    {/* Video/PDF Lesson */}
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

                    {/* Action buttons for Video/PDF only */}
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
    </Box>
  );
};