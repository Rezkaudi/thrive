// src/pages/CourseDetailPage.tsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Paper,
  Drawer,
  Button,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";

// Hooks & Utils
import { getCourseColors, getLessonIcon } from "../utils/course-details";
import { useCourseDetails } from "../hooks/useCourseDetails";

// Components
import { LessonSidebar } from "../components/course-details";
import { MobileTopBar } from "../components/course-details/MobileTopBar";
import { SubscriptionDialog } from "../components/course-details/SubscriptionDialog";
import { LessonView } from "../components/course-details/LessonView";

export const CourseDetailPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // UI State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem("sidebarCollapsed") === "true";
  });
  const [progressExpanded, setProgressExpanded] = useState(true);

  // Business Logic from Hook
  const {
    selectedCourse,
    lessons,
    selectedLesson,
    setSelectedLesson,
    enrollments,
    courseProgress,
    lessonLoading,
    completingLesson,
    handleCompleteLesson,
    handleEnroll,
    navigate,
  } = useCourseDetails();

  // Persist sidebar state
  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Derived Values
  const selectedCourseColors = getCourseColors(selectedCourse?.type || "");
  const isEnrolled = enrollments.some(
    (e: any) => e.courseId === selectedCourse?.id
  );
  const currentProgress = courseProgress.find(
    (p) => p.courseId === selectedCourse?.id
  ) || {
    completedLessons: 0,
    totalLessons: 0,
    completionPercentage: 0,
  };

  // Optimistic complete: trigger completion and immediately advance
  const onCompleteInstant = (score?: number) => {
    if (!selectedLesson) return;
    const currentId = selectedLesson.id;
    // Precompute next lesson from current list to avoid races
    const currentIndex = lessons.findIndex((l) => l.id === currentId);
    const nextLesson =
      currentIndex >= 0 ? lessons[currentIndex + 1] : undefined;
    // Optimistically unlock the next lesson (since previous is now complete)
    const unlockedNextLesson = nextLesson
      ? { ...nextLesson, isLocked: false, lockReason: "" }
      : undefined;

    // Optimistically update current lesson as completed so button updates immediately
    if (selectedLesson) {
      setSelectedLesson({ ...selectedLesson, isCompleted: true });
    }

    // Fire completion (will refresh and sync state in the hook)
    handleCompleteLesson(score);

    // Immediate next navigation using precomputed target (with optimistic unlock)
    if (unlockedNextLesson) {
      setSelectedLesson(unlockedNextLesson);
    }
  };

  const SidebarContent = (
    <>
      <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/classroom")}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 500,
            ...(sidebarCollapsed && {
              minWidth: "auto",
              px: 1,
              "& .MuiButton-startIcon": { mr: 0 },
            }),
          }}
        >
          {!sidebarCollapsed && "Back to Courses"}
        </Button>
      </Box>
      <LessonSidebar
        selectedCourse={selectedCourse}
        getCourseProgress={() => currentProgress}
        sidebarCollapsed={sidebarCollapsed}
        selectedCourseColors={selectedCourseColors}
        setSidebarCollapsed={setSidebarCollapsed}
        isMobile={isMobile}
        setDrawerOpen={setDrawerOpen}
        isEnrolled={() => isEnrolled}
        progressExpanded={progressExpanded}
        setProgressExpanded={setProgressExpanded}
        lessonLoading={lessonLoading}
        lessons={lessons}
        selectedLesson={selectedLesson}
        setSelectedLesson={setSelectedLesson}
        getLessonTypeIcon={getLessonIcon}
        navigate={navigate}
      />
    </>
  );

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
            transition: "width 0.3s ease-in-out",
          }}
        >
          {SidebarContent}
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
        <Box sx={{ pt: "70px" }}>{SidebarContent}</Box>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {isMobile && (
            <MobileTopBar
              title={selectedCourse?.title}
              onOpenDrawer={() => setDrawerOpen(true)}
            />
          )}

          <LessonView
            selectedLesson={selectedLesson}
            selectedCourse={selectedCourse}
            isEnrolled={isEnrolled}
            onEnroll={handleEnroll}
            onComplete={onCompleteInstant}
            isLoadingNextLesson={completingLesson}
          />
        </Container>
      </Box>

      <SubscriptionDialog
        open={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        courseId={selectedCourse?.id}
      />
    </Box>
  );
};
