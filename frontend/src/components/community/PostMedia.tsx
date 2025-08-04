// frontend/src/components/community/PostMedia.tsx
import React, { useState } from 'react';
import {
  Box,
  Card,
  CardMedia,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Chip,
  Stack,
} from '@mui/material';
import {
  PlayArrow,
  Fullscreen,
  Image as ImageIcon,
  Movie as MovieIcon,
  Close,
  Download,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

interface PostMediaProps {
  mediaUrls: string[];
  maxDisplay?: number;
}

const getMediaType = (url: string): 'image' | 'video' => {
  const videoExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.ogg'];
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
  
  const lowerUrl = url.toLowerCase();
  
  if (videoExtensions.some(ext => lowerUrl.includes(ext))) {
    return 'video';
  }
  
  if (imageExtensions.some(ext => lowerUrl.includes(ext))) {
    return 'image';
  }
  
  // Default to image if we can't determine
  return 'image';
};

const formatFileName = (url: string): string => {
  try {
    const parts = url.split('/');
    const fileName = parts[parts.length - 1];
    return fileName.split('?')[0]; // Remove query parameters
  } catch {
    return 'media';
  }
};

export const PostMedia: React.FC<PostMediaProps> = ({ 
  mediaUrls, 
  maxDisplay = 4 
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [previewMedia, setPreviewMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);

  if (!mediaUrls || mediaUrls.length === 0) {
    return null;
  }

  const handlePreview = (url: string, index: number) => {
    setPreviewMedia({ url, type: getMediaType(url) });
    setPreviewIndex(index);
    setPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setPreviewMedia(null);
  };

  const handleNextMedia = () => {
    const nextIndex = (previewIndex + 1) % mediaUrls.length;
    const nextUrl = mediaUrls[nextIndex];
    setPreviewIndex(nextIndex);
    setPreviewMedia({ url: nextUrl, type: getMediaType(nextUrl) });
  };

  const handlePrevMedia = () => {
    const prevIndex = previewIndex === 0 ? mediaUrls.length - 1 : previewIndex - 1;
    const prevUrl = mediaUrls[prevIndex];
    setPreviewIndex(prevIndex);
    setPreviewMedia({ url: prevUrl, type: getMediaType(prevUrl) });
  };

  const handleDownload = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = formatFileName(url);
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const displayUrls = mediaUrls.slice(0, maxDisplay);
  const remainingCount = mediaUrls.length - maxDisplay;

  const getItemHeight = (itemCount: number) => {
    switch (itemCount) {
      case 1: return 300;
      case 2: return 200;
      default: return 150;
    }
  };

      return (
    <Box sx={{ mt: 2 }}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          mb: 1,
          alignItems: 'flex-start',
        }}
      >
        {displayUrls.map((url, index) => {
          const mediaType = getMediaType(url);
          const isLastItem = index === displayUrls.length - 1;
          const showMoreOverlay = isLastItem && remainingCount > 0;
          
          // Calculate width for responsive layout
          const getWidth = () => {
            if (displayUrls.length === 1) return '100%';
            if (displayUrls.length === 2) return 'calc(50% - 4px)';
            if (displayUrls.length === 3) return 'calc(33.333% - 6px)';
            return 'calc(50% - 4px)'; // 4+ items in 2x2 grid
          };

          return (
            <Box
              key={index}
              sx={{
                width: getWidth(),
                minWidth: 0, // Prevent flex item overflow
                '@media (max-width: 600px)': {
                  width: displayUrls.length > 1 ? 'calc(50% - 4px)' : '100%',
                },
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  sx={{
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.02)',
                    },
                  }}
                  onClick={() => handlePreview(url, index)}
                >
                  {mediaType === 'image' ? (
                    <CardMedia
                      component="img"
                      height={getItemHeight(displayUrls.length)}
                      image={url}
                      alt={`Post media ${index + 1}`}
                      sx={{
                        objectFit: 'cover',
                        bgcolor: 'grey.100',
                      }}
                    />
                  ) : (
                    <Box
                      sx={{
                        height: getItemHeight(displayUrls.length),
                        bgcolor: 'grey.900',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      <video
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                        muted
                      >
                        <source src={url} type="video/mp4" />
                      </video>
                      <Box
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          bgcolor: 'rgba(0, 0, 0, 0.7)',
                          borderRadius: '50%',
                          p: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <PlayArrow sx={{ color: 'white', fontSize: 32 }} />
                      </Box>
                    </Box>
                  )}

                  {/* Media type indicator */}
                  <Chip
                    icon={mediaType === 'image' ? <ImageIcon /> : <MovieIcon />}
                    label={mediaType}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      bgcolor: 'rgba(0, 0, 0, 0.7)',
                      color: 'white',
                      '& .MuiChip-icon': {
                        color: 'white',
                      },
                    }}
                  />

                  {/* Expand icon */}
                  <IconButton
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'rgba(0, 0, 0, 0.7)',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'rgba(0, 0, 0, 0.8)',
                      },
                    }}
                    size="small"
                  >
                    <Fullscreen fontSize="small" />
                  </IconButton>

                  {/* More items overlay */}
                  {showMoreOverlay && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        bgcolor: 'rgba(0, 0, 0, 0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                      }}
                    >
                      <Typography variant="h4" fontWeight={600}>
                        +{remainingCount}
                      </Typography>
                    </Box>
                  )}
                </Card>
              </motion.div>
            </Box>
          );
        })}
      </Box>

      {mediaUrls.length > 1 && (
        <Typography variant="caption" color="text.secondary">
          {mediaUrls.length} media file{mediaUrls.length > 1 ? 's' : ''}
        </Typography>
      )}

      {/* Media Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={handleClosePreview}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'black',
            color: 'white',
          },
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          bgcolor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
        }}>
          <Box>
            <Typography variant="h6">
              Media Preview ({previewIndex + 1} of {mediaUrls.length})
            </Typography>
            <Typography variant="caption" color="grey.400">
              {formatFileName(previewMedia?.url || '')}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <IconButton
              onClick={() => handleDownload(previewMedia?.url || '')}
              sx={{ color: 'white' }}
            >
              <Download />
            </IconButton>
            <IconButton onClick={handleClosePreview} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ 
          p: 0, 
          bgcolor: 'black',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '70vh',
        }}>
          {previewMedia && (
            <Box sx={{ 
              width: '100%', 
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {previewMedia.type === 'image' ? (
                <Box
                  component="img"
                  src={previewMedia.url}
                  alt="Media preview"
                  sx={{
                    maxWidth: '100%',
                    maxHeight: '70vh',
                    objectFit: 'contain',
                  }}
                />
              ) : (
                <Box
                  component="video"
                  src={previewMedia.url}
                  controls
                  autoPlay
                  sx={{
                    maxWidth: '100%',
                    maxHeight: '70vh',
                    objectFit: 'contain',
                  }}
                />
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ 
          bgcolor: 'rgba(0, 0, 0, 0.8)',
          justifyContent: 'space-between',
        }}>
          <Button 
            onClick={handlePrevMedia} 
            disabled={mediaUrls.length <= 1}
            sx={{ color: 'white' }}
          >
            Previous
          </Button>
          <Button onClick={handleClosePreview} sx={{ color: 'white' }}>
            Close
          </Button>
          <Button 
            onClick={handleNextMedia} 
            disabled={mediaUrls.length <= 1}
            sx={{ color: 'white' }}
          >
            Next
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};