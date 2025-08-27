// frontend/src/store/slices/videoSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { videoService, Video, CreateOrUpdateVideoData, TourVideoStatus } from '../../services/videoService';

interface VideoState {
  // Single video management
  video: Video | null;
  videoExists: boolean;
  loading: boolean;
  error: string | null;
  
  // 🎯 FIRST-TIME LOGIN TOUR STATE
  tourVideoStatus: TourVideoStatus | null;
  showTourModal: boolean; // Controls modal visibility
  
  // UI states
  isCreatingOrUpdating: boolean;
  isDeleting: boolean;
}

const initialState: VideoState = {
  video: null,
  videoExists: false,
  loading: false,
  error: null,
  
  tourVideoStatus: null,
  showTourModal: false,
  
  isCreatingOrUpdating: false,
  isDeleting: false,
};

// Admin video management thunks
export const fetchVideo = createAsyncThunk(
  'videos/fetchVideo',
  async () => {
    const response = await videoService.getVideo();
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to fetch video');
  }
);

export const checkVideoExists = createAsyncThunk(
  'videos/checkVideoExists',
  async () => {
    const response = await videoService.videoExists();
    if (response.success) {
      return response.data.exists;
    }
    throw new Error(response.message || 'Failed to check video existence');
  }
);

export const createOrUpdateVideo = createAsyncThunk(
  'videos/createOrUpdateVideo',
  async (data: CreateOrUpdateVideoData) => {
    const response = await videoService.createOrUpdateVideo(data);
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to save video');
  }
);

export const deleteVideo = createAsyncThunk(
  'videos/deleteVideo',
  async () => {
    const response = await videoService.deleteVideo();
    if (response.success) {
      return true;
    }
    throw new Error(response.message || 'Failed to delete video');
  }
);

// 🎯 FIRST-TIME LOGIN TOUR THUNKS
export const fetchTourVideo = createAsyncThunk(
  'videos/fetchTourVideo',
  async () => {
    const response = await videoService.getTourVideo();
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to fetch tour video');
  }
);

export const fetchTourVideoStatus = createAsyncThunk(
  'videos/fetchTourVideoStatus',
  async () => {
    const response = await videoService.getTourVideoStatus();
    if (response.success) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to fetch tour video status');
  }
);

export const markTourVideoViewed = createAsyncThunk(
  'videos/markTourVideoViewed',
  async () => {
    const response = await videoService.markTourVideoViewed();
    if (response.success) {
      return true;
    }
    throw new Error(response.message || 'Failed to mark tour video as viewed');
  }
);

const videoSlice = createSlice({
  name: 'videos',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setShowTourModal: (state, action) => {
      state.showTourModal = action.payload;
    },
    hideTourModal: (state) => {
      state.showTourModal = false;
    },
    resetVideoState: (state) => {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch video
      .addCase(fetchVideo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVideo.fulfilled, (state, action) => {
        state.loading = false;
        state.video = action.payload;
        state.videoExists = action.payload !== null;
      })
      .addCase(fetchVideo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch video';
      })

      // Check video exists
      .addCase(checkVideoExists.fulfilled, (state, action) => {
        state.videoExists = action.payload;
      })

      // Create or update video
      .addCase(createOrUpdateVideo.pending, (state) => {
        state.isCreatingOrUpdating = true;
        state.error = null;
      })
      .addCase(createOrUpdateVideo.fulfilled, (state, action) => {
        state.isCreatingOrUpdating = false;
        state.video = action.payload;
        state.videoExists = true;
      })
      .addCase(createOrUpdateVideo.rejected, (state, action) => {
        state.isCreatingOrUpdating = false;
        state.error = action.error.message || 'Failed to save video';
      })

      // Delete video
      .addCase(deleteVideo.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteVideo.fulfilled, (state) => {
        state.isDeleting = false;
        state.video = null;
        state.videoExists = false;
      })
      .addCase(deleteVideo.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.error.message || 'Failed to delete video';
      })

      // 🎯 FIRST-TIME LOGIN TOUR CASES
      .addCase(fetchTourVideo.fulfilled, (state, action) => {
        state.video = action.payload;
      })

      // 🎯 KEY: Auto-show modal when user should see tour
      .addCase(fetchTourVideoStatus.fulfilled, (state, action) => {
        state.tourVideoStatus = action.payload;
        // AUTO-SHOW MODAL if user should see it and video exists
        if (action.payload.shouldShowTour && state.video && state.video.isActive) {
          state.showTourModal = true; // 🎯 TRIGGERS AUTO-SHOW!
        }
      })

      // 🎯 Mark as viewed - stops future auto-shows
      .addCase(markTourVideoViewed.fulfilled, (state) => {
        if (state.tourVideoStatus) {
          state.tourVideoStatus.hasSeenTour = true;
          state.tourVideoStatus.shouldShowTour = false; // 🎯 STOPS AUTO-SHOW!
        }
        state.showTourModal = false;
      });
  },
});

export const {
  clearError,
  setShowTourModal,
  hideTourModal,
  resetVideoState
} = videoSlice.actions;

export default videoSlice.reducer;