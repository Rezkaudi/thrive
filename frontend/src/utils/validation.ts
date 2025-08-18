import { ValidationResult, Slide } from '../types/slide.types';

export const validateAnswer = (
  slideId: string,
  userAnswer: any,
  interactiveType: string,
  slide: Slide
): ValidationResult => {
  if (!userAnswer && interactiveType !== 'quiz' && interactiveType !== 'pronunciation') {
    return {
      isValid: false,
      message: 'Please provide an answer before submitting.',
      type: 'warning'
    };
  }

  switch (interactiveType) {
    case 'quiz':
      const quizContent = slide.content.content;

      if (quizContent?.type === 'single-choice') {
        if (typeof userAnswer !== 'number') {
          return {
            isValid: false,
            message: 'Please select an answer before submitting.',
            type: 'warning'
          };
        }
      } else if (quizContent?.type === 'multiple-choice') {
        if (!userAnswer || !Array.isArray(userAnswer) || userAnswer.length === 0) {
          return {
            isValid: false,
            message: 'Please select at least one answer before submitting.',
            type: 'warning'
          };
        }
      }
      break;

    case 'drag-drop':
      const requiredItems = slide.content.content.items?.length || 0;
      const answeredItems = Object.keys(userAnswer || {}).length;
      if (answeredItems < requiredItems) {
        return {
          isValid: false,
          message: `Please match all ${requiredItems} items. You have ${answeredItems} matched.`,
          type: 'warning'
        };
      }
      break;

    case 'fill-blanks':
      const totalBlanks = slide.content.content.items?.reduce((total: number, item: any) => {
        return total + (item.sentence?.split('___').length - 1 || 0);
      }, 0) || 0;
      const filledBlanks = Object.keys(userAnswer || {}).length;
      if (filledBlanks < totalBlanks) {
        return {
          isValid: false,
          message: `Please fill in all ${totalBlanks} blanks. You have ${filledBlanks} filled.`,
          type: 'warning'
        };
      }
      break;

    case 'sentence-builder':
      const requiredWords = slide.content.content.items?.[0]?.words?.length || 0;
      if ((userAnswer?.length || 0) < requiredWords) {
        return {
          isValid: false,
          message: `Please use all ${requiredWords} words to build the sentence.`,
          type: 'warning'
        };
      }
      break;

    case 'sorting':
      const sortItems = userAnswer?.length || 0;
      const requiredSort = slide.content.content.items?.length || 0;
      if (sortItems < requiredSort) {
        return {
          isValid: false,
          message: `Please arrange all ${requiredSort} items in order.`,
          type: 'warning'
        };
      }
      break;

    case 'hotspot':
      const requiredClicks = slide.content.content.items?.length || 0;
      const actualClicks = userAnswer?.length || 0;
      if (actualClicks < requiredClicks) {
        return {
          isValid: false,
          message: `Please click on all ${requiredClicks} hotspots. You have clicked ${actualClicks}.`,
          type: 'warning'
        };
      }
      break;

    case 'matching':
      const requiredConnections = slide.content.content.items?.length || 0;
      const actualConnections = Object.keys(userAnswer || {}).length;
      if (actualConnections < requiredConnections) {
        return {
          isValid: false,
          message: `Please make all ${requiredConnections} connections. You have ${actualConnections} connected.`,
          type: 'warning'
        };
      }
      break;

    case 'timeline':
      const requiredEvents = slide.content.content.items?.length || 0;
      const arrangedEvents = userAnswer?.length || 0;
      if (arrangedEvents < requiredEvents) {
        return {
          isValid: false,
          message: `Please arrange all ${requiredEvents} events. You have ${arrangedEvents} arranged.`,
          type: 'warning'
        };
      }
      break;

    case 'listening':
      const totalQuestions = slide.content.content.items?.length || 0;
      const answeredQuestions = Object.keys(userAnswer || {}).length;
      if (answeredQuestions < totalQuestions) {
        return {
          isValid: false,
          message: `Please answer all ${totalQuestions} questions. You have answered ${answeredQuestions}.`,
          type: 'warning'
        };
      }
      break;

    case 'flashcard':
      const totalCards = slide.content.content.items?.length || 0;
      const reviewedCards = Object.keys(userAnswer || {}).length;
      if (reviewedCards < totalCards) {
        return {
          isValid: false,
          message: `Please review all ${totalCards} flashcards. You have reviewed ${reviewedCards}.`,
          type: 'warning'
        };
      }
      break;

    case 'pronunciation':
      // For pronunciation, we check if the user has recorded something
      if (!userAnswer || typeof userAnswer !== 'object') {
        return {
          isValid: false,
          message: 'Please record your pronunciation before completing the exercise.',
          type: 'warning'
        };
      }
      
      // Check if slide is marked as completed and has recordings
      if (userAnswer.completed === true) {
        const recordedItems = Object.keys(userAnswer).filter(key => {
          const value = userAnswer[key];
          return value && key !== 'completed' && typeof value === 'string' && value.length > 0;
        });
        
        if (recordedItems.length > 0) {
          return {
            isValid: true,
            message: `🗣️ Excellent pronunciation practice! You recorded ${recordedItems.length} item(s). Moving to next slide...`,
            type: 'success'
          };
        }
      }
      
      // Check if at least one item has been recorded (for intermediate validation)
      const recordedItems = Object.keys(userAnswer).filter(key => {
        const value = userAnswer[key];
        return value && key !== 'completed' && typeof value === 'string' && value.length > 0;
      });
      
      if (recordedItems.length === 0) {
        return {
          isValid: false,
          message: 'Please record at least one pronunciation before completing.',
          type: 'warning'
        };
      }
  }

  return {
    isValid: true,
    message: 'Answer validated successfully!',
    type: 'success'
  };
};