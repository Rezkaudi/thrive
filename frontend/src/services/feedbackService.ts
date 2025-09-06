// frontend/src/services/feedbackService.ts
import api from './api';

export interface Feedback {
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
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
  isEditing?: boolean;
  isDeleting?: boolean;
  // UI state properties for comments (similar to Post interface)
  comments?: any[];
  commentsLoading?: boolean;
  commentsPage?: number;
  commentsHasMore?: boolean;
  commentsInitialized?: boolean;
}

export interface FeedbackPaginatedResponse {
  feedback: Feedback[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface CreateFeedbackData {
  content: string;
  mediaUrls?: string[];
}

export interface UpdateFeedbackData {
  content: string;
  mediaUrls?: string[];
  removedMediaUrls?: string[];
}

export interface UploadedMediaFile {
  url: string;
  size: number;
  mimeType: string;
}

export interface MediaUploadResponse {
  message: string;
  files: UploadedMediaFile[];
}

export const feedbackService = {
  // Media upload/delete (reusing community endpoints as they're generic)
  async uploadMedia(files: File[]): Promise<MediaUploadResponse> {
    if (!files || files.length === 0) {
      throw new Error('No files provided for upload');
    }

    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append('media', file, file.name);
    });

    const response = await api.post('/feedback/upload-media', formData, {
      headers: {
        'Content-Type': undefined,
      },
    });
    return response.data;
  },

  async deleteMedia(mediaUrls: string[]): Promise<{ message: string }> {
    const response = await api.delete('/feedback/delete-media', {
      data: { mediaUrls },
    });
    return response.data;
  },

  // Feedback CRUD operations
  async getFeedback(page: number = 1, limit: number = 20): Promise<FeedbackPaginatedResponse> {
    try {
      const response = await api.get('/feedback', {
        params: { page, limit },
      });
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch feedback');
      }
    } catch (error: any) {
      console.error('Error fetching feedback:', error);
      throw error;
    }
  },

  async getFeedbackById(feedbackId: string): Promise<Feedback> {
    try {
      const response = await api.get(`/feedback/${feedbackId}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch feedback');
      }
    } catch (error: any) {
      console.error('Error fetching feedback:', error);
      throw error;
    }
  },

  async createFeedback(data: CreateFeedbackData): Promise<Feedback> {
    try {
      const response = await api.post('/feedback', data);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to create feedback');
      }
    } catch (error: any) {
      console.error('Error creating feedback:', error);
      throw error;
    }
  },

  async updateFeedback(feedbackId: string, data: UpdateFeedbackData): Promise<Feedback> {
    try {
      const response = await api.put(`/feedback/${feedbackId}`, data);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to update feedback');
      }
    } catch (error: any) {
      console.error('Error updating feedback:', error);
      throw error;
    }
  },

  async deleteFeedback(feedbackId: string): Promise<{ message: string }> {
    try {
      const response = await api.delete(`/feedback/${feedbackId}`);
      
      if (response.data.success) {
        return { message: response.data.message };
      } else {
        throw new Error(response.data.message || 'Failed to delete feedback');
      }
    } catch (error: any) {
      console.error('Error deleting feedback:', error);
      throw error;
    }
  },

  async toggleLike(feedbackId: string): Promise<{ isLiked: boolean; likesCount: number }> {
    try {
      const response = await api.post(`/feedback/${feedbackId}/toggle-like`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to toggle like');
      }
    } catch (error: any) {
      console.error('Error toggling like:', error);
      throw error;
    }
  },

  // Comments operations (using feedback endpoints)
  async getCommentsByFeedback(
    feedbackId: string,
    page: number = 1,
    limit: number = 20,
    includeReplies: boolean = true
  ): Promise<any> {
    try {
      const response = await api.get(`/feedback/${feedbackId}/comments`, {
        params: { page, limit, includeReplies }
      });
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch comments');
      }
    } catch (error: any) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  },

  async createComment(feedbackId: string, data: any): Promise<any> {
    try {
      const response = await api.post(`/feedback/${feedbackId}/comments`, data);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to create comment');
      }
    } catch (error: any) {
      console.error('Error creating comment:', error);
      throw error;
    }
  },

  async getCommentCount(feedbackId: string): Promise<{ count: number; topLevelCount: number; repliesCount: number }> {
    try {
      const response = await api.get(`/feedback/${feedbackId}/comments/count`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch comment count');
      }
    } catch (error: any) {
      console.error('Error fetching comment count:', error);
      throw error;
    }
  },

  // Validation helpers (similar to communityService)
  validateMediaFile(file: File): { valid: boolean; error?: string } {
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm'];
    const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes];

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file type: ${file.type}. Allowed types: ${allowedTypes.join(', ')}`,
      };
    }

    const maxImageSize = 10 * 1024 * 1024; // 10MB
    const maxVideoSize = 100 * 1024 * 1024; // 100MB
    const maxSize = file.type.startsWith('image/') ? maxImageSize : maxVideoSize;

    if (file.size > maxSize) {
      const maxSizeLabel = file.type.startsWith('image/') ? '10MB' : '100MB';
      return {
        valid: false,
        error: `File size exceeds ${maxSizeLabel}`,
      };
    }

    return { valid: true };
  },

  validateFeedbackContent(content: string, mediaUrls: string[] = []): { valid: boolean; error?: string } {
    if (!content.trim() && mediaUrls.length === 0) {
      return {
        valid: false,
        error: 'Feedback must have content or media',
      };
    }

    if (content.length > 2000) {
      return {
        valid: false,
        error: 'Feedback content must not exceed 2000 characters',
      };
    }

    if (mediaUrls.length > 10) {
      return {
        valid: false,
        error: 'Maximum 10 media files allowed per feedback',
      };
    }

    return { valid: true };
  },
};