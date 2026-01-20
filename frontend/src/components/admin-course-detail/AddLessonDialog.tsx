import React, { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Stack,
} from "@mui/material";
import { LessonFormState } from "../../types/lsesson-form.types";
import api from "../../services/api";
import { BasicInfoForm } from "./BasicInfoForm";
import { LessonTypeSelector } from "./LessonTypeSelector";
import { ContentForm } from "./ContentForm";

interface IAddLessonDialogProps {
  lessonForm: LessonFormState;
  isMobile: boolean;
  setLessonForm: React.Dispatch<React.SetStateAction<LessonFormState>>;
  editingLesson?: LessonFormState | null;
  selectedCourse: { id: string; title: string } | null;
  lessons: LessonFormState[];
  lessonDialog: boolean;
  setLessonDialog: React.Dispatch<React.SetStateAction<boolean>>;
  setBulkAudioDialog: React.Dispatch<React.SetStateAction<boolean>>;
  fetchLessons: (courseId: string) => void;
  fetchCourses: () => void;
  resetLessonForm: () => void;
}

export const AddLessonDialog: React.FC<IAddLessonDialogProps> = ({
  lessonForm,
  setLessonForm,
  isMobile,
  editingLesson,
  selectedCourse,
  fetchCourses,
  fetchLessons,
  lessonDialog,
  lessons,
  resetLessonForm,
  setBulkAudioDialog,
  setLessonDialog,
}) => {
  const methods = useForm<LessonFormState>({
    defaultValues: lessonForm,
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
    setError,
    clearErrors,
  } = methods;

  const lessonType = watch("lessonType");

  /**
   * IMPORTANT: We intentionally DO NOT push RHF values back into parent on every change.
   * The previous two-way sync caused recursive updates and "Maximum update depth exceeded".
   * Parent -> Form sync is handled explicitly (see keywords effect below).
   */

  // Reset form with normalized defaults when dialog opens
  useEffect(() => {
    if (lessonDialog) {
      const normalized: LessonFormState = {
        ...lessonForm,
        contentData:
          lessonForm.lessonType === "QUIZ"
            ? lessonForm.contentData ?? { questions: [] }
            : lessonForm.lessonType === "SLIDES"
            ? lessonForm.contentData ?? { slides: [] }
            : null,
        keywords:
          lessonForm.lessonType === "KEYWORDS"
            ? Array.isArray(lessonForm.keywords)
              ? lessonForm.keywords
              : []
            : [],
      };
      reset(normalized, { keepErrors: false, keepDirty: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonDialog]);

  // One-way sync: when parent keywords change externally (e.g., CSV import), reflect into RHF.
  useEffect(() => {
    if (!lessonDialog || lessonType !== "KEYWORDS") return;

    const incoming = Array.isArray(lessonForm.keywords)
      ? lessonForm.keywords
      : [];
    const current = (watch("keywords") ?? []) as LessonFormState["keywords"];

    // Cheap guard to avoid redundant setValue work
    const sameLength = (current?.length ?? 0) === incoming.length;
    const shallowEqual =
      sameLength &&
      current!.every(
        (k, i) =>
          k.englishText === incoming[i].englishText &&
          k.japaneseText === incoming[i].japaneseText &&
          k.englishAudioUrl === incoming[i].englishAudioUrl &&
          k.japaneseAudioUrl === incoming[i].japaneseAudioUrl &&
          (k.englishSentence ?? "") === (incoming[i].englishSentence ?? "") &&
          (k.japaneseSentence ?? "") === (incoming[i].japaneseSentence ?? "") &&
          (k.japaneseSentenceAudioUrl ?? "") ===
            (incoming[i].japaneseSentenceAudioUrl ?? "")
      );

    if (!shallowEqual) {
      setValue("keywords", incoming, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonDialog, lessonType, lessonForm.keywords]);

  const validateForm = (data: LessonFormState): boolean => {
    clearErrors();
    let isValid = true;

    if (!data.title?.trim()) {
      setError("title", { message: "Please enter a lesson title" });
      isValid = false;
    }

    if (!data.description?.trim()) {
      setError("description", { message: "Please enter a lesson description" });
      isValid = false;
    }

    if (data.lessonType === "KEYWORDS") {
      const list = Array.isArray(data.keywords) ? data.keywords : [];
      if (list.length === 0) {
        setError("keywords", { message: "Please add at least one keyword" });
        isValid = false;
      } else {
        list.forEach((k, i) => {
          if (!k.japaneseText?.trim() || !k.englishText?.trim()) {
            setError(`keywords.${i}` as any, {
              message: `Keyword ${
                i + 1
              } must have both Japanese and English text`,
            });
            isValid = false;
          }
        });
      }
    } else if (data.lessonType === "QUIZ") {
      const questions = (data.contentData as any)?.questions ?? [];
      if (!Array.isArray(questions) || questions.length === 0) {
        setError("contentData", {
          message: "Please add at least one quiz question",
        });
        isValid = false;
      }
    } else if (data.lessonType === "SLIDES") {
      const slides = (data.contentData as any)?.slides ?? [];
      if (!Array.isArray(slides) || slides.length === 0) {
        setError("contentData", { message: "Please add at least one slide" });
        isValid = false;
      }
    } else {
      // Logic for VIDEO and PDF URL validation
      const url = data.contentUrl?.trim() || "";
      
      if (!url) {
        setError("contentUrl", {
          message: `Please provide a ${
            data.lessonType === "VIDEO" ? "video" : "PDF"
          } URL`,
        });
        isValid = false;
      } else {
        const lowerUrl = url.toLowerCase();
        
        // Strict Validation Check
        if (data.lessonType === "VIDEO") {
          // Checks for .mp4, .webm, .ogg, .mov, .m4v and allows query params (e.g. ?signature=...)
          const isVideo = /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(lowerUrl);
          if (!isVideo) {
            setError("contentUrl", {
              message: "Invalid format. URL must end in .mp4, .webm, .ogg, or .mov",
            });
            isValid = false;
          }
        } else if (data.lessonType === "PDF") {
          // Checks for .pdf extension and allows query params
          const isPdf = /\.pdf(\?.*)?$/i.test(lowerUrl);
          if (!isPdf) {
            setError("contentUrl", {
              message: "Invalid format. URL must match a PDF file (.pdf)",
            });
            isValid = false;
          }
        }
      }
    }

    return isValid;
  };

  const onSubmit = async (data: LessonFormState) => {
    if (!validateForm(data)) return;

    const lessonData: any = {
      ...data,
      keywords:
        data.lessonType === "KEYWORDS"
          ? Array.isArray(data.keywords)
            ? data.keywords
            : []
          : undefined,
      contentData:
        data.lessonType === "QUIZ"
          ? data.contentData ?? { questions: [] }
          : data.lessonType === "SLIDES"
          ? data.contentData ?? { slides: [] }
          : undefined,
      passingScore:
        data.lessonType === "QUIZ" ? data.passingScore ?? 70 : undefined,
    };

    try {
      if (editingLesson) {
        await api.put(`/admin/lessons/${editingLesson.id}`, lessonData);
      } else {
        await api.post(
          `/admin/courses/${selectedCourse!.id}/lessons`,
          lessonData
        );
      }

      // Optionally push final submitted values to parent once (non-reactive)
      setLessonForm((prev) => ({ ...prev, ...data }));

      handleCloseDialog();
      if (selectedCourse) fetchLessons(selectedCourse.id);
      fetchCourses();
    } catch (error) {
      console.error("Failed to save lesson:", error);
      setError("root" as any, {
        message: "Failed to save lesson. Please try again.",
      });
    }
  };

  const handleCloseDialog = () => {
    setLessonDialog(false);
    resetLessonForm();
    reset();
    clearErrors();
  };

  return (
    <Dialog
      open={lessonDialog}
      onClose={handleCloseDialog}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        {editingLesson ? "Edit Lesson" : "Add New Lesson"}
      </DialogTitle>
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Stack spacing={3} sx={{ pt: 2 }}>
              <BasicInfoForm
                control={control}
                errors={errors}
                lessons={lessons}
                isEditing={!!editingLesson}
              />
              <LessonTypeSelector control={control} />
              <ContentForm
                control={control}
                errors={errors}
                lessonType={lessonType}
                editingLesson={editingLesson}
                setValue={setValue}
                isMobile={isMobile}
                setBulkAudioDialog={setBulkAudioDialog}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" sx={{ color: "white" }}>
              Save Lesson
            </Button>
          </DialogActions>
        </form>
      </FormProvider>
    </Dialog>
  );
};