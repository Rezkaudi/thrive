import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Stack,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper,
  Switch,
  FormControlLabel,
  FormLabel,
  RadioGroup,
  Radio,
  Alert,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  VideoLibrary,
  DragIndicator,
  Translate,
  VolumeUp,
  DeleteOutline,
  AddCircleOutline,
  CloudUpload,
  Quiz as QuizIcon,
  Slideshow,
} from "@mui/icons-material";
import { PictureAsPdf, VideoLibrary as VideoIcon } from "@mui/icons-material";
import { motion } from "framer-motion";
import api from "../../services/api";
import { BulkAudioManager } from "../../components/admin/BulkAudioManager";
import { QuizBuilder } from "../../components/admin/QuizBuilder";
import { SlidesBuilder } from "../../components/admin/SlidesBuilder";

interface Course {
  id: string;
  title: string;
  description: string;
  type: "JAPAN_IN_CONTEXT" | "JLPT_IN_CONTEXT";
  icon: string;
  isActive: boolean;
  lessonCount?: number;
  freeLessonCount: number
}

interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  contentUrl?: string;
  contentData?: any;
  lessonType: "VIDEO" | "PDF" | "KEYWORDS" | "QUIZ" | "SLIDES";
  pointsReward: number;
  requiresReflection: boolean;
  passingScore?: number;
}

interface Keyword {
  englishText: string;
  japaneseText: string;
  englishAudioUrl: string;
  japaneseAudioUrl: string;
}

