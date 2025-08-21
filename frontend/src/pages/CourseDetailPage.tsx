// frontend/src/pages/ClassroomPage.tsx - Enhanced version with menu toggle and small icons
import React, { useState, useEffect, useRef } from "react";
import {
    Box,
    Container,
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

    TrendingUp,
    ExpandLess,
    ChevronLeft,
    ChevronRight,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import { KeywordFlashcards } from "../components/classroom/KeywordFlashcards";
import { Quiz } from "../components/classroom/Quiz";
import { InteractiveSlides } from "../components/classroom/InteractiveSlides";
import { fetchDashboardData } from "../store/slices/dashboardSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { SimplePDFViewer } from '../components/classroom/SimplePDFViewer';
import { isYouTubeUrl, toYouTubeEmbedUrl } from "../utils/youtub";

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

const VideoPlayer: React.FC<{ url: string }> = ({ url }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        // Apply anti-actions for HTML5 video only (iframes handle their own UI)
        if (isYouTubeUrl(url)) return;

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
                (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "C")) ||
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
    }, [url]);

    const isYT = isYouTubeUrl(url);
    const ytEmbed = isYT ? toYouTubeEmbedUrl(url) : null;

    return (
        <Paper
            elevation={3}
            sx={{
                position: "relative",
                paddingTop: "56.25%", // 16:9
                bgcolor: "black",
                borderRadius: 3,
                overflow: "hidden",
                userSelect: "none",
                WebkitUserSelect: "none",
                MozUserSelect: "none",
                msUserSelect: "none",
            }}
            onContextMenu={(e) => !isYT && e.preventDefault()}
        >
            {isYT ? (
                <iframe
                    title="YouTube video player"
                    src={ytEmbed!}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        border: 0,
                    }}
                />
            ) : (
                <video
                    ref={videoRef}
                    controls
                    controlsList="nodownload noremoteplayback"
                    disablePictureInPicture
                    style={{
                        position: "absolute",
                        inset: 0,
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
            )}
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
            <object
                data={url}
                type="application/pdf"
                width="100%"
                height="100%"
            >
                <p>
                    Your device may not support inline PDF viewing.
                    <a href={url} target="_blank" rel="noopener noreferrer">
                        Open PDF
                    </a>
                </p>
            </object>
        </Paper>

    );
};



export const CourseDetailPage: React.FC = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { courseId } = useParams()
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
    const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
        const stored = localStorage.getItem("sidebarCollapsed");
        return stored === "true";
    });
    const [progressExpanded, setProgressExpanded] = useState(true);
    const { hasAccessToCourses } = useSelector((state: RootState) => state.auth);

    const dispatch = useDispatch<AppDispatch>();

    // Get dynamic colors based on selected course
    const selectedCourseColors = selectedCourse
        ? getCourseColors(selectedCourse.type)
        : getCourseColors("JAPAN_IN_CONTEXT");

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        localStorage.setItem("sidebarCollapsed", String(sidebarCollapsed))
    }, [sidebarCollapsed]);

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
            setSelectedCourse(coursesRes.data.find((item: Course) => item.id === courseId))

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

            if (hasAccessToCourses) {
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
                                                            if (isMobile) setDrawerOpen(false)
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
                                                                                <LockOutlined color="inherit" sx={{ fontSize: '12px !important', color: "white" }} /> : undefined
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

    if (!courseId) {
        navigate("/not-found")
    }

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
                                // setSelectedCourse(null);
                                // setLessons([]);
                                // setSelectedLesson(null);
                                // setSidebarCollapsed(false);
                                navigate("/classroom")
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
                <Box sx={{ p: 3, pt: "70px", pb: 1, borderBottom: "1px solid", borderColor: "divider" }}>
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={() => {
                            // setSelectedCourse(null);
                            // setLessons([]);
                            // setSelectedLesson(null);
                            // setDrawerOpen(false);
                            navigate("/classroom")
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
                                            gap={2}
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
                                ) : !isEnrolled(courseId!) ? (
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
                                                            <>
                                                                {selectedLesson.contentUrl ? (
                                                                    <SimplePDFViewer
                                                                        url={selectedLesson.contentUrl}
                                                                        title={selectedLesson.title}
                                                                        allowDownload={true}
                                                                    />
                                                                    // <PDFViewer
                                                                    //   url={selectedLesson.contentUrl}
                                                                    // />
                                                                ) : (
                                                                    <Alert
                                                                        severity="warning"
                                                                        sx={{ mb: 4, borderRadius: 3 }}
                                                                    >
                                                                        Content URL not available. Please contact support.
                                                                    </Alert>
                                                                )}
                                                            </>)
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
                                                            display: "flex", justifyContent: "center",
                                                        }}
                                                    >
                                                        <Stack
                                                            direction="row"
                                                            spacing={2}
                                                            justifyContent="flex-end"
                                                            alignItems="center"
                                                        >
                                                            {/* {selectedLesson.lessonType === "PDF" &&
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
                                                                )} */}

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