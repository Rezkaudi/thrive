import React from 'react';
import {
  Paper,
  Stack,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ExpandMore,
  TextFields,
  Image,
  VideoLibrary,
  Quiz,
  Extension,
  Code,
  ColorLens,
  School,
} from '@mui/icons-material';
import { Slide, SlideContent } from '../../../types/slide.types';
import { TextSlideEditor } from './TextSlideEditor';
import { ImageSlideEditor } from './ImageSlideEditor';
import { ValidationDisplay } from './ValidationDisplay';
import { SlideStyling } from './SlideStyling';
import { InstructorNotes } from './InstructorNotes';
import { InteractiveSlideEditor } from './InteractiveSlideEditor';
import { CodeSlideEditor } from './CodeSlideEditor';
import { QuizSlideEditor } from './QuizSlideEditor';
import { VideoSlideEditor } from './VideoSlideEditor';


interface SlideEditorProps {
  slide: Slide;
  index: number;
  onUpdate: (index: number, updates: Partial<Slide>) => void;
  onUpdateContent: (index: number, contentUpdates: Partial<SlideContent>) => void;
  onChangeType: (index: number, newType: SlideContent['type']) => void;
  validationErrors: string[];
  onPreview: () => void;
}

export const SlideEditor: React.FC<SlideEditorProps> = ({
  slide,
  index,
  onUpdate,
  onUpdateContent,
  onChangeType,
  validationErrors,
  onPreview,
}) => {
  const renderSlideTypeEditor = () => {
    const commonProps = {
      slide,
      index,
      onUpdate,
      onUpdateContent,
      key: slide.id
    };

    switch (slide.content.type) {
      case 'text':
        return <TextSlideEditor {...commonProps} />;
      case 'image':
        return <ImageSlideEditor {...commonProps} />;
      case 'video':
        return <VideoSlideEditor {...commonProps} />;
      case 'quiz':
        return <QuizSlideEditor {...commonProps} />;
      case 'code':
        return <CodeSlideEditor {...commonProps} />;
      case 'interactive':
        return <InteractiveSlideEditor {...commonProps} />;
      default:
        return <TextSlideEditor {...commonProps} />;
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5" fontWeight={600}>
              Edit Slide {index + 1}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {slide.content.title || ''}
            </Typography>
          </Box>

          <Stack direction="row" spacing={2}>
            <FormControl size="small" sx={{ width: 150 }}>
              <InputLabel>Slide Type</InputLabel>
              <Select
                value={slide.content.type}
                label="Slide Type"
                onChange={(e) => onChangeType(index, e.target.value as SlideContent['type'])}
              >
                <MenuItem value="text">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <TextFields sx={{ fontSize: 18 }} />
                    <Typography>Text</Typography>
                  </Stack>
                </MenuItem>
                <MenuItem value="image">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Image sx={{ fontSize: 18 }} />
                    <Typography>Image</Typography>
                  </Stack>
                </MenuItem>
                <MenuItem value="video">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <VideoLibrary sx={{ fontSize: 18 }} />
                    <Typography>Video</Typography>
                  </Stack>
                </MenuItem>
                <MenuItem value="quiz">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Quiz sx={{ fontSize: 18 }} />
                    <Typography>Quiz</Typography>
                  </Stack>
                </MenuItem>
                <MenuItem value="interactive">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Extension sx={{ fontSize: 18 }} />
                    <Typography>Interactive</Typography>
                  </Stack>
                </MenuItem>
                <MenuItem value="code">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Code sx={{ fontSize: 18 }} />
                    <Typography>Code</Typography>
                  </Stack>
                </MenuItem>
              </Select>
            </FormControl>

            {/* <Button
              variant="outlined"
              startIcon={<Preview />}
              onClick={onPreview}
              sx={{ borderRadius: 2 }}
            >
              Preview
            </Button>

            <Button
              variant="contained"
              startIcon={<Save />}
              sx={{ borderRadius: 2 }}
            >
              Save
            </Button> */}
          </Stack>
        </Stack>

        <Divider />

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <ValidationDisplay errors={validationErrors} />
        )}

        {/* Content Editor */}
        {renderSlideTypeEditor()}

        <Divider />

        {/* Slide Styling */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <ColorLens color="action" />
              <Typography variant="subtitle1" fontWeight={600}>
                Slide Styling & Layout
              </Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <SlideStyling
              slide={slide}
              index={index}
              onUpdate={onUpdate}
              onUpdateContent={onUpdateContent}
            />
          </AccordionDetails>
        </Accordion>

        {/* Instructor Notes */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <School color="action" />
              <Typography variant="subtitle1" fontWeight={600}>
                Instructor Notes & Settings
              </Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <InstructorNotes
              slide={slide}
              index={index}
              onUpdate={onUpdate}
            />
          </AccordionDetails>
        </Accordion>
      </Stack>
    </Paper>
  );
};