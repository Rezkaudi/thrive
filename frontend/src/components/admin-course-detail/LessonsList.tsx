import React, { useCallback, useMemo, useState } from "react";
import {
  Delete,
  DragIndicator,
  Edit,
  PictureAsPdf,
  Slideshow,
  Translate,
  VideoLibrary,
  Quiz as QuizIcon,
} from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
  Grid,
} from "@mui/material";

import api from "../../services/api";
import { Course } from "../../services/courseService";
import {
  Keyword,
  LessonFormState,
  LessonType,
} from "../../types/lsesson-form.types";

export type StoredLesson = LessonFormState & {
  id: string;
  courseId: string;
};

interface LessonDetailsResponse {
  contentData?: unknown;
  passingScore?: number;
  keywords?: Keyword[];
}

interface LessonsListProps {
  lessons: StoredLesson[];
  selectedCourse: Course | null;
  fetchLessons: (courseId: string) => void;
  setLessons: React.Dispatch<React.SetStateAction<StoredLesson[]>>;
  setEditingLesson: React.Dispatch<React.SetStateAction<LessonFormState | null>>;
  setLessonDialog: React.Dispatch<React.SetStateAction<boolean>>;
  setLessonForm: React.Dispatch<React.SetStateAction<LessonFormState>>;
}

const typeMeta: Record<
  LessonType,
  { label: string; icon: React.ReactElement }
> = {
  VIDEO: { label: "Video", icon: <VideoLibrary fontSize="small" /> },
  PDF: { label: "PDF", icon: <PictureAsPdf fontSize="small" /> },
  KEYWORDS: { label: "Keywords Practice", icon: <Translate fontSize="small" /> },
  QUIZ: { label: "Quiz", icon: <QuizIcon fontSize="small" /> },
  SLIDES: { label: "Interactive Slides", icon: <Slideshow fontSize="small" /> },
};

const reorder = (arr: StoredLesson[], from: number, to: number): StoredLesson[] => {
  const next = arr.slice();
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next.map((l, i) => ({ ...l, order: i + 1 }));
};

