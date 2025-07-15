// frontend/src/components/admin/QuizBuilder.tsx
import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Stack,
  Typography,
  Paper,
  IconButton,
  FormControlLabel,
  Switch,
  RadioGroup,
  Radio,
  Checkbox,
  FormGroup,
  Chip,
  Alert,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Add,
  Delete,
  DragIndicator,
  ContentCopy,
  RadioButtonChecked,
  CheckBox,
} from '@mui/icons-material';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number | number[];
  type: 'single' | 'multiple';
  explanation?: string;
  points?: number;
}

interface QuizBuilderProps {
  initialQuestions?: QuizQuestion[];
  passingScore?: number;
  timeLimit?: number;
  onChange: (questions: QuizQuestion[], settings: { passingScore: number; timeLimit?: number }) => void;
}

export const QuizBuilder: React.FC<QuizBuilderProps> = ({
  initialQuestions = [],
  passingScore = 70,
  timeLimit,
  onChange,
}) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>(
    initialQuestions.length > 0 ? initialQuestions : [{
      id: Date.now().toString(),
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      type: 'single',
      points: 1,
    }]
  );
  const [settings, setSettings] = useState({
    passingScore,
    timeLimit: timeLimit || undefined,
  });

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
    onChange(newQuestions, settings);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
    onChange(newQuestions, settings);
  };

  const addOption = (questionIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options.push('');
    setQuestions(newQuestions);
    onChange(newQuestions, settings);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options.splice(optionIndex, 1);
    
    // Adjust correct answer if needed
    const correctAnswer = newQuestions[questionIndex].correctAnswer;
    if (newQuestions[questionIndex].type === 'single') {
      if (correctAnswer === optionIndex) {
        newQuestions[questionIndex].correctAnswer = 0;
      } else if (typeof correctAnswer === 'number' && correctAnswer > optionIndex) {
        newQuestions[questionIndex].correctAnswer = correctAnswer - 1;
      }
    } else {
      // Multiple choice
      const correctAnswers = correctAnswer as number[];
      newQuestions[questionIndex].correctAnswer = correctAnswers
        .filter(ans => ans !== optionIndex)
        .map(ans => ans > optionIndex ? ans - 1 : ans);
    }
    
    setQuestions(newQuestions);
    onChange(newQuestions, settings);
  };

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: Date.now().toString(),
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      type: 'single',
      points: 1,
    };
    setQuestions([...questions, newQuestion]);
    onChange([...questions, newQuestion], settings);
  };

  const duplicateQuestion = (index: number) => {
    const questionToDuplicate = questions[index];
    const newQuestion: QuizQuestion = {
      ...questionToDuplicate,
      id: Date.now().toString(),
      question: questionToDuplicate.question + ' (Copy)',
    };
    const newQuestions = [...questions];
    newQuestions.splice(index + 1, 0, newQuestion);
    setQuestions(newQuestions);
    onChange(newQuestions, settings);
  };

  const removeQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    setQuestions(newQuestions);
    onChange(newQuestions, settings);
  };

  const updateSettings = (field: keyof typeof settings, value: any) => {
    const newSettings = { ...settings, [field]: value };
    setSettings(newSettings);
    onChange(questions, newSettings);
  };

  const toggleQuestionType = (index: number) => {
    const newQuestions = [...questions];
    const question = newQuestions[index];
    
    if (question.type === 'single') {
      question.type = 'multiple';
      question.correctAnswer = [question.correctAnswer as number];
    } else {
      question.type = 'single';
      question.correctAnswer = (question.correctAnswer as number[])[0] || 0;
    }
    
    setQuestions(newQuestions);
    onChange(newQuestions, settings);
  };

  const toggleCorrectAnswer = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...questions];
    const question = newQuestions[questionIndex];
    
    if (question.type === 'single') {
      question.correctAnswer = optionIndex;
    } else {
      const currentAnswers = question.correctAnswer as number[];
      if (currentAnswers.includes(optionIndex)) {
        question.correctAnswer = currentAnswers.filter(i => i !== optionIndex);
      } else {
        question.correctAnswer = [...currentAnswers, optionIndex];
      }
    }
    
    setQuestions(newQuestions);
    onChange(newQuestions, settings);
  };

  return (
    <Box>
      <Stack spacing={3}>
        {/* Settings */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Quiz Settings
          </Typography>
          <Stack direction="row" spacing={3}>
            <TextField
              type="number"
              label="Passing Score (%)"
              value={settings.passingScore}
              onChange={(e) => updateSettings('passingScore', parseInt(e.target.value))}
              inputProps={{ min: 0, max: 100 }}
              sx={{ width: 150 }}
            />
            <TextField
              type="number"
              label="Time Limit (minutes)"
              value={settings.timeLimit || ''}
              onChange={(e) => updateSettings('timeLimit', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="No limit"
              inputProps={{ min: 1 }}
              sx={{ width: 150 }}
            />
          </Stack>
        </Paper>

        {/* Questions */}
        {questions.map((question, qIndex) => (
          <Paper key={question.id} sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" alignItems="center" spacing={2}>
                  <IconButton size="small" sx={{ cursor: 'grab' }}>
                    <DragIndicator />
                  </IconButton>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Question {qIndex + 1}
                  </Typography>
                  <Chip
                    label={question.type === 'single' ? 'Single Choice' : 'Multiple Choice'}
                    size="small"
                    icon={question.type === 'single' ? <RadioButtonChecked /> : <CheckBox />}
                    onClick={() => toggleQuestionType(qIndex)}
                    sx={{ cursor: 'pointer' }}
                  />
                </Stack>
                <Stack direction="row" spacing={1}>
                  <IconButton onClick={() => duplicateQuestion(qIndex)} size="small">
                    <ContentCopy />
                  </IconButton>
                  <IconButton
                    onClick={() => removeQuestion(qIndex)}
                    size="small"
                    color="error"
                    disabled={questions.length === 1}
                  >
                    <Delete />
                  </IconButton>
                </Stack>
              </Stack>

              <TextField
                fullWidth
                label="Question"
                value={question.question}
                onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                multiline
                rows={2}
              />

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Options {question.type === 'multiple' && '(Select all correct answers)'}
                </Typography>
                <Stack spacing={2}>
                  {question.options.map((option, oIndex) => (
                    <Stack key={oIndex} direction="row" spacing={2} alignItems="center">
                      {question.type === 'single' ? (
                        <Radio
                          checked={question.correctAnswer === oIndex}
                          onChange={() => toggleCorrectAnswer(qIndex, oIndex)}
                        />
                      ) : (
                        <Checkbox
                          checked={(question.correctAnswer as number[]).includes(oIndex)}
                          onChange={() => toggleCorrectAnswer(qIndex, oIndex)}
                        />
                      )}
                      <TextField
                        fullWidth
                        label={`Option ${oIndex + 1}`}
                        value={option}
                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                        size="small"
                      />
                      <IconButton
                        onClick={() => removeOption(qIndex, oIndex)}
                        size="small"
                        disabled={question.options.length <= 2}
                      >
                        <Delete />
                      </IconButton>
                    </Stack>
                  ))}
                </Stack>
                <Button
                  startIcon={<Add />}
                  onClick={() => addOption(qIndex)}
                  size="small"
                  sx={{ mt: 1 }}
                >
                  Add Option
                </Button>
              </Box>

              <Stack direction="row" spacing={2}>
                <TextField
                  fullWidth
                  label="Explanation (shown after answer)"
                  value={question.explanation || ''}
                  onChange={(e) => updateQuestion(qIndex, 'explanation', e.target.value)}
                  multiline
                  rows={2}
                />
                <TextField
                  type="number"
                  label="Points"
                  value={question.points || 1}
                  onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value))}
                  inputProps={{ min: 1 }}
                  sx={{ width: 100 }}
                />
              </Stack>
            </Stack>
          </Paper>
        ))}

        <Button
          variant="outlined"
          startIcon={<Add />}
          onClick={addQuestion}
          fullWidth
        >
          Add Question
        </Button>

        {/* Summary */}
        <Alert severity="info">
          <Typography variant="subtitle2">
            Quiz Summary: {questions.length} questions, 
            {' '}{questions.reduce((sum, q) => sum + (q.points || 1), 0)} total points, 
            {' '}{settings.passingScore}% to pass
            {settings.timeLimit && `, ${settings.timeLimit} minute time limit`}
          </Typography>
        </Alert>
      </Stack>
    </Box>
  );
};