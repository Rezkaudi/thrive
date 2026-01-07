import React, { useState, useEffect } from "react";
import { Container, useTheme, useMediaQuery } from "@mui/material";
import api from "../../services/api";
import { BulkAudioManager } from "../../components/admin/BulkAudioManager";
// import { AddLessonDialog, CourseDetailHeader, LessonsList } from "../../components/admin-course-detail";
import { CourseDetailHeader, AddLessonDialog, LessonsList} from "../../components/admin-course-detail";
import { LessonFormState } from "../../types/lsesson-form.types";
import { useParams } from "react-router-dom";

type StoredLesson = LessonFormState & {
  id: string;
  courseId: string;
};

interface Course {
  id: string;
  title: string;
  description: string;
  type: "JAPAN_IN_CONTEXT" | "JLPT_IN_CONTEXT";
  icon: string;
  isActive: boolean;
  lessonCount?: number;
  freeLessonCount: number;
  order?: number;
}

export const AdminCourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<StoredLesson[]>([]);
  const [lessonDialog, setLessonDialog] = useState(false);
  const [editingLesson, setEditingLesson] = useState<LessonFormState | null>(null);
  const [bulkAudioDialog, setBulkAudioDialog] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [lessonForm, setLessonForm] = useState<LessonFormState>({
    title: "",
    description: "",
    order: 1,
    lessonType: "VIDEO",
    contentUrl: "",
    contentData: null,
    pointsReward: 0,
    requiresReflection: false,
    passingScore: 70,
    keywords: [],
  });

  const resetLessonForm = () => {
    setLessonForm({
      title: "",
      description: "",
      order: lessons.length + 1,
      lessonType: "VIDEO",
      contentUrl: "",
      contentData: null,
      pointsReward: 0,
      requiresReflection: false,
      passingScore: 70,
      keywords: [],
    });
    setEditingLesson(null);
  };

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedCourse) fetchLessons(selectedCourse.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourse]);

  useEffect(() => {
    if (!selectedCourse) {
      setLessons([]);
      setLessonDialog(false);
      resetLessonForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      const response = await api.get("/courses");
      const sortedCourses: Course[] = response.data.sort((a: Course, b: Course) => {
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        return 0;
      });
      setSelectedCourse(sortedCourses.find((item) => item.id === courseId) || null);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    }
  };

  const fetchLessons = async (courseId: string) => {
    try {
      const response = await api.get(`/courses/${courseId}/lessons`);
      const mapped: StoredLesson[] = (response.data as any[]).map((l) => ({
        id: l.id,
        courseId: l.courseId ?? courseId,
        title: l.title ?? "",
        description: l.description ?? "",
        order: l.order ?? 1,
        lessonType: l.lessonType ?? "VIDEO",
        contentUrl: l.contentUrl ?? "",
        contentData: l.contentData ?? null,
        pointsReward: l.pointsReward ?? 0,
        requiresReflection: l.requiresReflection ?? false,
        passingScore: l.passingScore ?? 70,
        keywords: l.keywords ?? [],
      }));
      setLessons(mapped.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error("Failed to fetch lessons:", error);
    }
  };

  const handleAddNewLesson = () => {
    resetLessonForm();
    setLessonDialog(true);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <CourseDetailHeader
        isMobile={isMobile}
        selectedCourse={selectedCourse}
        handleAddNewLesson={handleAddNewLesson}
      />

      <LessonsList
        lessons={lessons}
        fetchLessons={fetchLessons}
        selectedCourse={selectedCourse}
        setLessons={setLessons}
        setEditingLesson={setEditingLesson}
        setLessonDialog={setLessonDialog}
        setLessonForm={setLessonForm}
      />

      <AddLessonDialog
        fetchCourses={fetchCourses}
        fetchLessons={fetchLessons}
        isMobile={isMobile}
        lessonDialog={lessonDialog}
        lessonForm={lessonForm}
        lessons={lessons}
        setLessonDialog={setLessonDialog}
        setLessonForm={setLessonForm}
        editingLesson={editingLesson}
        selectedCourse={selectedCourse}
        setBulkAudioDialog={setBulkAudioDialog}
        resetLessonForm={resetLessonForm}
      />

      <BulkAudioManager
        open={bulkAudioDialog}
        onClose={() => setBulkAudioDialog(false)}
        keywords={lessonForm.keywords ?? []}
        onApply={(updatedKeywords) => {
          const safe = Array.isArray(updatedKeywords) ? updatedKeywords : [];
          // ✅ functional update to avoid stale closure
          setLessonForm(prev => ({ ...prev, keywords: safe }));
        }}
      />
    </Container>
  );
};

export default AdminCourseDetailPage;
