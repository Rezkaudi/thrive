// frontend/src/components/classroom/Quiz.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Stack,
  LinearProgress,
  Chip,
  Alert,
  Paper,
  Fade,
  Zoom,
  IconButton,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Timer,
  Quiz as QuizIcon,
  NavigateNext,
  NavigateBefore,
  Flag,
  ArrowForward,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number | number[]; // Single or multiple correct answers
  type: 'single' | 'multiple';
  explanation?: string;
  points?: number;
}

interface QuizProps {
  questions: QuizQuestion[];
  passingScore?: number;
  timeLimit?: number; // in minutes
  onComplete: (score: number, passed: boolean, answers: any[]) => void;
  pointsReward: number;
  isLessonCompleted?: boolean;
}

const MotionCard = motion(Card);

export const Quiz: React.FC<QuizProps> = ({
  questions,
  passingScore = 70,
  timeLimit,
  onComplete,
  pointsReward = 0,
  isLessonCompleted = false,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<any[]>(
    questions.map(() => null)
  );
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(
    timeLimit ? timeLimit * 60 : null
  );
  const [showExplanation, setShowExplanation] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [hasCompletedLesson, setHasCompletedLesson] = useState(false); // NEW STATE

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  useEffect(() => {
    if (timeRemaining && timeRemaining > 0 && !showResults) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0) {
      handleSubmit();
    }
  }, [timeRemaining, showResults]);

  const handleSingleAnswer = (value: string) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = parseInt(value);
    setSelectedAnswers(newAnswers);
  };

  const handleMultipleAnswer = (index: number, checked: boolean) => {
    const current = selectedAnswers[currentQuestion] || [];
    const newAnswers = [...selectedAnswers];
    
    if (checked) {
      newAnswers[currentQuestion] = [...current, index];
    } else {
      newAnswers[currentQuestion] = current.filter((i: number) => i !== index);
    }
    
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowExplanation(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setShowExplanation(false);
    }
  };

  const handleFlagQuestion = () => {
    const newFlags = new Set(flaggedQuestions);
    if (newFlags.has(currentQuestion)) {
      newFlags.delete(currentQuestion);
    } else {
      newFlags.add(currentQuestion);
    }
    setFlaggedQuestions(newFlags);
  };

  const calculateScore = () => {
    let totalScore = 0;
    let totalPoints = 0;

    questions.forEach((q, index) => {
      const answer = selectedAnswers[index];
      const points = q.points || 1;
      totalPoints += points;

      if (q.type === 'single') {
        if (answer === q.correctAnswer) {
          totalScore += points;
        }
      } else {
        // Multiple choice
        const correct = Array.isArray(q.correctAnswer) ? q.correctAnswer : [q.correctAnswer];
        const selected = answer || [];
        
        if (correct.length === selected.length && 
            correct.every((c: number) => selected.includes(c))) {
          totalScore += points;
        }
      }
    });

    return Math.round((totalScore / totalPoints) * 100);
  };

  const handleSubmit = () => {
    const finalScore = calculateScore();
    setScore(finalScore);
    setShowResults(true);

    const passed = finalScore >= passingScore;
    
    if (passed) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    // Don't call onComplete immediately - let user review results first
    // onComplete will be called when user clicks "Continue" button
  };

  // NEW FUNCTION: Handle continuing to next lesson
  const handleContinueToNextLesson = () => {
    const passed = score >= passingScore;
    setHasCompletedLesson(true);
    
    // Now call onComplete to trigger lesson completion and move to next lesson
    onComplete(score, passed, selectedAnswers);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers(questions.map(() => null));
    setShowResults(false);
    setScore(0);
    setTimeRemaining(timeLimit ? timeLimit * 60 : null);
    setShowExplanation(false);
    setFlaggedQuestions(new Set());
    setHasCompletedLesson(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (showResults) {
    const passed = score >= passingScore;
    
    return (
      <Zoom in>
        <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 5 }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
              >
                {passed ? (
                  <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                ) : (
                  <Cancel sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
                )}
              </motion.div>
              
              <Typography variant="h3" fontWeight={700} gutterBottom>
                {passed ? 'Congratulations!' : 'Keep Practicing!'}
              </Typography>
              
              <Typography variant="h4" sx={{ mb: 3 }}>
                Your Score: <strong>{score}%</strong>
              </Typography>
              
              {passed ? (
                <Alert severity="success" sx={{ mb: 3 }}>
                  You passed! You've earned {pointsReward} points.
                </Alert>
              ) : (
                <Alert severity="info" sx={{ mb: 3 }}>
                  You need {passingScore}% to pass. Try again!
                </Alert>
              )}

              <Stack spacing={2}>
                <Typography variant="h6" gutterBottom>
                  Review Your Answers
                </Typography>
                {questions.map((q, index) => {
                  const answer = selectedAnswers[index];
                  const isCorrect = q.type === 'single' 
                    ? answer === q.correctAnswer
                    : Array.isArray(q.correctAnswer) &&
                      answer && answer.length === q.correctAnswer.length &&
                      q.correctAnswer.every((c: number) => answer.includes(c));

                  return (
                    <Paper key={q.id} sx={{ p: 2, textAlign: 'left' }}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        {isCorrect ? (
                          <CheckCircle color="success" />
                        ) : (
                          <Cancel color="error" />
                        )}
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="body2" fontWeight={600}>
                            Question {index + 1}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {q.question}
                          </Typography>
                          {/* Show correct answer for wrong answers */}
                          {!isCorrect && (
                            <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 1 }}>
                              Correct answer: {
                                Array.isArray(q.correctAnswer) 
                                  ? q.correctAnswer.map(i => q.options[i]).join(', ')
                                  : q.options[q.correctAnswer as number]
                              }
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>

              {/* ACTION BUTTONS */}
              <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4 }}>
                {!passed && !isLessonCompleted && (
                  <Button
                    variant="outlined"
                    onClick={resetQuiz}
                    size="large"
                  >
                    Try Again
                  </Button>
                )}
                
                {passed && !hasCompletedLesson && (
                  <Button
                    variant="contained"
                    onClick={handleContinueToNextLesson}
                    endIcon={<ArrowForward />}
                    size="large"
                  >
                    Continue to Next Lesson
                  </Button>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Zoom>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" fontWeight={600}>
            <QuizIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Quiz
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            {timeRemaining !== null && (
              <Chip
                icon={<Timer />}
                label={formatTime(timeRemaining)}
                color={timeRemaining < 60 ? 'error' : 'default'}
                sx={timeRemaining < 60 ? {color: "white"} : null}
              />
            )}
            <Chip
              label={`${currentQuestion + 1} / ${questions.length}`}
              color="primary"
              sx={{color: "white"}}
            />
          </Stack>
        </Stack>

        <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 1 }} />

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <MotionCard
            key={currentQuestion}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={3}>
                <Stack direction="row" justifyContent="space-between" alignItems="start">
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {question.question}
                    </Typography>
                    {question.type === 'multiple' && (
                      <Typography variant="caption" color="text.secondary">
                        Select all that apply
                      </Typography>
                    )}
                  </Box>
                  {/* <IconButton
                    onClick={handleFlagQuestion}
                    color={flaggedQuestions.has(currentQuestion) ? 'warning' : 'default'}
                  >
                    <Flag />
                  </IconButton> */}
                </Stack>

                {question.type === 'single' ? (
                  <RadioGroup
                    value={selectedAnswers[currentQuestion] ?? ''}
                    onChange={(e) => handleSingleAnswer(e.target.value)}
                  >
                    {question.options.map((option, index) => (
                      <FormControlLabel
                        key={index}
                        value={index}
                        control={<Radio />}
                        label={option}
                        sx={{
                          mb: 1,
                          p: 1,
                          borderRadius: 1,
                          '&:hover': { bgcolor: 'action.hover' },
                        }}
                      />
                    ))}
                  </RadioGroup>
                ) : (
                  <Stack spacing={1}>
                    {question.options.map((option, index) => (
                      <FormControlLabel
                        key={index}
                        control={
                          <Checkbox
                            checked={selectedAnswers[currentQuestion]?.includes(index) || false}
                            onChange={(e) => handleMultipleAnswer(index, e.target.checked)}
                          />
                        }
                        label={option}
                        sx={{
                          mb: 1,
                          p: 1,
                          borderRadius: 1,
                          '&:hover': { bgcolor: 'action.hover' },
                        }}
                      />
                    ))}
                  </Stack>
                )}

                {showExplanation && question.explanation && (
                  <Fade in>
                    <Alert severity="info">
                      <Typography variant="body2">{question.explanation}</Typography>
                    </Alert>
                  </Fade>
                )}
              </Stack>
            </CardContent>
          </MotionCard>
        </AnimatePresence>

        {/* Navigation */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Button
            startIcon={<NavigateBefore />}
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>

          <Stack direction="row" spacing={1}>
            {questions.map((_, index) => (
              <Box
                key={index}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: index === currentQuestion
                    ? 'primary.main'
                    : selectedAnswers[index] !== null
                    ? 'success.main'
                    : flaggedQuestions.has(index)
                    ? 'warning.main'
                    : 'grey.300',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }}
                onClick={() => setCurrentQuestion(index)}
              />
            ))}
          </Stack>

          {currentQuestion === questions.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={selectedAnswers.some(a => a === null)}
              color="success"
              sx={{color: "white"}}
            >
              Submit Quiz
            </Button>
          ) : (
            <Button
              endIcon={<NavigateNext />}
              onClick={handleNext}
              variant="contained"
              sx={{color: "white"}}
            >
              Next
            </Button>
          )}
        </Stack>
      </Stack>
    </Box>
  );
};