import { useState } from 'react';
import { Slide, SlideContent } from '../types/slide.types';
import { getDefaultContent } from '../utils/lideDefaults';

interface UseSlideManagementProps {
  initialSlides: Slide[];
  onChange: (slides: Slide[]) => void;
}

export const useSlideManagement = ({ initialSlides, onChange }: UseSlideManagementProps) => {
  const [slides, setSlides] = useState<Slide[]>(
    initialSlides.length > 0 ? initialSlides : [{
      id: Date.now().toString(),
      content: getDefaultContent('text'),
    }]
  );

  const [activeSlide, setActiveSlide] = useState(0);

  const updateSlides = (newSlides: Slide[]) => {
    setSlides(newSlides);
    onChange(newSlides);
  };

  const updateSlide = (index: number, updates: Partial<Slide>) => {
    const newSlides = [...slides];
    newSlides[index] = { ...newSlides[index], ...updates };
    updateSlides(newSlides);
  };

  const updateSlideContent = (index: number, contentUpdates: Partial<SlideContent>) => {
    const newSlides = [...slides];
    newSlides[index].content = { ...newSlides[index].content, ...contentUpdates };
    updateSlides(newSlides);
  };

  const addSlide = (type: SlideContent['type'] = 'text') => {
    const newSlide: Slide = {
      id: Date.now().toString(),
      content: getDefaultContent(type),
    };
    const newSlides = [...slides, newSlide];
    updateSlides(newSlides);
    setActiveSlide(slides.length);
  };

  const duplicateSlide = (index: number) => {
    const slideToDuplicate = slides[index];
    const newSlide: Slide = {
      ...slideToDuplicate,
      id: Date.now().toString(),
      content: { ...slideToDuplicate.content },
    };
    const newSlides = [...slides];
    newSlides.splice(index + 1, 0, newSlide);
    updateSlides(newSlides);
    setActiveSlide(index + 1);
  };

  const removeSlide = (index: number) => {
    if (slides.length === 1) return;
    const newSlides = slides.filter((_, i) => i !== index);
    updateSlides(newSlides);
    if (activeSlide >= newSlides.length) {
      setActiveSlide(newSlides.length - 1);
    }
  };

  const changeSlideType = (index: number, newType: SlideContent['type']) => {
    updateSlideContent(index, getDefaultContent(newType));
  };

  const reorderSlides = (newSlides: Slide[]) => {
    updateSlides(newSlides);
  };

  return {
    slides,
    activeSlide,
    setActiveSlide,
    updateSlide,
    updateSlideContent,
    addSlide,
    duplicateSlide,
    removeSlide,
    changeSlideType,
    reorderSlides, // Export the new function
  };
};