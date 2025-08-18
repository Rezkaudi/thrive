// Enhanced useInteractiveSlides.ts with auto-progression for quiz types only and no timer

import { useEffect, useRef, useState } from "react";
import { Slide, ValidationResult } from "../types/slide.types";
import confetti from 'canvas-confetti';
import { validateAnswer } from "../utils/validation";

export const useInteractiveSlides = (slides: Slide[], onComplete: () => void) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [slideProgress, setSlideProgress] = useState<Set<number>>(new Set());
  const [interactiveAnswers, setInteractiveAnswers] = useState<Record<string, any>>({});
  const [showFeedback, setShowFeedback] = useState<Record<string, boolean>>({});
  const [validationResults, setValidationResults] = useState<Record<string, ValidationResult>>({});

  // Enhanced: Track completion status for quiz slide types only
  const [quizCompletionStatus, setQuizCompletionStatus] = useState<Record<string, boolean>>({});

  // Track auto-progression timers to clean them up if needed
  const progressionTimers = useRef<Record<string, NodeJS.Timeout>>({});

  const containerRef = useRef<HTMLDivElement>(null);

  const slide = slides[currentSlide];
  const progress = ((currentSlide + 1) / slides.length) * 100;
  const isLastSlide = currentSlide === slides.length - 1;

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      Object.values(progressionTimers.current).forEach(timer => clearTimeout(timer));
    };
  }, []);

  useEffect(() => {
    if (slide) {
      // Mark slide as progressed if it's not a quiz or if quiz is completed
      const shouldMarkProgressed = !isQuizSlide(slide) || isQuizCompleted(currentSlide);

      if (shouldMarkProgressed) {
        setSlideProgress(prev => new Set(prev).add(currentSlide));
      }
    }
  }, [currentSlide, slide, quizCompletionStatus]);

  // Helper function to check if a slide is a quiz (ONLY quiz type)
  const isQuizSlide = (slide: Slide) => {
    return slide.content.type === 'quiz';
  };

  // Helper function to check if a quiz slide is completed
  const isQuizCompleted = (slideIndex: number) => {
    const slideAtIndex = slides[slideIndex];
    if (!isQuizSlide(slideAtIndex)) return true; // Non-quiz slides are always "completed"

    const slideId = getSlideId(slideAtIndex);
    return quizCompletionStatus[slideId] === true;
  };

  // Helper function to get consistent slide ID
  const getSlideId = (slide: Slide) => {
    if (slide.content.type === 'quiz') {
      return `quiz-${slide.id}`;
    } else if (slide.content.type === 'interactive') {
      const interactiveContent = slide.content.content;
      return `${interactiveContent.type}-${slide.id}`;
    }
    return slide.id;
  };

  // Helper function to check if navigation to next slide is allowed
  const canNavigateToNext = () => {
    if (isQuizSlide(slide)) {
      return isQuizCompleted(currentSlide);
    }
    return true; // All non-quiz slides allow navigation
  };

  // Enhanced handleNext with quiz validation only
  const handleNext = () => {
    if (!isLastSlide) {
      // Check if current slide is a quiz and if it's completed
      if (!canNavigateToNext()) {
        // Show warning message for quiz only
        const slideId = getSlideId(slide);
        setValidationResults(prev => ({
          ...prev,
          [slideId]: {
            isValid: false,
            message: 'Please complete this quiz correctly before proceeding to the next slide.',
            type: 'warning'
          }
        }));
        setShowFeedback(prev => ({
          ...prev,
          [slideId]: true
        }));

        // Hide warning after 3 seconds
        setTimeout(() => {
          setShowFeedback(prev => ({
            ...prev,
            [slideId]: false
          }));
        }, 3000);

        return;
      }

      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  // FIXED: Remove slideProgress.size check to fix completion issue
  const handleComplete = () => {
    // Check if all quiz slides are completed
    let allQuizzesCompleted = true;

    for (let i = 0; i < slides.length; i++) {
      if (isQuizSlide(slides[i]) && !isQuizCompleted(i)) {
        allQuizzesCompleted = false;
        break;
      }
    }

    // Only check if all quizzes are completed (removed slideProgress.size check)
    if (allQuizzesCompleted) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      onComplete();
    } else {
      alert('Please complete all quiz activities before finishing the lesson.');
    }
  };

  // Enhanced checkAnswer with completion tracking and auto-progression (no timer)
  const checkAnswer = (slideId: string, userAnswer: any, correctAnswer: any, interactiveType?: string): boolean => {
    // Clear any existing progression timer for this slide
    if (progressionTimers.current[slideId]) {
      clearTimeout(progressionTimers.current[slideId]);
      delete progressionTimers.current[slideId];
    }

    // First validate the answer
    const validation = validateAnswer(slideId, userAnswer, interactiveType || 'generic', slide);
    setValidationResults(prev => ({
      ...prev,
      [slideId]: validation
    }));

    if (!validation.isValid) {
      setShowFeedback(prev => ({
        ...prev,
        [slideId]: true
      }));
      setTimeout(() => {
        setShowFeedback(prev => ({
          ...prev,
          [slideId]: false
        }));
      }, 4000);
      return false;
    }

    // Enhanced object comparison for different data types
    let isCorrect = false;

    // SPECIAL CASE: For slides where validation passing means success
    if (interactiveType === 'pronunciation' || interactiveType === 'flashcard' || interactiveType === 'listening') {
      // For these slide types, if validation passed with success type, it's correct
      isCorrect = validation.type === 'success';
      console.log(`${interactiveType} slide - using validation result:`, {
        validationType: validation.type,
        isCorrect,
        message: validation.message
      });
    } else if (interactiveType === 'drag-drop') {
      // For drag-drop, compare object properties regardless of key order
      isCorrect = deepEqual(userAnswer, correctAnswer);
    } else if (Array.isArray(userAnswer) && Array.isArray(correctAnswer)) {
      // For arrays, compare elements
      isCorrect = userAnswer.length === correctAnswer.length &&
        userAnswer.every((val, index) => val === correctAnswer[index]);
    } else if (typeof userAnswer === 'object' && typeof correctAnswer === 'object') {
      // For other objects, use deep comparison
      isCorrect = deepEqual(userAnswer, correctAnswer);
    } else {
      // For primitive values, direct comparison
      isCorrect = userAnswer === correctAnswer;
    }

    console.log('Answer check:', { userAnswer, correctAnswer, isCorrect, interactiveType, validationType: validation.type });

    setShowFeedback(prev => ({
      ...prev,
      [slideId]: true
    }));

    if (isCorrect) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });

      // Mark quiz as completed (only for quiz types)
      if (interactiveType === 'quiz' || slide.content.type === 'quiz') {
        setQuizCompletionStatus(prev => ({
          ...prev,
          [slideId]: true
        }));

        // Mark slide as progressed since quiz is completed
        setSlideProgress(prev => new Set(prev).add(currentSlide));
      } else {
        // For non-quiz interactive types, mark slide as progressed immediately
        setSlideProgress(prev => new Set(prev).add(currentSlide));
      }

      // For slides that already have success validation, keep that message
      // Otherwise, set success validation message
      if (validation.type === 'success') {
        // Keep the existing success validation message
        console.log('Keeping existing success validation message:', validation.message);
      } else {
        // Set new success validation message
        setValidationResults(prev => ({
          ...prev,
          [slideId]: {
            isValid: true,
            message: getSuccessMessage(interactiveType),
            type: 'success'
          }
        }));
      }

      // AUTO-PROGRESSION: Move to next slide after success message (no timer for quiz types)
      const autoProgressionDelay = getAutoProgressionDelay(interactiveType);

      progressionTimers.current[slideId] = setTimeout(() => {
        // Hide feedback first
        setShowFeedback(prev => ({
          ...prev,
          [slideId]: false
        }));

        // Then progress to next slide if not on last slide
        if (!isLastSlide) {
          setTimeout(() => {
            setCurrentSlide(prev => prev + 1);
          }, 500); // Small delay for smooth transition
        }

        delete progressionTimers.current[slideId];
      }, autoProgressionDelay);

    } else {
      setValidationResults(prev => ({
        ...prev,
        [slideId]: {
          isValid: false,
          message: getErrorMessage(interactiveType),
          type: 'error'
        }
      }));

      // Mark quiz as not completed (only for quiz types)
      if (interactiveType === 'quiz' || slide.content.type === 'quiz') {
        setQuizCompletionStatus(prev => ({
          ...prev,
          [slideId]: false
        }));
      }

      // Hide error feedback after shorter delay
      setTimeout(() => {
        setShowFeedback(prev => ({
          ...prev,
          [slideId]: false
        }));
      }, 3000);
    }

    return isCorrect;
  };

  // Deep equality comparison function
  const deepEqual = (obj1: any, obj2: any): boolean => {
    if (obj1 === obj2) return true;

    if (obj1 == null || obj2 == null) return false;

    if (typeof obj1 !== typeof obj2) return false;

    if (typeof obj1 !== 'object') return obj1 === obj2;

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (let key of keys1) {
      if (!keys2.includes(key)) return false;
      if (!deepEqual(obj1[key], obj2[key])) return false;
    }

    return true;
  };

  // Helper function to get success message based on interactive type
  const getSuccessMessage = (interactiveType?: string): string => {
    const messages = {
      'quiz': '🎉 Perfect! Correct answer! Moving to next slide...',
      'drag-drop': '🎯 Excellent! All matches are correct!',
      'fill-blanks': '✨ Great job! All blanks filled correctly!',
      'sentence-builder': '🎉 Perfect sentence! You got the order exactly right!',
      'matching': '🔊 Outstanding! All audio matches are correct!',
      'sorting': '📊 Perfect order! You sorted everything correctly!',
      'hotspot': '🎯 Excellent! You found all the hotspots!',
      'timeline': '⏰ Perfect chronology! All events in correct order!',
      'listening': '👂 Great listening! All answers correct!',
      'pronunciation': '🗣️ Excellent pronunciation practice!',
      'flashcard': '🎴 All flashcards completed!',
      'generic': '🎉 Perfect! Correct answer!'
    };

    return messages[interactiveType as keyof typeof messages] || messages.generic;
  };

  // Helper function to get error message based on interactive type
  const getErrorMessage = (interactiveType?: string): string => {
    const messages = {
      'quiz': '❌ Not quite right. Please try again! 💪',
      'drag-drop': '❌ Some matches are incorrect. Try again! 💪',
      'fill-blanks': '❌ Some words are incorrect. Review and try again! 💪',
      'sentence-builder': '❌ Word order is incorrect. Try rearranging! 💪',
      'matching': '❌ Some audio matches are wrong. Listen again! 💪',
      'sorting': '❌ Order is incorrect. Try sorting again! 💪',
      'hotspot': '❌ Some hotspots are missing or incorrect. Try again! 💪',
      'timeline': '❌ Chronological order is incorrect. Try again! 💪',
      'listening': '❌ Some answers are incorrect. Listen again! 💪',
      'pronunciation': '❌ Keep practicing! Try recording again! 💪',
      'flashcard': '❌ Review the flashcards and try again! 💪',
      'generic': '❌ Not quite right. Please try again! 💪'
    };

    return messages[interactiveType as keyof typeof messages] || messages.generic;
  };

  // Helper function to get auto-progression delay based on interactive type
  const getAutoProgressionDelay = (interactiveType?: string): number => {
    const delays = {
      'quiz': 2500,           // Quick auto-progression for quizzes
      'drag-drop': 0,         // No auto-progression for other interactive types
      'fill-blanks': 0,       
      'sentence-builder': 0,  
      'matching': 0,          
      'sorting': 0,           
      'hotspot': 0,           
      'timeline': 0,          
      'listening': 0,         
      'pronunciation': 0,     
      'flashcard': 0,         
      'generic': 0            
    };

    return delays[interactiveType as keyof typeof delays] || delays.generic;
  };

  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);

    if (!isFullscreen) {
      if (containerRef.current) {
        containerRef.current.requestFullscreen?.();
      }
    } else {
      exitFullscreen();
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    }
  };

  const slideComponentProps = {
    slide,
    currentSlide,
    interactiveAnswers,
    setInteractiveAnswers,
    showFeedback,
    setShowFeedback,
    validationResults,
    setValidationResults,
    setSlideProgress,
    checkAnswer,
  };

  return {
    slide,
    isFullscreen,
    currentSlide,
    progress,
    slideComponentProps,
    slideProgress,
    isLastSlide,
    containerRef,
    toggleFullscreen,
    exitFullscreen,
    handlePrevious,
    handleNext,
    handleComplete,
    setCurrentSlide,
    canNavigateToNext,
    quizCompletionStatus, // Export for debugging/UI (renamed from interactiveCompletionStatus)
    // NEW: Export validation state for auto-progression feedback
    validationResults,
    showFeedback,
  };
};