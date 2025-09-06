import { createSlice, createAsyncThunk, PayloadAction, createAction } from '@reduxjs/toolkit';
import { announcementService, Announcement } from '../../services/announcementService';
import { Comment, CreateCommentData, UpdateCommentData } from '../../services/commentService';
import { RootState } from '../store'; // Import RootState for `getState`

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

// Async thunks for announcements
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

export const loadMoreAnnouncements = createAsyncThunk(
  'announcements/loadMoreAnnouncements',
  async (_, { getState }) => {
    const state = getState() as RootState;
    const nextPage = state.announcements.currentPage + 1;

    const response = await announcementService.getAnnouncements(nextPage, 20);
    return { ...response, page: nextPage, append: true };
  }
);

export const createAnnouncement = createAsyncThunk(
  'announcements/createAnnouncement',
  async ({ content }: { content: string }) => {
    const response = await announcementService.createAnnouncement({ content });
    return response;
  }
);

export const toggleAnnouncementLike = createAsyncThunk(
  'announcements/toggleLike',
  async (announcementId: string) => {
    const response = await announcementService.toggleLike(announcementId);
    return { announcementId, ...response };
  }
);

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

// Comment actions for announcements - Updated to work with community endpoints
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
        const state = getState() as RootState;
        const currentUserId = state.auth.user?.id;
        const userProfile = state.dashboard.data?.user;

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

export const updateAnnouncementComment = createAsyncThunk(
  'announcements/updateComment',
  async ({ commentId, announcementId, data }: { 
    commentId: string;
    announcementId: string; 
    data: UpdateCommentData 
  }, { rejectWithValue }) => {
    try {
      const response = await announcementService.updateComment(commentId, data);
      if (response.success) {
        return { 
          announcementId, // Include announcementId in return
          updatedComment: response.data 
        };
      }
      throw new Error(response.message || 'Failed to update comment');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update comment');
    }
  }
);

