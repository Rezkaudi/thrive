// frontend/src/store/slices/announcementSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { announcementService, Announcement } from '../../services/announcementService';
import { commentService, Comment, CreateCommentData, UpdateCommentData } from '../../services/commentService';

interface AnnouncementState {
  announcements: Announcement[];
  totalAnnouncements: number;
  currentPage: number;
  loading: boolean;
  loadingMore: boolean;
  hasMoreAnnouncements: boolean;
  error: string | null;
  editError: string | null;
  deleteError: string | null;
  commentError: string | null;
}

const initialState: AnnouncementState = {
  announcements: [],
  totalAnnouncements: 0,
  currentPage: 1,
  loading: false,
  loadingMore: false,
  hasMoreAnnouncements: true,
  error: null,
  editError: null,
  deleteError: null,
  commentError: null,
};

// Fetch announcements
export const fetchAnnouncements = createAsyncThunk(
  'announcements/fetchAnnouncements',
  async ({ page = 1, limit = 20, append = false }: {
    page?: number;
    limit?: number;
    append?: boolean;
  }) => {
    const response = await announcementService.getAnnouncements(page, limit);
    return { ...response, append };
  }
);

// Load more announcements
export const loadMoreAnnouncements = createAsyncThunk(
  'announcements/loadMoreAnnouncements',
  async (_, { getState }) => {
    const state = getState() as { announcements: AnnouncementState };
    const nextPage = state.announcements.currentPage + 1;

    const response = await announcementService.getAnnouncements(nextPage, 20);
    return { ...response, page: nextPage, append: true };
  }
);

// Create announcement (admin only)
export const createAnnouncement = createAsyncThunk(
  'announcements/createAnnouncement',
  async ({ content }: { content: string }) => {
    const response = await announcementService.createAnnouncement({ content });
    return response;
  }
);

// Toggle like
export const toggleAnnouncementLike = createAsyncThunk(
  'announcements/toggleLike',
  async (announcementId: string) => {
    const response = await announcementService.toggleLike(announcementId);
    return { announcementId, ...response };
  }
);

