// frontend/src/store/slices/profileSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { profileService, Profile, UpdateProfileData } from '../../services/profileService';

interface ProfileState {
  data: Profile | null;
  loading: boolean;
  error: string | null;
  updateLoading: boolean;
  photoUploadLoading: boolean;
}

const initialState: ProfileState = {
  data: null,
  loading: false,
  error: null,
  updateLoading: false,
  photoUploadLoading: false,
};

// Fetch current user's profile
export const fetchMyProfile = createAsyncThunk(
  'profile/fetchMyProfile',
  async (_, { rejectWithValue }) => {
    try {
      return await profileService.getMyProfile();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch profile');
    }
  }
);

// Update profile data
export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (data: UpdateProfileData, { rejectWithValue }) => {
    try {
      return await profileService.updateProfile(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update profile');
    }
  }
);

// Upload profile photo
export const uploadProfilePhoto = createAsyncThunk(
  'profile/uploadPhoto',
  async (file: File, { rejectWithValue }) => {
    try {
      // Validate file before upload
      const validation = profileService.validateProfilePhoto(file);
      if (!validation.valid) {
        return rejectWithValue(validation.error);
      }

      const result = await profileService.uploadProfilePhoto(file);
      return result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to upload photo');
    }
  }
);

// Delete profile photo
export const deleteProfilePhoto = createAsyncThunk(
  'profile/deletePhoto',
  async (_, { rejectWithValue }) => {
    try {
      const result = await profileService.deleteProfilePhoto();
      return result;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete photo');
    }
  }
);

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addPoints: (state, action) => {
      if (state.data) {
        state.data.points += action.payload;
      }
    },
    updateLocalProfile: (state, action) => {
      if (state.data) {
        state.data = { ...state.data, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch profile
      .addCase(fetchMyProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchMyProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload as string;
      })
      
      // Upload photo
      .addCase(uploadProfilePhoto.pending, (state) => {
        state.photoUploadLoading = true;
        state.error = null;
      })
      .addCase(uploadProfilePhoto.fulfilled, (state, action) => {
        state.photoUploadLoading = false;
        if (state.data) {
          state.data = action.payload.profile;
        }
        state.error = null;
      })
      .addCase(uploadProfilePhoto.rejected, (state, action) => {
        state.photoUploadLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete photo
      .addCase(deleteProfilePhoto.pending, (state) => {
        state.photoUploadLoading = true;
        state.error = null;
      })
      .addCase(deleteProfilePhoto.fulfilled, (state, action) => {
        state.photoUploadLoading = false;
        if (state.data) {
          state.data = action.payload.profile;
        }
        state.error = null;
      })
      .addCase(deleteProfilePhoto.rejected, (state, action) => {
        state.photoUploadLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, addPoints, updateLocalProfile } = profileSlice.actions;
export default profileSlice.reducer;