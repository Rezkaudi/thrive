// types/interactive-items.ts

export interface BaseItem {
  id?: string;
  type: string;
}

export interface DragDropItem extends BaseItem {
  text: string;
  target: string;
  category?: string;
}

export interface FillBlanksItem extends BaseItem {
  sentence: string;
  blanks: string[];
  translation?: string;
}

export interface MatchingItem extends BaseItem {
  left: string;
  right: string;
  audioUrl?: string; // Audio file URL for the sound
  pair?: string | number;
}

export interface SortingItem extends BaseItem {
  text: string;
  correctOrder: number;
}

export interface HotspotItem extends BaseItem {
  x: number;
  y: number;
  label: string;
  feedback: string;
}

export interface TimelineItem extends BaseItem {
  event: string;
  date: string;
  description?: string;
}

export interface FlashcardItem extends BaseItem {
  front: string;
  back: string;
  category?: string;
}

export interface PronunciationItem extends BaseItem {
  text: string;
  pronunciation: string;
  audioUrl?: string;
}

export interface ListeningItem extends BaseItem {
  audioUrl: string;
  question: string;
  options: string[];
  correct: number;
}

export interface SentenceBuilderItem extends BaseItem {
  words: string[];
  correctOrder: number[];
  translation?: string;
  distractors?: string[]; 
}

export type InteractiveItem =
  | DragDropItem
  | FillBlanksItem
  | MatchingItem
  | SortingItem
  | HotspotItem
  | TimelineItem
  | FlashcardItem
  | PronunciationItem
  | ListeningItem
  | SentenceBuilderItem;

export interface InteractiveItemEditorProps {
  type: string;
  item: InteractiveItem;
  itemIndex: number;
  onUpdate: (itemIndex: number, updates: Partial<InteractiveItem>) => void;
  currentTypeConfig?: {
    color?: string;
    [key: string]: any;
  };
}