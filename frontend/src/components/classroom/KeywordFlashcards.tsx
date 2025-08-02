import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Stack,
  Button,
  LinearProgress,
  Chip,
  Zoom,
  Paper,
} from '@mui/material';
import {
  VolumeUp,
  ArrowBack,
  ArrowForward,
  PlayArrow,
  Pause,
  Replay,
  CheckCircle,
  Language,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

interface Keyword {
  id: string;
  englishText: string;
  japaneseText: string;
  englishAudioUrl?: string;
  japaneseAudioUrl?: string;
}

interface KeywordFlashcardsProps {
  keywords: Keyword[];
  onComplete?: () => void;
  pointsReward?: number;
  isLessonCompleted?: boolean;
}

const MotionBox = motion(Box);

export const KeywordFlashcards: React.FC<KeywordFlashcardsProps> = ({
  keywords,
  onComplete,
  pointsReward = 0,
  isLessonCompleted = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedCards, setCompletedCards] = useState<Set<number>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentKeyword = keywords[currentIndex];
  const progress = ((currentIndex + 1) / keywords.length) * 100;
  const isOnLastCard = currentIndex === keywords.length - 1;
  const isAllFlipped = completedCards.size === keywords.length;

  useEffect(() => {
    setIsFlipped(false);
  }, [currentIndex]);

  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause();
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, []);

  const playAudio = (url?: string) => {
    if (!url) return;
    audioRef.current?.pause();
    audioRef.current = new Audio(url);
    audioRef.current.play().catch(console.error);
  };

  const markCardFlipped = () => {
    setCompletedCards((prev) => new Set(prev).add(currentIndex));
  };

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
    markCardFlipped();
  };

  const handleNext = () => {
    if (currentIndex < keywords.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  const handleComplete = () => {
    markCardFlipped(); // just in case the user didn’t flip it yet
    onComplete?.();
  };

  const handlePlayAll = () => {
    if (isPlaying) {
      clearInterval(playIntervalRef.current!);
      return setIsPlaying(false);
    }

    setIsPlaying(true);
    setCurrentIndex(0);
    setIsFlipped(false);
    let idx = 0;

    playIntervalRef.current = setInterval(() => {
      if (idx >= keywords.length) {
        clearInterval(playIntervalRef.current!);
        return setIsPlaying(false);
      }
      setCurrentIndex(idx);
      playAudio(keywords[idx].japaneseAudioUrl);

      setTimeout(() => {
        setIsFlipped(true);
        playAudio(keywords[idx].englishAudioUrl);
      }, 2000);

      setTimeout(() => {
        setIsFlipped(false);
        idx++;
      }, 4000);
    }, 4500);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setCompletedCards(new Set());
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={600}>Keyword Practice</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip label={`${currentIndex + 1} / ${keywords.length}`} size="small" />
          {pointsReward > 0 && (
            <Chip
              icon={<CheckCircle />}
              label={`${pointsReward} points`}
              color="primary"
              size="small"
            />
          )}
        </Stack>
      </Stack>

      <LinearProgress variant="determinate" value={progress} sx={{ mb: 3, height: 8, borderRadius: 1 }} />

      <Stack direction="row" spacing={2} justifyContent="center" mb={3}>
        <Button variant="outlined" startIcon={isPlaying ? <Pause /> : <PlayArrow />} onClick={handlePlayAll}>
          {isPlaying ? 'Pause' : 'Play All'}
        </Button>
        {isAllFlipped && (
          <Button variant="outlined" startIcon={<Replay />} onClick={handleRestart}>
            Restart
          </Button>
        )}
        {isOnLastCard && (
          <Button
            variant="contained"
            startIcon={<CheckCircle />}
            onClick={handleComplete}
            color="success"
            disabled={isLessonCompleted}
          >
            {isLessonCompleted ? 'Completed' : 'Mark as Complete'}
          </Button>
        )}
      </Stack>

      {/* Flashcard */}
      <Box sx={{ perspective: 1000, mb: 4 }}>
        <MotionBox
          onClick={handleFlip}
          sx={{
            position: 'relative',
            height: 300,
            transformStyle: 'preserve-3d',
            cursor: 'pointer',
          }}
          initial={{ rotateY: 0 }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Front - Japanese */}
          <Box
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #5C633A 0%, #D4BC8C 100%)',
              color: 'white',
              zIndex: isFlipped ? 0 : 1,
              borderRadius: 1,
            }}
          >
            <Stack spacing={2} alignItems="center">
              <Chip icon={<Language />} label="Japanese" />
              <Typography variant="h2" fontWeight={700} textAlign="center">
                {currentKeyword.japaneseText}
              </Typography>
              <IconButton onClick={(e) => { e.stopPropagation(); playAudio(currentKeyword.japaneseAudioUrl); }}>
                <VolumeUp />
              </IconButton>
            </Stack>
          </Box>

          {/* Back - English */}
          <Box
            sx={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #A6531C 0%, #7ED4D0 100%)',
              color: 'white',
              zIndex: isFlipped ? 1 : 0,
              borderRadius: 1,
            }}
          >
            <Stack spacing={2} alignItems="center">
              <Chip icon={<Language />} label="English" />
              <Typography variant="h2" fontWeight={700} textAlign="center">
                {currentKeyword.englishText}
              </Typography>
              <IconButton onClick={(e) => { e.stopPropagation(); playAudio(currentKeyword.englishAudioUrl); }}>
                <VolumeUp />
              </IconButton>
            </Stack>
            {completedCards.has(currentIndex) && (
              <CheckCircle sx={{ position: 'absolute', top: 16, right: 16, fontSize: 32 }} />
            )}
          </Box>
        </MotionBox>
      </Box>

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <IconButton onClick={handlePrevious} disabled={currentIndex === 0}>
          <ArrowBack />
        </IconButton>
        <Stack direction="row" spacing={1}>
          {keywords.map((_, i) => (
            <Box
              key={i}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: completedCards.has(i)
                  ? 'success.main'
                  : i === currentIndex
                    ? 'primary.main'
                    : 'grey.300',
              }}
              onClick={() => setCurrentIndex(i)}
            />
          ))}
        </Stack>
        <IconButton onClick={handleNext} disabled={isOnLastCard}>
          <ArrowForward />
        </IconButton>
      </Stack>

      {isAllFlipped && (
        <Zoom in>
          <Paper sx={{ p: 3, mt: 3, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
            <Typography variant="h6" fontWeight={600}>
              Great job! You've completed all keywords!
            </Typography>
            {pointsReward > 0 && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                You've earned {pointsReward} points!
              </Typography>
            )}
          </Paper>
        </Zoom>
      )}
    </Box>
  );
};