export interface InteractiveContent {
  type: 'drag-drop' | 'fill-blanks' | 'matching' | 'sorting' | 'hotspot' | 'timeline' | 'flashcard' | 'pronunciation' | 'listening' | 'sentence-builder';
  items: any[];
  settings: any;
  instruction: string;
  feedback: {
    correct: string;
    incorrect: string;
  };
}

export interface InteractiveTypeConfig {
  value: string;
  label: string;
  icon: React.ReactElement;
  description: string;
  example: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  color: string;
}

export interface InteractiveEditorProps {
  slide: {
    content: {
      content: InteractiveContent;
    };
  };
  index: number;
  onUpdate: (updates: Partial<InteractiveContent>) => void;
}

export interface InteractiveItemEditorProps {
  type: string;
  item: any;
  itemIndex: number;
  onUpdate: (itemIndex: number, updates: any) => void;
}

export interface InteractiveSettingsProps {
  type: string;
  content: InteractiveContent;
  onUpdate: (updates: any) => void;
}