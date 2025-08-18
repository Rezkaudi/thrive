import { InteractiveContent } from '../types/interactive.types';
import { SlideContent } from '../types/slide.types';

export const getDefaultContent = (type: SlideContent['type']): SlideContent => {
  switch (type) {
    case 'text':
      return {
        type: 'text',
        content: '',
        title: '',
        subtitle: ''
      };

    case 'image':
      return {
        type: 'image',
        content: { url: '', alt: '', caption: '' },
        title: ''
      };

    case 'video':
      return {
        type: 'video',
        content: { url: '' },
        title: ''
      };

    case 'quiz':
      return {
        type: 'quiz',
        content: {
          question: '',
          type: 'single-choice',
          options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
          correctAnswer: 0,
          correctAnswers: [0], // For multiple choice
          explanation: '',
        },
        title: ''
      };

    case 'interactive':
      return {
        type: 'interactive',
        content: {
          type: 'drag-drop',
          instruction: 'Drag items to their correct positions',
          items: [],
          settings: {},
          feedback: {
            correct: 'Excellent! You got it right! 🎉',
            incorrect: 'Not quite right. Try again! 💪'
          }
        } as InteractiveContent,
        title: '',
      };

    case 'code':
      return {
        type: 'code',
        content: {
          code: '// Enter your code here\nconsole.log("Hello, World!");',
          language: 'javascript'
        },
        title: '',
      };

    default:
      return {
        type: 'text',
        content: '',
        title: '',
        subtitle: ''
      };
  }
};

export const getDefaultInteractiveItem = (type: string) => {
  const id = Date.now() + Math.random();

  switch (type) {
    case 'drag-drop':
      return { id, text: '', target: '', category: '' };

    case 'fill-blanks':
      return { id, sentence: 'I am ___ student', blanks: ['a'], translation: 'I am a student' };

    case 'matching':
      return { id, left: '', right: '', pair: id };

    case 'sorting':
      return { id, text: '', correctOrder: 0 };

    case 'hotspot':
      return { id, x: 50, y: 50, label: '', feedback: '' };

    case 'timeline':
      return { id, event: '', date: '', description: '' };

    case 'flashcard':
      return { id, front: '', back: '', category: 'vocabulary' };

    case 'pronunciation':
      return { id, text: '', pronunciation: '', audioUrl: '' };

    case 'listening':
      return {
        id,
        audioUrl: '',
        question: '',
        options: ['Option 1', 'Option 2', 'Option 3'],
        correct: 0
      };

    case 'sentence-builder':
      return { id, words: [''], correctOrder: [], translation: '' };

    default:
      return { id, text: '' };
  }
};