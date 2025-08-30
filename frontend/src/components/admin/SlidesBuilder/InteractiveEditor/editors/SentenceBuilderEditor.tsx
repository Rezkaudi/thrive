// Enhanced SentenceBuilderEditor component
import React, { useState, useEffect } from 'react';
import {
  Stack,
  TextField,
  Box,
  Typography,
  Chip,
  Paper,
  IconButton,
  Divider,
  Alert,
} from '@mui/material';
import {
  DragIndicator,
  Add as AddIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { SentenceBuilderItem } from '../../../../../types/interactive-items.types';

interface SentenceBuilderEditorProps {
  item: SentenceBuilderItem;
  onUpdate: (updates: Partial<SentenceBuilderItem>) => void;
}

export const SentenceBuilderEditor: React.FC<SentenceBuilderEditorProps> = ({
  item,
  onUpdate
}) => {
  const [newWord, setNewWord] = useState('');
  const [newDistractor, setNewDistractor] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const words = Array.isArray(item.words) ? item.words : [];
  const correctOrder = Array.isArray(item.correctOrder) ? item.correctOrder : [];
  const distractors = Array.isArray(item.distractors) ? item.distractors : [];

  // Clean up any existing empty words on component mount
  useEffect(() => {
    const hasEmptyWords = words.some(word => !word || word.trim() === '');
    if (hasEmptyWords) {
      const cleanWords = words.filter(word => word && word.trim() !== '');
      const cleanOrder = correctOrder
        .map(orderIndex => {
          const word = words[orderIndex];
          return word && word.trim() !== '' ? cleanWords.indexOf(word) : -1;
        })
        .filter(index => index >= 0);

      onUpdate({
        words: cleanWords,
        correctOrder: cleanOrder
      });
    }
  }, []);

  // Handle adding words to the correct sentence
  const handleAddWord = () => {
    if (newWord.trim()) {
      const trimmedWord = newWord.trim();
      if (words.includes(trimmedWord) || distractors.includes(trimmedWord)) {
        return; // Don't add duplicate words
      }

      const updatedWords = [...words, trimmedWord];
      const newIndex = words.length;
      const updatedOrder = [...correctOrder, newIndex];

      onUpdate({
        words: updatedWords,
        correctOrder: updatedOrder
      });
      setNewWord('');
    }
  };

  // Handle adding distractor words
  const handleAddDistractor = () => {
    if (newDistractor.trim()) {
      const trimmedWord = newDistractor.trim();
      if (words.includes(trimmedWord) || distractors.includes(trimmedWord)) {
        return; // Don't add duplicate words
      }

      const updatedDistractors = [...distractors, trimmedWord];
      onUpdate({ distractors: updatedDistractors });
      setNewDistractor('');
    }
  };

  // Handle removing distractor words
  const handleRemoveDistractor = (indexToRemove: number) => {
    const updatedDistractors = distractors.filter((_, i) => i !== indexToRemove);
    onUpdate({ distractors: updatedDistractors });
  };

  const handleRemoveWord = (indexToRemove: number) => {
    if (words.length <= 0) return;

    const updatedWords = words.filter((_, i) => i !== indexToRemove);
    const updatedOrder = correctOrder
      .filter(orderIndex => orderIndex !== indexToRemove)
      .map(orderIndex => orderIndex > indexToRemove ? orderIndex - 1 : orderIndex);

    onUpdate({
      words: updatedWords,
      correctOrder: updatedOrder
    });
  };

  // Drag and drop handlers (existing code)
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const newOrder = [...correctOrder];
    const draggedItem = newOrder[draggedIndex];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedItem);

    onUpdate({ correctOrder: newOrder });
    setDraggedIndex(null);
  };

  const getOrderedWords = () => {
    return correctOrder.map(wordIndex => words[wordIndex]).filter(Boolean);
  };

  const canDeleteWord = words.length > 0;
  const totalWords = words.length + distractors.length;

  return (
    <Stack spacing={3}>
      {/* Header Info */}
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Enhanced Sentence Builder:</strong> Students will choose the correct words AND arrange them in the right order.
          Add distractors to make it more challenging!
        </Typography>
      </Alert>

      {/* Add Correct Words Section */}
      <Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'success.dark' }}>
          ✅ Correct Words ({words.length} words)
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          These words will be part of the correct sentence.
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            fullWidth
            size="small"
            label="Add correct word"
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddWord()}
            placeholder="e.g., 私, です, 学生"
            sx={{ maxWidth: 300 }}
            helperText={
              (words.includes(newWord.trim()) || distractors.includes(newWord.trim())) && newWord.trim()
                ? "Word already exists"
                : ""
            }
            error={(words.includes(newWord.trim()) || distractors.includes(newWord.trim())) && newWord.trim() !== ""}
          />
          <IconButton
            onClick={handleAddWord}
            disabled={!newWord.trim() || words.includes(newWord.trim()) || distractors.includes(newWord.trim())}
            color="success"
            sx={{
              bgcolor: 'success.main',
              color: 'white',
              '&:hover': { bgcolor: 'success.dark' },
              '&:disabled': { bgcolor: 'grey.300', color: 'grey.500' }
            }}
          >
            <AddIcon />
          </IconButton>
        </Stack>
      </Box>

      <Divider />

      {/* Correct Sentence Order */}
      <Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'success.dark' }}>
          📝 Correct Sentence Order
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Drag and drop to arrange words in the correct sentence order.
        </Typography>

        {correctOrder.length > 0 ? (
          <Stack spacing={1}>
            {correctOrder.map((wordIndex, orderIndex) => (
              <Paper
                key={`${wordIndex}-${orderIndex}`}
                elevation={1}
                draggable
                onDragStart={(e) => handleDragStart(e, orderIndex)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, orderIndex)}
                sx={{
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  cursor: 'grab',
                  minHeight: 48,
                  backgroundColor: 'success.50',
                  border: '1px solid',
                  borderColor: 'success.200',
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: 'success.100',
                    borderColor: 'success.main'
                  },
                  '&:active': {
                    cursor: 'grabbing'
                  }
                }}
              >
                <DragIndicator sx={{ color: 'success.main', fontSize: 20 }} />
                <Typography variant="body2" sx={{ flex: 1, fontWeight: 500 }}>
                  {orderIndex + 1}. {words[wordIndex] || `Word ${wordIndex}`}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => handleRemoveWord(wordIndex)}
                  disabled={!canDeleteWord}
                  sx={{
                    color: canDeleteWord ? 'error.main' : 'grey.300',
                    '&:disabled': {
                      color: 'grey.300'
                    }
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Paper>
            ))}
          </Stack>
        ) : (
          <Paper
            sx={{
              p: 3,
              textAlign: 'center',
              backgroundColor: 'grey.50',
              border: '2px dashed',
              borderColor: 'grey.300',
              borderRadius: 2
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Add correct words above to start building your sentence
            </Typography>
          </Paper>
        )}
      </Box>

      <Divider />

      {/* Add Distractor Words Section */}
      <Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'error.dark' }}>
          ❌ Distractor Words ({distractors.length} words)
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          These are incorrect words that will appear as options but should NOT be used in the sentence.
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            label="Add distractor word"
            value={newDistractor}
            onChange={(e) => setNewDistractor(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddDistractor()}
            placeholder="e.g., 猫, 食べます, 本"
            sx={{ maxWidth: 300 }}
            helperText={
              (words.includes(newDistractor.trim()) || distractors.includes(newDistractor.trim())) && newDistractor.trim()
                ? "Word already exists"
                : ""
            }
            error={(words.includes(newDistractor.trim()) || distractors.includes(newDistractor.trim())) && newDistractor.trim() !== ""}
          />
          <IconButton
            onClick={handleAddDistractor}
            disabled={!newDistractor.trim() || words.includes(newDistractor.trim()) || distractors.includes(newDistractor.trim())}
            color="error"
            sx={{
              bgcolor: 'error.main',
              color: 'white',
              '&:hover': { bgcolor: 'error.dark' },
              '&:disabled': { bgcolor: 'grey.300', color: 'grey.500' }
            }}
          >
            <AddIcon />
          </IconButton>
        </Stack>

        {/* Display Distractor Words */}
        {distractors.length > 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              p: 2,
              backgroundColor: 'error.50',
              border: '1px solid',
              borderColor: 'error.200',
              borderRadius: 2,
            }}
          >
            {distractors.map((word, index) => (
              <Chip
                key={`distractor-${index}`}
                label={word}
                onDelete={() => handleRemoveDistractor(index)}
                color="error"
                variant="outlined"
                sx={{
                  fontWeight: 500,
                  '& .MuiChip-deleteIcon': {
                    color: 'error.main'
                  }
                }}
              />
            ))}
          </Box>
        ) : (
          <Paper
            sx={{
              p: 3,
              textAlign: 'center',
              backgroundColor: 'error.50',
              border: '2px dashed',
              borderColor: 'error.200',
              borderRadius: 2
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Add distractor words to make the exercise more challenging
            </Typography>
          </Paper>
        )}
      </Box>

      <Divider />

      {/* Translation Section */}
      <Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
          🌐 Translation
        </Typography>
        <TextField
          fullWidth
          size="small"
          label="English translation"
          value={item.translation || ''}
          onChange={(e) => onUpdate({ translation: e.target.value })}
          placeholder="e.g., I am a student"
          helperText="Provide the English translation of the correct sentence"
        />
      </Box>

      {/* Enhanced Preview Section */}
      {(getOrderedWords().length > 0 || distractors.length > 0) && (
        <>
          <Divider />
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
              👀 Student View Preview
            </Typography>

            {/* Correct Sentence */}
            {getOrderedWords().length > 0 && (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  mb: 2,
                  backgroundColor: 'success.50',
                  border: '1px solid',
                  borderColor: 'success.200',
                  borderRadius: 2
                }}
              >
                <Typography variant="subtitle2" gutterBottom sx={{ color: 'success.dark', fontWeight: 600 }}>
                  ✅ Correct Answer (hidden from students):
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
                  {getOrderedWords().map((word, i) => (
                    <Chip
                      key={i}
                      label={`${i + 1}. ${word}`}
                      color="success"
                      variant="filled"
                      sx={{ fontWeight: 600, fontSize: '0.875rem' }}
                    />
                  ))}
                </Stack>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 600,
                    color: 'success.dark',
                    textAlign: 'center',
                    p: 1,
                    bgcolor: 'white',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'success.300'
                  }}
                >
                  "{getOrderedWords().join(' ')}"
                </Typography>
                {item.translation && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontStyle: 'italic',
                      borderTop: '1px solid',
                      borderColor: 'success.200',
                      pt: 1,
                      mt: 1,
                      textAlign: 'center'
                    }}
                  >
                    Translation: "{item.translation}"
                  </Typography>
                )}
              </Paper>
            )}

            {/* All Available Words (shuffled simulation) */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                backgroundColor: 'primary.50',
                border: '1px solid',
                borderColor: 'primary.200',
                borderRadius: 2
              }}
            >
              <Typography variant="subtitle2" gutterBottom sx={{ color: 'primary.dark', fontWeight: 600 }}>
                🎲 Available Words (shuffled for students):
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {/* Combine and shuffle all words for preview */}
                {[...getOrderedWords(), ...distractors]
                  .sort(() => Math.random() - 0.5) // Simple shuffle for preview
                  .map((word, i) => {
                    const isCorrect = getOrderedWords().includes(word);
                    return (
                      <Chip
                        key={i}
                        label={word}
                        color={isCorrect ? "primary" : "default"}
                        variant={isCorrect ? "filled" : "outlined"}
                        sx={{
                          fontWeight: 500,
                          fontSize: '0.875rem',
                          backgroundColor: isCorrect ? 'primary.main' : 'grey.200',
                          color: isCorrect ? 'white' : 'text.secondary'
                        }}
                      />
                    );
                  })}
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Blue words are correct, grey words are distractors
              </Typography>
            </Paper>
          </Box>
        </>
      )}

      {/* Enhanced Statistics */}
      <Paper sx={{ p: 2, bgcolor: 'info.50', border: '1px solid', borderColor: 'info.200' }}>
        <Typography variant="subtitle2" gutterBottom sx={{ color: 'info.dark', fontWeight: 600 }}>
          📊 Exercise Statistics
        </Typography>
        <Stack direction="row" spacing={3} flexWrap="wrap">
          <Typography variant="body2" color="text.secondary">
            <strong>Correct words:</strong> {words.length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Distractors:</strong> {distractors.length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Total options:</strong> {totalWords}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Difficulty:</strong> {
              distractors.length === 0 ? 'Easy (order only)' :
                distractors.length < words.length ? 'Medium' :
                  distractors.length >= words.length ? 'Hard' : 'Custom'
            }
          </Typography>
        </Stack>
      </Paper>

      {/* Validation Warnings */}
      {words.length < 2 && (
        <Alert severity="warning">
          <Typography variant="body2">
            <strong>Warning:</strong> Add at least 2 correct words to create a meaningful sentence.
          </Typography>
        </Alert>
      )}

      {words.length > 0 && !item.translation && (
        <Alert severity="info">
          <Typography variant="body2">
            <strong>Tip:</strong> Add a translation to help students understand the sentence meaning.
          </Typography>
        </Alert>
      )}

      {distractors.length === 0 && words.length > 0 && (
        <Alert severity="info">
          <Typography variant="body2">
            <strong>Enhancement idea:</strong> Add some distractor words to make students choose the right words, not just arrange them!
          </Typography>
        </Alert>
      )}
    </Stack>
  );
};