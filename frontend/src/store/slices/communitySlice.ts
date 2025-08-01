import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

interface Post {
  id: string;
  author?: {
    userId: string;
    name: string;
    email: string;
    avatar: string;
    level: number;
  };
  content: string;
  mediaUrls: string[];
  isAnnouncement: boolean;
  likesCount: number;
  isLiked: boolean;
  createdAt: string;
}

interface CommunityState {
  posts: Post[];
  totalPosts: number;
  currentPage: number;
  loading: boolean;
  error: string | null;
}

const initialState: CommunityState = {
  posts: [],
  totalPosts: 0,
  currentPage: 1,
  loading: false,
  error: null,
};

export const fetchPosts = createAsyncThunk(
  'community/fetchPosts',
  async ({ page = 1, limit = 20 }: { page?: number; limit?: number }) => {
    const response = await api.get('/community/posts', { params: { page, limit } });
    return response.data;
  }
);

export const createPost = createAsyncThunk(
  'community/createPost',
  async ({ content, mediaUrls = [], isAnnouncement = false }: {
    content: string;
    mediaUrls?: string[];
    isAnnouncement?: boolean;
  }) => {
    const response = await api.post('/community/posts', { content, mediaUrls, isAnnouncement });
    return response.data;
  }
);

export const toggleLike = createAsyncThunk(
  'community/toggleLike',
  async (postId: string) => {
    const response = await api.post(`/community/posts/${postId}/toggle-like`);
    return { postId, ...response.data };
  }
);

const communitySlice = createSlice({
  name: 'community',
  initialState,
  reducers: {
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload.posts;
        state.totalPosts = action.payload.total;
        state.currentPage = action.payload.page;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch posts';
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload);
        state.totalPosts++;
      })
      .addCase(toggleLike.fulfilled, (state, action) => {
        const postIndex = state.posts.findIndex(p => p.id === action.payload.postId);
        if (postIndex !== -1) {
          state.posts[postIndex].likesCount = action.payload.likesCount;
          state.posts[postIndex].isLiked = action.payload.isLiked;
        }
      });
  },
});

export const { setCurrentPage, clearError } = communitySlice.actions;
export default communitySlice.reducer;