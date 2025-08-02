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
  isEditing?: boolean;
  isDeleting?: boolean;
}

interface CommunityState {
  posts: Post[];
  totalPosts: number;
  currentPage: number;
  loading: boolean;
  error: string | null;
  editError: string | null;
  deleteError: string | null;
}

const initialState: CommunityState = {
  posts: [],
  totalPosts: 0,
  currentPage: 1,
  loading: false,
  error: null,
  editError: null,
  deleteError: null,
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

export const editPost = createAsyncThunk(
  'community/editPost', 
  async ({ postId, content, mediaUrls }: {
    postId: string;
    content: string;
    mediaUrls?: string[];
  }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/community/posts/${postId}`, { content, mediaUrls });
      
      return { 
        postId, 
        updatedPost: response.data.post || response.data,
        content,
        mediaUrls: mediaUrls || [],
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to edit post');
    }
  }
);

export const deletePost = createAsyncThunk(
  'community/deletePost', 
  async (postId: string, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/community/posts/${postId}`);
      return { postId, ...response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete post');
    }
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
      state.editError = null;
      state.deleteError = null;
    },
    startEditPost: (state, action) => {
      const postIndex = state.posts.findIndex(p => p.id === action.payload);
      if (postIndex !== -1) {
        state.posts[postIndex].isEditing = true;
      }
    },
    startDeletePost: (state, action) => {
      const postIndex = state.posts.findIndex(p => p.id === action.payload);
      if (postIndex !== -1) {
        state.posts[postIndex].isDeleting = true;
      }
    },
    updatePostContent: (state, action) => {
      const { postId, content, mediaUrls } = action.payload;
      const postIndex = state.posts.findIndex(p => p.id === postId);
      if (postIndex !== -1) {
        state.posts[postIndex].content = content;
        if (mediaUrls !== undefined) {
          state.posts[postIndex].mediaUrls = mediaUrls;
        }
      }
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
      })
      .addCase(editPost.pending, (state, action) => {
        const postIndex = state.posts.findIndex(p => p.id === action.meta.arg.postId);
        if (postIndex !== -1) {
          state.posts[postIndex].isEditing = true;
        }
        state.editError = null;
      })
      .addCase(editPost.fulfilled, (state, action) => {
        const postIndex = state.posts.findIndex(p => p.id === action.payload.postId);
        if (postIndex !== -1) {
          const updatedPost = {
            ...state.posts[postIndex],
            content: action.payload.content,
            mediaUrls: action.payload.mediaUrls,
            isEditing: false,
          };
          
          if (action.payload.updatedPost) {
            Object.assign(updatedPost, action.payload.updatedPost);
          }
          
          state.posts[postIndex] = updatedPost;
        }
        state.editError = null;
      })
      .addCase(editPost.rejected, (state, action) => {
        const postIndex = state.posts.findIndex(p => p.id === action.meta.arg.postId);
        if (postIndex !== -1) {
          state.posts[postIndex].isEditing = false;
        }
        state.editError = action.payload as string;
      })
      .addCase(deletePost.pending, (state, action) => {
        const postIndex = state.posts.findIndex(p => p.id === action.meta.arg);
        if (postIndex !== -1) {
          state.posts[postIndex].isDeleting = true;
        }
        state.deleteError = null;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter(post => post.id !== action.payload.postId);
        state.totalPosts = Math.max(0, state.totalPosts - 1);
        state.deleteError = null;
      })
      .addCase(deletePost.rejected, (state, action) => {
        const postIndex = state.posts.findIndex(p => p.id === action.meta.arg);
        if (postIndex !== -1) {
          state.posts[postIndex].isDeleting = false;
        }
        state.deleteError = action.payload as string;
      });
  },
});

export const { setCurrentPage, clearError, startEditPost, startDeletePost, updatePostContent } = communitySlice.actions;
export default communitySlice.reducer;