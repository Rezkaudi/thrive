// frontend/src/store/slices/communitySlice.ts (Updated - Remove isAnnouncement)
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { Comment, CreateCommentData, UpdateCommentData } from '../../services/commentService';

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
  likesCount: number;
  isLiked: boolean;
  createdAt: string;
  isEditing?: boolean;
  isDeleting?: boolean;
  commentsCount?: number;
  comments?: Comment[];
  commentsLoading?: boolean;
  commentsPage?: number;
  commentsHasMore?: boolean;
  commentsInitialized?: boolean;
}

interface CommunityState {
  posts: Post[];
  totalPosts: number;
  currentPage: number;
  loading: boolean;
  loadingMore: boolean;
  hasMorePosts: boolean;
  error: string | null;
  editError: string | null;
  deleteError: string | null;
  commentError: string | null;
}

const initialState: CommunityState = {
  posts: [],
  totalPosts: 0,
  currentPage: 1,
  loading: false,
  loadingMore: false,
  hasMorePosts: true,
  error: null,
  editError: null,
  deleteError: null,
  commentError: null,
};

// Modified fetchPosts to support infinite scroll
export const fetchPosts = createAsyncThunk(
  'community/fetchPosts',
  async ({ page = 1, limit = 20, append = false }: {
    page?: number;
    limit?: number;
    append?: boolean;
  }) => {
    const response = await api.get('/community/posts', { params: { page, limit } });
    return { ...response.data, append };
  }
);

// New action specifically for loading more posts
export const loadMorePosts = createAsyncThunk(
  'community/loadMorePosts',
  async (_, { getState }) => {
    const state = getState() as { community: CommunityState };
    const nextPage = state.community.currentPage + 1;

    const response = await api.get('/community/posts', {
      params: { page: nextPage, limit: 20 }
    });

    return { ...response.data, page: nextPage, append: true };
  }
);

// Updated createPost - removed isAnnouncement
export const createPost = createAsyncThunk(
  'community/createPost',
  async ({ content, mediaUrls = [] }: {
    content: string;
    mediaUrls?: string[];
  }) => {
    const response = await api.post('/community/posts', { content, mediaUrls });
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
    } catch (error) {
      return rejectWithValue((error as any).response?.data?.error || 'Failed to edit post');
    }
  }
);

export const deletePost = createAsyncThunk(
  'community/deletePost',
  async (postId: string, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/community/posts/${postId}`);
      return { postId, ...response.data };
    } catch (error) {
      return rejectWithValue((error as any).response?.data?.error || 'Failed to delete post');
    }
  }
);

// Comment actions - Updated to use community endpoints
export const fetchComments = createAsyncThunk(
  'community/fetchComments',
  async ({ postId, page = 1, limit = 20, includeReplies = true }: {
    postId: string;
    page?: number;
    limit?: number;
    includeReplies?: boolean;
  }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/community/posts/${postId}/comments`, {
        params: { page, limit, includeReplies }
      });

      if (response.data.success) {
        return { postId, ...response.data.data };
      } else {
        throw new Error(response.data.message || 'Failed to fetch comments');
      }
    } catch (error) {
      return rejectWithValue((error as any).response?.data?.message || (error as any).message || 'Failed to fetch comments');
    }
  }
);

export const createComment = createAsyncThunk(
  'community/createComment',
  async ({ postId, data }: { postId: string; data: CreateCommentData }, { rejectWithValue, getState }) => {
    try {
      const response = await api.post(`/community/posts/${postId}/comments`, data);

      if (response.data.success) {
        const comment = response.data.data;

        // Get current user info from state for optimistic UI updates
        const state = getState() as any;
        const currentUserId = state.auth.user?.id;
        const userProfile = state.dashboard.data?.user;

        // Ensure the comment has author info for immediate display
        const commentWithAuthor = {
          ...comment,
          author: comment.author || {
            userId: currentUserId,
            name: userProfile?.name || userProfile?.email?.split('@')[0] || 'You',
            email: userProfile?.email || '',
            avatar: userProfile?.profilePhoto || '',
            level: userProfile?.level || 1
          }
        };

        return { postId, comment: commentWithAuthor };
      } else {
        throw new Error(response.data.message || 'Failed to create comment');
      }
    } catch (error) {
      return rejectWithValue((error as any).response?.data?.message || (error as any).message || 'Failed to create comment');
    }
  }
);

