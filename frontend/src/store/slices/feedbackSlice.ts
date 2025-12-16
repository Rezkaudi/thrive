import { createSlice, createAsyncThunk, PayloadAction, createAction } from '@reduxjs/toolkit';
import { feedbackService, Feedback } from '../../services/feedbackService';
import api from '../../services/api';
import { Comment, CreateCommentData, UpdateCommentData } from '../../services/commentService';
import { RootState } from '../store'; // Import RootState to type getState

interface FeedbackState {
  feedback: Feedback[];
  totalFeedback: number;
  currentPage: number;
  loading: boolean;
  loadingMore: boolean;
  hasMoreFeedback: boolean;
  error: string | null;
  editError: string | null;
  deleteError: string | null;
  commentError: string | null;
}

const initialState: FeedbackState = {
  feedback: [],
  totalFeedback: 0,
  currentPage: 1,
  loading: false,
  loadingMore: false,
  hasMoreFeedback: true,
  error: null,
  editError: null,
  deleteError: null,
  commentError: null,
};

// Async thunks for feedback operations
export const fetchFeedback = createAsyncThunk(
  'feedback/fetchFeedback',
  async ({ page = 1, limit = 20, append = false }: {
    page?: number;
    limit?: number;
    append?: boolean;
  }) => {
    const response = await feedbackService.getFeedback(page, limit);
    return { ...response, append };
  }
);

export const loadMoreFeedback = createAsyncThunk(
  'feedback/loadMoreFeedback',
  async (_, { getState }) => {
    const state = getState() as RootState; // Use RootState
    const nextPage = state.feedback.currentPage + 1;

    const response = await feedbackService.getFeedback(nextPage, 20);
    return { ...response, page: nextPage, append: true };
  }
);

export const createFeedback = createAsyncThunk(
  'feedback/createFeedback',
  async ({ content, mediaUrls = [] }: {
    content: string;
    mediaUrls?: string[];
  }) => {
    return await feedbackService.createFeedback({ content, mediaUrls });
  }
);

export const toggleFeedbackLike = createAsyncThunk(
  'feedback/toggleLike',
  async (feedbackId: string) => {
    const response = await feedbackService.toggleLike(feedbackId);
    return { feedbackId, ...response };
  }
);

export const editFeedback = createAsyncThunk(
  'feedback/editFeedback',
  async ({ feedbackId, content, mediaUrls }: {
    feedbackId: string;
    content: string;
    mediaUrls?: string[];
  }, { rejectWithValue }) => {
    try {
      const response = await feedbackService.updateFeedback(feedbackId, { content, mediaUrls });
      return {
        feedbackId,
        updatedFeedback: response,
        content,
        mediaUrls: mediaUrls || [],
      };
    } catch (error) {
      return rejectWithValue((error as any).message || 'Failed to edit feedback');
    }
  }
);

export const deleteFeedback = createAsyncThunk(
  'feedback/deleteFeedback',
  async (feedbackId: string, { rejectWithValue }) => {
    try {
      const response = await feedbackService.deleteFeedback(feedbackId);
      return { feedbackId, ...response };
    } catch (error) {
      return rejectWithValue((error as any).message || 'Failed to delete feedback');
    }
  }
);

// Comment actions for feedback
export const fetchFeedbackComments = createAsyncThunk(
  'feedback/fetchComments',
  async ({ feedbackId, page = 1, limit = 20, includeReplies = true }: {
    feedbackId: string;
    page?: number;
    limit?: number;
    includeReplies?: boolean;
  }, { rejectWithValue }) => {
    try {
      const response = await feedbackService.getCommentsByFeedback(feedbackId, page, limit, includeReplies);
      return { feedbackId, ...response };
    } catch (error) {
      return rejectWithValue((error as any).message || 'Failed to fetch comments');
    }
  }
);