// Edit announcement
export const editAnnouncement = createAsyncThunk(
  'announcements/editAnnouncement',
  async ({ announcementId, content }: {
    announcementId: string;
    content: string;
  }, { rejectWithValue }) => {
    try {
      const response = await announcementService.updateAnnouncement(announcementId, { content });
      return {
        announcementId,
        updatedAnnouncement: response,
        content,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to edit announcement');
    }
  }
);

// Delete announcement
export const deleteAnnouncement = createAsyncThunk(
  'announcements/deleteAnnouncement',
  async (announcementId: string, { rejectWithValue }) => {
    try {
      const response = await announcementService.deleteAnnouncement(announcementId);
      return { announcementId, ...response };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete announcement');
    }
  }
);

// Comment actions for announcements
export const fetchAnnouncementComments = createAsyncThunk(
  'announcements/fetchComments',
  async ({ announcementId, page = 1, limit = 20, includeReplies = true }: {
    announcementId: string;
    page?: number;
    limit?: number;
    includeReplies?: boolean;
  }, { rejectWithValue }) => {
    try {
      const response = await announcementService.getComments(announcementId, page, limit, includeReplies);

      if (response.success) {
        return { announcementId, ...response.data };
      } else {
        throw new Error(response.message || 'Failed to fetch comments');
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch comments');
    }
  }
);

export const createAnnouncementComment = createAsyncThunk(
  'announcements/createComment',
  async ({ announcementId, data }: { announcementId: string; data: CreateCommentData }, { rejectWithValue, getState }) => {
    try {
      const response = await announcementService.createComment(announcementId, data);

      if (response.success) {
        const comment = response.data;

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

        return { announcementId, comment: commentWithAuthor };
      } else {
        throw new Error(response.message || 'Failed to create comment');
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create comment');
    }
  }
);

// New thunk for updating an announcement comment
export const updateAnnouncementComment = createAsyncThunk(
  'announcements/updateComment',
  async ({ commentId, data }: { commentId: string; data: UpdateCommentData }, { rejectWithValue }) => {
    try {
      const response = await announcementService.updateComment(commentId, data);
      if (response.success) {
        return { updatedComment: response.data };
      }
      throw new Error(response.message || 'Failed to update comment');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update comment');
    }
  }
);

// Updated async thunk for deleting a comment on an announcement
export const deleteAnnouncementComment = createAsyncThunk(
  'announcements/deleteComment',
  async ({ commentId, announcementId }: { commentId: string, announcementId: string }, { rejectWithValue }) => {
    try {
      // The API call returns the new total count
      const response = await announcementService.deleteComment(commentId);
      return { commentId, announcementId, newCommentsCount: response.newCommentsCount };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to delete comment');
    }
  }
);

// Helper functions for nested comment operations (same as community slice)
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

const countAllComments = (comments: Comment[]): number => {
  let count = comments.length;
  comments.forEach(comment => {
    if (comment.replies && comment.replies.length > 0) {
      count += countAllComments(comment.replies);
    }
  });
  return count;
};

const announcementSlice = createSlice({
  name: 'announcements',
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
    resetAnnouncements: (state) => {
      state.announcements = [];
      state.currentPage = 1;
      state.hasMoreAnnouncements = true;
    },
    startEditAnnouncement: (state, action) => {
      const announcementIndex = state.announcements.findIndex(a => a.id === action.payload);
      if (announcementIndex !== -1) {
        // Add isEditing property (extend the interface as needed)
        (state.announcements[announcementIndex] as any).isEditing = true;
      }
    },
    startDeleteAnnouncement: (state, action) => {
      const announcementIndex = state.announcements.findIndex(a => a.id === action.payload);
      if (announcementIndex !== -1) {
        // Add isDeleting property (extend the interface as needed)
        (state.announcements[announcementIndex] as any).isDeleting = true;
      }
    },
    toggleAnnouncementCommentsSection: (state, action) => {
      const announcementIndex = state.announcements.findIndex(a => a.id === action.payload);
      if (announcementIndex !== -1) {
        // Initialize comments if not present
        if (!(state.announcements[announcementIndex] as any).comments) {
          (state.announcements[announcementIndex] as any).comments = [];
          (state.announcements[announcementIndex] as any).commentsPage = 1;
          (state.announcements[announcementIndex] as any).commentsHasMore = false;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch announcements
      .addCase(fetchAnnouncements.pending, (state, action) => {
        const page = action.meta.arg.page ?? 1;
        const append = action.meta.arg.append ?? false;

        if (append || page > 1) {
          state.loadingMore = true;
        } else {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchAnnouncements.fulfilled, (state, action) => {
        state.loading = false;
        state.loadingMore = false;

        const page = action.meta.arg.page ?? 1;
        const append = action.meta.arg.append ?? false;

        if (append || page > 1) {
          const newAnnouncements = action.payload.announcements.filter(
            (newAnnouncement: Announcement) => !state.announcements.find(existing => existing.id === newAnnouncement.id)
          );
          state.announcements = [...state.announcements, ...newAnnouncements];
        } else {
          state.announcements = action.payload.announcements;
        }

        state.totalAnnouncements = action.payload.total;
        state.currentPage = action.payload.page;

        const totalLoadedAnnouncements = state.announcements.length;
        state.hasMoreAnnouncements = totalLoadedAnnouncements < state.totalAnnouncements;
      })
      .addCase(fetchAnnouncements.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = action.error.message || 'Failed to fetch announcements';
      })

      // Load more announcements
      .addCase(loadMoreAnnouncements.pending, (state) => {
        state.loadingMore = true;
        state.error = null;
      })
      .addCase(loadMoreAnnouncements.fulfilled, (state, action) => {
        state.loadingMore = false;

        const newAnnouncements = action.payload.announcements.filter(
          (newAnnouncement: Announcement) => !state.announcements.find(existing => existing.id === newAnnouncement.id)
        );
        state.announcements = [...state.announcements, ...newAnnouncements];

        state.totalAnnouncements = action.payload.total;
        state.currentPage = action.payload.page;

        const totalLoadedAnnouncements = state.announcements.length;
        state.hasMoreAnnouncements = totalLoadedAnnouncements < state.totalAnnouncements;
      })
      .addCase(loadMoreAnnouncements.rejected, (state, action) => {
        state.loadingMore = false;
        state.error = action.error.message || 'Failed to load more announcements';
      })

      // Create announcement
      .addCase(createAnnouncement.fulfilled, (state, action) => {
        state.announcements.unshift(action.payload);
        state.totalAnnouncements++;
      })

      // Toggle like
      .addCase(toggleAnnouncementLike.fulfilled, (state, action) => {
        const announcementIndex = state.announcements.findIndex(a => a.id === action.payload.announcementId);
        if (announcementIndex !== -1) {
          state.announcements[announcementIndex].likesCount = action.payload.likesCount;
          state.announcements[announcementIndex].isLiked = action.payload.isLiked;
        }
      })

      // Edit announcement
      .addCase(editAnnouncement.pending, (state, action) => {
        const announcementIndex = state.announcements.findIndex(a => a.id === action.meta.arg.announcementId);
        if (announcementIndex !== -1) {
          (state.announcements[announcementIndex] as any).isEditing = true;
        }
        state.editError = null;
      })
      .addCase(editAnnouncement.fulfilled, (state, action) => {
        const announcementIndex = state.announcements.findIndex(a => a.id === action.payload.announcementId);
        if (announcementIndex !== -1) {
          const updatedAnnouncement = {
            ...state.announcements[announcementIndex],
            content: action.payload.content,
            isEditing: false,
          };

          if (action.payload.updatedAnnouncement) {
            Object.assign(updatedAnnouncement, action.payload.updatedAnnouncement);
          }

          state.announcements[announcementIndex] = updatedAnnouncement;
        }
        state.editError = null;
      })
      .addCase(editAnnouncement.rejected, (state, action) => {
        const announcementIndex = state.announcements.findIndex(a => a.id === action.meta.arg.announcementId);
        if (announcementIndex !== -1) {
          (state.announcements[announcementIndex] as any).isEditing = false;
        }
        state.editError = action.payload as string;
      })

      // Delete announcement
      .addCase(deleteAnnouncement.pending, (state, action) => {
        const announcementIndex = state.announcements.findIndex(a => a.id === action.meta.arg);
        if (announcementIndex !== -1) {
          (state.announcements[announcementIndex] as any).isDeleting = true;
        }
        state.deleteError = null;
      })
      .addCase(deleteAnnouncement.fulfilled, (state, action) => {
        state.announcements = state.announcements.filter(announcement => announcement.id !== action.payload.announcementId);
        state.totalAnnouncements = Math.max(0, state.totalAnnouncements - 1);
        state.deleteError = null;
      })
      .addCase(deleteAnnouncement.rejected, (state, action) => {
        const announcementIndex = state.announcements.findIndex(a => a.id === action.meta.arg);
        if (announcementIndex !== -1) {
          (state.announcements[announcementIndex] as any).isDeleting = false;
        }
        state.deleteError = action.payload as string;
      })

      // Comments
      .addCase(fetchAnnouncementComments.pending, (state, action) => {
        const announcementIndex = state.announcements.findIndex(a => a.id === action.meta.arg.announcementId);
        if (announcementIndex !== -1) {
          (state.announcements[announcementIndex] as any).commentsLoading = true;
        }
        state.commentError = null;
      })
      .addCase(fetchAnnouncementComments.fulfilled, (state, action) => {
        const announcementIndex = state.announcements.findIndex(a => a.id === action.payload.announcementId);
        if (announcementIndex !== -1) {
          const { comments, pagination } = action.payload;

          // Mark as initialized and set comments
          (state.announcements[announcementIndex] as any).commentsInitialized = true;
          (state.announcements[announcementIndex] as any).commentsLoading = false;

          if (pagination.page === 1) {
            (state.announcements[announcementIndex] as any).comments = comments;
          } else {
            (state.announcements[announcementIndex] as any).comments = [
              ...((state.announcements[announcementIndex] as any).comments || []),
              ...comments
            ];
          }

          (state.announcements[announcementIndex] as any).commentsPage = pagination.page;
          (state.announcements[announcementIndex] as any).commentsHasMore = pagination.hasNextPage;

          if (pagination.totalWithReplies !== undefined) {
            state.announcements[announcementIndex].commentsCount = pagination.totalWithReplies;
          } else if (pagination.total !== undefined) {
            state.announcements[announcementIndex].commentsCount = pagination.total;
          }
        }
      })
      .addCase(fetchAnnouncementComments.rejected, (state, action) => {
        const announcementIndex = state.announcements.findIndex(a => a.id === action.meta.arg.announcementId);
        if (announcementIndex !== -1) {
          (state.announcements[announcementIndex] as any).commentsLoading = false;
          (state.announcements[announcementIndex] as any).commentsInitialized = true;
        }
        state.commentError = action.payload as string;
      })

      // Create comment
      .addCase(createAnnouncementComment.fulfilled, (state, action) => {
        const announcementIndex = state.announcements.findIndex(a => a.id === action.payload.announcementId);
        if (announcementIndex !== -1) {
          if (!(state.announcements[announcementIndex] as any).comments) {
            (state.announcements[announcementIndex] as any).comments = [];
          }

          (state.announcements[announcementIndex] as any).commentsInitialized = true;

          const newComment = action.payload.comment;

          if (newComment.parentCommentId) {
            (state.announcements[announcementIndex] as any).comments = findAndAddReply(
              (state.announcements[announcementIndex] as any).comments!,
              newComment.parentCommentId,
              newComment
            );
          } else {
            (state.announcements[announcementIndex] as any).comments!.unshift(newComment);
          }

          const totalComments = countAllComments((state.announcements[announcementIndex] as any).comments!);
          state.announcements[announcementIndex].commentsCount = totalComments;
        }
      })
      .addCase(createAnnouncementComment.rejected, (state, action) => {
        state.commentError = action.payload as string;
      })

      // Handle update announcement comment
      .addCase(updateAnnouncementComment.fulfilled, (state, action) => {
        const { updatedComment } = action.payload;
        for (const announcement of state.announcements) {
          if ((announcement as any).comments) {
            (announcement as any).comments = findAndUpdateComment(
              (announcement as any).comments,
              updatedComment.id,
              updatedComment
            );
          }
        }
      })
      .addCase(updateAnnouncementComment.rejected, (state, action) => {
        state.commentError = action.payload as string;
      })

      // Handle delete announcement comment
      .addCase(deleteAnnouncementComment.fulfilled, (state, action) => {
        const { commentId, announcementId, newCommentsCount } = action.payload;
        const announcementIndex = state.announcements.findIndex(a => a.id === announcementId);

        if (announcementIndex !== -1) {
          const announcement = state.announcements[announcementIndex];
          // Remove the comment from the local state
          const updatedComments = findAndDeleteComment(
            (announcement as any).comments || [],
            commentId
          );
          (announcement as any).comments = updatedComments;

          // Update the comment count with the correct value from the backend
          announcement.commentsCount = newCommentsCount;
        }
      })
      .addCase(deleteAnnouncementComment.rejected, (state, action) => {
        state.commentError = action.payload as string;
      });
  },
});

export const {
  setCurrentPage,
  clearError,
  resetAnnouncements,
  startEditAnnouncement,
  startDeleteAnnouncement,
  toggleAnnouncementCommentsSection,
} = announcementSlice.actions;

export default announcementSlice.reducer;