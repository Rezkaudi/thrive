// frontend/src/components/community/MediaUpload.tsx - Enhanced UX Version
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Box,
  Button,
  IconButton,
  Paper,
  Typography,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Chip,
  Alert,
  Card,
  CardMedia,
  CardActions,
  Tooltip,
  Fade,
  CircularProgress,
  Collapse,
  ButtonGroup,
  Divider,
  Badge,
  Snackbar,
} from '@mui/material';
import {
  PhotoCamera,
  VideoCall,
  Delete,
  CloudUpload,
  Cancel,
  PlayArrow,
  Image as ImageIcon,
  Movie as MovieIcon,
  CheckCircle,
  Error as ErrorIcon,
  Info,
  Close,
  Refresh,
  Fullscreen,
  ExpandMore,
  ExpandLess,
  DragIndicator,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { communityService } from '../../services/communityService';

export interface UploadedMedia {
  url: string;
  size: number;
  mimeType: string;
  file?: File;
  isUploading?: boolean;
  uploadProgress?: number;
  error?: string;
  id?: string;
}

interface MediaUploadProps {
  onMediaUpload: (mediaFiles: UploadedMedia[]) => void;
  onMediaRemove: (mediaUrl: string) => void;
  existingMedia?: UploadedMedia[];
  maxFiles?: number;
  disabled?: boolean;
  showUploadedFiles?: boolean;
}

interface FileWithPreview {
  file: File;
  preview: string;
  id: string;
  uploadProgress?: number;
  error?: string;
  isUploading?: boolean;
}

const SUPPORTED_FORMATS = {
  images: ['JPEG', 'PNG', 'GIF', 'WebP'],
  videos: ['MP4', 'MOV', 'AVI', 'WebM'],
};

const MAX_SIZES = {
  image: 10 * 1024 * 1024, // 10MB
  video: 100 * 1024 * 1024, // 100MB
};

export const MediaUpload: React.FC<MediaUploadProps> = ({
  onMediaUpload,
  onMediaRemove,
  existingMedia = [],
  maxFiles = 10,
  disabled = false,
  showUploadedFiles = true,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [uploadErrors, setUploadErrors] = useState<{ [key: string]: string }>({});
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<UploadedMedia | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [uploadStage, setUploadStage] = useState<'idle' | 'preparing' | 'uploading' | 'success' | 'error'>('idle');
  const [successMessage, setSuccessMessage] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    const validation = communityService.validateMediaFile(file);
    return validation.valid ? null : validation.error!;
  }, []);

  const createPreview = useCallback((file: File): string => {
    return URL.createObjectURL(file);
  }, []);

  const generateFileId = useCallback((): string => {
    return Math.random().toString(36).substr(2, 9);
  }, []);

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const getFileTypeIcon = useCallback((mimeType: string) => {
    return mimeType.startsWith('image/') ? <ImageIcon /> : <MovieIcon />;
  }, []);

  const getFileTypeColor = useCallback((mimeType: string): 'primary' | 'secondary' => {
    return mimeType.startsWith('image/') ? 'primary' : 'secondary';
  }, []);

  // Enhanced file selection with better validation feedback
  const handleFileSelect = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const currentTotal = existingMedia.length + selectedFiles.length;
    
    // Clear previous errors
    setUploadErrors({});
    
    if (fileArray.length + currentTotal > maxFiles) {
      setUploadErrors({
        fileLimit: `You can only upload ${maxFiles} files total. You currently have ${currentTotal} files.`
      });
      return;
    }

    const validFiles: FileWithPreview[] = [];
    const errors: { [key: string]: string } = {};

    fileArray.forEach((file) => {
      const fileId = generateFileId();
      const error = validateFile(file);
      
      if (error) {
        errors[fileId] = `${file.name}: ${error}`;
      } else {
        const fileWithPreview: FileWithPreview = {
          file: file,
          preview: createPreview(file),
          id: fileId,
          isUploading: false,
          uploadProgress: 0,
        };
        validFiles.push(fileWithPreview);
      }
    });

    if (Object.keys(errors).length > 0) {
      setUploadErrors(errors);
      // Auto-clear errors after 8 seconds
      setTimeout(() => setUploadErrors({}), 8000);
    }

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
      setUploadStage('idle');
      
      // Show success message for valid files
      if (validFiles.length > 0) {
        setSuccessMessage(`${validFiles.length} file${validFiles.length > 1 ? 's' : ''} ready to upload`);
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    }
  }, [existingMedia.length, selectedFiles.length, maxFiles, validateFile, createPreview, generateFileId]);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      handleFileSelect(event.target.files);
      event.target.value = '';
    }
  }, [handleFileSelect]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    
    if (disabled) return;
    
    const files = Array.from(event.dataTransfer.files);
    handleFileSelect(files);
  }, [disabled, handleFileSelect]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!disabled) {
      setDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    // Only set dragOver to false if we're actually leaving the drop zone
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;
    
    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setDragOver(false);
    }
  }, []);

  const handleRemoveSelected = useCallback((id: string) => {
    setSelectedFiles((prev) => {
      const newFiles = prev.filter(item => item.id !== id);
      const removedItem = prev.find(item => item.id === id);
      
      if (removedItem?.preview) {
        URL.revokeObjectURL(removedItem.preview);
      }
      
      return newFiles;
    });
    
    // Clear any errors for this file
    setUploadErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
  }, []);

  const handleRetryUpload = useCallback(async (fileId: string) => {
    const fileItem = selectedFiles.find(f => f.id === fileId);
    if (!fileItem) return;

    // Update file status
    setSelectedFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, isUploading: true, error: undefined, uploadProgress: 0 } : f
    ));

    try {
      const response = await communityService.uploadMedia([fileItem.file]);
      
      const uploadedMedia: UploadedMedia[] = response.files.map((file) => ({
        url: file.url,
        size: file.size,
        mimeType: file.mimeType,
        file: fileItem.file,
        id: fileId,
      }));

      onMediaUpload(uploadedMedia);
      
      // Remove from selected files
      setSelectedFiles(prev => prev.filter(f => f.id !== fileId));
      URL.revokeObjectURL(fileItem.preview);
      
    } catch (error: any) {
      setSelectedFiles(prev => prev.map(f => 
        f.id === fileId ? { 
          ...f, 
          isUploading: false, 
          error: error.response?.data?.error || error.message || 'Upload failed' 
        } : f
      ));
    }
  }, [selectedFiles, onMediaUpload]);

  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0 || isUploading) return;

    setIsUploading(true);
    setUploadStage('preparing');
    setUploadErrors({});

    // Update all files to uploading state
    setSelectedFiles(prev => prev.map(f => ({ ...f, isUploading: true, uploadProgress: 0 })));

    try {
      setUploadStage('uploading');
      
      const filesToUpload: File[] = selectedFiles.map(item => item.file);
      const response = await communityService.uploadMedia(filesToUpload);
      
      const uploadedMedia: UploadedMedia[] = response.files.map((file, index) => ({
        url: file.url,
        size: file.size,
        mimeType: file.mimeType,
        file: selectedFiles[index].file,
        id: selectedFiles[index].id,
      }));

      onMediaUpload(uploadedMedia);
      
      // Clean up
      selectedFiles.forEach((item) => {
        if (item.preview) {
          URL.revokeObjectURL(item.preview);
        }
      });
      
      setSelectedFiles([]);
      setUploadStage('success');
      setSuccessMessage(`Successfully uploaded ${uploadedMedia.length} file${uploadedMedia.length > 1 ? 's' : ''}!`);
      
      // Auto-clear success state
      setTimeout(() => {
        setUploadStage('idle');
        setSuccessMessage('');
      }, 3000);
      
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadStage('error');
      setUploadErrors({ 
        upload: error.response?.data?.error || error.message || 'Upload failed. Please try again.' 
      });
      
      // Reset file states
      setSelectedFiles(prev => prev.map(f => ({ ...f, isUploading: false })));
    } finally {
      setIsUploading(false);
    }
  }, [selectedFiles, isUploading, onMediaUpload]);

  const handleCancel = useCallback(() => {
    selectedFiles.forEach((item) => {
      if (item.preview) {
        URL.revokeObjectURL(item.preview);
      }
    });
    setSelectedFiles([]);
    setUploadErrors({});
    setUploadStage('idle');
  }, [selectedFiles]);

  const handlePreview = useCallback((media: UploadedMedia) => {
    setPreviewMedia(media);
    setPreviewOpen(true);
  }, []);

  const handleClosePreview = useCallback(() => {
    setPreviewOpen(false);
    setPreviewMedia(null);
  }, []);

  const totalFiles = existingMedia.length + selectedFiles.length;
  const canAddMore = totalFiles < maxFiles && !disabled && !isUploading;
  const hasFiles = existingMedia.length > 0 || selectedFiles.length > 0;

  // Enhanced upload area that's always visible but changes based on state
  const renderUploadArea = () => {
    if (collapsed && hasFiles) return null;

    const getUploadAreaContent = () => {
      if (!canAddMore && totalFiles >= maxFiles) {
        return (
          <Stack alignItems="center" spacing={1}>
            <CheckCircle color="success" sx={{ fontSize: 40 }} />
            <Typography variant="body1" color="success.main" fontWeight={600}>
              Maximum files reached ({maxFiles}/{maxFiles})
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Remove files to add more
            </Typography>
          </Stack>
        );
      }

      if (uploadStage === 'success') {
        return (
          <Stack alignItems="center" spacing={1}>
            <CheckCircle color="success" sx={{ fontSize: 40 }} />
            <Typography variant="body1" color="success.main" fontWeight={600}>
              Upload complete!
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {successMessage}
            </Typography>
          </Stack>
        );
      }

      if (uploadStage === 'uploading') {
        return (
          <Stack alignItems="center" spacing={2}>
            <CircularProgress size={40} />
            <Typography variant="body1" fontWeight={600}>
              Uploading {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''}...
            </Typography>
            <LinearProgress sx={{ width: '200px' }} />
          </Stack>
        );
      }

      return (
        <Stack alignItems="center" spacing={2}>
          <CloudUpload 
            color={dragOver ? 'primary' : 'action'} 
            sx={{ fontSize: 48, transition: 'all 0.3s ease' }} 
          />
          <Box textAlign="center">
            <Typography variant="h6" fontWeight={600} gutterBottom>
              {dragOver ? 'Drop your files here' : 'Upload your media'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Drag and drop files, or click to select
            </Typography>
            
            <ButtonGroup variant="outlined" size="small">
              <Button
                startIcon={<PhotoCamera />}
                onClick={() => fileInputRef.current?.click()}
              >
                Photos
              </Button>
              <Button
                startIcon={<VideoCall />}
                onClick={() => videoInputRef.current?.click()}
              >
                Videos
              </Button>
            </ButtonGroup>
          </Box>
          
          <Button
            size="small"
            variant="text"
            startIcon={showHelp ? <ExpandLess /> : <Info />}
            onClick={() => setShowHelp(!showHelp)}
            sx={{ mt: 1 }}
          >
            Supported formats
          </Button>
        </Stack>
      );
    };

    return (
      <Paper
        sx={{
          p: 4,
          mb: 2,
          border: '2px dashed',
          borderColor: 
            uploadStage === 'success' ? 'success.main' :
            uploadStage === 'error' ? 'error.main' :
            dragOver ? 'primary.main' : 'grey.300',
          bgcolor: 
            uploadStage === 'success' ? 'success.50' :
            uploadStage === 'error' ? 'error.50' :
            dragOver ? 'primary.50' : 'grey.50',
          transition: 'all 0.3s ease',
          cursor: canAddMore ? 'pointer' : 'default',
          '&:hover': canAddMore ? {
            borderColor: 'primary.main',
            bgcolor: 'primary.50',
          } : {},
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => canAddMore && fileInputRef.current?.click()}
      >
        {getUploadAreaContent()}
        
        <Collapse in={showHelp}>
          <Divider sx={{ my: 2 }} />
          <Stack direction="row" spacing={4} justifyContent="center">
            <Box textAlign="center">
              <PhotoCamera color="primary" sx={{ mb: 1 }} />
              <Typography variant="caption" display="block" fontWeight={600}>
                Images
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {SUPPORTED_FORMATS.images.join(', ')}
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary">
                Up to {formatFileSize(MAX_SIZES.image)}
              </Typography>
            </Box>
            <Box textAlign="center">
              <VideoCall color="secondary" sx={{ mb: 1 }} />
              <Typography variant="caption" display="block" fontWeight={600}>
                Videos
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {SUPPORTED_FORMATS.videos.join(', ')}
              </Typography>
              <Typography variant="caption" display="block" color="text.secondary">
                Up to {formatFileSize(MAX_SIZES.video)}
              </Typography>
            </Box>
          </Stack>
        </Collapse>
      </Paper>
    );
  };

  return (
    <Box>
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept="image/*,video/*"
        onChange={handleInputChange}
        style={{ display: 'none' }}
        disabled={disabled || !canAddMore}
      />
      
      <input
        type="file"
        ref={videoInputRef}
        multiple
        accept="video/*"
        onChange={handleInputChange}
        style={{ display: 'none' }}
        disabled={disabled || !canAddMore}
      />

      {/* Header with file counter and collapse toggle */}
      {hasFiles && (
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="h6" fontWeight={600}>
              Media Files
            </Typography>
            <Badge
              badgeContent={totalFiles}
              color="primary"
              max={maxFiles}
            >
              <Chip
                label={`${totalFiles}/${maxFiles}`}
                size="small"
                color={totalFiles >= maxFiles ? 'warning' : 'default'}
              />
            </Badge>
          </Stack>
          
          <IconButton
            size="small"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ExpandMore /> : <ExpandLess />}
          </IconButton>
        </Stack>
      )}

      {/* Upload area */}
      {renderUploadArea()}

      {/* Action buttons for selected files */}
      {selectedFiles.length > 0 && !collapsed && (
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" mb={2}>
          <Button
            variant="contained"
            startIcon={isUploading ? <CircularProgress size={16} /> : <CloudUpload />}
            onClick={handleUpload}
            disabled={isUploading || disabled}
            size="large"
            sx={{ minWidth: 160 }}
          >
            {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''}`}
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<Cancel />}
            onClick={handleCancel}
            disabled={isUploading}
          >
            Clear All
          </Button>
        </Stack>
      )}

      {/* Error messages */}
      <AnimatePresence>
        {Object.keys(uploadErrors).length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Alert 
              severity="error" 
              sx={{ mb: 2 }}
              action={
                <IconButton
                  size="small"
                  onClick={() => setUploadErrors({})}
                >
                  <Close fontSize="small" />
                </IconButton>
              }
            >
              <Typography variant="subtitle2" gutterBottom>
                Upload Issues:
              </Typography>
              {Object.entries(uploadErrors).map(([key, error]) => (
                <Typography key={key} variant="body2">
                  • {error}
                </Typography>
              ))}
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success message */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled">
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Media grid */}
      <Collapse in={!collapsed}>
        {hasFiles && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(3, 1fr)',
                md: 'repeat(4, 1fr)',
              },
              gap: 2,
              mb: 2,
            }}
          >
            {/* Existing uploaded media */}
            {showUploadedFiles && existingMedia.map((media, index) => (
              <motion.div
                key={`existing-${index}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card sx={{ height: '100%' }}>
                  <CardMedia
                    sx={{
                      height: 120,
                      cursor: 'pointer',
                      bgcolor: 'grey.100',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                    onClick={() => handlePreview(media)}
                  >
                    {media.mimeType.startsWith('image/') ? (
                      <Box
                        component="img"
                        src={media.url}
                        alt="Uploaded media"
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <>
                        <video
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                          muted
                        >
                          <source src={media.url} type="video/mp4" />
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
                          }}
                        >
                          <PlayArrow sx={{ color: 'white' }} />
                        </Box>
                      </>
                    )}
                    
                    {/* Status indicator */}
                    <Chip
                      icon={<CheckCircle />}
                      label="Uploaded"
                      size="small"
                      color="success"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        fontSize: '0.7rem',
                      }}
                    />
                  </CardMedia>
                  
                  <CardActions sx={{ p: 1, minHeight: 60 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" width="100%">
                      <Stack spacing={0.5}>
                        <Chip
                          icon={getFileTypeIcon(media.mimeType)}
                          label={formatFileSize(media.size)}
                          size="small"
                          variant="outlined"
                          color={getFileTypeColor(media.mimeType)}
                        />
                      </Stack>
                      
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="Preview">
                          <IconButton
                            size="small"
                            onClick={() => handlePreview(media)}
                          >
                            <Fullscreen fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Remove">
                          <IconButton
                            size="small"
                            onClick={() => onMediaRemove(media.url)}
                            disabled={disabled}
                            color="error"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  </CardActions>
                </Card>
              </motion.div>
            ))}

            {/* Selected files awaiting upload */}
            {selectedFiles.map((item, index) => (
              <motion.div
                key={`selected-${item.id}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card sx={{ height: '100%', position: 'relative' }}>
                  {/* Upload progress overlay */}
                  {item.isUploading && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2,
                      }}
                    >
                      <CircularProgress size={40} />
                      <Typography variant="caption" sx={{ mt: 1 }}>
                        Uploading...
                      </Typography>
                    </Box>
                  )}
                  
                  <CardMedia
                    sx={{
                      height: 120,
                      bgcolor: 'grey.100',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    {item.file.type.startsWith('image/') ? (
                      <Box
                        component="img"
                        src={item.preview}
                        alt="Selected media"
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <Stack alignItems="center" spacing={1} sx={{ p: 2 }}>
                        <MovieIcon sx={{ fontSize: 40, color: 'text.secondary' }} />
                        <Typography variant="caption" textAlign="center" noWrap sx={{ maxWidth: '100%' }}>
                          {item.file.name.length > 15 ? `${item.file.name.substring(0, 15)}...` : item.file.name}
                        </Typography>
                      </Stack>
                    )}
                    
                    {/* Status indicators */}
                    {item.error ? (
                      <Chip
                        icon={<ErrorIcon />}
                        label="Failed"
                        size="small"
                        color="error"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          fontSize: '0.7rem',
                        }}
                      />
                    ) : (
                      <Chip
                        icon={<DragIndicator />}
                        label="Ready"
                        size="small"
                        color="info"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          fontSize: '0.7rem',
                        }}
                      />
                    )}
                  </CardMedia>
                  
                  <CardActions sx={{ p: 1, minHeight: 60 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" width="100%">
                      <Stack spacing={0.5}>
                        <Chip
                          icon={getFileTypeIcon(item.file.type)}
                          label={formatFileSize(item.file.size)}
                          size="small"
                          variant="outlined"
                          color={getFileTypeColor(item.file.type)}
                        />
                        {item.error && (
                          <Typography variant="caption" color="error" noWrap>
                            {item.error}
                          </Typography>
                        )}
                      </Stack>
                      
                      <Stack direction="row" spacing={0.5}>
                        {item.error && (
                          <Tooltip title="Retry upload">
                            <IconButton
                              size="small"
                              onClick={() => handleRetryUpload(item.id)}
                              color="primary"
                            >
                              <Refresh fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Remove">
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveSelected(item.id)}
                            disabled={item.isUploading}
                            color="error"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  </CardActions>
                </Card>
              </motion.div>
            ))}
          </Box>
        )}
      </Collapse>

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
          <Typography variant="h6">
            Media Preview
          </Typography>
          <IconButton onClick={handleClosePreview} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ 
          p: 0, 
          bgcolor: 'black',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
        }}>
          {previewMedia && (
            <Box sx={{ 
              width: '100%', 
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {previewMedia.mimeType.startsWith('image/') ? (
                <Box
                  component="img"
                  src={previewMedia.url}
                  alt="Media preview"
                  sx={{
                    maxWidth: '100%',
                    maxHeight: '60vh',
                    objectFit: 'contain',
                  }}
                />
              ) : (
                <Box
                  component="video"
                  src={previewMedia.url}
                  controls
                  sx={{
                    maxWidth: '100%',
                    maxHeight: '60vh',
                    objectFit: 'contain',
                  }}
                />
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ bgcolor: 'rgba(0, 0, 0, 0.8)' }}>
          <Button onClick={handleClosePreview} sx={{ color: 'white' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};