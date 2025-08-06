import { useEffect, useRef, useState } from "react";
import { Slide, ValidationResult } from "../types/slides";
import confetti from 'canvas-confetti';
import { validateAnswer } from "../utils/validation";


export const useInteractiveSlides = (slides: Slide[], onComplete: () => void) => {

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [slideProgress, setSlideProgress] = useState<Set<number>>(new Set());
  const [interactiveAnswers, setInteractiveAnswers] = useState<Record<string, any>>({});
  const [showFeedback, setShowFeedback] = useState<Record<string, boolean>>({});
  const [validationResults, setValidationResults] = useState<Record<string, ValidationResult>>({});

  const containerRef = useRef<HTMLDivElement>(null);

  const slide = slides[currentSlide];
  const progress = ((currentSlide + 1) / slides.length) * 100;
  const isLastSlide = currentSlide === slides.length - 1;

  useEffect(() => {
    if (slide) {
      setSlideProgress(prev => new Set(prev).add(currentSlide));
    }
  }, [currentSlide, slide]);

  // Enhanced fullscreen functionality
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = Boolean(document.fullscreenElement);
      setIsFullscreen(isCurrentlyFullscreen);
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if (isFullscreen) {
        switch (e.key) {
          case 'ArrowLeft':
            handlePrevious();
            break;
          case 'ArrowRight':
            handleNext();
            break;
          case 'Escape':
            exitFullscreen();
            break;
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [isFullscreen, currentSlide]);

  const handleNext = () => {
    if (!isLastSlide) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleComplete = () => {
    if (slideProgress.size === slides.length) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      onComplete();
    }
  };

  const toggleFullscreen = () => {
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
      setSlideProgress(prev => new Set(prev).add(currentSlide));
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
    }

    setTimeout(() => {
      setShowFeedback(prev => ({
        ...prev,
        [slideId]: false
      }));
    }, 3000);

    return isCorrect;
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
  }
}