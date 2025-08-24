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
  Switch,
  FormControlLabel
} from "@mui/material";
import {
  Add,
  Delete,
  DragIndicator,

} from "@mui/icons-material";
import { motion } from "framer-motion";
import api from "../../services/api";

import { useNavigate } from "react-router-dom";

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


export const CourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [courseDialog, setCourseDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);


  // Drag and drop state for courses
  const [draggedCourse, setDraggedCourse] = useState<Course | null>(null);
  const [dragOverCourseIndex, setDragOverCourseIndex] = useState<number | null>(null);

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

  // Course Drag and Drop handlers
  const handleCourseDragStart = (e: React.DragEvent<HTMLDivElement>, course: Course) => {
    setDraggedCourse(course);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", "");

    if (e.currentTarget) {
      e.currentTarget.style.opacity = "0.5";
    }
  };

  const handleCourseDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    setDraggedCourse(null);
    setDragOverCourseIndex(null);

    if (e.currentTarget) {
      e.currentTarget.style.opacity = "1";
    }
  };

  const handleCourseDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverCourseIndex(index);
  };

  const handleCourseDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverCourseIndex(null);
    }
  };

  const handleCourseDrop = async (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();

    if (!draggedCourse) return;

    const dragIndex = courses.findIndex(course => course.id === draggedCourse.id);

    if (dragIndex === dropIndex) {
      setDraggedCourse(null);
      setDragOverCourseIndex(null);
      return;
    }

    // Create new array with reordered courses
    const newCourses = [...courses];
    const [draggedItem] = newCourses.splice(dragIndex, 1);
    newCourses.splice(dropIndex, 0, draggedItem);

    // Update order numbers
    const reorderedCourses = newCourses.map((course, index) => ({
      ...course,
      order: index + 1
    }));

    // Optimistically update UI
    setCourses(reorderedCourses);
    setDraggedCourse(null);
    setDragOverCourseIndex(null);

    try {
      // Update all affected courses in the backend
      const updatePromises = reorderedCourses.map(course =>
        api.put(`/admin/courses/${course.id}`, {
          ...course,
          order: course.order
        })
      );

      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Failed to reorder courses:", error);
      // Revert on error
      fetchCourses();
      alert("Failed to reorder courses. Please try again.");
    }
  };



  // Helper functions (existing code)
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



  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchLessons(selectedCourse.id);
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
      setCourses(sortedCourses);
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

  const handleCloseCourseDialog = () => {
    setCourseDialog(false);
    resetCourseForm();
  };

  const handleAddNewCourse = () => {
    resetCourseForm();
    setCourseDialog(true);
  };


  // Course list view with drag and drop
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
        {courses.map((course, index) => (
          <Grid
            size={{ xs: 12, md: 4 }}
            key={course.id}
            draggable
            onDragStart={(e) => handleCourseDragStart(e, course)}
            onDragEnd={handleCourseDragEnd}
            onDragOver={(e) => handleCourseDragOver(e, index)}
            onDragLeave={handleCourseDragLeave}
            onDrop={(e) => handleCourseDrop(e, index)}
          >
            <motion.div
              whileHover={{ y: -4 }}
              style={{
                cursor: 'grab',
                transition: 'all 0.2s ease',
                transform: dragOverCourseIndex === index && draggedCourse?.id !== course.id
                  ? 'translateY(-8px)'
                  : 'none',
                opacity: draggedCourse?.id === course.id ? 0.5 : 1,
              }}
            >
              <Card
                sx={{
                  position: 'relative',
                  boxShadow: dragOverCourseIndex === index && draggedCourse?.id !== course.id
                    ? 4
                    : 1,
                  border: dragOverCourseIndex === index && draggedCourse?.id !== course.id
                    ? '2px solid #1976d2'
                    : 'none',
                  '&:active': {
                    cursor: 'grabbing'
                  }
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    zIndex: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: 1,
                    padding: '2px 8px',
                  }}
                >
                  <DragIndicator sx={{ fontSize: 20, color: 'action.active' }} />
                  <Typography variant="caption" fontWeight={600}>
                    #{course.order || index + 1}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    height: 120,
                    background: `linear-gradient(135deg, ${course.type === "JAPAN_IN_CONTEXT" ? "#5C633A" : "#A6531C"
                      } 0%, ${course.type === "JAPAN_IN_CONTEXT" ? "#D4BC8C" : "#7ED4D0"
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
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      sx={{
                        lineHeight: 1.6,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
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
                    onClick={() => {
                      setSelectedCourse(course)
                      navigate(`/admin/courses/${course.id}`)
                    }}
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
              onWheel={(e) => (e.target as HTMLInputElement).blur()}
              onChange={(e) =>
                setCourseForm({
                  ...courseForm,
                  freeLessonCount: parseInt(e.target.value),
                })
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
