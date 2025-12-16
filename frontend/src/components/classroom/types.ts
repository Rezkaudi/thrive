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