export interface LessonKeyword {
  id: string;
  englishText: string;
  japaneseText: string;
  englishAudioUrl?: string;
  japaneseAudioUrl?: string;
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
  keywords?: LessonKeyword[];
}
