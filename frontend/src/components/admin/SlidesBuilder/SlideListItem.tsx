// frontend/src/components/admin/SlidesBuilder/SlideListItem.tsx
import React, { useRef } from 'react';
import {
  Paper,
  Typography,
  Stack,
  IconButton,
  Avatar,
  Chip,
  Tooltip,
  Box,
} from '@mui/material';
import {
  DragIndicator,
  ContentCopy,
  Delete,
  Error,
  TextFields,
  Image,
  VideoLibrary,
  Quiz,
  Code,
  Extension,
} from '@mui/icons-material';
import { Slide } from '../../../types/slide.types';

interface SlideListItemProps {
  slide: Slide;
  index: number;
  isActive: boolean;
  hasErrors: boolean;
  errorCount: number;
  onSelect: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
  canRemove: boolean;
  isDragging?: boolean;
  isDragOver?: boolean;
}

const getSlideIcon = (type: string) => {
  switch (type) {
    case 'text': return <TextFields />;
    case 'image': return <Image />;
    case 'video': return <VideoLibrary />;
    case 'quiz': return <Quiz />;
    case 'interactive': return <Extension />;
    case 'code': return <Code />;
    default: return <TextFields />;
  }
};

const getSlideTypeColor = (type: string) => {
  switch (type) {
    case 'text': return '#1976D2';
    case 'image': return '#388E3C';
    case 'video': return '#F57C00';
    case 'quiz': return '#7B1FA2';
    case 'interactive': return '#C2185B';
    case 'code': return '#5D4037';
    default: return '#757575';
  }
};

export const SlideListItem: React.FC<SlideListItemProps> = ({
  slide,
  index,
  isActive,
  hasErrors,
  errorCount,
  onSelect,
  onDuplicate,
  onRemove,
  canRemove,
  isDragging = false,
  isDragOver = false,
}) => {
  const dragHandleRef = useRef<HTMLDivElement>(null);
  const slideTypeColor = getSlideTypeColor(slide.content.type);

  return (
    <Paper
      sx={{
        p: 2,
        cursor: 'pointer',
        bgcolor: isActive ? 'primary.light' : 'background.paper',
        border: '2px solid',
        borderColor: hasErrors ? 'error.main' : isActive ? 'primary.main' : 'transparent',
        opacity: isDragging ? 0.5 : 1,
        transform: isDragOver ? 'translateY(2px)' : 'none',
        '&:hover': {
          bgcolor: isActive ? 'primary.light' : 'action.hover',
          borderColor: hasErrors ? 'error.main' : 'primary.main'
        },
        transition: 'all 0.2s ease'
      }}
      onClick={onSelect}
    >
      <Stack direction="row" alignItems="center" spacing={1} mb={1}>
        <Box
          ref={dragHandleRef}
          sx={{
            cursor: 'grab',
            display: 'flex',
            alignItems: 'center',
            color: slideTypeColor,
            '&:active': {
              cursor: 'grabbing'
            }
          }}
          onClick={(e) => e.stopPropagation()} // Prevent slide selection when dragging
        >
          <DragIndicator />
        </Box>
        <Avatar
          sx={{
            width: 24,
            height: 24,
            bgcolor: slideTypeColor,
            '& .MuiSvgIcon-root': { fontSize: 14 }
          }}
        >
          {getSlideIcon(slide.content.type)}
        </Avatar>
        <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: 500 }}>
          Slide {index + 1}
        </Typography>
        {hasErrors && (
          <Tooltip title={`${errorCount} error${errorCount > 1 ? 's' : ''}`}>
            <Error color="error" fontSize="small" />
          </Tooltip>
        )}
      </Stack>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
        {/* {slide.content.title || ''} */}
      </Typography>

      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Chip
          label={slide.content.type}
          size="small"
          sx={{
            bgcolor: slideTypeColor + '20',
            color: slideTypeColor,
            fontWeight: 600,
            fontSize: '0.65rem'
          }}
        />
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Duplicate Slide">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
            >
              <ContentCopy sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Slide">
            <IconButton
              size="small"
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              disabled={!canRemove}
            >
              <Delete sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Paper>
  );
};