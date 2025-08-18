import React from "react";
import { Box, Typography, Paper, Chip, Alert } from "@mui/material";

import { SlideComponentProps } from "../../types/slide.types";

// sliders
import { QuizSlide } from "../slides/QuizSlide";
import { DragDropSlide } from "../slides/DragDropSlide";
import { FillBlanksSlide } from "../slides/FillBlanksSlide";
import { SortingSlide } from "../slides/SortingSlide";
import { MatchingSlide } from "../slides/MatchingSlide";
import { HotspotSlide } from "../slides/HotspotSlide";
import { TimelineSlide } from "../slides/TimelineSlide";
import { ListeningSlide } from "../slides/ListeningSlide";
import { FlashcardSlide } from "../slides/FlashcardSlide";
import { PronunciationSlide } from "../slides/PronunciationSlide";
import { NotImplementedSlide } from "../slides/NotImplementedSlide";
import { SentenceBuilderSlide } from "../slides/SentenceBuilderSlide";

export const SlideRenderer: React.FC<SlideComponentProps> = (props) => {
  const { slide } = props;
  const { content } = slide;

  const renderSlideContent = () => {
    switch (content.type) {
      case "text":
        return (
          <Box sx={{ textAlign: "center", p: 4 }}>
            {content.title && (
              <Typography variant="h3" fontWeight={700} gutterBottom>
                {content.title}
              </Typography>
            )}
            {content.subtitle && (
              <Typography variant="h5" color="text.secondary" gutterBottom>
                {content.subtitle}
              </Typography>
            )}

            {content.content.split('\n').map((item: string, index: number) =>
              <Typography
                key={index}
                variant="body1"
                sx={{ mt: 3, fontSize: "1.2rem", lineHeight: 1.8 }}
              >
                {item}
              </Typography>

            )}
          </Box>
        );

      case "image":
        return (
          <Box sx={{ textAlign: "center", p: 4 }}>
            {content.title && (
              <Typography variant="h3" fontWeight={600} gutterBottom>
                {content.title}
              </Typography>
            )}
            <Box
              component="img"
              src={content.content.url}
              alt={content.content.alt || "Slide image"}
              sx={{
                maxWidth: "100%",
                maxHeight: "60vh",
                objectFit: "contain",
                borderRadius: 2,
                boxShadow: 3,
              }}
            />
            {content.content.caption && (
              <Typography variant="caption" display="block" sx={{ mt: 2 }}>
                {content.content.caption}
              </Typography>
            )}
          </Box>
        );

      case "video":
        return (
          <Box sx={{ textAlign: "center", p: 4 }}>
            {content.title && (
              <Typography variant="h3" fontWeight={600} gutterBottom>
                {content.title}
              </Typography>
            )}
            <Box
              component="video"
              controls
              src={content.content.url}
              sx={{
                maxWidth: "100%",
                maxHeight: "60vh",
                borderRadius: 2,
                boxShadow: 3,
              }}
            />
          </Box>
        );

      case "quiz":
        return <QuizSlide {...props} />;

      case "interactive":
        const interactiveContent = content.content;
        if (!interactiveContent) {
          return (
            <Box sx={{ textAlign: "center", p: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No interactive content available
              </Typography>
            </Box>
          );
        }

        switch (interactiveContent.type) {
          case "drag-drop":
            return <DragDropSlide {...props} />;
          case "fill-blanks":
            return <FillBlanksSlide {...props} />;
          case "sentence-builder":
            return <SentenceBuilderSlide {...props} />;
          case "sorting":
            return <SortingSlide {...props} />;
          case "hotspot":
            return <HotspotSlide {...props} />;
          case "timeline":
            return <TimelineSlide {...props} />;
          case "listening":
            return <ListeningSlide {...props} />;
          case "matching":
            return <MatchingSlide {...props} />;
          case "flashcard":
            return <FlashcardSlide {...props} />;
          case "pronunciation":
            return <PronunciationSlide {...props} />;
          default:
            return (
              <NotImplementedSlide
                interactiveType={interactiveContent.type}
                instruction={interactiveContent.instruction}
                title={slide.content.title}
              />
            );
        }

      case "code":
        return (
          <Box sx={{ p: 4 }}>
            {content.title && (
              <Typography variant="h3" fontWeight={600} gutterBottom>
                {content.title}
              </Typography>
            )}
            <Paper
              sx={{
                p: 2,
                bgcolor: "grey.900",
                color: "common.white",
                fontFamily: "monospace",
                overflow: "auto",
                maxHeight: "60vh",
              }}
            >
              <pre style={{ margin: 0 }}>
                <code>{content.content.code}</code>
              </pre>
            </Paper>
            {content.content.language && (
              <Chip
                label={content.content.language}
                size="small"
                sx={{ mt: 1 }}
              />
            )}
          </Box>
        );

      default:
        return (
          <NotImplementedSlide
            interactiveType={content.type}
            instruction="This slide type is not yet supported."
            title="Unknown Slide Type"
          />
        );
    }
  };

  return renderSlideContent();
};