export const updateComment = createAsyncThunk(
  'community/updateComment',
  async ({ commentId, data }: { commentId: string; data: UpdateCommentData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/community/comments/${commentId}`, data);

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to update comment');
      }
    } catch (error) {
      return rejectWithValue((error as any).response?.data?.message || (error as any).message || 'Failed to update comment');
    }
  }
);

export const deleteComment = createAsyncThunk(
  'community/deleteComment',
  async ({ commentId, postId }: { commentId: string; postId: string }, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/community/comments/${commentId}`);

      if (response.data.success) {
        return { commentId, postId };
      } else {
        throw new Error(response.data.message || 'Failed to delete comment');
      }
    } catch (error) {
      return rejectWithValue((error as any).response?.data?.message || (error as any).message || 'Failed to delete comment');
    }
  }
);

export const fetchCommentCount = createAsyncThunk(
  'community/fetchCommentCount',
  async (postId: string, { rejectWithValue, getState }) => {
    try {
      const state = getState() as { community: CommunityState };
      const post = state.community.posts.find(p => p.id === postId);

      if (post?.commentsCount !== undefined) {
        return { postId, count: post.commentsCount };
      }

      const response = await api.get(`/community/posts/${postId}/comments/count`);

      if (response.data.success) {
        return { postId, count: response.data.data.count };
      } else {
        throw new Error(response.data.message || 'Failed to fetch comment count');
      }
    } catch (error) {
      return rejectWithValue((error as any).response?.data?.message || (error as any).message || 'Failed to fetch comment count');
    }
  }
);

// Helper functions for nested comment operations - FIXED VERSION
const findAndUpdateComment = (comments: Comment[], commentId: string, updatedComment: Comment): Comment[] => {
  return comments.map(comment => {
    if (comment.id === commentId) {
      return { ...updatedComment, isEditing: false, isDeleting: false };
    }
    if (comment.replies && comment.replies.length > 0) {
      return {
        ...comment,
        replies: findAndUpdateComment(comment.replies, commentId, updatedComment)
      };
    }
    return comment;
  });
};

const findAndDeleteComment = (comments: Comment[], commentId: string): Comment[] => {
  return comments
    .filter(comment => comment.id !== commentId)
    .map(comment => ({
      ...comment,
      replies: comment.replies ? findAndDeleteComment(comment.replies, commentId) : undefined
    }));
};

const findAndAddReply = (comments: Comment[], parentId: string, newReply: Comment): Comment[] => {
  return comments.map(comment => {
    if (comment.id === parentId) {
      return {
        ...comment,
        replies: [...(comment.replies || []), newReply]
      };
    }
    if (comment.replies && comment.replies.length > 0) {
      return {
        ...comment,
        replies: findAndAddReply(comment.replies, parentId, newReply)
      };
    }
    return comment;
  });
};

const markCommentAsEditing = (comments: Comment[], commentId: string, isEditing: boolean = true): Comment[] => {
  return comments.map(comment => {
    if (comment.id === commentId) {
      return { ...comment, isEditing, isDeleting: false };
    }
    if (comment.replies) {
      return {
        ...comment,
        replies: markCommentAsEditing(comment.replies, commentId, isEditing)
      };
    }
    return comment;
  });
};

const markCommentAsDeleting = (comments: Comment[], commentId: string, isDeleting: boolean = true): Comment[] => {
  return comments.map(comment => {
    if (comment.id === commentId) {
      return { ...comment, isDeleting, isEditing: false };
    }
    if (comment.replies) {
      return {
        ...comment,
        replies: markCommentAsDeleting(comment.replies, commentId, isDeleting)
      };
    }
    return comment;
  });
};

const countAllComments = (comments: Comment[]): number => {
  let count = comments.length;
  comments.forEach(comment => {
    if (comment.replies && comment.replies.length > 0) {
      count += countAllComments(comment.replies);
    }
  });
  return count;
};

