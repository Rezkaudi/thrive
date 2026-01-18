import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import api from "../services/api";
import { fetchDashboardData } from "../store/slices/dashboardSlice";
import { AppDispatch, RootState } from "../store/store";
import { Course, Lesson, Enrollment, CourseProgress } from "../types/course-details.types";
import { calculateLessonLocks } from "../utils/course-details";

export const useCourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { hasAccessToCourses } = useSelector((state: RootState) => state.auth) as { hasAccessToCourses: boolean };

  // Data State
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [rawLessons, setRawLessons] = useState<Lesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  // Loading State
  const [loading, setLoading] = useState(true);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [completingLesson, setCompletingLesson] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. MEMOIZED LESSONS (Prevents loops)
  const lessons = useMemo(() => {
    return calculateLessonLocks(rawLessons, selectedCourse, hasAccessToCourses);
  }, [rawLessons, selectedCourse, hasAccessToCourses]);

  const selectedLesson = useMemo(() => {
    return lessons.find((l) => l.id === selectedLessonId) || null;
  }, [lessons, selectedLessonId]);

  // 2. STABLE FETCH with ABORT SIGNAL
  const fetchLessons = useCallback(async (cId: string, signal?: AbortSignal) => {
    if (!cId) return;
    try {
      setLessonLoading(true);
      // Pass the signal to axios/api
      const response = await api.get(`/courses/${cId}/lessons`, { signal });
      setRawLessons(response.data);
    } catch (err: any) {
      // Ignore errors caused by cancellation
      if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
        console.error("Failed to fetch lessons", err);
      }
    } finally {
      setLessonLoading(false);
    }
  }, []);

  // 3. MASTER USE EFFECT (Handles Initial Load & Cleanup)
  useEffect(() => {
    if (!courseId) return;

    // Create a controller for this specific effect run
    const controller = new AbortController();

    const initData = async () => {
      try {
        setLoading(true);

        // Parallel fetching
        const [coursesRes, enrollmentsRes] = await Promise.all([
          api.get("/courses", { signal: controller.signal }),
          api.get("/courses/my-enrollments", { signal: controller.signal }),
        ]);

        // Process Core Data
        setEnrollments(enrollmentsRes.data);
        const current = coursesRes.data.find((c: Course) => c.id === courseId);
        if (current) setSelectedCourse(current);

        // Fetch Lessons (progress will be calculated in separate effect)
        await fetchLessons(courseId, controller.signal);

      } catch (err: any) {
        if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
          setError("Failed to load course data");
        }
      } finally {
        // Only turn off loading if we weren't cancelled
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    initData();

    // CLEANUP FUNCTION: This runs if the component unmounts OR runs again
    // This cancels the previous request immediately.
    return () => {
      controller.abort();
    };
  }, [courseId, fetchLessons]);

  // 4. Calculate progress whenever lessons change
  useEffect(() => {
    if (!courseId || rawLessons.length === 0) return;

    const completedLessons = rawLessons.filter((l) => l.isCompleted).length;
    const totalLessons = rawLessons.length;
    const completionPercentage = totalLessons > 0
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;

    setCourseProgress([
      {
        courseId,
        completedLessons,
        totalLessons,
        completionPercentage,
      },
    ]);
  }, [courseId, rawLessons]);

  // 5. Auto-select logic (Remains the same)
  useEffect(() => {
    if (lessons.length > 0 && !selectedLessonId) {
      const next = lessons.find((l) => !l.isCompleted && !l.isLocked);
      const first = lessons.find((l) => l.order === 1);
      const target = next || first;
      if (target) setSelectedLessonId(target.id);
    }
  }, [lessons, selectedLessonId]);

  const handleCompleteLesson = async (quizScore?: number) => {
    if (!selectedLesson || !selectedCourse) return;
    try {
      setCompletingLesson(true);
      // ... complete logic
      await api.post(`/courses/lessons/${selectedLesson.id}/complete`, { quizScore });

      // Refresh without signal (user action, not effect)
      await fetchLessons(selectedCourse.id);
      // ... rest of logic
    } catch (err) {
      console.error(err);
    } finally {
      setCompletingLesson(false);
    }
  };

  const handleEnroll = async () => {
    if (!selectedCourse) return;
    try {
      await api.post(`/courses/${selectedCourse.id}/enroll`);

      const enrollRes = await api.get("/courses/my-enrollments");
      setEnrollments(enrollRes.data);

      // Just re-fetching lessons will update the `lessons` variable via useMemo
      // because hasAccessToCourses (redux) or enrollments will likely update lock logic
      await fetchLessons(selectedCourse.id);
    } catch (err) {
      setError("Failed to enroll");
    }
  };

  return {
    selectedCourse,
    lessons,
    selectedLesson,
    setSelectedLesson: (l: Lesson) => setSelectedLessonId(l.id),
    enrollments,
    courseProgress,
    loading,
    lessonLoading,
    completingLesson,
    error,
    handleCompleteLesson,
    handleEnroll,
    navigate
  };
};