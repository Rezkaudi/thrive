import { useState, useRef, useEffect, useCallback } from 'react';
import { Slide, SlideContent } from '../types/slide.types';
import { getDefaultContent } from '../utils/lideDefaults';

interface UseSlideManagementProps {
  initialSlides: Slide[];
  onChange: (slides: Slide[]) => void;
}

export const useSlideManagement = ({ initialSlides, onChange }: UseSlideManagementProps) => {
  const [slides, setSlides] = useState<Slide[]>(() =>
    initialSlides.length > 0 ? initialSlides : [{
      id: Date.now().toString(),
      content: getDefaultContent('text'),
    }]
  );

  const [activeSlide, setActiveSlide] = useState(0);

  // Track if this is the initial mount to avoid calling onChange on mount
  const isInitialMount = useRef(true);

  // Store the latest onChange in a ref to avoid stale closures
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Sync slides changes to parent via useEffect (avoids synchronous state update loops)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    onChangeRef.current(slides);
  }, [slides]);

  const updateSlide = useCallback((index: number, updates: Partial<Slide>) => {
    setSlides(prev => {
      const newSlides = [...prev];
      newSlides[index] = { ...newSlides[index], ...updates };
      return newSlides;
    });
  }, []);

  const updateSlideContent = useCallback((index: number, contentUpdates: Partial<SlideContent>) => {
    setSlides(prev => {
      const newSlides = [...prev];
      newSlides[index] = {
        ...newSlides[index],
        content: { ...newSlides[index].content, ...contentUpdates }
      };
      return newSlides;
    });
  }, []);

  const addSlide = useCallback((type: SlideContent['type'] = 'text') => {
    setSlides(prev => {
      const newSlide: Slide = {
        id: Date.now().toString(),
        content: getDefaultContent(type),
      };
      setActiveSlide(prev.length);
      return [...prev, newSlide];
    });
  }, []);

  const duplicateSlide = useCallback((index: number) => {
    setSlides(prev => {
      const slideToDuplicate = prev[index];
      const newSlide: Slide = {
        ...slideToDuplicate,
        id: Date.now().toString(),
        content: { ...slideToDuplicate.content },
      };
      const newSlides = [...prev];
      newSlides.splice(index + 1, 0, newSlide);
      setActiveSlide(index + 1);
      return newSlides;
    });
  }, []);

  const removeSlide = useCallback((index: number) => {
    setSlides(prev => {
      if (prev.length === 1) return prev;
      const newSlides = prev.filter((_, i) => i !== index);
      setActiveSlide(current => current >= newSlides.length ? newSlides.length - 1 : current);
      return newSlides;
    });
  }, []);

  const changeSlideType = useCallback((index: number, newType: SlideContent['type']) => {
    setSlides(prev => {
      const newSlides = [...prev];
      newSlides[index] = {
        ...newSlides[index],
        content: getDefaultContent(newType)
      };
      return newSlides;
    });
  }, []);

  const reorderSlides = useCallback((newSlides: Slide[]) => {
    setSlides(newSlides);
  }, []);

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
    reorderSlides,
  };
};