export const CourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [courseDialog, setCourseDialog] = useState(false);
  const [lessonDialog, setLessonDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [bulkAudioDialog, setBulkAudioDialog] = useState(false);

  // Drag and drop state
  const [draggedLesson, setDraggedLesson] = useState<Lesson | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const [courseForm, setCourseForm] = useState<{
    title: string;
    description: string;
    type: "JAPAN_IN_CONTEXT" | "JLPT_IN_CONTEXT";
    icon: string;
    isActive: boolean;
    freeLessonCount: number;
  }>({
    title: "",
    description: "",
    type: "JAPAN_IN_CONTEXT",
    icon: "🏯",
    isActive: true,
    freeLessonCount: 2,
  });

  const [lessonForm, setLessonForm] = useState({
    title: "",
    description: "",
    order: 1,
    lessonType: "VIDEO" as "VIDEO" | "PDF" | "KEYWORDS" | "QUIZ" | "SLIDES",
    contentUrl: "",
    contentData: null as any,
    pointsReward: 10,
    requiresReflection: false,
    passingScore: 70,
    keywords: [] as Keyword[],
  });

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, lesson: Lesson) => {
    setDraggedLesson(lesson);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", "");

    // Add some visual feedback
    if (e.currentTarget) {
      e.currentTarget.style.opacity = "0.5";
    }
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    setDraggedLesson(null);
    setDragOverIndex(null);

    // Reset visual feedback
    if (e.currentTarget) {
      e.currentTarget.style.opacity = "1";
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    // Only clear if we're leaving the entire drop zone, not just moving between children
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();

    if (!draggedLesson) return;

    const dragIndex = lessons.findIndex(lesson => lesson.id === draggedLesson.id);

    if (dragIndex === dropIndex) {
      setDraggedLesson(null);
      setDragOverIndex(null);
      return;
    }

    // Create new array with reordered lessons
    const newLessons = [...lessons];
    const [draggedItem] = newLessons.splice(dragIndex, 1);
    newLessons.splice(dropIndex, 0, draggedItem);

    // Update order numbers
    const reorderedLessons = newLessons.map((lesson, index) => ({
      ...lesson,
      order: index + 1
    }));

    // Optimistically update UI
    setLessons(reorderedLessons);
    setDraggedLesson(null);
    setDragOverIndex(null);

    try {
      // Update all affected lessons in the backend
      const updatePromises = reorderedLessons.map(lesson =>
        api.put(`/admin/lessons/${lesson.id}`, {
          ...lesson,
          order: lesson.order
        })
      );

      await Promise.all(updatePromises);
      console.log('Lessons reordered successfully');
    } catch (error) {
      console.error("Failed to reorder lessons:", error);
      // Revert on error
      fetchLessons(selectedCourse!.id);
      alert("Failed to reorder lessons. Please try again.");
    }
  };


  // Helper function to reset course form to default values
  const resetCourseForm = () => {
    setCourseForm({
      title: "",
      description: "",
      type: "JAPAN_IN_CONTEXT",
      icon: "🏯",
      isActive: true,
      freeLessonCount: 2,
    });
    setEditingCourse(null);
  };

  // Helper function to reset lesson form to default values
  const resetLessonForm = () => {
    setLessonForm({
      title: "",
      description: "",
      order: lessons.length + 1,
      lessonType: "VIDEO",
      contentUrl: "",
      contentData: null,
      pointsReward: 10,
      requiresReflection: false,
      passingScore: 70,
      keywords: [],
    });
    setEditingLesson(null);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchLessons(selectedCourse.id);
    }
  }, [selectedCourse]);

  // Reset states when navigating back to course list
  useEffect(() => {
    if (!selectedCourse) {
      // Reset all lesson-related states when going back to course list
      setLessons([]);
      setLessonDialog(false);
      resetLessonForm();
    }
  }, [selectedCourse,]);

  const fetchCourses = async () => {
    try {
      const response = await api.get("/courses");
      setCourses(response.data);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    }
  };

  const fetchLessons = async (courseId: string) => {
    try {
      const response = await api.get(`/courses/${courseId}/lessons`);
      console.log("Lessons response:", response.data);
      // Sort lessons by order to ensure correct display
      const sortedLessons = response.data.sort((a: Lesson, b: Lesson) => a.order - b.order);
      setLessons(sortedLessons);
    } catch (error) {
      console.error("Failed to fetch lessons:", error);
    }
  };

  const fetchLessonDetails = async (lessonId: string) => {
    try {
      const response = await api.get(`/admin/lessons/${lessonId}`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch lesson details:", error);
      return null;
    }
  };

  const validateLessonForm = () => {
    if (!lessonForm.title.trim()) {
      alert("Please enter a lesson title");
      return false;
    }

    if (!lessonForm.description.trim()) {
      alert("Please enter a lesson description");
      return false;
    }

    if (lessonForm.lessonType === "KEYWORDS") {
      if (lessonForm.keywords.length === 0) {
        alert("Please add at least one keyword");
        return false;
      }

      for (let i = 0; i < lessonForm.keywords.length; i++) {
        const keyword = lessonForm.keywords[i];
        if (!keyword.japaneseText.trim() || !keyword.englishText.trim()) {
          alert(`Keyword ${i + 1} must have both Japanese and English text`);
          return false;
        }
      }
    } else if (lessonForm.lessonType === "QUIZ") {
      if (
        !lessonForm.contentData?.questions ||
        lessonForm.contentData.questions.length === 0
      ) {
        alert("Please add at least one quiz question");
        return false;
      }
    } else if (lessonForm.lessonType === "SLIDES") {
      if (
        !lessonForm.contentData?.slides ||
        lessonForm.contentData.slides.length === 0
      ) {
        alert("Please add at least one slide");
        return false;
      }
    } else if (!lessonForm.contentUrl.trim()) {
      alert(
        `Please provide a ${lessonForm.lessonType === "VIDEO" ? "video" : "PDF"
        } URL`
      );
      return false;
    }

    return true;
  };

  const handleSaveCourse = async () => {
    try {
      if (editingCourse) {
        await api.put(`/admin/courses/${editingCourse.id}`, courseForm);
      } else {
        await api.post("/admin/courses", courseForm);
      }
      setCourseDialog(false);
      resetCourseForm();
      fetchCourses();
    } catch (error) {
      console.error("Failed to save course:", error);
    }
  };

  const handleSaveLesson = async () => {
    if (!validateLessonForm()) {
      return;
    }

    try {
      const lessonData: any = {
        ...lessonForm,
        keywords:
          lessonForm.lessonType === "KEYWORDS"
            ? lessonForm.keywords
            : undefined,
        contentData:
          lessonForm.lessonType === "QUIZ" || lessonForm.lessonType === "SLIDES"
            ? lessonForm.contentData
            : undefined,
        passingScore:
          lessonForm.lessonType === "QUIZ"
            ? lessonForm.passingScore
            : undefined,
      };

      if (editingLesson) {
        await api.put(`/admin/lessons/${editingLesson.id}`, lessonData);
      } else {
        await api.post(
          `/admin/courses/${selectedCourse!.id}/lessons`,
          lessonData
        );
      }
      setLessonDialog(false);
      resetLessonForm();
      fetchLessons(selectedCourse!.id);
    } catch (error) {
      console.error("Failed to save lesson:", error);
      alert("Failed to save lesson. Please try again.");
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        await api.delete(`/admin/courses/${courseId}`);
        fetchCourses();
      } catch (error) {
        console.error("Failed to delete course:", error);
      }
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (window.confirm("Are you sure you want to delete this lesson?")) {
      try {
        await api.delete(`/admin/lessons/${lessonId}`);
        fetchLessons(selectedCourse!.id);
      } catch (error) {
        console.error("Failed to delete lesson:", error);
      }
    }
  };

  // Fixed: Close course dialog handler
  const handleCloseCourseDialog = () => {
    setCourseDialog(false);
    resetCourseForm();
  };

  // Fixed: Close lesson dialog handler
  const handleCloseLessonDialog = () => {
    setLessonDialog(false);
    resetLessonForm();
  };

  // Fixed: Add new course handler
  const handleAddNewCourse = () => {
    resetCourseForm();
    setCourseDialog(true);
  };

  // Fixed: Add new lesson handler
  const handleAddNewLesson = () => {
    resetLessonForm();
    setLessonDialog(true);
  };

  const addKeyword = () => {
    setLessonForm({
      ...lessonForm,
      keywords: [
        ...lessonForm.keywords,
        {
          englishText: "",
          japaneseText: "",
          englishAudioUrl: "",
          japaneseAudioUrl: "",
        },
      ],
    });
  };

  const updateKeyword = (
    index: number,
    field: keyof Keyword,
    value: string
  ) => {
    const newKeywords = [...lessonForm.keywords];
    newKeywords[index] = { ...newKeywords[index], [field]: value };
    setLessonForm({ ...lessonForm, keywords: newKeywords });
  };

  const removeKeyword = (index: number) => {
    const newKeywords = lessonForm.keywords.filter((_, i) => i !== index);
    setLessonForm({ ...lessonForm, keywords: newKeywords });
  };

  if (selectedCourse) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={4}
        >
          <Box>
            <Button onClick={() => setSelectedCourse(null)} sx={{ mb: 1 }}>
              ← Back to Courses
            </Button>
            <Typography variant="h4" fontWeight={700}>
              {selectedCourse.title} - Lessons
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddNewLesson}
            sx={{ color: 'white' }}
          >
            Add Lesson
          </Button>
        </Stack>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Lesson List
                </Typography>
                <List>
                  {lessons.map((lesson, index) => (
                    <Paper
                      key={lesson.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lesson)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, index)}
                      sx={{
                        mb: 2,
                        cursor: 'grab',
                        transition: 'all 0.2s ease',
                        transform: dragOverIndex === index && draggedLesson?.id !== lesson.id
                          ? 'translateY(-2px)'
                          : 'none',
                        boxShadow: dragOverIndex === index && draggedLesson?.id !== lesson.id
                          ? 3
                          : 1,
                        borderLeft: dragOverIndex === index && draggedLesson?.id !== lesson.id
                          ? '4px solid #1976d2'
                          : 'none',
                        backgroundColor: draggedLesson?.id === lesson.id
                          ? 'rgba(0,0,0,0.05)'
                          : 'white',
                        '&:hover': {
                          boxShadow: 2
                        },
                        '&:active': {
                          cursor: 'grabbing'
                        }
                      }}
                    >
                      <ListItem>
                        <Stack direction="row" spacing={1} sx={{ mr: 1 }}>

                          <DragIndicator
                            sx={{
                              color: 'action.active',
                              alignSelf: 'center',
                              ml: 0.5
                            }}
                          />
                        </Stack>
                        <ListItemText
                          primary={
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={2}
                            >
                              <Chip
                                label={`Lesson ${lesson.order}`}
                                size="small"
                              />
                              <Typography variant="subtitle1" fontWeight={500}>
                                {lesson.title}
                              </Typography>
                            </Stack>
                          }
                          secondary={
                            <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                              <Chip
                                icon={
                                  lesson.lessonType === "VIDEO" ? (
                                    <VideoLibrary />
                                  ) : lesson.lessonType === "PDF" ? (
                                    <PictureAsPdf />
                                  ) : lesson.lessonType === "QUIZ" ? (
                                    <QuizIcon />
                                  ) : lesson.lessonType === "SLIDES" ? (
                                    <Slideshow />
                                  ) : (
                                    <Translate />
                                  )
                                }
                                label={
                                  lesson.lessonType === "KEYWORDS"
                                    ? "Keywords Practice"
                                    : lesson.lessonType === "QUIZ"
                                      ? "Quiz"
                                      : lesson.lessonType === "SLIDES"
                                        ? "Interactive Slides"
                                        : lesson.contentUrl
                                          ? lesson.lessonType === "VIDEO"
                                            ? "Has Video"
                                            : "Has PDF"
                                          : lesson.lessonType === "VIDEO"
                                            ? "No Video"
                                            : "No PDF"
                                }
                                size="small"
                                color={
                                  lesson.contentUrl ||
                                    lesson.lessonType === "KEYWORDS" ||
                                    lesson.lessonType === "QUIZ" ||
                                    lesson.lessonType === "SLIDES"
                                    ? "success"
                                    : "default"
                                }
                                sx={{ color: "white" }}
                              />
                              <Chip
                                label={`${lesson.pointsReward} points`}
                                size="small"
                                color="primary"
                              />
                              {lesson.requiresReflection && (
                                <Chip
                                  label="Reflection Required"
                                  size="small"
                                  color="secondary"
                                />
                              )}
                            </Stack>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            onClick={async (e) => {
                              e.stopPropagation();
                              setEditingLesson(lesson);

                              const lessonDetails = await fetchLessonDetails(
                                lesson.id
                              );

                              setLessonForm({
                                title: lesson.title,
                                description: lesson.description,
                                order: lesson.order,
                                lessonType: lesson.lessonType || "VIDEO",
                                contentUrl: lesson.contentUrl || "",
                                contentData: lessonDetails?.contentData || null,
                                pointsReward: lesson.pointsReward,
                                requiresReflection: lesson.requiresReflection,
                                passingScore: lessonDetails?.passingScore || 70,
                                keywords: lessonDetails?.keywords || [],
                              });
                              setLessonDialog(true);
                            }}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteLesson(lesson.id);
                            }}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    </Paper>
                  ))}
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
                    <Typography variant="body1">
                      {selectedCourse.type.replace("_", " ")}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Status
                    </Typography>
                    <Typography variant="body1">
                      <Chip
                        label={selectedCourse.isActive ? "Active" : "Inactive"}
                        color={selectedCourse.isActive ? "success" : "default"}
                        size="small"
                        sx={{ color: "white" }}
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

        {/* Lesson Dialog */}
        <Dialog
          open={lessonDialog}
          onClose={handleCloseLessonDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editingLesson ? "Edit Lesson" : "Add New Lesson"}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Lesson Title"
                value={lessonForm.title}
                onChange={(e) =>
                  setLessonForm({ ...lessonForm, title: e.target.value })
                }
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={lessonForm.description}
                onChange={(e) =>
                  setLessonForm({ ...lessonForm, description: e.target.value })
                }
              />
              <TextField
                fullWidth
                type="number"
                label="Order"
                value={lessonForm.order}
                onChange={(e) =>
                  setLessonForm({
                    ...lessonForm,
                    order: parseInt(e.target.value),
                  })
                }
                helperText="Change this number to reorder the lesson"
                InputProps={{
                  inputProps: { min: 1, max: lessons.length + 1 }
                }}
              />

              <FormControl>
                <FormLabel>Lesson Type</FormLabel>
                <RadioGroup
                  row
                  value={lessonForm.lessonType}
                  onChange={(e) =>
                    setLessonForm({
                      ...lessonForm,
                      lessonType: e.target.value as
                        | "VIDEO"
                        | "PDF"
                        | "KEYWORDS"
                        | "QUIZ"
                        | "SLIDES",
                    })
                  }
                >
                  <FormControlLabel
                    value="VIDEO"
                    control={<Radio />}
                    label={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <VideoIcon />
                        <Typography>Video Lesson</Typography>
                      </Stack>
                    }
                  />
                  <FormControlLabel
                    value="PDF"
                    control={<Radio />}
                    label={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <PictureAsPdf />
                        <Typography>PDF Resource</Typography>
                      </Stack>
                    }
                  />
                  <FormControlLabel
                    value="KEYWORDS"
                    control={<Radio />}
                    label={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Translate />
                        <Typography>Keywords Practice</Typography>
                      </Stack>
                    }
                  />
                  <FormControlLabel
                    value="QUIZ"
                    control={<Radio />}
                    label={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <QuizIcon />
                        <Typography>Quiz</Typography>
                      </Stack>
                    }
                  />
                  <FormControlLabel
                    value="SLIDES"
                    control={<Radio />}
                    label={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Slideshow />
                        <Typography>Interactive Slides</Typography>
                      </Stack>
                    }
                  />
                </RadioGroup>
              </FormControl>

              {lessonForm.lessonType !== "KEYWORDS" &&
                lessonForm.lessonType !== "QUIZ" &&
                lessonForm.lessonType !== "SLIDES" && (
                  <TextField
                    fullWidth
                    label={
                      lessonForm.lessonType === "VIDEO"
                        ? "Video URL (S3)"
                        : "PDF URL (S3)"
                    }
                    value={lessonForm.contentUrl}
                    onChange={(e) =>
                      setLessonForm({
                        ...lessonForm,
                        contentUrl: e.target.value,
                      })
                    }
                    helperText={`Enter the S3 URL for the ${lessonForm.lessonType.toLowerCase()}`}
                  />
                )}

              {lessonForm.lessonType === "QUIZ" && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Quiz Questions
                  </Typography>
                  <QuizBuilder
                    initialQuestions={lessonForm.contentData?.questions || []}
                    passingScore={lessonForm.passingScore}
                    timeLimit={lessonForm.contentData?.timeLimit}
                    onChange={(questions, settings) => {
                      setLessonForm({
                        ...lessonForm,
                        contentData: {
                          questions,
                          timeLimit: settings.timeLimit,
                        },
                        passingScore: settings.passingScore,
                      });
                    }}
                  />
                </Box>
              )}

              {lessonForm.lessonType === "SLIDES" && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Slide Content
                  </Typography>
                  <SlidesBuilder
                    initialSlides={lessonForm.contentData?.slides || []}
                    onChange={(slides) => {
                      setLessonForm({
                        ...lessonForm,
                        contentData: { slides },
                      });
                    }}
                  />
                </Box>
              )}

              {lessonForm.lessonType === "KEYWORDS" && (
                <Box>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Typography variant="h6">Keywords</Typography>
                    <Stack direction="row" spacing={1}>
                      <Button
                        startIcon={<CloudUpload />}
                        onClick={() => setBulkAudioDialog(true)}
                        variant="outlined"
                        size="small"
                        color="secondary"
                      >
                        Bulk Audio
                      </Button>
                      <Button
                        startIcon={<AddCircleOutline />}
                        onClick={addKeyword}
                        variant="outlined"
                        size="small"
                      >
                        Add Keyword
                      </Button>
                    </Stack>
                  </Stack>

                  {lessonForm.keywords.length === 0 ? (
                    <Paper
                      sx={{ p: 3, textAlign: "center", bgcolor: "grey.50" }}
                    >
                      <Typography color="text.secondary" gutterBottom>
                        No keywords added yet. You can:
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={2}
                        justifyContent="center"
                        sx={{ mt: 2 }}
                      >
                        <Button
                          variant="outlined"
                          startIcon={<AddCircleOutline />}
                          onClick={addKeyword}
                        >
                          Add Manually
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<CloudUpload />}
                          onClick={() => setBulkAudioDialog(true)}
                          color="secondary"
                        >
                          Import from CSV
                        </Button>
                      </Stack>
                    </Paper>
                  ) : (
                    <Stack spacing={2}>
                      {lessonForm.keywords.map((keyword, index) => (
                        <Paper key={index} sx={{ p: 2 }}>
                          <Stack spacing={2}>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Typography variant="subtitle2" fontWeight={600}>
                                Keyword {index + 1}
                              </Typography>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => removeKeyword(index)}
                              >
                                <DeleteOutline />
                              </IconButton>
                            </Stack>

                            <Grid container spacing={2}>
                              <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                  fullWidth
                                  label="Japanese Text"
                                  value={keyword.japaneseText}
                                  onChange={(e) =>
                                    updateKeyword(
                                      index,
                                      "japaneseText",
                                      e.target.value
                                    )
                                  }
                                  placeholder="こんにちは"
                                  InputProps={{
                                    startAdornment: (
                                      <Translate
                                        sx={{ mr: 1, color: "action.active" }}
                                      />
                                    ),
                                  }}
                                />
                              </Grid>
                              <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                  fullWidth
                                  label="English Text"
                                  value={keyword.englishText}
                                  onChange={(e) =>
                                    updateKeyword(
                                      index,
                                      "englishText",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Hello"
                                  InputProps={{
                                    startAdornment: (
                                      <Translate
                                        sx={{ mr: 1, color: "action.active" }}
                                      />
                                    ),
                                  }}
                                />
                              </Grid>
                              <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                  fullWidth
                                  label="Japanese Audio URL (S3)"
                                  value={keyword.japaneseAudioUrl}
                                  onChange={(e) =>
                                    updateKeyword(
                                      index,
                                      "japaneseAudioUrl",
                                      e.target.value
                                    )
                                  }
                                  placeholder="https://s3.../japanese-audio.mp3"
                                  InputProps={{
                                    startAdornment: (
                                      <VolumeUp
                                        sx={{ mr: 1, color: "action.active" }}
                                      />
                                    ),
                                  }}
                                />
                              </Grid>
                              <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                  fullWidth
                                  label="English Audio URL (S3)"
                                  value={keyword.englishAudioUrl}
                                  onChange={(e) =>
                                    updateKeyword(
                                      index,
                                      "englishAudioUrl",
                                      e.target.value
                                    )
                                  }
                                  placeholder="https://s3.../english-audio.mp3"
                                  InputProps={{
                                    startAdornment: (
                                      <VolumeUp
                                        sx={{ mr: 1, color: "action.active" }}
                                      />
                                    ),
                                  }}
                                />
                              </Grid>
                            </Grid>
                          </Stack>
                        </Paper>
                      ))}
                    </Stack>
                  )}

                  {/* Summary */}
                  {lessonForm.keywords.length > 0 && (
                    <Paper sx={{ p: 2, mt: 2, bgcolor: "grey.50" }}>
                      <Stack spacing={1}>
                        <Typography variant="subtitle2">Summary</Typography>
                        <Stack direction="row" spacing={2}>
                          <Chip
                            label={`${lessonForm.keywords.length} total keywords`}
                            size="small"
                          />
                          <Chip
                            label={`${lessonForm.keywords.filter(
                              (k) => k.japaneseAudioUrl
                            ).length
                              } with JP audio`}
                            size="small"
                            color={
                              lessonForm.keywords.filter(
                                (k) => k.japaneseAudioUrl
                              ).length === lessonForm.keywords.length
                                ? "success"
                                : "warning"
                            }
                          />
                          <Chip
                            label={`${lessonForm.keywords.filter(
                              (k) => k.englishAudioUrl
                            ).length
                              } with EN audio`}
                            size="small"
                            color={
                              lessonForm.keywords.filter(
                                (k) => k.englishAudioUrl
                              ).length === lessonForm.keywords.length
                                ? "success"
                                : "warning"
                            }
                          />
                        </Stack>
                        {lessonForm.keywords.some(
                          (k) => !k.japaneseAudioUrl || !k.englishAudioUrl
                        ) && (
                            <Alert severity="warning" sx={{ mt: 1 }}>
                              Some keywords are missing audio files. Consider
                              using the Bulk Audio manager to import them.
                            </Alert>
                          )}
                      </Stack>
                    </Paper>
                  )}
                </Box>
              )}

              <TextField
                fullWidth
                type="number"
                label="Points Reward"
                value={lessonForm.pointsReward}
                onChange={(e) =>
                  setLessonForm({
                    ...lessonForm,
                    pointsReward: parseInt(e.target.value),
                  })
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={lessonForm.requiresReflection}
                    onChange={(e) =>
                      setLessonForm({
                        ...lessonForm,
                        requiresReflection: e.target.checked,
                      })
                    }
                  />
                }
                label="Requires Reflection"
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseLessonDialog}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveLesson} sx={{ color: "white" }}>
              Save Lesson
            </Button>
          </DialogActions>
        </Dialog>

        {/* Bulk Audio Manager Dialog */}
        <BulkAudioManager
          open={bulkAudioDialog}
          onClose={() => setBulkAudioDialog(false)}
          keywords={lessonForm.keywords}
          onApply={(updatedKeywords) => {
            setLessonForm({ ...lessonForm, keywords: updatedKeywords });
          }}
        />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Typography variant="h4" fontWeight={700}>
          Course Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          sx={{ color: "white" }}
          onClick={handleAddNewCourse}
        >
          Add Course
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {courses.map((course) => (
          <Grid size={{ xs: 12, md: 4 }} key={course.id}>
            <motion.div whileHover={{ y: -4 }}>
              <Card>
                <Box
                  sx={{
                    height: 120,
                    background: `linear-gradient(135deg, ${course.type === "JAPAN_IN_CONTEXT" ? "#FF6B6B" : "#4ECDC4"
                      } 0%, ${course.type === "JAPAN_IN_CONTEXT" ? "#FFB7C5" : "#7ED4D0"
                      } 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "3rem",
                  }}
                >
                  {course.icon}
                </Box>
                <CardContent>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="start"
                    mb={2}
                  >
                    <Typography variant="h6" fontWeight={600}
                      sx={{
                        lineHeight: 1.6,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}>
                      {course.title}
                    </Typography>
                    <Chip
                      label={course.isActive ? "Active" : "Inactive"}
                      size="small"
                      color={course.isActive ? "success" : "default"}
                      sx={{ color: "white" }}
                    />
                  </Stack>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      lineHeight: 1.6,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}

                  >
                    {course.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {course.lessonCount || 0} lessons
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={() => setSelectedCourse(course)}
                  >
                    Manage Lessons
                  </Button>
                  <Button
                    size="small"
                    onClick={() => {
                      setEditingCourse(course);
                      setCourseForm({
                        title: course.title,
                        description: course.description,
                        type: course.type,
                        icon: course.icon,
                        isActive: course.isActive,
                        freeLessonCount: course.freeLessonCount,
                      });
                      setCourseDialog(true);
                    }}
                  >
                    Edit
                  </Button>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteCourse(course.id)}
                  >
                    <Delete />
                  </IconButton>
                </CardActions>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Course Dialog */}
      <Dialog
        open={courseDialog}
        onClose={handleCloseCourseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingCourse ? "Edit Course" : "Add New Course"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Course Title"
              value={courseForm.title}
              onChange={(e) =>
                setCourseForm({ ...courseForm, title: e.target.value })
              }
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={courseForm.description}
              onChange={(e) =>
                setCourseForm({ ...courseForm, description: e.target.value })
              }
            />
            <FormControl fullWidth>
              <InputLabel>Course Type</InputLabel>
              <Select
                value={courseForm.type}
                label="Course Type"
                onChange={(e) =>
                  setCourseForm({ ...courseForm, type: e.target.value as any })
                }
              >
                <MenuItem value="JAPAN_IN_CONTEXT">Japan in Context</MenuItem>
                <MenuItem value="JLPT_IN_CONTEXT">JLPT in Context</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Icon (Emoji)"
              value={courseForm.icon}
              onChange={(e) =>
                setCourseForm({ ...courseForm, icon: e.target.value })
              }
              helperText="Enter an emoji to represent the course"
            />
            <TextField
              fullWidth
              required
              type="number"
              label="Free Lesson Count"
              value={courseForm.freeLessonCount}
              onChange={(e) =>
                setCourseForm({ ...courseForm, freeLessonCount: parseInt(e.target.value) })
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={courseForm.isActive}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, isActive: e.target.checked })
                  }
                />
              }
              label="Active"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCourseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveCourse}
            sx={{ color: "white" }}
          >
            Save Course
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};