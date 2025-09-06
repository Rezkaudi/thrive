import React, { useState, useEffect } from "react";
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
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
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Paper,
    FormControlLabel,
    FormLabel,
    RadioGroup,
    Radio,
    Alert,
    useTheme,
    useMediaQuery,
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
import api from "../../services/api";
import { BulkAudioManager } from "../../components/admin/BulkAudioManager";
import { QuizBuilder } from "../../components/admin/QuizBuilder";
import { SlidesBuilder } from "../../components/admin/SlidesBuilder";
import { useNavigate, useParams } from "react-router-dom";

interface Course {
    id: string;
    title: string;
    description: string;
    type: "JAPAN_IN_CONTEXT" | "JLPT_IN_CONTEXT";
    icon: string;
    isActive: boolean;
    lessonCount?: number;
    freeLessonCount: number;
    order?: number; // Add order field
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
    englishSentence?: string;
    japaneseSentence?: string;
    japaneseSentenceAudioUrl?: string;
}

export const AdminCourseDetailPage: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const navigate = useNavigate();

    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [lessonDialog, setLessonDialog] = useState(false);
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
    const [bulkAudioDialog, setBulkAudioDialog] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    // Drag and drop state for lessons
    const [draggedLesson, setDraggedLesson] = useState<Lesson | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);


    const [lessonForm, setLessonForm] = useState({
        title: "",
        description: "",
        order: 1,
        lessonType: "VIDEO" as "VIDEO" | "PDF" | "KEYWORDS" | "QUIZ" | "SLIDES",
        contentUrl: "",
        contentData: null as any,
        pointsReward: 0,
        requiresReflection: false,
        passingScore: 70,
        keywords: [] as Keyword[],
    });

    // Lesson Drag and Drop handlers (existing code)
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, lesson: Lesson) => {
        setDraggedLesson(lesson);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/html", "");

        if (e.currentTarget) {
            e.currentTarget.style.opacity = "0.5";
        }
    };

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
        setDraggedLesson(null);
        setDragOverIndex(null);

        if (e.currentTarget) {
            e.currentTarget.style.opacity = "1";
        }
    };

    const handleDragOver = (
        e: React.DragEvent<HTMLDivElement>,
        index: number
    ) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setDragOverIndex(index);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;

        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
            setDragOverIndex(null);
        }
    };

    const handleDrop = async (
        e: React.DragEvent<HTMLDivElement>,
        dropIndex: number
    ) => {
        e.preventDefault();

        if (!draggedLesson) return;

        const dragIndex = lessons.findIndex(
            (lesson) => lesson.id === draggedLesson.id
        );

        if (dragIndex === dropIndex) {
            setDraggedLesson(null);
            setDragOverIndex(null);
            return;
        }

        const newLessons = [...lessons];
        const [draggedItem] = newLessons.splice(dragIndex, 1);
        newLessons.splice(dropIndex, 0, draggedItem);

        const reorderedLessons = newLessons.map((lesson, index) => ({
            ...lesson,
            order: index + 1,
        }));

        setLessons(reorderedLessons);
        setDraggedLesson(null);
        setDragOverIndex(null);

        try {
            const updatePromises = reorderedLessons.map(lesson =>
                api.put(`/admin/lessons/${lesson.id}`, {
                    ...lesson,
                    order: lesson.order,
                })
            );

            await Promise.all(updatePromises);
        } catch (error) {
            console.error("Failed to reorder lessons:", error);
            fetchLessons(selectedCourse!.id);
            alert("Failed to reorder lessons. Please try again.");
        }
    };


    const resetLessonForm = () => {
        setLessonForm({
            title: "",
            description: "",
            order: lessons.length + 1,
            lessonType: "VIDEO",
            contentUrl: "",
            contentData: null,
            pointsReward: 0,
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

    useEffect(() => {
        if (!selectedCourse) {
            setLessons([]);
            setLessonDialog(false);
            resetLessonForm();
        }
    }, [selectedCourse]);

    const fetchCourses = async () => {
        try {
            const response = await api.get("/courses");
            // Sort courses by order if they have it, otherwise by creation date
            const sortedCourses = response.data.sort((a: Course, b: Course) => {
                if (a.order !== undefined && b.order !== undefined) {
                    return a.order - b.order;
                }
                return 0;
            });
            setSelectedCourse(sortedCourses.find((item: Course) => item.id === courseId))

        } catch (error) {
            console.error("Failed to fetch courses:", error);
        }
    };

    const fetchLessons = async (courseId: string) => {
        try {
            const response = await api.get(`/courses/${courseId}/lessons`);
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
            fetchCourses();
        } catch (error) {
            console.error("Failed to save lesson:", error);
            alert("Failed to save lesson. Please try again.");
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


    const handleCloseLessonDialog = () => {
        setLessonDialog(false);
        resetLessonForm();
    };

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
                    englishSentence: "",
                    japaneseSentence: "",
                    japaneseSentenceAudioUrl: "",
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

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Stack
                direction={isMobile ? "column" : "row"}
                justifyContent="space-between"
                alignItems="center"
                gap={2}
                mb={4}
            >
                <Box>
                    <Button onClick={() => navigate("/admin/courses")} sx={{ mb: 1 }}>
                        ← Back to Courses
                    </Button>
                    <Typography variant="h4" fontWeight={700}>
                        {selectedCourse?.title} - Lessons
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleAddNewLesson}
                    sx={{ color: "white" }}
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
                                            cursor: "grab",
                                            transition: "all 0.2s ease",
                                            transform:
                                                dragOverIndex === index &&
                                                    draggedLesson?.id !== lesson.id
                                                    ? "translateY(-2px)"
                                                    : "none",
                                            boxShadow:
                                                dragOverIndex === index &&
                                                    draggedLesson?.id !== lesson.id
                                                    ? 3
                                                    : 1,
                                            borderLeft:
                                                dragOverIndex === index &&
                                                    draggedLesson?.id !== lesson.id
                                                    ? "4px solid #1976d2"
                                                    : "none",
                                            backgroundColor:
                                                draggedLesson?.id === lesson.id
                                                    ? "rgba(0,0,0,0.05)"
                                                    : "white",
                                            "&:hover": {
                                                boxShadow: 2,
                                            },
                                            "&:active": {
                                                cursor: "grabbing",
                                            },
                                        }}
                                    >
                                        <ListItem>
                                            <Stack direction="row" spacing={1} sx={{ mr: 1 }}>
                                                <DragIndicator
                                                    sx={{
                                                        color: "action.active",
                                                        alignSelf: "center",
                                                        ml: 0.5,
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
                                        {selectedCourse?.type.replace("_", " ")}
                                    </Typography>
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

            {/* Lesson Dialog (existing code remains the same) */}
            <Dialog
                open={lessonDialog}
                onClose={handleCloseLessonDialog}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle>
                    {editingLesson ? "Edit Lesson" : "Add New Lesson"}
                </DialogTitle>
                <DialogContent >
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
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                            value={lessonForm.order}
                            onChange={(e) =>
                                setLessonForm({
                                    ...lessonForm,
                                    order: parseInt(e.target.value),
                                })
                            }
                            helperText="Change this number to reorder the lesson"
                            InputProps={{
                                inputProps: { min: 1, max: lessons.length + 1 },
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
                                    key={editingLesson?.id || 'new-quiz'}
                                    initialQuestions={lessonForm.contentData?.questions || []}
                                    passingScore={lessonForm.passingScore}
                                    timeLimit={lessonForm.contentData?.timeLimit}
                                    onChange={(questions, settings) => {
                                        setLessonForm((prev) => ({
                                            ...prev,
                                            contentData: {
                                                questions,
                                                timeLimit: settings.timeLimit,
                                            },
                                            passingScore: settings.passingScore,
                                        }));
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
                                    key={editingLesson?.id || 'new-slides'}
                                    initialSlides={lessonForm.contentData?.slides || []}
                                    onChange={(slides) => {
                                        setLessonForm((prev) => ({
                                            ...prev,
                                            contentData: { slides },
                                        }));
                                    }}
                                />
                            </Box>
                        )}

                        {lessonForm.lessonType === "KEYWORDS" && (
                            <Box>
                                <Stack
                                    direction={isMobile ? "column" : "row"}
                                    justifyContent="space-between"
                                    gap={1}
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

                                                    {/* Word Section */}
                                                    <Typography
                                                        variant="body2"
                                                        fontWeight={500}
                                                        color="primary"
                                                    >
                                                        Word/Phrase
                                                    </Typography>
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
                                                    </Grid>

                                                    {/* Sentence Section */}
                                                    <Typography
                                                        variant="body2"
                                                        fontWeight={500}
                                                        color="secondary"
                                                    >
                                                        Example Sentences
                                                    </Typography>
                                                    <Grid container spacing={2}>
                                                        <Grid size={{ xs: 12, md: 6 }}>
                                                            <TextField
                                                                fullWidth
                                                                multiline
                                                                rows={2}
                                                                label="Japanese Sentence"
                                                                value={keyword.japaneseSentence}
                                                                onChange={(e) =>
                                                                    updateKeyword(
                                                                        index,
                                                                        "japaneseSentence",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                placeholder="こんにちは、元気ですか？"
                                                                InputProps={{
                                                                    startAdornment: (
                                                                        <Translate
                                                                            sx={{
                                                                                mr: 1,
                                                                                color: "action.active",
                                                                                alignSelf: "flex-start",
                                                                                mt: 1,
                                                                            }}
                                                                        />
                                                                    ),
                                                                }}
                                                            />
                                                        </Grid>
                                                        <Grid size={{ xs: 12, md: 6 }}>
                                                            <TextField
                                                                fullWidth
                                                                multiline
                                                                rows={2}
                                                                label="English Sentence"
                                                                value={keyword.englishSentence}
                                                                onChange={(e) =>
                                                                    updateKeyword(
                                                                        index,
                                                                        "englishSentence",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                placeholder="Hello, how are you?"
                                                                InputProps={{
                                                                    startAdornment: (
                                                                        <Translate
                                                                            sx={{
                                                                                mr: 1,
                                                                                color: "action.active",
                                                                                alignSelf: "flex-start",
                                                                                mt: 1,
                                                                            }}
                                                                        />
                                                                    ),
                                                                }}
                                                            />
                                                        </Grid>
                                                    </Grid>

                                                    {/* Audio Section */}
                                                    <Typography
                                                        variant="body2"
                                                        fontWeight={500}
                                                        color="info"
                                                    >
                                                        Audio Files
                                                    </Typography>
                                                    <Grid container spacing={2}>
                                                        <Grid size={{ xs: 12, md: 4 }}>
                                                            <TextField
                                                                fullWidth
                                                                label="Japanese Word Audio URL"
                                                                value={keyword.japaneseAudioUrl}
                                                                onChange={(e) =>
                                                                    updateKeyword(
                                                                        index,
                                                                        "japaneseAudioUrl",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                placeholder="https://s3.../japanese-word.mp3"
                                                                InputProps={{
                                                                    startAdornment: (
                                                                        <VolumeUp
                                                                            sx={{ mr: 1, color: "action.active" }}
                                                                        />
                                                                    ),
                                                                }}
                                                            />
                                                        </Grid>
                                                        <Grid size={{ xs: 12, md: 4 }}>
                                                            <TextField
                                                                fullWidth
                                                                label="English Word Audio URL"
                                                                value={keyword.englishAudioUrl}
                                                                onChange={(e) =>
                                                                    updateKeyword(
                                                                        index,
                                                                        "englishAudioUrl",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                placeholder="https://s3.../english-word.mp3"
                                                                InputProps={{
                                                                    startAdornment: (
                                                                        <VolumeUp
                                                                            sx={{ mr: 1, color: "action.active" }}
                                                                        />
                                                                    ),
                                                                }}
                                                            />
                                                        </Grid>
                                                        <Grid size={{ xs: 12, md: 4 }}>
                                                            <TextField
                                                                fullWidth
                                                                label="Japanese Sentence Audio URL"
                                                                value={keyword.japaneseSentenceAudioUrl}
                                                                onChange={(e) =>
                                                                    updateKeyword(
                                                                        index,
                                                                        "japaneseSentenceAudioUrl",
                                                                        e.target.value
                                                                    )
                                                                }
                                                                placeholder="https://s3.../japanese-sentence.mp3"
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

                                {/* Updated Summary */}
                                {lessonForm.keywords.length > 0 && (
                                    <Paper sx={{ p: 2, mt: 2, bgcolor: "grey.50" }}>
                                        <Stack spacing={1}>
                                            <Typography variant="subtitle2">Summary</Typography>
                                            <Stack
                                                direction={isMobile ? "column" : "row"}
                                                spacing={2}
                                                flexWrap="wrap"
                                            >
                                                <Chip
                                                    label={`${lessonForm.keywords.length} total keywords`}
                                                    size="small"
                                                />
                                                <Chip
                                                    label={`${lessonForm.keywords.filter(
                                                        (k) => k.japaneseAudioUrl
                                                    ).length
                                                        } with JP word audio`}
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
                                                        } with EN word audio`}
                                                    size="small"
                                                    color={
                                                        lessonForm.keywords.filter(
                                                            (k) => k.englishAudioUrl
                                                        ).length === lessonForm.keywords.length
                                                            ? "success"
                                                            : "warning"
                                                    }
                                                />
                                                <Chip
                                                    label={`${lessonForm.keywords.filter(
                                                        (k) => k.englishSentence
                                                    ).length
                                                        } with EN sentences`}
                                                    size="small"
                                                    color={
                                                        lessonForm.keywords.filter(
                                                            (k) => k.englishSentence
                                                        ).length === lessonForm.keywords.length
                                                            ? "success"
                                                            : "warning"
                                                    }
                                                />
                                                <Chip
                                                    label={`${lessonForm.keywords.filter(
                                                        (k) => k.japaneseSentence
                                                    ).length
                                                        } with JP sentences`}
                                                    size="small"
                                                    color={
                                                        lessonForm.keywords.filter(
                                                            (k) => k.japaneseSentence
                                                        ).length === lessonForm.keywords.length
                                                            ? "success"
                                                            : "warning"
                                                    }
                                                />
                                                <Chip
                                                    label={`${lessonForm.keywords.filter(
                                                        (k) => k.japaneseSentenceAudioUrl
                                                    ).length
                                                        } with JP sentence audio`}
                                                    size="small"
                                                    color={
                                                        lessonForm.keywords.filter(
                                                            (k) => k.japaneseSentenceAudioUrl
                                                        ).length === lessonForm.keywords.length
                                                            ? "success"
                                                            : "warning"
                                                    }
                                                />
                                            </Stack>

                                            {/* Enhanced warning alerts */}
                                            {lessonForm.keywords.some(
                                                (k) => !k.japaneseAudioUrl || !k.englishAudioUrl
                                            ) && (
                                                    <Alert severity="warning" sx={{ mt: 1 }}>
                                                        Some keywords are missing word audio files. Consider
                                                        using the Bulk Audio manager to import them.
                                                    </Alert>
                                                )}

                                            {lessonForm.keywords.some(
                                                (k) => !k.englishSentence || !k.japaneseSentence
                                            ) && (
                                                    <Alert severity="info" sx={{ mt: 1 }}>
                                                        Some keywords are missing example sentences. Adding
                                                        sentences helps learners understand context and
                                                        usage.
                                                    </Alert>
                                                )}

                                            {lessonForm.keywords.some(
                                                (k) =>
                                                    k.japaneseSentence && !k.japaneseSentenceAudioUrl
                                            ) && (
                                                    <Alert severity="warning" sx={{ mt: 1 }}>
                                                        Some Japanese sentences are missing audio
                                                        pronunciation. This audio helps with pronunciation
                                                        practice.
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
                            onWheel={(e) => (e.target as HTMLInputElement).blur()}
                            onChange={(e) =>
                                setLessonForm({
                                    ...lessonForm,
                                    pointsReward: parseInt(e.target.value),
                                })
                            }
                        />
                        {/* <FormControlLabel
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
                        /> */}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseLessonDialog}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveLesson}
                        sx={{ color: "white" }}
                    >
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
};