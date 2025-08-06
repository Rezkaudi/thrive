// components/slides/PronunciationSlide.tsx
import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Paper,
  Alert,
  CircularProgress,
} from '@mui/material';
import { PlayArrow, Stop, Mic, VolumeUp } from '@mui/icons-material';
import confetti from 'canvas-confetti';
import { SlideComponentProps } from '../../types/slides';

export const PronunciationSlide: React.FC<SlideComponentProps> = ({
  slide,
  setSlideProgress,
  currentSlide,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const content = slide.content.content;

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const playAudio = (url: string) => {
    if (currentAudio) {
      currentAudio.pause();
    }
    const audio = new Audio(url);
    setCurrentAudio(audio);
    audio.play();
  };

  const handleMarkComplete = () => {
    setSlideProgress(prev => new Set(prev).add(currentSlide));
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  return (
    <Box sx={{ padding: 4, maxWidth: '800px', margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom fontWeight={600} textAlign="center" sx={{ mb: 3 }}>
        {slide.content.title}
      </Typography>

      <Typography variant="body1" sx={{ textAlign: 'center', mb: 4, color: 'text.secondary', fontSize: '1.1rem' }}>
        {content.instruction}
      </Typography>

      <Stack spacing={4}>
        {content.items?.map((item: any, index: number) => (
          <Paper key={item.id} sx={{ p: 4, borderRadius: 3, bgcolor: 'background.paper' }}>
            <Typography variant="h5" fontWeight={600} textAlign="center" gutterBottom sx={{ mb: 3 }}>
              {item.text}
            </Typography>

            <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 3, fontSize: '1.1rem' }}>
              Pronunciation: <strong>{item.pronunciation}</strong>
            </Typography>

            <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" sx={{ mb: 3 }}>
              {item.audioUrl && (
                <Button
                  variant="outlined"
                  startIcon={<VolumeUp />}
                  onClick={() => playAudio(item.audioUrl)}
                  sx={{ borderRadius: 3, px: 3 }}
                >
                  Listen to Reference
                </Button>
              )}

              <Button
                variant={isRecording ? "contained" : "outlined"}
                color={isRecording ? "error" : "primary"}
                startIcon={isRecording ? <Stop /> : <Mic />}
                onClick={isRecording ? stopRecording : startRecording}
                sx={{ borderRadius: 3, px: 3 }}
              >
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </Button>

              {audioUrl && (
                <Button
                  variant="outlined"
                  startIcon={<PlayArrow />}
                  onClick={() => playAudio(audioUrl)}
                  sx={{ borderRadius: 3, px: 3 }}
                >
                  Play My Recording
                </Button>
              )}
            </Stack>

            {isRecording && (
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <CircularProgress size={24} />
                <Typography variant="body2" color="error.main" sx={{ mt: 1 }}>
                  Recording... Speak clearly into your microphone
                </Typography>
              </Box>
            )}

            {audioUrl && (
              <Alert severity="success" sx={{ borderRadius: 2 }}>
                Great! Your pronunciation has been recorded. Compare it with the reference audio.
              </Alert>
            )}
          </Paper>
        )) || []}
      </Stack>

      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleMarkComplete}
          disabled={!audioUrl}
          sx={{
            px: 6,
            py: 2,
            fontSize: '1.1rem',
            borderRadius: 3,
            background: 'linear-gradient(45deg, #1976D2 30%, #42A5F5 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #1565C0 30%, #2196F3 90%)',
            }
          }}
        >
          Complete Pronunciation Practice
        </Button>
      </Box>
    </Box>
  );
};