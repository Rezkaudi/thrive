// frontend/src/components/admin/VideoManagement.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Avatar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  YouTube,
  CloudDownload
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { 
  fetchVideo, 
  checkVideoExists,
  createOrUpdateVideo, 
  deleteVideo,
  clearError
} from '../../store/slices/videoSlice';
import { Video, VideoType, CreateOrUpdateVideoData, videoService } from '../../services/videoService';

// ===== Forms & Types =====
// Removed title, duration, and isActive
interface VideoFormData extends CreateOrUpdateVideoData {
  description: string;
  videoUrl: string;
  videoType: VideoType;
  thumbnailUrl?: string;
}

const buildInitialForm = (video?: Video | null): VideoFormData => ({
  description: video?.description || '',
  videoUrl: video?.videoUrl || '',
  videoType: video?.videoType ?? VideoType.YOUTUBE,
  thumbnailUrl: video?.thumbnailUrl || '',
});

const VideoForm: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (data: VideoFormData) => void;
  video?: Video | null;
  loading?: boolean;
}> = ({ open, onClose, onSubmit, video, loading = false }) => {
  const [formData, setFormData] = useState<VideoFormData>(() => buildInitialForm(video));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewThumbnail, setPreviewThumbnail] = useState<string | null>(null);

  // --- Reset form whenever dialog opens or when the bound video changes ---
  useEffect(() => {
    if (open) {
      const init = buildInitialForm(video);
      setFormData(init);
      setErrors({});
      if (init.videoType === VideoType.YOUTUBE && init.videoUrl) {
        const thumb = videoService.getYouTubeThumbnail(init.videoUrl);
        setPreviewThumbnail(thumb);
      } else {
        setPreviewThumbnail(null);
      }
    }
  }, [open, video]);

  // --- Keep preview in sync with url/type ---
  useEffect(() => {
    if (formData.videoType === VideoType.YOUTUBE && formData.videoUrl) {
      const thumb = videoService.getYouTubeThumbnail(formData.videoUrl);
      setPreviewThumbnail(thumb);
      if (thumb && !formData.thumbnailUrl) {
        setFormData(prev => ({ ...prev, thumbnailUrl: thumb }));
      }
    } else {
      setPreviewThumbnail(null);
    }
  }, [formData.videoUrl, formData.videoType]);

  const handleInputChange = (field: keyof VideoFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSelectChange = (field: keyof VideoFormData) => (event: any) => {
    const nextType = event.target.value as VideoType;
    setFormData(prev => {
      const next: VideoFormData = { ...prev, [field]: nextType } as VideoFormData;
      if (nextType !== VideoType.YOUTUBE) {
        setPreviewThumbnail(null);
      }
      return next;
    });
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.videoUrl.trim()) {
      newErrors.videoUrl = 'Video URL is required';
    } else if (!videoService.isValidVideoUrl(formData.videoUrl, formData.videoType)) {
      newErrors.videoUrl = `Invalid ${formData.videoType} URL`;
    }
    if (formData.thumbnailUrl && formData.thumbnailUrl.trim()) {
      try { new URL(formData.thumbnailUrl); } catch { newErrors.thumbnailUrl = 'Invalid thumbnail URL'; }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;
    const submitData: VideoFormData = { ...formData };
    if (!submitData.thumbnailUrl?.trim()) delete submitData.thumbnailUrl;
    onSubmit(submitData);
  };

  const closeAndReset = () => {
    setFormData(buildInitialForm(video));
    setErrors({});
    setPreviewThumbnail(null);
    onClose();
  };

  const urlHelper = useMemo(() => (
    formData.videoType === VideoType.YOUTUBE 
      ? 'e.g., https://www.youtube.com/watch?v=VIDEO_ID'
      : 'e.g., https://your-bucket.s3.amazonaws.com/video.mp4'
  ), [formData.videoType]);

  return (
    <Dialog open={open} onClose={closeAndReset} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          <Typography variant="h5" fontWeight={600}>
            {video ? 'Edit Tour Video' : 'Create Tour Video'}
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Description"
              value={formData.description}
              onChange={handleInputChange('description')}
              error={!!errors.description}
              helperText={errors.description}
              multiline
              rows={3}
              fullWidth
              required
            />

            <FormControl fullWidth>
              <InputLabel>Video Type</InputLabel>
              <Select
                value={formData.videoType}
                label="Video Type"
                onChange={handleSelectChange('videoType')}
              >
                <MenuItem value={VideoType.YOUTUBE}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <YouTube fontSize="small" />
                    <span>YouTube</span>
                  </Stack>
                </MenuItem>
                <MenuItem value={VideoType.S3}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CloudDownload fontSize="small" />
                    <span>S3 Video</span>
                  </Stack>
                </MenuItem>
              </Select>
            </FormControl>

            <TextField
              label={formData.videoType === VideoType.YOUTUBE ? 'YouTube URL' : 'S3 Video URL'}
              value={formData.videoUrl}
              onChange={handleInputChange('videoUrl')}
              error={!!errors.videoUrl}
              helperText={errors.videoUrl || urlHelper}
              fullWidth
              required
            />

            {previewThumbnail && (
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>Preview</Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      src={previewThumbnail}
                      variant="rounded"
                      sx={{ width: 120, height: 80 }}
                    >
                      <YouTube />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="success.main">
                        ✓ Valid YouTube URL detected
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Thumbnail will be auto-generated
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            )}

            <Stack direction="row" spacing={2}>
              <TextField
                label="Custom Thumbnail URL"
                value={formData.thumbnailUrl || ''}
                onChange={handleInputChange('thumbnailUrl')}
                error={!!errors.thumbnailUrl}
                helperText={errors.thumbnailUrl || 'Optional'}
                fullWidth
              />
            </Stack>

            <Alert severity="info">
              Tour videos automatically appear to new users on their first login and are accessible via the sidebar button.
            </Alert>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={closeAndReset} disabled={loading}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
          >
            {loading ? 'Saving...' : (video ? 'Update Video' : 'Create Video')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export const VideoManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    video, 
    loading, 
    error, 
    isCreatingOrUpdating, 
    isDeleting 
  } = useSelector((state: RootState) => state.videos);

  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    dispatch(fetchVideo());
    dispatch(checkVideoExists());
  }, [dispatch]);

  const handleCreateOrUpdate = async (data: VideoFormData) => {
    try {
      await dispatch(createOrUpdateVideo(data)).unwrap();
      setShowForm(false);
    } catch (error) {
      console.error('Failed to save video:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteVideo()).unwrap();
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Failed to delete video:', error);
    }
  };

  const getThumbnail = () => {
    if (!video) return null;
    if (video.thumbnailUrl) return video.thumbnailUrl;
    if (video.videoType === VideoType.YOUTUBE) {
      const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const match = video.videoUrl.match(regex);
      const videoId = match ? match[1] : null;
      return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
    }
    return null;
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>
          Tour Video Management
        </Typography>
        <Button
          variant="contained"
          startIcon={video ? <Edit /> : <Add />}
          onClick={() => setShowForm(true)}
          disabled={isCreatingOrUpdating}
        >
          {video ? 'Edit Video' : 'Add Video'}
        </Button>
      </Stack>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2 }} 
          onClose={() => dispatch(clearError())}
        >
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : video ? (
        <Card>
          <CardContent>
            <Stack direction="row" spacing={3} alignItems="center">
              <Avatar
                src={getThumbnail() || undefined}
                variant="rounded"
                sx={{ width: 120, height: 80 }}
              >
                {video.videoType === VideoType.YOUTUBE ? <YouTube /> : <CloudDownload />}
              </Avatar>
              
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Platform Tour Video
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {video.description}
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    Type: {video.videoType}
                  </Typography>
                </Stack>
              </Box>
              
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={() => setShowForm(true)}
                  disabled={isCreatingOrUpdating}
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Delete />}
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isDeleting}
                >
                  Delete
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Tour Video Created
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Create a tour video to automatically guide new users through your platform on first login.
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setShowForm(true)}
                disabled={isCreatingOrUpdating}
              >
                Create Tour Video
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Form Dialog */}
      <VideoForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleCreateOrUpdate}
        video={video}
        loading={isCreatingOrUpdating}
      />

      {/* Delete Confirmation */}
      <Dialog open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this tour video? New users will no longer see the automatic tour on first login.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
