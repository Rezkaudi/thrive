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
  Alert
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

interface DraggableWordProps {
  word: string;
  index: number;
  onRemove: (index: number) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetIndex: number) => void;
  canDelete: boolean;
}

const DraggableWord: React.FC<DraggableWordProps> = ({
  word,
  index,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
  canDelete
}) => (
  <Paper
    elevation={1}
    draggable
    onDragStart={(e) => onDragStart(e, index)}
    onDragOver={onDragOver}
    onDrop={(e) => onDrop(e, index)}
    sx={{
      p: 1.5,
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      cursor: 'grab',
      minHeight: 48,
      backgroundColor: 'grey.50',
      border: '1px solid',
      borderColor: 'grey.300',
      borderRadius: 2,
      '&:hover': {
        backgroundColor: 'grey.100',
        borderColor: 'primary.main'
      },
      '&:active': {
        cursor: 'grabbing'
      }
    }}
  >
    <DragIndicator sx={{ color: 'grey.500', fontSize: 20 }} />
    <Typography variant="body2" sx={{ flex: 1, fontWeight: 500 }}>
      {word}
    </Typography>
    <IconButton
      size="small"
      onClick={() => onRemove(index)}
      disabled={!canDelete}
      sx={{ 
        color: canDelete ? 'grey.500' : 'grey.300',
        '&:disabled': {
          color: 'grey.300'
        }
      }}
    >
      <CloseIcon fontSize="small" />
    </IconButton>
  </Paper>
);

export const SentenceBuilderEditor: React.FC<SentenceBuilderEditorProps> = ({ 
  item, 
  onUpdate 
}) => {
  const [newWord, setNewWord] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const words = Array.isArray(item.words) ? item.words : [];
  const correctOrder = Array.isArray(item.correctOrder) ? item.correctOrder : [];

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

  const handleAddWord = () => {
    if (newWord.trim()) {
      const trimmedWord = newWord.trim();
      // Check if word already exists
      if (words.includes(trimmedWord)) {
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

  const handleRemoveWord = (indexToRemove: number) => {
    // Don't remove if it would result in empty array or less than 2 words
    if (words.length <= 2) {
      return;
    }
    
    const updatedWords = words.filter((_, i) => i !== indexToRemove);
    const updatedOrder = correctOrder
      .filter(orderIndex => orderIndex !== indexToRemove)
      .map(orderIndex => orderIndex > indexToRemove ? orderIndex - 1 : orderIndex);
    
    onUpdate({ 
      words: updatedWords,
      correctOrder: updatedOrder
    });
  };

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

  const canDeleteWord = words.length > 2; // Minimum 2 words required

  return (
    <Stack spacing={3}>
      {/* Header Info */}
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Single Sentence Mode:</strong> Build one sentence with drag-and-drop word ordering. 
          Minimum 2 words required.
        </Typography>
      </Alert>

      {/* Add Words Section */}
      <Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
          Word Blocks ({words.length} words)
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            fullWidth
            size="small"
            label="Add new word"
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddWord()}
            placeholder="e.g., 私, です, 学生"
            sx={{ maxWidth: 300 }}
            helperText={words.includes(newWord.trim()) && newWord.trim() ? "Word already exists" : ""}
            error={words.includes(newWord.trim()) && newWord.trim() !== ""}
          />
          <IconButton 
            onClick={handleAddWord}
            disabled={!newWord.trim() || words.includes(newWord.trim())}
            color="primary"
            sx={{ 
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': { bgcolor: 'primary.dark' },
              '&:disabled': { bgcolor: 'grey.300', color: 'grey.500' }
            }}
          >
            <AddIcon />
          </IconButton>
        </Stack>
      </Box>

      <Divider />

      {/* Drag to Reorder Section */}
      <Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
          Correct Sentence Order
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Drag and drop to arrange words in the correct sentence order. 
          {!canDeleteWord && (
            <Typography component="span" color="warning.main" sx={{ fontWeight: 500 }}>
              {" "}(Minimum 2 words required - add more words to enable deletion)
            </Typography>
          )}
        </Typography>
        
        {correctOrder.length > 0 ? (
          <Stack spacing={1}>
            {correctOrder.map((wordIndex, orderIndex) => (
              <DraggableWord
                key={`${wordIndex}-${orderIndex}`}
                word={words[wordIndex] || `Word ${wordIndex}`}
                index={orderIndex}
                onRemove={() => handleRemoveWord(wordIndex)}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                canDelete={canDeleteWord}
              />
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
              Add words above to start building your sentence
            </Typography>
          </Paper>
        )}
      </Box>

      <Divider />

      {/* Translation Section */}
      <Box>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
          Translation
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

      {/* Preview Section */}
      {getOrderedWords().length > 0 && (
        <>
          <Divider />
          <Box>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
              Sentence Preview
            </Typography>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                backgroundColor: 'success.50',
                border: '1px solid',
                borderColor: 'success.200',
                borderRadius: 2
              }}
            >
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
                {getOrderedWords().map((word, i) => (
                  <Chip
                    key={i}
                    label={`${i + 1}. ${word}`}
                    color="success"
                    variant="filled"
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.875rem'
                    }}
                  />
                ))}
              </Stack>
              
              {/* Sentence Display */}
              <Box sx={{ mb: 2, p: 1.5, bgcolor: 'white', borderRadius: 1, border: '1px solid', borderColor: 'success.300' }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 600,
                    color: 'success.dark',
                    textAlign: 'center'
                  }}
                >
                  "{getOrderedWords().join(' ')}"
                </Typography>
              </Box>

              {item.translation && (
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    fontStyle: 'italic',
                    borderTop: '1px solid',
                    borderColor: 'success.200',
                    pt: 1,
                    textAlign: 'center'
                  }}
                >
                  Translation: "{item.translation}"
                </Typography>
              )}
            </Paper>
          </Box>
        </>
      )}

      {/* Validation Warnings */}
      {words.length < 2 && (
        <Alert severity="warning">
          <Typography variant="body2">
            <strong>Warning:</strong> Add at least 2 words to create a meaningful sentence.
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
    </Stack>
  );
};