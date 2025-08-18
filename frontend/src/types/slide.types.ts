export interface SlideContent {
  type: 'text' | 'image' | 'video' | 'quiz' | 'interactive' | 'code';
  content: any;
  title?: string;
  subtitle?: string;
  alignment?: 'left' | 'center' | 'right';
}

export interface Slide {
  id: string;
  content: SlideContent;
  backgroundImage?: string;
  backgroundColor?: string;
  notes?: string;
  transition?: 'slide' | 'fade' | 'zoom' | 'flip';
  duration?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  learningObjectives?: string;
  tags?: string;
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
  markSlideAsComplete?: (slideId: string) => void;
}

export interface SlidesBuilderProps {
  initialSlides?: Slide[];
  onChange: (slides: Slide[]) => void;
}

export interface SlideEditorProps {
  slide: Slide;
  index: number;
  onUpdate: (index: number, updates: Partial<Slide>) => void;
  onUpdateContent: (index: number, contentUpdates: Partial<SlideContent>) => void;
  validationErrors: string[];
}

export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}