export const deleteAnnouncementComment = createAsyncThunk(
  'announcements/deleteComment',
  async ({ commentId, announcementId }: { commentId: string, announcementId: string }, { rejectWithValue, getState }) => {
    try {
      const response = await announcementService.deleteComment(commentId);
      
      // Get current comment count and calculate new count
      const state = getState() as RootState;
      const announcementIndex = state.announcements.announcements.findIndex(a => a.id === announcementId);
      let newCommentsCount = 0;
      
      if (announcementIndex !== -1) {
        const currentAnnouncement = state.announcements.announcements[announcementIndex];
        // Calculate new count by counting remaining comments after deletion
        const currentComments = (currentAnnouncement as any).comments || [];
        const commentsWithoutDeleted = findAndDeleteComment(currentComments, commentId);
        newCommentsCount = countAllComments(commentsWithoutDeleted);
      }

      return { 
        commentId, 
        announcementId, 
        newCommentsCount,
        message: response.message 
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to delete comment');
    }
  }
);

export const startEditAnnouncementComment = createAction<{ announcementId: string; commentId: string }>('announcements/startEditComment');
export const startDeleteAnnouncementComment = createAction<{ announcementId: string; commentId: string }>('announcements/startDeleteComment');


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


const announcementSlice = createSlice({
  name: 'announcements',
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
    resetAnnouncements: (state) => {
      state.announcements = [];
      state.currentPage = 1;
      state.hasMoreAnnouncements = true;
    },
    startEditAnnouncement: (state, action) => {
      const announcementIndex = state.announcements.findIndex(a => a.id === action.payload);
      if (announcementIndex !== -1) {
        (state.announcements[announcementIndex] as any).isEditing = true;
      }
    },
    startDeleteAnnouncement: (state, action) => {
      const announcementIndex = state.announcements.findIndex(a => a.id === action.payload);
      if (announcementIndex !== -1) {
        (state.announcements[announcementIndex] as any).isDeleting = true;
      }
    },
    toggleAnnouncementCommentsSection: (state, action) => {
      const announcementIndex = state.announcements.findIndex(a => a.id === action.payload);
      if (announcementIndex !== -1) {
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

      // Comments - Updated to work with community endpoints
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
      .addCase(updateAnnouncementComment.pending, (state, action) => {
        const announcementId = (action.meta.arg as any).announcementId;
        const commentId = (action.meta.arg as any).commentId;

        const announcementIndex = state.announcements.findIndex(a => a.id === announcementId);
        if (announcementIndex !== -1 && (state.announcements[announcementIndex] as any).comments) {
          (state.announcements[announcementIndex] as any).comments = markCommentAsEditing(
            (state.announcements[announcementIndex] as any).comments,
            commentId,
            true
          );
        }
      })
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
        const announcementId = (action.meta.arg as any).announcementId;
        const commentId = (action.meta.arg as any).commentId;

        const announcementIndex = state.announcements.findIndex(a => a.id === announcementId);
        if (announcementIndex !== -1 && (state.announcements[announcementIndex] as any).comments) {
          (state.announcements[announcementIndex] as any).comments = markCommentAsEditing(
            (state.announcements[announcementIndex] as any).comments,
            commentId,
            false
          );
        }
        state.commentError = action.payload as string;
      })

      // Handle delete announcement comment - Updated to calculate comment count locally
      .addCase(deleteAnnouncementComment.pending, (state, action) => {
        const { announcementId, commentId } = action.meta.arg;
        const announcementIndex = state.announcements.findIndex(a => a.id === announcementId);
        if (announcementIndex !== -1 && (state.announcements[announcementIndex] as any).comments) {
          (state.announcements[announcementIndex] as any).comments = markCommentAsDeleting(
            (state.announcements[announcementIndex] as any).comments!,
            commentId,
            true
          );
        }
        state.commentError = null;
      })
      .addCase(deleteAnnouncementComment.fulfilled, (state, action) => {
        const { commentId, announcementId, newCommentsCount } = action.payload;
        const announcementIndex = state.announcements.findIndex(a => a.id === announcementId);

        if (announcementIndex !== -1) {
          const announcement = state.announcements[announcementIndex];
          const updatedComments = findAndDeleteComment(
            (announcement as any).comments || [],
            commentId
          );
          (announcement as any).comments = updatedComments;
          announcement.commentsCount = newCommentsCount;
        }
      })
      .addCase(deleteAnnouncementComment.rejected, (state, action) => {
        const { announcementId, commentId } = action.meta.arg;
        const announcementIndex = state.announcements.findIndex(a => a.id === announcementId);
        if (announcementIndex !== -1 && (state.announcements[announcementIndex] as any).comments) {
          (state.announcements[announcementIndex] as any).comments = markCommentAsDeleting(
            (state.announcements[announcementIndex] as any).comments!,
            commentId,
            false
          );
        }
        state.commentError = action.payload as string;
      })

      // Handle the action creators for comment editing/deleting states
      .addCase(startEditAnnouncementComment, (state, action) => {
        const { announcementId, commentId } = action.payload;
        const announcementIndex = state.announcements.findIndex(a => a.id === announcementId);
        if (announcementIndex !== -1 && (state.announcements[announcementIndex] as any).comments) {
          (state.announcements[announcementIndex] as any).comments = markCommentAsEditing(
            (state.announcements[announcementIndex] as any).comments,
            commentId,
            true
          );
        }
      })
      .addCase(startDeleteAnnouncementComment, (state, action) => {
        const { announcementId, commentId } = action.payload;
        const announcementIndex = state.announcements.findIndex(a => a.id === announcementId);
        if (announcementIndex !== -1 && (state.announcements[announcementIndex] as any).comments) {
          (state.announcements[announcementIndex] as any).comments = markCommentAsDeleting(
            (state.announcements[announcementIndex] as any).comments,
            commentId,
            true
          );
        }
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