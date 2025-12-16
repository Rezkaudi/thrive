import React from "react";
import { Controller, Control } from "react-hook-form";
import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Stack,
  Typography,
} from "@mui/material";
import {
  PictureAsPdf,
  Slideshow,
  Translate,
  VideoLibrary as VideoIcon,
  Quiz as QuizIcon,
} from "@mui/icons-material";
import { LessonFormState, LessonType } from "../../types/lsesson-form.types";

interface LessonTypeSelectorProps {
  control: Control<LessonFormState>;
}

export const LessonTypeSelector: React.FC<LessonTypeSelectorProps> = ({ control }) => {
  const lessonTypeOptions: { value: LessonType; label: string; icon: React.ReactNode }[] = [
    { value: "VIDEO", label: "Video Lesson", icon: <VideoIcon /> },
    { value: "PDF", label: "PDF Resource", icon: <PictureAsPdf /> },
    { value: "KEYWORDS", label: "Keywords Practice", icon: <Translate /> },
    { value: "QUIZ", label: "Quiz", icon: <QuizIcon /> },
    { value: "SLIDES", label: "Interactive Slides", icon: <Slideshow /> },
  ];

  return (
    <FormControl>
      <FormLabel>Lesson Type</FormLabel>
      <Controller
        name="lessonType"
        control={control}
        render={({ field }) => (
          <RadioGroup {...field} row>
            {lessonTypeOptions.map((option) => (
              <FormControlLabel
                key={option.value}
                value={option.value}
                control={<Radio />}
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    {option.icon}
                    <Typography>{option.label}</Typography>
                  </Stack>
                }
              />
            ))}
          </RadioGroup>
        )}
      />
    </FormControl>
  );
};
