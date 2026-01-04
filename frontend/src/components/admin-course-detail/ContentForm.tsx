import React, { useEffect, memo } from "react";
import {
  Controller,
  Control,
  FieldErrors,
  UseFormSetValue,
  useFormContext,
} from "react-hook-form";
import { TextField, Box, Typography } from "@mui/material";
import {
  LessonFormState,
  LessonType,
  Keyword,
} from "../../types/lsesson-form.types";
import { QuizBuilder } from "../admin/QuizBuilder";
import { SlidesBuilder } from "../admin/SlidesBuilder";
import { KeywordsForm } from "./KeywordsForm";

interface ContentFormProps {
  control: Control<LessonFormState>;
  errors: FieldErrors<LessonFormState>;
  lessonType: LessonType;
  editingLesson?: LessonFormState | null;
  setValue: UseFormSetValue<LessonFormState>;
  isMobile: boolean;
  setBulkAudioDialog: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ContentForm: React.FC<ContentFormProps> = memo(
  ({
    control,
    errors,
    lessonType,
    editingLesson,
    setValue,
    isMobile,
    setBulkAudioDialog,
  }) => {
    const { getValues, clearErrors } = useFormContext<LessonFormState>();

    // Normalize minimal safe defaults when switching types
    useEffect(() => {
      if (lessonType === "KEYWORDS") {
        const current = getValues("keywords") as Keyword[] | null | undefined;
        if (!Array.isArray(current)) {
          setValue("keywords", [], {
            shouldDirty: false,
            shouldValidate: false,
          });
        }
      } else if (lessonType === "QUIZ") {
        const cd = getValues("contentData") as any;
        if (!cd || !Array.isArray(cd.questions)) {
          setValue(
            "contentData",
            { questions: [] },
            { shouldDirty: false, shouldValidate: false }
          );
        }
      } else if (lessonType === "SLIDES") {
        const cd = getValues("contentData") as any;
        if (!cd || !Array.isArray(cd.slides)) {
          setValue(
            "contentData",
            { slides: [] },
            { shouldDirty: false, shouldValidate: false }
          );
        }
      } else {
        const url = getValues("contentUrl");
        if (typeof url !== "string") {
          setValue("contentUrl", "", {
            shouldDirty: false,
            shouldValidate: false,
          });
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lessonType]);

    if (lessonType === "KEYWORDS") {
      return (
        <KeywordsForm
          control={control}
          errors={errors}
          clearErrors={clearErrors}
          isMobile={isMobile}
          setBulkAudioDialog={setBulkAudioDialog}
        />
      );
    }

    if (lessonType === "QUIZ") {
      return (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Quiz Questions
          </Typography>

          <Controller
            name="contentData"
            control={control}
            render={({ field }) => {
              const value = (field.value as any) ?? { questions: [] };
              return (
                <QuizBuilder
                  key={editingLesson?.id || "new-quiz"}
                  initialQuestions={
                    Array.isArray(value.questions) ? value.questions : []
                  }
                  passingScore={
                    (editingLesson?.passingScore as number) ?? undefined
                  }
                  timeLimit={value.timeLimit ?? undefined}
                  onChange={(questions, settings) => {
                    setValue(
                      "contentData",
                      { questions, timeLimit: settings.timeLimit ?? null },
                      { shouldDirty: true, shouldValidate: true }
                    );
                    setValue("passingScore", settings.passingScore ?? 70, {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }}
                />
              );
            }}
          />

          {!!errors.contentData && (
            <Typography color="error" variant="caption">
              {typeof errors.contentData?.message === "string"
                ? errors.contentData.message
                : ""}
            </Typography>
          )}
        </Box>
      );
    }

    if (lessonType === "SLIDES") {
      return (
        <Box>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Slide Content
          </Typography>

          <Controller
            name="contentData"
            control={control}
            render={({ field }) => {
              const value = (field.value as any) ?? { slides: [] };
              return (
                <SlidesBuilder
                  key={editingLesson?.id || "new-slides"}
                  initialSlides={
                    Array.isArray(value.slides) ? value.slides : []
                  }
                  onChange={(slides) => {
                    field.onChange({ slides: slides ?? [] });
                  }}
                />
              );
            }}
          />

          {!!errors.contentData && (
            <Typography color="error" variant="caption">
              {typeof errors.contentData?.message === "string"
                ? errors.contentData.message
                : ""}
            </Typography>
          )}
        </Box>
      );
    }

    // VIDEO / PDF
    return (
      <Controller
        name="contentUrl"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            fullWidth
            label={lessonType === "VIDEO" ? "Video URL (S3)" : "PDF URL (S3)"}
            error={!!errors.contentUrl}
            helperText={
              errors.contentUrl?.message ||
              `Enter the S3 URL for the ${lessonType.toLowerCase()}`
            }
          />
        )}
      />
    );
  }
);

ContentForm.displayName = "ContentForm";
