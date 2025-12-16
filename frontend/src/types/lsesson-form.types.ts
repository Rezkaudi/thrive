export type LessonType = "VIDEO" | "PDF" | "KEYWORDS" | "QUIZ" | "SLIDES";

export interface Keyword {
  englishText: string;
  japaneseText: string;
  englishAudioUrl: string;
  japaneseAudioUrl: string;
  englishSentence?: string;
  japaneseSentence?: string;
  japaneseSentenceAudioUrl?: string;
}

export interface LessonFormState {
  id?: string;
  title: string;
  description: string;
  order: number;
  lessonType: LessonType;
  contentUrl: string;
  contentData: any;
  pointsReward: number;
  requiresReflection: boolean;
  passingScore: number;
  keywords: Keyword[];
}
