import { useState, useEffect } from 'react';
import { Slide } from '../types/slide.types';
import { InteractiveContent } from '../types/interactive.types';

export const useSlideValidation = (slides: Slide[]) => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  const validateSlide = (index: number, slide: Slide) => {
    const errors: string[] = [];

    // Basic validation
    // if (!slide.content.title?.trim() && slide.content.type !== 'code') {
    //   errors.push('Title is required');
    // }

    // Type-specific validation
    switch (slide.content.type) {
      case 'image':
        if (!slide.content.content?.url?.trim()) {
          errors.push('Image URL is required');
        }
        break;

      case 'video':
        if (!slide.content.content?.url?.trim()) {
          errors.push('Video URL is required');
        }
        break;

      case 'quiz':
        if (!slide.content.content?.question?.trim()) {
          errors.push('Quiz question is required');
        }
        if ((slide.content.content?.type === 'single-choice' || slide.content.content?.type === 'multiple-choice') &&
          (!slide.content.content?.options ||
            slide.content.content.options.some((opt: string) => !opt.trim()))) {
          errors.push('All quiz options must be filled');
        }
        if (slide.content.content?.type === 'single-choice' &&
          (slide.content.content?.correctAnswer === undefined || slide.content.content?.correctAnswer === null)) {
          errors.push('Correct answer must be selected for single choice');
        }
        if (slide.content.content?.type === 'multiple-choice' &&
          (!slide.content.content?.correctAnswers ||
            slide.content.content.correctAnswers.length === 0)) {
          errors.push('At least one correct answer must be selected for multiple choice');
        }
        break;

      case 'interactive':
        const interactiveContent = slide.content.content as InteractiveContent;
        if (!interactiveContent?.instruction?.trim()) {
          errors.push('Interactive instruction is required');
        }
        if (!interactiveContent?.items?.length) {
          errors.push('At least one interactive item is required');
        }
        break;

      case 'code':
        if (!slide.content.content?.code?.trim()) {
          errors.push('Code content is required');
        }
        break;
    }

    setValidationErrors(prev => ({
      ...prev,
      [index]: errors
    }));

    return errors;
  };

  const validateAllSlides = () => {
    slides.forEach((slide, index) => {
      validateSlide(index, slide);
    });
  };

  useEffect(() => {
    validateAllSlides();
  }, [slides]);

  const getTotalErrors = () => {
    return Object.values(validationErrors).reduce((acc, errors) => acc + errors.length, 0);
  };

  const hasErrors = (index: number) => {
    return (validationErrors[index] || []).length > 0;
  };

  return {
    validationErrors,
    validateSlide,
    validateAllSlides,
    getTotalErrors,
    hasErrors,
  };
};