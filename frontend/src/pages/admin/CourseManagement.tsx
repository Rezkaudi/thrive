import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
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
} from '@mui/icons-material';
import { PictureAsPdf, VideoLibrary as VideoIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { BulkAudioManager } from '../../components/admin/BulkAudioManager';


interface Course {
  id: string;
  title: string;
  description: string;
  type: 'JAPAN_IN_CONTEXT' | 'JLPT_IN_CONTEXT';
  icon: string;
  isActive: boolean;
  lessonCount?: number;
}

interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  contentUrl?: string;
  lessonType: 'VIDEO' | 'PDF' | 'KEYWORDS';
  pointsReward: number;
  requiresReflection: boolean;
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

  const [courseForm, setCourseForm] = useState<{
    title: string;
    description: string;
    type: 'JAPAN_IN_CONTEXT' | 'JLPT_IN_CONTEXT';
    icon: string;
    isActive: boolean;
  }>({
    title: '',
    description: '',
    type: 'JAPAN_IN_CONTEXT',
    icon: '🏯',
    isActive: true,
  });

  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    order: 1,
    lessonType: 'VIDEO' as 'VIDEO' | 'PDF' | 'KEYWORDS',
    contentUrl: '',
    pointsReward: 10,
    requiresReflection: false,
    keywords: [] as Keyword[],
  });

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
      const response = await api.get('/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  const fetchLessons = async (courseId: string) => {
    try {
      const response = await api.get(`/courses/${courseId}/lessons`);
      console.log('Lessons response:', response.data);
      setLessons(response.data);
    } catch (error) {
      console.error('Failed to fetch lessons:', error);
    }
  };

  const fetchLessonDetails = async (lessonId: string) => {
    try {
      const response = await api.get(`/admin/lessons/${lessonId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch lesson details:', error);
      return null;
    }
  };

  const validateLessonForm = () => {
    if (!lessonForm.title.trim()) {
      alert('Please enter a lesson title');
      return false;
    }

    if (!lessonForm.description.trim()) {
      alert('Please enter a lesson description');
      return false;
    }

    if (lessonForm.lessonType === 'KEYWORDS') {
      if (lessonForm.keywords.length === 0) {
        alert('Please add at least one keyword');
        return false;
      }

      for (let i = 0; i < lessonForm.keywords.length; i++) {
        const keyword = lessonForm.keywords[i];
        if (!keyword.japaneseText.trim() || !keyword.englishText.trim()) {
          alert(`Keyword ${i + 1} must have both Japanese and English text`);
          return false;
        }
      }
    } else if (!lessonForm.contentUrl.trim()) {
      alert(`Please provide a ${lessonForm.lessonType === 'VIDEO' ? 'video' : 'PDF'} URL`);
      return false;
    }

    return true;
  };

  const handleSaveCourse = async () => {
    try {
      if (editingCourse) {
        await api.put(`/admin/courses/${editingCourse.id}`, courseForm);
      } else {
        await api.post('/admin/courses', courseForm);
      }
      setCourseDialog(false);
      setEditingCourse(null);
      setCourseForm({
        title: '',
        description: '',
        type: 'JAPAN_IN_CONTEXT',
        icon: '🏯',
        isActive: true,
      });
      fetchCourses();
    } catch (error) {
      console.error('Failed to save course:', error);
    }
  };

  const handleSaveLesson = async () => {
    if (!validateLessonForm()) {
      return;
    }

    try {
      if (editingLesson) {
        await api.put(`/admin/lessons/${editingLesson.id}`, lessonForm);
      } else {
        await api.post(`/admin/courses/${selectedCourse!.id}/lessons`, lessonForm);
      }
      setLessonDialog(false);
      setEditingLesson(null);
      setLessonForm({
        title: '',
        description: '',
        order: lessons.length + 1,
        lessonType: 'VIDEO',
        contentUrl: '',
        pointsReward: 10,
        requiresReflection: false,
        keywords: [],
      });
      fetchLessons(selectedCourse!.id);
    } catch (error) {
      console.error('Failed to save lesson:', error);
      alert('Failed to save lesson. Please try again.');
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await api.delete(`/admin/courses/${courseId}`);
        fetchCourses();
      } catch (error) {
        console.error('Failed to delete course:', error);
      }
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (window.confirm('Are you sure you want to delete this lesson?')) {
      try {
        await api.delete(`/admin/lessons/${lessonId}`);
        fetchLessons(selectedCourse!.id);
      } catch (error) {
        console.error('Failed to delete lesson:', error);
      }
    }
  };

  const addKeyword = () => {
    setLessonForm({
      ...lessonForm,
      keywords: [...lessonForm.keywords, {
        englishText: '',
        japaneseText: '',
        englishAudioUrl: '',
        japaneseAudioUrl: '',
      }],
    });
  };

  const updateKeyword = (index: number, field: keyof Keyword, value: string) => {
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
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
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
            onClick={() => {
              setLessonForm({
                ...lessonForm,
                order: lessons.length + 1,
                keywords: [],
              });
              setEditingLesson(null);
              setLessonDialog(true);
            }}
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
                  {lessons.map((lesson) => (
                    <Paper key={lesson.id} sx={{ mb: 2 }}>
                      <ListItem>
                        <IconButton edge="start" sx={{ cursor: 'grab' }}>
                          <DragIndicator />
                        </IconButton>
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
                                icon={
                                  lesson.lessonType === 'VIDEO' ? <VideoLibrary /> :
                                  lesson.lessonType === 'PDF' ? <PictureAsPdf /> :
                                  <Translate />
                                }
                                label={
                                  lesson.lessonType === 'KEYWORDS' ? 'Keywords Practice' :
                                  lesson.contentUrl
                                    ? (lesson.lessonType === 'VIDEO' ? 'Has Video' : 'Has PDF')
                                    : (lesson.lessonType === 'VIDEO' ? 'No Video' : 'No PDF')
                                }
                                size="small"
                                color={lesson.contentUrl || lesson.lessonType === 'KEYWORDS' ? 'success' : 'default'}
                              />
                              <Chip
                                label={`${lesson.pointsReward} points`}
                                size="small"
                                color="primary"
                              />
                              {lesson.requiresReflection && (
                                <Chip label="Reflection Required" size="small" color="secondary" />
                              )}
                            </Stack>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            onClick={async () => {
                              setEditingLesson(lesson);
                              
                              const lessonDetails = await fetchLessonDetails(lesson.id);
                              
                              setLessonForm({
                                title: lesson.title,
                                description: lesson.description,
                                order: lesson.order,
                                lessonType: lesson.lessonType || 'VIDEO',
                                contentUrl: lesson.contentUrl || '',
                                pointsReward: lesson.pointsReward,
                                requiresReflection: lesson.requiresReflection,
                                keywords: lessonDetails?.keywords || [],
                              });
                              setLessonDialog(true);
                            }}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDeleteLesson(lesson.id)}
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
                      {selectedCourse.type.replace('_', ' ')}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Status
                    </Typography>
                    <Typography variant="body1">
                      <Chip
                        label={selectedCourse.isActive ? 'Active' : 'Inactive'}
                        color={selectedCourse.isActive ? 'success' : 'default'}
                        size="small"
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
        <Dialog open={lessonDialog} onClose={() => setLessonDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingLesson ? 'Edit Lesson' : 'Add New Lesson'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Lesson Title"
                value={lessonForm.title}
                onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={lessonForm.description}
                onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
              />
              <TextField
                fullWidth
                type="number"
                label="Order"
                value={lessonForm.order}
                onChange={(e) => setLessonForm({ ...lessonForm, order: parseInt(e.target.value) })}
              />

              <FormControl>
                <FormLabel>Lesson Type</FormLabel>
                <RadioGroup
                  row
                  value={lessonForm.lessonType}
                  onChange={(e) => setLessonForm({ ...lessonForm, lessonType: e.target.value as 'VIDEO' | 'PDF' | 'KEYWORDS' })}
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
                </RadioGroup>
              </FormControl>

              {lessonForm.lessonType !== 'KEYWORDS' && (
                <TextField
                  fullWidth
                  label={lessonForm.lessonType === 'VIDEO' ? 'Video URL (S3)' : 'PDF URL (S3)'}
                  value={lessonForm.contentUrl}
                  onChange={(e) => setLessonForm({ ...lessonForm, contentUrl: e.target.value })}
                  helperText={`Enter the S3 URL for the ${lessonForm.lessonType.toLowerCase()}`}
                />
              )}

              {lessonForm.lessonType === 'KEYWORDS' && (
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
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
                    <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
                      <Typography color="text.secondary" gutterBottom>
                        No keywords added yet. You can:
                      </Typography>
                      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
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
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
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
                                  onChange={(e) => updateKeyword(index, 'japaneseText', e.target.value)}
                                  placeholder="こんにちは"
                                  InputProps={{
                                    startAdornment: <Translate sx={{ mr: 1, color: 'action.active' }} />,
                                  }}
                                />
                              </Grid>
                              <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                  fullWidth
                                  label="English Text"
                                  value={keyword.englishText}
                                  onChange={(e) => updateKeyword(index, 'englishText', e.target.value)}
                                  placeholder="Hello"
                                  InputProps={{
                                    startAdornment: <Translate sx={{ mr: 1, color: 'action.active' }} />,
                                  }}
                                />
                              </Grid>
                              <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                  fullWidth
                                  label="Japanese Audio URL (S3)"
                                  value={keyword.japaneseAudioUrl}
                                  onChange={(e) => updateKeyword(index, 'japaneseAudioUrl', e.target.value)}
                                  placeholder="https://s3.../japanese-audio.mp3"
                                  InputProps={{
                                    startAdornment: <VolumeUp sx={{ mr: 1, color: 'action.active' }} />,
                                  }}
                                />
                              </Grid>
                              <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                  fullWidth
                                  label="English Audio URL (S3)"
                                  value={keyword.englishAudioUrl}
                                  onChange={(e) => updateKeyword(index, 'englishAudioUrl', e.target.value)}
                                  placeholder="https://s3.../english-audio.mp3"
                                  InputProps={{
                                    startAdornment: <VolumeUp sx={{ mr: 1, color: 'action.active' }} />,
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
                    <Paper sx={{ p: 2, mt: 2, bgcolor: 'grey.50' }}>
                      <Stack spacing={1}>
                        <Typography variant="subtitle2">Summary</Typography>
                        <Stack direction="row" spacing={2}>
                          <Chip
                            label={`${lessonForm.keywords.length} total keywords`}
                            size="small"
                          />
                          <Chip
                            label={`${lessonForm.keywords.filter(k => k.japaneseAudioUrl).length} with JP audio`}
                            size="small"
                            color={lessonForm.keywords.filter(k => k.japaneseAudioUrl).length === lessonForm.keywords.length ? 'success' : 'warning'}
                          />
                          <Chip
                            label={`${lessonForm.keywords.filter(k => k.englishAudioUrl).length} with EN audio`}
                            size="small"
                            color={lessonForm.keywords.filter(k => k.englishAudioUrl).length === lessonForm.keywords.length ? 'success' : 'warning'}
                          />
                        </Stack>
                        {lessonForm.keywords.some(k => !k.japaneseAudioUrl || !k.englishAudioUrl) && (
                          <Alert severity="warning" sx={{ mt: 1 }}>
                            Some keywords are missing audio files. Consider using the Bulk Audio manager to import them.
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
                onChange={(e) => setLessonForm({ ...lessonForm, pointsReward: parseInt(e.target.value) })}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={lessonForm.requiresReflection}
                    onChange={(e) => setLessonForm({ ...lessonForm, requiresReflection: e.target.checked })}
                  />
                }
                label="Requires Reflection"
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setLessonDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveLesson}>
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
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" fontWeight={700}>
          Course Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCourseDialog(true)}
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
                    background: `linear-gradient(135deg, ${course.type === 'JAPAN_IN_CONTEXT' ? '#FF6B6B' : '#4ECDC4'
                      } 0%, ${course.type === 'JAPAN_IN_CONTEXT' ? '#FFB7C5' : '#7ED4D0'
                      } 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '3rem',
                  }}
                >
                  {course.icon}
                </Box>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="start" mb={2}>
                    <Typography variant="h6" fontWeight={600}>
                      {course.title}
                    </Typography>
                    <Chip
                      label={course.isActive ? 'Active' : 'Inactive'}
                      size="small"
                      color={course.isActive ? 'success' : 'default'}
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {course.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {course.lessonCount || 0} lessons
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => setSelectedCourse(course)}>
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
      <Dialog open={courseDialog} onClose={() => setCourseDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCourse ? 'Edit Course' : 'Add New Course'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Course Title"
              value={courseForm.title}
              onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={courseForm.description}
              onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
            />
            <FormControl fullWidth>
              <InputLabel>Course Type</InputLabel>
              <Select
                value={courseForm.type}
                label="Course Type"
                onChange={(e) => setCourseForm({ ...courseForm, type: e.target.value as any })}
              >
                <MenuItem value="JAPAN_IN_CONTEXT">Japan in Context</MenuItem>
                <MenuItem value="JLPT_IN_CONTEXT">JLPT in Context</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Icon (Emoji)"
              value={courseForm.icon}
              onChange={(e) => setCourseForm({ ...courseForm, icon: e.target.value })}
              helperText="Enter an emoji to represent the course"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={courseForm.isActive}
                  onChange={(e) => setCourseForm({ ...courseForm, isActive: e.target.checked })}
                />
              }
              label="Active"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCourseDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveCourse}>
            Save Course
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};