export const LessonsList: React.FC<LessonsListProps> = ({
  lessons,
  fetchLessons,
  selectedCourse,
  setLessons,
  setEditingLesson,
  setLessonDialog,
  setLessonForm,
}) => {
  const [draggedLesson, setDraggedLesson] = useState<StoredLesson | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const hasCourse = Boolean(selectedCourse?.id);

  const fetchLessonDetails = useCallback(async (lessonId: string) => {
    try {
      const { data } = await api.get<LessonDetailsResponse>(`/admin/lessons/${lessonId}`);
      return data ?? null;
    } catch (error) {
      console.error("Failed to fetch lesson details:", error);
      return null;
    }
  }, []);

  const handleDeleteLesson = useCallback(
    async (lessonId: string) => {
      if (!hasCourse) return;
      if (!window.confirm("Are you sure you want to delete this lesson?")) return;
      try {
        await api.delete(`/admin/lessons/${lessonId}`);
        fetchLessons(selectedCourse!.id);
      } catch (error) {
        console.error("Failed to delete lesson:", error);
      }
    },
    [fetchLessons, hasCourse, selectedCourse]
  );

  const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>, lesson: StoredLesson) => {
    setDraggedLesson(lesson);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", lesson.id);
    if (e.currentTarget) e.currentTarget.style.opacity = "0.5";
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    setDraggedLesson(null);
    setDragOverIndex(null);
    if (e.currentTarget) e.currentTarget.style.opacity = "1";
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const { clientX: x, clientY: y } = e;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverIndex(null);
    }
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
      e.preventDefault();
      if (!draggedLesson) return;

      const dragIndex = lessons.findIndex((l) => l.id === draggedLesson.id);
      if (dragIndex === -1 || dragIndex === dropIndex) {
        setDraggedLesson(null);
        setDragOverIndex(null);
        return;
      }

      const prev = lessons;
      const next = reorder(lessons, dragIndex, dropIndex);
      setLessons(next);
      setDraggedLesson(null);
      setDragOverIndex(null);

      try {
        await Promise.all(
          next.map((lesson) =>
            api.put(`/admin/lessons/${lesson.id}`, {
              ...lesson,
              order: lesson.order,
            })
          )
        );
      } catch (error) {
        console.error("Failed to reorder lessons:", error);
        setLessons(prev);
        if (hasCourse) fetchLessons(selectedCourse!.id);
        alert("Failed to reorder lessons. Please try again.");
      }
    },
    [draggedLesson, fetchLessons, hasCourse, lessons, selectedCourse, setLessons]
  );

  const courseType = useMemo(() => selectedCourse?.type?.replaceAll("_", " ") ?? "—", [selectedCourse]);

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 8}}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Lesson List
            </Typography>
            <List>
              {lessons.map((lesson, index) => {
                const meta = typeMeta[lesson.lessonType];
                const hasContent =
                  lesson.lessonType === "KEYWORDS" ||
                  lesson.lessonType === "QUIZ" ||
                  lesson.lessonType === "SLIDES" ||
                  Boolean(lesson.contentUrl);

                const statusLabel =
                  lesson.lessonType === "KEYWORDS"
                    ? meta.label
                    : lesson.lessonType === "QUIZ"
                    ? meta.label
                    : lesson.lessonType === "SLIDES"
                    ? meta.label
                    : lesson.lessonType === "VIDEO"
                    ? hasContent
                      ? "Has Video"
                      : "No Video"
                    : hasContent
                    ? "Has PDF"
                    : "No PDF";

                return (
                  <Paper
                    key={lesson.id}
                    draggable
                    aria-grabbed={draggedLesson?.id === lesson.id}
                    onDragStart={(e) => handleDragStart(e, lesson)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    sx={{
                      mb: 2,
                      cursor: "grab",
                      transition: "all 0.2s ease",
                      transform:
                        dragOverIndex === index && draggedLesson?.id !== lesson.id ? "translateY(-2px)" : "none",
                      boxShadow: dragOverIndex === index && draggedLesson?.id !== lesson.id ? 3 : 1,
                      borderLeft: dragOverIndex === index && draggedLesson?.id !== lesson.id ? "4px solid #1976d2" : "none",
                      backgroundColor: draggedLesson?.id === lesson.id ? "rgba(0,0,0,0.05)" : "white",
                      "&:hover": { boxShadow: 2 },
                      "&:active": { cursor: "grabbing" },
                    }}
                  >
                    <ListItem
                      secondaryAction={
                        <Stack direction="row" spacing={1}>
                          <IconButton
                            aria-label="Edit lesson"
                            onClick={async (e) => {
                              e.stopPropagation();
                              setEditingLesson(lesson);
                              const details = await fetchLessonDetails(lesson.id);
                              setLessonForm({
                                title: lesson.title,
                                description: lesson.description,
                                order: lesson.order,
                                lessonType: lesson.lessonType ?? "VIDEO",
                                contentUrl: lesson.contentUrl ?? "",
                                contentData: details?.contentData ?? null,
                                pointsReward: lesson.pointsReward,
                                requiresReflection: lesson.requiresReflection,
                                passingScore: details?.passingScore ?? 70,
                                keywords: details?.keywords ?? [],
                              });
                              setLessonDialog(true);
                            }}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            aria-label="Delete lesson"
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteLesson(lesson.id);
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </Stack>
                      }
                    >
                      <Stack direction="row" spacing={1} sx={{ mr: 1 }}>
                        <DragIndicator sx={{ color: "action.active", alignSelf: "center", ml: 0.5 }} />
                      </Stack>

                      <ListItemText
                        primary={
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Chip label={`Lesson ${lesson.order}`} size="small" />
                            <Typography variant="subtitle1" fontWeight={500}>
                              {lesson.title}
                            </Typography>
                          </Stack>
                        }
                        secondary={
                          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                            <Chip
                              icon={meta.icon}
                              label={statusLabel}
                              size="small"
                              color={hasContent ? "success" : "default"}
                              sx={{ color: hasContent ? "white" : undefined }}
                            />
                            <Chip label={`${lesson.pointsReward} points`} size="small" color="primary" />
                            {lesson.requiresReflection && (
                              <Chip label="Reflection Required" size="small" color="secondary" />
                            )}
                          </Stack>
                        }
                      />
                    </ListItem>
                  </Paper>
                );
              })}
            </List>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Course Details
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Type
                </Typography>
                <Typography variant="body1">{courseType}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Status
                </Typography>
                <Typography variant="body1">
                  <Chip
                    label={selectedCourse?.isActive ? "Active" : "Inactive"}
                    color={selectedCourse?.isActive ? "success" : "default"}
                    size="small"
                    sx={{ color: selectedCourse?.isActive ? "white" : undefined }}
                  />
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Total Lessons
                </Typography>
                <Typography variant="body1">{lessons.length}</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default LessonsList;
