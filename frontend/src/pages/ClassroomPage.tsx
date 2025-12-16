import React, { useState, useEffect } from "react";
import { Container, useMediaQuery, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Course, CourseProgress } from "../types/course.types";
import { ClassroomService } from "../services/classroom.service";
import { ClassroomHeader } from "../components/classroom/ClassroomHeader";
import { CourseGrid } from "../components/classroom/CourseGrid";
import { EnrollmentDialog } from "../components/classroom/EnrollmentDialog";

export const ClassroomPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<string[]>([]);
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
      const [coursesData, enrollmentsData] = await Promise.all([
        ClassroomService.getCourses(),
        ClassroomService.getEnrollments(),
      ]);

      setCourses(coursesData);
      setEnrollments(enrollmentsData.map((e: any) => e.courseId));

      // Fetch progress for enrolled courses
      const progressPromises = enrollmentsData.map((e: any) =>
        ClassroomService.getCourseProgress(e.courseId)
      );
      const progressData = await Promise.all(progressPromises);
      setCourseProgress(progressData);
    } catch (err) {
      setError("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const handleCourseClick = (course: Course) => {
    if (enrollments.includes(course.id)) {
      navigate(`/classroom/${course.id}`);
    } else {
      setEnrollDialog(course);
    }
  };

  const handleEnroll = async (course: Course) => {
    try {
      await ClassroomService.enrollInCourse(course.id);
      navigate(`/classroom/${course.id}`);
    } catch (error) {
      if ((error as any).response?.status === 409) {
        navigate(`/classroom/${course.id}`);
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <ClassroomHeader />

      <CourseGrid
        courses={courses}
        loading={loading}
        error={error}
        enrollments={enrollments}
        progressData={courseProgress}
        onCourseClick={handleCourseClick}
        isMobile={isMobile}
      />

      <EnrollmentDialog
        course={enrollDialog}
        onClose={() => setEnrollDialog(null)}
        onEnroll={handleEnroll}
      />
    </Container>
  );
};
