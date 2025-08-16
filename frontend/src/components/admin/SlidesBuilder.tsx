import React, { useState } from 'react';
import { Box, Grid } from '@mui/material';
import { SlidesBuilderProps } from '../../types/slide.types';
import { useSlideManagement } from '../../hooks/useSlideManagement';
import { useSlideValidation } from '../../hooks/useSlideValidation';
import { SlideList } from './SlidesBuilder/SlideList';
import { SlideEditor } from './SlidesBuilder/SlideEditor';
import { SlidesBuilderSummary } from './SlidesBuilder/SlidesBuilderSummary';
import { PreviewDialog } from './SlidesBuilder/PreviewDialog';

export const SlidesBuilder: React.FC<SlidesBuilderProps> = ({
  initialSlides = [],
  onChange,
}) => {
  const [previewMode, setPreviewMode] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  const {
    slides,
    activeSlide,
    setActiveSlide,
    updateSlide,
    updateSlideContent,
    addSlide,
    duplicateSlide,
    removeSlide,
    changeSlideType,
    reorderSlides, // Add this new function
  } = useSlideManagement({ initialSlides, onChange });

  const {
    validationErrors,
    validateSlide,
    getTotalErrors,
    hasErrors,
  } = useSlideValidation(slides);

  // Validate slide when it's updated
  const handleUpdateSlide = (index: number, updates: Partial<typeof slides[0]>) => {
    updateSlide(index, updates);
    validateSlide(index, { ...slides[index], ...updates });
  };

  const handleUpdateSlideContent = (index: number, contentUpdates: any) => {
    updateSlideContent(index, contentUpdates);
    const updatedSlide = {
      ...slides[index],
      content: { ...slides[index].content, ...contentUpdates }
    };
    validateSlide(index, updatedSlide);
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Slide List Sidebar */}
        <Grid size={{ xs: 12, md: 3 }}>
          <SlideList
            slides={slides}
            activeSlide={activeSlide}
            onSlideSelect={setActiveSlide}
            onAddSlide={addSlide}
            onDuplicateSlide={duplicateSlide}
            onRemoveSlide={removeSlide}
            onReorderSlides={reorderSlides} // Pass the reorder function
            validationErrors={validationErrors}
            showAdvancedSettings={showAdvancedSettings}
            onToggleAdvancedSettings={() => setShowAdvancedSettings(!showAdvancedSettings)}
          />
        </Grid>

        {/* Main Slide Editor */}
        <Grid size={{ xs: 12, md: 9 }}>
          <SlideEditor
            slide={slides[activeSlide]}
            index={activeSlide}
            onUpdate={handleUpdateSlide}
            onUpdateContent={handleUpdateSlideContent}
            onChangeType={changeSlideType}
            validationErrors={validationErrors[activeSlide] || []}
            onPreview={() => setPreviewMode(true)}
          />
        </Grid>
      </Grid>

      {/* Summary Section */}
      <SlidesBuilderSummary
        slides={slides}
        totalErrors={getTotalErrors()}
        onPreview={() => setPreviewMode(true)}
        hasValidationErrors={getTotalErrors() > 0}
      />

      {/* Preview Dialog */}
      <PreviewDialog
        open={previewMode}
        onClose={() => setPreviewMode(false)}
        slides={slides}
      />
    </Box>
  );
};