export const createFeedbackComment = createAsyncThunk(
  'feedback/createComment',
  async ({ feedbackId, data }: { feedbackId: string; data: CreateCommentData }, { rejectWithValue, getState }) => {
    try {
      const response = await feedbackService.createComment(feedbackId, data);

      const state = getState() as RootState;
      const currentUserId = state.auth.user?.id;
      const userProfile = state.dashboard.data?.user;

      const commentWithAuthor = {
        ...response,
        author: response.author || {
          userId: currentUserId,
          name: userProfile?.name || userProfile?.email?.split('@')[0] || 'You',
          email: userProfile?.email || '',
          avatar: userProfile?.profilePhoto || '',
          level: userProfile?.level || 1
        }
      };

      return { feedbackId, comment: commentWithAuthor };
    } catch (error) {
      return rejectWithValue((error as any).message || 'Failed to create comment');
    }
  }
);

export const updateFeedbackComment = createAsyncThunk(
  'feedback/updateComment',
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

export const deleteFeedbackComment = createAsyncThunk(
  'feedback/deleteComment',
  async ({ commentId, feedbackId }: { commentId: string; feedbackId: string }, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/community/comments/${commentId}`);
      
      if (response.data.success) {
        return { commentId, feedbackId };
      } else {
        throw new Error(response.data.message || 'Failed to delete comment');
      }
    } catch (error) {
      return rejectWithValue((error as any).response?.data?.message || (error as any).message || 'Failed to delete comment');
    }
  }
);

export const fetchFeedbackCommentCount = createAsyncThunk(
  'feedback/fetchCommentCount',
  async (feedbackId: string, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const feedbackItem = state.feedback.feedback.find(f => f.id === feedbackId);

      if (feedbackItem?.commentsCount !== undefined) {
        return { feedbackId, count: feedbackItem.commentsCount };
      }

      const response = await feedbackService.getCommentCount(feedbackId);
      return { feedbackId, count: response.count };
    } catch (error) {
      return rejectWithValue((error as any).message || 'Failed to fetch comment count');
    }
  }
);

// New Reducer actions for optimistic UI updates
export const startEditFeedbackComment = createAction<{ feedbackId: string; commentId: string }>('feedback/startEditComment');
export const startDeleteFeedbackComment = createAction<{ feedbackId: string; commentId: string }>('feedback/startDeleteComment');


// Helper functions for nested comment operations (reusing from community slice)
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

const feedbackSlice = createSlice({
  name: 'feedback',
  initialState,
  reducers: {
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    clearError: (state) => {
      state.error = null;
      state.editError = null;
      state.deleteError = null;
      state.commentError = null;
    },
    resetFeedback: (state) => {
      state.feedback = [];
      state.currentPage = 1;
      state.hasMoreFeedback = true;
    },
    startEditFeedback: (state, action: PayloadAction<string>) => {
      const feedbackIndex = state.feedback.findIndex(f => f.id === action.payload);
      if (feedbackIndex !== -1) {
        state.feedback[feedbackIndex].isEditing = true;
      }
    },
    startDeleteFeedback: (state, action: PayloadAction<string>) => {
      const feedbackIndex = state.feedback.findIndex(f => f.id === action.payload);
      if (feedbackIndex !== -1) {
        state.feedback[feedbackIndex].isDeleting = true;
      }
    },
    updateFeedbackContent: (state, action) => {
      const { feedbackId, content, mediaUrls } = action.payload;
      const feedbackIndex = state.feedback.findIndex(f => f.id === feedbackId);
      if (feedbackIndex !== -1) {
        state.feedback[feedbackIndex].content = content;
        if (mediaUrls !== undefined) {
          state.feedback[feedbackIndex].mediaUrls = mediaUrls;
        }
      }
    },
    toggleFeedbackCommentsSection: (state, action) => {
      const feedbackIndex = state.feedback.findIndex(f => f.id === action.payload);
      if (feedbackIndex !== -1) {
        if (!state.feedback[feedbackIndex].comments) {
          state.feedback[feedbackIndex].comments = [];
          state.feedback[feedbackIndex].commentsPage = 1;
          state.feedback[feedbackIndex].commentsHasMore = false;
        }
      }
    },
    resetFeedbackCommentLoadingStates: (state) => {
      state.feedback.forEach(feedbackItem => {
        if (feedbackItem.comments) {
          feedbackItem.comments = resetCommentStates(feedbackItem.comments);
        }
      });
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch feedback
      .addCase(fetchFeedback.pending, (state, action) => {
        const page = action.meta.arg.page ?? 1;
        const append = action.meta.arg.append ?? false;

        if (append || page > 1) {
          state.loadingMore = true;
        } else {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchFeedback.fulfilled, (state, action) => {
        state.loading = false;
        state.loadingMore = false;

        const page = action.meta.arg.page ?? 1;
        const append = action.meta.arg.append ?? false;

        if (append || page > 1) {
          const newFeedback = action.payload.feedback.filter(
            (newItem: Feedback) => !state.feedback.find(existing => existing.id === newItem.id)
          );
          state.feedback = [...state.feedback, ...newFeedback];
        } else {
          state.feedback = action.payload.feedback;
        }

        state.totalFeedback = action.payload.pagination.total;
        state.currentPage = action.payload.pagination.page;

        const totalLoadedFeedback = state.feedback.length;
        state.hasMoreFeedback = totalLoadedFeedback < state.totalFeedback;
      })
      .addCase(fetchFeedback.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = action.error.message || 'Failed to fetch feedback';
      })

      // Load more feedback
      .addCase(loadMoreFeedback.pending, (state) => {
        state.loadingMore = true;
        state.error = null;
      })
      .addCase(loadMoreFeedback.fulfilled, (state, action) => {
        state.loadingMore = false;

        const newFeedback = action.payload.feedback.filter(
          (newItem: Feedback) => !state.feedback.find(existing => existing.id === newItem.id)
        );
        state.feedback = [...state.feedback, ...newFeedback];

        state.totalFeedback = action.payload.pagination.total;
        state.currentPage = action.payload.page;

        const totalLoadedFeedback = state.feedback.length;
        state.hasMoreFeedback = totalLoadedFeedback < state.totalFeedback;
      })
      .addCase(loadMoreFeedback.rejected, (state, action) => {
        state.loadingMore = false;
        state.error = action.error.message || 'Failed to load more feedback';
      })

      // Create feedback
      .addCase(createFeedback.fulfilled, (state, action) => {
        state.feedback.unshift(action.payload);
        state.totalFeedback++;
      })

      // Toggle like
      .addCase(toggleFeedbackLike.fulfilled, (state, action) => {
        const feedbackIndex = state.feedback.findIndex(f => f.id === action.payload.feedbackId);
        if (feedbackIndex !== -1) {
          state.feedback[feedbackIndex].likesCount = action.payload.likesCount;
          state.feedback[feedbackIndex].isLiked = action.payload.isLiked;
        }
      })

      // Edit feedback
      .addCase(editFeedback.pending, (state, action) => {
        const feedbackIndex = state.feedback.findIndex(f => f.id === action.meta.arg.feedbackId);
        if (feedbackIndex !== -1) {
          state.feedback[feedbackIndex].isEditing = true;
        }
        state.editError = null;
      })
      .addCase(editFeedback.fulfilled, (state, action) => {
        const feedbackIndex = state.feedback.findIndex(f => f.id === action.payload.feedbackId);
        if (feedbackIndex !== -1) {
          const updatedFeedback = {
            ...state.feedback[feedbackIndex],
            content: action.payload.content,
            mediaUrls: action.payload.mediaUrls,
            isEditing: false,
          };

          if (action.payload.updatedFeedback) {
            Object.assign(updatedFeedback, action.payload.updatedFeedback);
          }

          state.feedback[feedbackIndex] = updatedFeedback;
        }
        state.editError = null;
      })
      .addCase(editFeedback.rejected, (state, action) => {
        const feedbackIndex = state.feedback.findIndex(f => f.id === action.meta.arg.feedbackId);
        if (feedbackIndex !== -1) {
          state.feedback[feedbackIndex].isEditing = false;
        }
        state.editError = action.payload as string;
      })

      // Delete feedback
      .addCase(deleteFeedback.pending, (state, action) => {
        const feedbackIndex = state.feedback.findIndex(f => f.id === action.meta.arg);
        if (feedbackIndex !== -1) {
          state.feedback[feedbackIndex].isDeleting = true;
        }
        state.deleteError = null;
      })
      .addCase(deleteFeedback.fulfilled, (state, action) => {
        state.feedback = state.feedback.filter(feedbackItem => feedbackItem.id !== action.payload.feedbackId);
        state.totalFeedback = Math.max(0, state.totalFeedback - 1);
        state.deleteError = null;
      })
      .addCase(deleteFeedback.rejected, (state, action) => {
        const feedbackIndex = state.feedback.findIndex(f => f.id === action.meta.arg);
        if (feedbackIndex !== -1) {
          state.feedback[feedbackIndex].isDeleting = false;
        }
        state.deleteError = action.payload as string;
      })
      
      // Comments (similar to community slice)
      .addCase(fetchFeedbackComments.pending, (state, action) => {
        const feedbackIndex = state.feedback.findIndex(f => f.id === action.meta.arg.feedbackId);
        if (feedbackIndex !== -1) {
          state.feedback[feedbackIndex].commentsLoading = true;
        }
        state.commentError = null;
      })
      .addCase(fetchFeedbackComments.fulfilled, (state, action) => {
        const feedbackIndex = state.feedback.findIndex(f => f.id === action.payload.feedbackId);
        if (feedbackIndex !== -1) {
          const { comments, pagination } = action.payload;

          state.feedback[feedbackIndex].commentsInitialized = true;
          state.feedback[feedbackIndex].commentsLoading = false;

          if (pagination.page === 1) {
            state.feedback[feedbackIndex].comments = comments;
          } else {
            state.feedback[feedbackIndex].comments = [
              ...(state.feedback[feedbackIndex].comments || []),
              ...comments
            ];
          }

          state.feedback[feedbackIndex].commentsPage = pagination.page;
          state.feedback[feedbackIndex].commentsHasMore = pagination.hasNextPage;

          if (pagination.totalWithReplies !== undefined) {
            state.feedback[feedbackIndex].commentsCount = pagination.totalWithReplies;
          } else if (pagination.total !== undefined) {
            state.feedback[feedbackIndex].commentsCount = pagination.total;
          }
        }
      })
      .addCase(fetchFeedbackComments.rejected, (state, action) => {
        const feedbackIndex = state.feedback.findIndex(f => f.id === action.meta.arg.feedbackId);
        if (feedbackIndex !== -1) {
          state.feedback[feedbackIndex].commentsLoading = false;
          state.feedback[feedbackIndex].commentsInitialized = true;
        }
        state.commentError = action.payload as string;
      })

      // Create comment
      .addCase(createFeedbackComment.fulfilled, (state, action) => {
        const feedbackIndex = state.feedback.findIndex(f => f.id === action.payload.feedbackId);
        if (feedbackIndex !== -1) {
          if (!state.feedback[feedbackIndex].comments) {
            state.feedback[feedbackIndex].comments = [];
          }

          state.feedback[feedbackIndex].commentsInitialized = true;

          const newComment = action.payload.comment;

          if (newComment.parentCommentId) {
            state.feedback[feedbackIndex].comments = findAndAddReply(
              state.feedback[feedbackIndex].comments!,
              newComment.parentCommentId,
              newComment
            );
          } else {
            state.feedback[feedbackIndex].comments!.unshift(newComment);
          }

          const totalComments = countAllComments(state.feedback[feedbackIndex].comments!);
          state.feedback[feedbackIndex].commentsCount = totalComments;
        }
      })
      .addCase(createFeedbackComment.rejected, (state, action) => {
        state.commentError = action.payload as string;
      })

      // Update comment
      .addCase(updateFeedbackComment.pending, (state, action) => {
        for (const feedbackItem of state.feedback) {
          if (feedbackItem.comments) {
            feedbackItem.comments = markCommentAsEditing(feedbackItem.comments, action.meta.arg.commentId, true);
          }
        }
        state.commentError = null;
      })
      .addCase(updateFeedbackComment.fulfilled, (state, action) => {
        for (const feedbackItem of state.feedback) {
          if (feedbackItem.comments) {
            feedbackItem.comments = findAndUpdateComment(feedbackItem.comments, action.payload.id, action.payload);
          }
        }
        state.commentError = null;
      })
      .addCase(updateFeedbackComment.rejected, (state, action) => {
        for (const feedbackItem of state.feedback) {
          if (feedbackItem.comments) {
            feedbackItem.comments = markCommentAsEditing(feedbackItem.comments, action.meta.arg.commentId, false);
          }
        }
        state.commentError = action.payload as string;
      })

      // Delete comment
      .addCase(deleteFeedbackComment.pending, (state, action) => {
        const { feedbackId, commentId } = action.meta.arg;
        const feedbackIndex = state.feedback.findIndex(f => f.id === feedbackId);
        if (feedbackIndex !== -1 && state.feedback[feedbackIndex].comments) {
          state.feedback[feedbackIndex].comments = markCommentAsDeleting(
            state.feedback[feedbackIndex].comments!,
            commentId,
            true
          );
        }
        state.commentError = null;
      })
      .addCase(deleteFeedbackComment.fulfilled, (state, action) => {
        const feedbackIndex = state.feedback.findIndex(f => f.id === action.payload.feedbackId);
        if (feedbackIndex !== -1 && state.feedback[feedbackIndex].comments) {
          const beforeCount = countAllComments(state.feedback[feedbackIndex].comments!);

          state.feedback[feedbackIndex].comments = findAndDeleteComment(
            state.feedback[feedbackIndex].comments!,
            action.payload.commentId
          );

          const afterCount = countAllComments(state.feedback[feedbackIndex].comments!);
          const deletedCount = beforeCount - afterCount;
          state.feedback[feedbackIndex].commentsCount = Math.max(
            0,
            (state.feedback[feedbackIndex].commentsCount || 0) - deletedCount
          );
        }
        state.commentError = null;
      })
      .addCase(deleteFeedbackComment.rejected, (state, action) => {
        const { feedbackId, commentId } = action.meta.arg;
        const feedbackIndex = state.feedback.findIndex(f => f.id === feedbackId);
        if (feedbackIndex !== -1 && state.feedback[feedbackIndex].comments) {
          state.feedback[feedbackIndex].comments = markCommentAsDeleting(
            state.feedback[feedbackIndex].comments!,
            commentId,
            false
          );
        }
        state.commentError = action.payload as string;
      })
      
      // Comment count
      .addCase(fetchFeedbackCommentCount.fulfilled, (state, action) => {
        const feedbackIndex = state.feedback.findIndex(f => f.id === action.payload.feedbackId);
        if (feedbackIndex !== -1) {
          state.feedback[feedbackIndex].commentsCount = action.payload.count;
        }
      })
      .addCase(fetchFeedbackCommentCount.rejected, (state, action) => {
        // Error silently handled
      })
      // Add extra reducers to handle optimistic updates for comments
      .addCase(startEditFeedbackComment, (state, action) => {
        const { feedbackId, commentId } = action.payload;
        const feedbackItem = state.feedback.find(f => f.id === feedbackId);
        if (feedbackItem && feedbackItem.comments) {
          feedbackItem.comments = markCommentAsEditing(feedbackItem.comments, commentId);
        }
      })
      .addCase(startDeleteFeedbackComment, (state, action) => {
        const { feedbackId, commentId } = action.payload;
        const feedbackItem = state.feedback.find(f => f.id === feedbackId);
        if (feedbackItem && feedbackItem.comments) {
          feedbackItem.comments = markCommentAsDeleting(feedbackItem.comments, commentId);
        }
      });
  },
});

export const {
  setCurrentPage,
  clearError,
  resetFeedback,
  startEditFeedback,
  startDeleteFeedback,
  updateFeedbackContent,
  toggleFeedbackCommentsSection,
  resetFeedbackCommentLoadingStates
} = feedbackSlice.actions;

export default feedbackSlice.reducer;