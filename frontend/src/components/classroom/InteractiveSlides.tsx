// Updated InteractiveSlides.tsx with auto-progression support

import React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

import { InteractiveSlidesProps } from "../../types/slide.types";
import { SlideHeader } from "./SliderHeader";
import { ProgressBar } from "./ProgressBar";
import { SlideRenderer } from "./SlideRenderer";
import { SlideFooter } from "./SlideFooter";
import { useInteractiveSlides } from "../../hooks/useInteractiveSlides";

const MotionBox = motion(Box);

export const InteractiveSlides: React.FC<InteractiveSlidesProps> = ({
  slides,
  onComplete,
  pointsReward = 0,
  isLessonCompleted = false,
}) => {
  const {
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
    // NEW: Get validation state for auto-progression feedback
    validationResults,
    showFeedback,
  } = useInteractiveSlides(slides, onComplete);

  if (!slide) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h6">No slides available</Typography>
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        display: "flex",
        flexDirection: "column",
        bgcolor: slide.backgroundColor || "background.default",
        backgroundImage: slide.backgroundImage
          ? `url(${slide.backgroundImage})`
          : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: isFullscreen ? "fixed" : "relative",
        top: isFullscreen ? 0 : "auto",
        left: isFullscreen ? 0 : "auto",
        width: isFullscreen ? "100vw" : "100%",
        zIndex: isFullscreen ? 9999 : "auto",
        overflow: "hidden",
      }}
    >
      {/* Header of Slide */}
      <SlideHeader
        currentSlide={currentSlide}
        totalSlides={slides.length}
        pointsReward={pointsReward}
        isFullscreen={isFullscreen}
        slideType={slide.content.type}
        onToggleFullscreen={toggleFullscreen}
        onExitFullscreen={exitFullscreen}
      />

      {/* Progress Bar */}
      <ProgressBar progress={progress} />

      {/* Main Slide Content Area */}
      <Box
        sx={{
          my: 3,
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "auto",
          position: "relative",
          top: "0"
        }}
      >
        {/* Slide Content */}
        <Box
          sx={{
            flexGrow: 1,
            overflowX: isFullscreen ? "-moz-hidden-unscrollabl" : "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: { xs: 1, sm: 2, md: 3 },
          }}
        >
          <AnimatePresence mode="wait">
            <MotionBox
              key={currentSlide}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              sx={{
                width: "100%",
                maxWidth: 1200,
                mx: "auto",
                height: "fit-content",
                minHeight: "400px",
              }}
            >
              <Card
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.98)",
                  borderRadius: 4,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                  overflow: "hidden",
                  height: "fit-content",
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <SlideRenderer {...slideComponentProps} />
                </CardContent>
              </Card>
            </MotionBox>
          </AnimatePresence>
        </Box>
      </Box>

      {/* Footer of Slide - Updated with new props for auto-progression */}
      <SlideFooter
        currentSlide={currentSlide}
        totalSlides={slides.length}
        slideProgress={slideProgress}
        isLessonCompleted={isLessonCompleted}
        isLastSlide={isLastSlide}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onComplete={handleComplete}
        onSlideClick={setCurrentSlide}
        canNavigateToNext={canNavigateToNext()}
        slides={slides}
        // NEW: Pass validation state for auto-progression feedback
        validationResults={validationResults}
        showFeedback={showFeedback}
      />
    </Box>
  );
};