import React from 'react';
import {
  TouchApp,
  LinearScale,
  CompareArrows,
  SortByAlpha,
  Timeline,
  SwapHoriz,
  RecordVoiceOver,
  Hearing,
  Category,
} from '@mui/icons-material';
import { InteractiveTypeConfig } from '../types/interactive.types';

export const interactiveTypes: InteractiveTypeConfig[] = [
  {
    value: 'drag-drop',
    label: 'Drag & Drop',
    icon: React.createElement(TouchApp),
    description: 'Students drag items to correct positions',
    example: 'Match Japanese words to their English translations',
    difficulty: 'Easy',
    color: '#5C633A'
  },
  {
    value: 'fill-blanks',
    label: 'Fill in the Blanks',
    icon: React.createElement(LinearScale),
    description: 'Students fill missing words in sentences',
    example: 'Complete the Japanese sentence: "私は___です"',
    difficulty: 'Medium',
    color: '#A6531C'
  },
  {
    value: 'matching',
    label: 'Matching Pairs',
    icon: React.createElement(CompareArrows),
    description: 'Connect related items with lines',
    example: 'Match hiragana characters to their sounds',
    difficulty: 'Easy',
    color: '#45B7D1'
  },
  {
    value: 'sorting',
    label: 'Sort & Order',
    icon: React.createElement(SortByAlpha),
    description: 'Arrange items in correct order',
    example: 'Order Japanese numbers from 1 to 10',
    difficulty: 'Medium',
    color: '#9C27B0'
  },
  {
    value: 'hotspot',
    label: 'Hotspot Click',
    icon: React.createElement(TouchApp),
    description: 'Click on specific areas of an image',
    example: 'Click on body parts in Japanese',
    difficulty: 'Easy',
    color: '#FF9800'
  },
  {
    value: 'timeline',
    label: 'Timeline',
    icon: React.createElement(Timeline),
    description: 'Arrange events chronologically',
    example: 'Order Japanese historical periods',
    difficulty: 'Hard',
    color: '#795548'
  },
  {
    value: 'flashcard',
    label: 'Interactive Flashcards',
    icon: React.createElement(SwapHoriz),
    description: 'Flip cards to reveal answers',
    example: 'Kanji flashcards with readings',
    difficulty: 'Easy',
    color: '#2E7D32'
  },
  {
    value: 'pronunciation',
    label: 'Pronunciation Practice',
    icon: React.createElement(RecordVoiceOver),
    description: 'Record and compare pronunciation',
    example: 'Practice Japanese pronunciation',
    difficulty: 'Hard',
    color: '#1976D2'
  },
  {
    value: 'listening',
    label: 'Listening Exercise',
    icon: React.createElement(Hearing),
    description: 'Audio-based comprehension',
    example: 'Listen and identify Japanese words',
    difficulty: 'Medium',
    color: '#8BC34A'
  },
  {
    value: 'sentence-builder',
    label: 'Sentence Builder',
    icon: React.createElement(Category),
    description: 'Build sentences from word blocks',
    example: 'Construct Japanese sentences with correct grammar',
    difficulty: 'Hard',
    color: '#FF5722'
  }
];

export const getInteractiveTypeConfig = (type: string): InteractiveTypeConfig | undefined => {
  return interactiveTypes.find(t => t.value === type);
};

export const getDefaultInstruction = (type: string): string => {
  const typeConfig = getInteractiveTypeConfig(type);
  return typeConfig?.description || 'Complete the interactive activity';
};