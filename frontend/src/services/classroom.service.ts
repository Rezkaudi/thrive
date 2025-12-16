import api from './api';
import { Course, CourseProgress } from '../types/course.types';

export const ClassroomService = {
  getCourses: async (): Promise<Course[]> => {
    const response = await api.get('/courses');
    return response.data;
  },

  getEnrollments: async () => {
    const response = await api.get('/courses/my-enrollments');
    return response.data;
  },

  getCourseProgress: async (courseId: string): Promise<CourseProgress> => {
    const response = await api.get(`/courses/${courseId}/lessons`);
    const lessons = response.data;
    const completedLessons = lessons.filter((l: any) => l.isCompleted).length;
    const totalLessons = lessons.length;
    const completionPercentage = totalLessons > 0
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;

    return {
      courseId,
      completedLessons,
      totalLessons,
      completionPercentage,
    };
  },

  enrollInCourse: async (courseId: string) => {
    return api.post(`/courses/${courseId}/enroll`);
  },
};