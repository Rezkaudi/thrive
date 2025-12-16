// types.ts
export interface Course {
  id: string;
  title: string;
  description: string;
  type: string;
  icon: string;
  isActive: boolean;
  freeLessonCount?: number;
}

export interface Lesson {
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

export interface Enrollment {
  id: string;
  courseId: string;
  enrolledAt: string;
  course?: Course;
}

export interface CourseProgress {
  courseId: string;
  completedLessons: number;
  totalLessons: number;
  completionPercentage: number;
}

export const COURSE_THEMES = {
  JAPAN_IN_CONTEXT: { primary: "#5C633A", secondary: "#D4BC8C", accent: "#D4BC8C" },
  JLPT_IN_CONTEXT: { primary: "#A6531C", secondary: "#7ED4D0", accent: "#6DD6CE" },
};