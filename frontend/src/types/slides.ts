export interface SlideContent {
  type: 'text' | 'image' | 'video' | 'quiz' | 'interactive' | 'code';
  content: any;
  title?: string;
  subtitle?: string;
}

export interface Slide {
  id: string;
  content: SlideContent;
  backgroundImage?: string;
  backgroundColor?: string;
  notes?: string;
}

export interface ValidationResult {
  isValid: boolean;
  message: string;
  type: 'error' | 'warning' | 'success';
}

export interface InteractiveSlidesProps {
  slides: Slide[];
  onComplete: () => void;
  pointsReward: number;
  isLessonCompleted?: boolean;
}

export interface SlideComponentProps {
  slide: Slide;
  currentSlide: number;
  interactiveAnswers: Record<string, any>;
  setInteractiveAnswers: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  showFeedback: Record<string, boolean>;
  setShowFeedback: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  validationResults: Record<string, ValidationResult>;
  setValidationResults: React.Dispatch<React.SetStateAction<Record<string, ValidationResult>>>;
  setSlideProgress: React.Dispatch<React.SetStateAction<Set<number>>>;
  checkAnswer: (slideId: string, userAnswer: any, correctAnswer: any, interactiveType?: string) => boolean;
}