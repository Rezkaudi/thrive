import React, { memo } from "react";
import { Controller, Control, FieldErrors } from "react-hook-form";
import { TextField, Stack } from "@mui/material";
import { LessonFormState } from "../../types/lsesson-form.types";

interface BasicInfoFormProps {
  control: Control<LessonFormState>;
  errors: FieldErrors<LessonFormState>;
  lessons: LessonFormState[];
  isEditing?: boolean;
}

export const BasicInfoForm: React.FC<BasicInfoFormProps> = memo(
  ({ control, errors, lessons, isEditing = false }) => {
    // When adding a new lesson, allow order up to lessons.length + 1
    // When editing, allow up to lessons.length (since the lesson already exists)
    const maxOrder = isEditing ? lessons.length : lessons.length + 1;

    return (
      <Stack spacing={3}>
        <Controller
          name="title"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Lesson Title"
              error={!!errors.title}
              helperText={errors.title?.message}
            />
          )}
        />

        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              multiline
              rows={3}
              label="Description"
              error={!!errors.description}
              helperText={errors.description?.message}
            />
          )}
        />

        <Controller
          name="order"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              type="number"
              label="Order"
              onWheel={(e) => (e.target as HTMLInputElement).blur()}
              error={!!errors.order}
              helperText={
                errors.order?.message ||
                "Change this number to reorder the lesson"
              }
              inputProps={{ min: 1, max: Math.max(maxOrder, 1) }}
              onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
            />
          )}
        />

        <Controller
          name="pointsReward"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              type="number"
              label="Points Reward"
              onWheel={(e) => (e.target as HTMLInputElement).blur()}
              error={!!errors.pointsReward}
              helperText={errors.pointsReward?.message}
              onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
            />
          )}
        />
      </Stack>
    );
  }
);

BasicInfoForm.displayName = "BasicInfoForm";