const resetCommentStates = (comments: Comment[]): Comment[] => {
  return comments.map(comment => ({
    ...comment,
    isEditing: false,
    isDeleting: false,
    replies: comment.replies ? resetCommentStates(comment.replies) : undefined
  }));
};

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
      state.commentError = null;
    },
    resetPosts: (state) => {
      state.posts = [];
      state.currentPage = 1;
      state.hasMorePosts = true;
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
    toggleCommentsSection: (state, action) => {
      const postIndex = state.posts.findIndex(p => p.id === action.payload);
      if (postIndex !== -1) {
        if (!state.posts[postIndex].comments) {
          state.posts[postIndex].comments = [];
          state.posts[postIndex].commentsPage = 1;
          state.posts[postIndex].commentsHasMore = false;
        }
      }
    },
    startEditComment: (state, action) => {
      const { postId, commentId } = action.payload;
      const postIndex = state.posts.findIndex(p => p.id === postId);
      if (postIndex !== -1 && state.posts[postIndex].comments) {
        state.posts[postIndex].comments = markCommentAsEditing(
          state.posts[postIndex].comments!,
          commentId,
          true
        );
      }
    },
    startDeleteComment: (state, action) => {
      const { postId, commentId } = action.payload;
      const postIndex = state.posts.findIndex(p => p.id === postId);
      if (postIndex !== -1 && state.posts[postIndex].comments) {
        state.posts[postIndex].comments = markCommentAsDeleting(
          state.posts[postIndex].comments!,
          commentId,
          true
        );
      }
    },
    resetCommentLoadingStates: (state) => {
      state.posts.forEach(post => {
        if (post.comments) {
          post.comments = resetCommentStates(post.comments);
        }
      });
    },
  },
  extraReducers: (builder) => {
    builder
      // Posts - Modified to handle both initial load and infinite scroll
      .addCase(fetchPosts.pending, (state, action) => {
        const page = action.meta.arg.page ?? 1;
        const append = action.meta.arg.append ?? false;

        if (append || page > 1) {
          state.loadingMore = true;
        } else {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.loadingMore = false;

        const page = action.meta.arg.page ?? 1;
        const append = action.meta.arg.append ?? false;

        if (append || page > 1) {
          const newPosts = action.payload.posts.filter(
            (newPost: Post) => !state.posts.find(existing => existing.id === newPost.id)
          );
          state.posts = [...state.posts, ...newPosts];
        } else {
          state.posts = action.payload.posts;
        }

        state.totalPosts = action.payload.total;
        state.currentPage = action.payload.page;

        const totalLoadedPosts = state.posts.length;
        state.hasMorePosts = totalLoadedPosts < state.totalPosts;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = action.error.message || 'Failed to fetch posts';
      })

      // Load More Posts
      .addCase(loadMorePosts.pending, (state) => {
        state.loadingMore = true;
        state.error = null;
      })
      .addCase(loadMorePosts.fulfilled, (state, action) => {
        state.loadingMore = false;

        const newPosts = action.payload.posts.filter(
          (newPost: Post) => !state.posts.find(existing => existing.id === newPost.id)
        );
        state.posts = [...state.posts, ...newPosts];

        state.totalPosts = action.payload.total;
        state.currentPage = action.payload.page;

        const totalLoadedPosts = state.posts.length;
        state.hasMorePosts = totalLoadedPosts < state.totalPosts;
      })
      .addCase(loadMorePosts.rejected, (state, action) => {
        state.loadingMore = false;
        state.error = action.error.message || 'Failed to load more posts';
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
      })

      // Comments (same as before)
      .addCase(fetchComments.pending, (state, action) => {
        const postIndex = state.posts.findIndex(p => p.id === action.meta.arg.postId);
        if (postIndex !== -1) {
          state.posts[postIndex].commentsLoading = true;
        }
        state.commentError = null;
      })
      .addCase(fetchComments.fulfilled, (state, action) => {
        const postIndex = state.posts.findIndex(p => p.id === action.payload.postId);
        if (postIndex !== -1) {
          const { comments, pagination } = action.payload;

          state.posts[postIndex].commentsInitialized = true;
          state.posts[postIndex].commentsLoading = false;

          if (pagination.page === 1) {
            state.posts[postIndex].comments = comments;
          } else {
            state.posts[postIndex].comments = [
              ...(state.posts[postIndex].comments || []),
              ...comments
            ];
          }

          state.posts[postIndex].commentsPage = pagination.page;
          state.posts[postIndex].commentsHasMore = pagination.hasNextPage;

          if (pagination.totalWithReplies !== undefined) {
            state.posts[postIndex].commentsCount = pagination.totalWithReplies;
          } else if (pagination.total !== undefined) {
            state.posts[postIndex].commentsCount = pagination.total;
          }
        }
      })
      .addCase(fetchComments.rejected, (state, action) => {
        const postIndex = state.posts.findIndex(p => p.id === action.meta.arg.postId);
        if (postIndex !== -1) {
          state.posts[postIndex].commentsLoading = false;
          state.posts[postIndex].commentsInitialized = true;
        }
        state.commentError = action.payload as string;
      })
      .addCase(createComment.pending, (state, action) => {
        state.commentError = null;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        const postIndex = state.posts.findIndex(p => p.id === action.payload.postId);
        if (postIndex !== -1) {
          if (!state.posts[postIndex].comments) {
            state.posts[postIndex].comments = [];
          }

          state.posts[postIndex].commentsInitialized = true;

          const newComment = action.payload.comment;

          if (newComment.parentCommentId) {
            state.posts[postIndex].comments = findAndAddReply(
              state.posts[postIndex].comments!,
              newComment.parentCommentId,
              newComment
            );
          } else {
            state.posts[postIndex].comments!.unshift(newComment);
          }

          const totalComments = countAllComments(state.posts[postIndex].comments!);
          state.posts[postIndex].commentsCount = totalComments;
        }
      })
      .addCase(createComment.rejected, (state, action) => {
        state.commentError = action.payload as string;
      })
      .addCase(updateComment.pending, (state, action) => {
        for (const post of state.posts) {
          if (post.comments) {
            post.comments = markCommentAsEditing(post.comments, action.meta.arg.commentId, true);
          }
        }
        state.commentError = null;
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        for (const post of state.posts) {
          if (post.comments) {
            post.comments = findAndUpdateComment(post.comments, action.payload.id, action.payload);
          }
        }
        state.commentError = null;
      })
      .addCase(updateComment.rejected, (state, action) => {
        for (const post of state.posts) {
          if (post.comments) {
            post.comments = markCommentAsEditing(post.comments, action.meta.arg.commentId, false);
          }
        }
        state.commentError = action.payload as string;
      })
      .addCase(deleteComment.pending, (state, action) => {
        const { postId, commentId } = action.meta.arg;
        const postIndex = state.posts.findIndex(p => p.id === postId);
        if (postIndex !== -1 && state.posts[postIndex].comments) {
          state.posts[postIndex].comments = markCommentAsDeleting(
            state.posts[postIndex].comments!,
            commentId,
            true
          );
        }
        state.commentError = null;
      })
      .addCase(deleteComment.fulfilled, (state, action) => {
        const postIndex = state.posts.findIndex(p => p.id === action.payload.postId);
        if (postIndex !== -1 && state.posts[postIndex].comments) {

          const beforeCount = countAllComments(state.posts[postIndex].comments!);

          state.posts[postIndex].comments = findAndDeleteComment(
            state.posts[postIndex].comments!,
            action.payload.commentId
          );

          const afterCount = countAllComments(state.posts[postIndex].comments!);

          const deletedCount = beforeCount - afterCount;
          state.posts[postIndex].commentsCount = Math.max(
            0,
            (state.posts[postIndex].commentsCount || 0) - deletedCount
          );
        }
        state.commentError = null;
      })
      .addCase(deleteComment.rejected, (state, action) => {
        const { postId, commentId } = action.meta.arg;
        const postIndex = state.posts.findIndex(p => p.id === postId);
        if (postIndex !== -1 && state.posts[postIndex].comments) {
          state.posts[postIndex].comments = markCommentAsDeleting(
            state.posts[postIndex].comments!,
            commentId,
            false
          );
        }
        state.commentError = action.payload as string;
      })
      .addCase(fetchCommentCount.fulfilled, (state, action) => {
        const postIndex = state.posts.findIndex(p => p.id === action.payload.postId);
        if (postIndex !== -1) {
          state.posts[postIndex].commentsCount = action.payload.count;
        }
      })
      .addCase(fetchCommentCount.rejected, (state, action) => {
        console.error('Failed to fetch comment count:', action.payload);
      });
  },
});

export const {
  setCurrentPage,
  clearError,
  resetPosts,
  startEditPost,
  startDeletePost,
  updatePostContent,
  toggleCommentsSection,
  startEditComment,
  startDeleteComment,
  resetCommentLoadingStates
} = communitySlice.actions;

export default communitySlice.reducer;