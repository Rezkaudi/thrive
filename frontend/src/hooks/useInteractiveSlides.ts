// In useInteractiveSlides.ts, update the hook with quiz completion tracking

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

  // NEW: Track quiz completion status
  const [quizCompletionStatus, setQuizCompletionStatus] = useState<Record<string, boolean>>({});

  const containerRef = useRef<HTMLDivElement>(null);

  const slide = slides[currentSlide];
  const progress = ((currentSlide + 1) / slides.length) * 100;
  const isLastSlide = currentSlide === slides.length - 1;

  useEffect(() => {
    if (slide) {
      // Only mark slide as progressed if it's not a quiz or if quiz is completed
      if (slide.content.type !== 'quiz' || isQuizCompleted(currentSlide)) {
        setSlideProgress(prev => new Set(prev).add(currentSlide));
      }
    }
  }, [currentSlide, slide, quizCompletionStatus]);

  // Helper function to check if a quiz slide is completed
  const isQuizCompleted = (slideIndex: number) => {
    const slideAtIndex = slides[slideIndex];
    if (slideAtIndex?.content.type !== 'quiz') return true;

    const quizId = `quiz-${slideAtIndex.id}`;
    return quizCompletionStatus[quizId] === true;
  };

  // Helper function to check if navigation to next slide is allowed
  const canNavigateToNext = () => {
    // Check if current slide is a quiz
    if (slide?.content.type === 'quiz') {
      return isQuizCompleted(currentSlide);
    }
    return true;
  };

  // Enhanced handleNext with quiz validation
  const handleNext = () => {
    if (!isLastSlide) {
      // Check if current slide is a quiz and if it's completed
      if (!canNavigateToNext()) {
        // Show warning message
        const quizId = `quiz-${slide.id}`;
        setValidationResults(prev => ({
          ...prev,
          [quizId]: {
            isValid: false,
            message: 'Please complete the quiz correctly before proceeding to the next slide.',
            type: 'warning'
          }
        }));
        setShowFeedback(prev => ({
          ...prev,
          [quizId]: true
        }));

        // Hide warning after 3 seconds
        setTimeout(() => {
          setShowFeedback(prev => ({
            ...prev,
            [quizId]: false
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

  const handleComplete = () => {
    // Check if all slides are completed (including all quizzes)
    let allCompleted = true;

    for (let i = 0; i < slides.length; i++) {
      if (slides[i].content.type === 'quiz' && !isQuizCompleted(i)) {
        allCompleted = false;
        break;
      }
    }

    if (allCompleted && slideProgress.size === slides.length) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      onComplete();
    } else {
      alert('Please complete all quizzes before finishing the lesson.');
    }
  };

  // Enhanced checkAnswer with quiz completion tracking
  const checkAnswer = (slideId: string, userAnswer: any, correctAnswer: any, interactiveType?: string): boolean => {
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

    // Check correctness
    const isCorrect = JSON.stringify(userAnswer) === JSON.stringify(correctAnswer);

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

      // Mark quiz as completed if it's a quiz
      if (interactiveType === 'quiz') {
        setQuizCompletionStatus(prev => ({
          ...prev,
          [slideId]: true
        }));

        // Now mark slide as progressed since quiz is completed
        setSlideProgress(prev => new Set(prev).add(currentSlide));
      } else {
        setSlideProgress(prev => new Set(prev).add(currentSlide));
      }

      setValidationResults(prev => ({
        ...prev,
        [slideId]: {
          isValid: true,
          message: 'Perfect! Correct answer! 🎉',
          type: 'success'
        }
      }));
    } else {
      setValidationResults(prev => ({
        ...prev,
        [slideId]: {
          isValid: false,
          message: 'Not quite right. Please try again! 💪',
          type: 'error'
        }
      }));

      // Mark quiz as not completed
      if (interactiveType === 'quiz') {
        setQuizCompletionStatus(prev => ({
          ...prev,
          [slideId]: false
        }));
      }
    }

    setTimeout(() => {
      setShowFeedback(prev => ({
        ...prev,
        [slideId]: false
      }));
    }, 3000);

    return isCorrect;
  };

  // ... rest of the code remains the same ...

  const toggleFullscreen = () => {
    setIsFullscreen(pre => !pre)

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
    canNavigateToNext, // Export this for UI feedback
    quizCompletionStatus, // Export for debugging/UI
  };
};