export interface Course {
  id: string;
  title: string;
  description: string;
  type: string;
  icon: string;
  isActive: boolean;
  freeLessonCount?: number;
  levelId?: string | null;
  level?: { id: string; name: string } | null;
}

export interface CourseProgress {
  courseId: string;
  completedLessons: number;
  totalLessons: number;
  completionPercentage: number;
}

export interface CourseCardProps {
  course: Course;
  onClick: () => void;
  isEnrolled: boolean;
  progress?: number;
  lessonCount?: number;
  completedCount?: number;
}