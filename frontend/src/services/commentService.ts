import api from './api';

export interface Comment {
  id: string;
  userId: string;
  postId: string;
  content: string;
  parentCommentId?: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    userId: string;
    name: string;
    email: string;
    avatar: string;
    level?: number;
  };
  replies?: Comment[];
  isEditing?: boolean;
  isDeleting?: boolean;
}

export interface CommentsPaginatedResponse {
  comments: Comment[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface CreateCommentData {
  content: string;
  parentCommentId?: string;
}

export interface UpdateCommentData {
  content: string;
}

export const commentService = {
  // Get comments for a post with pagination
  async getCommentsByPost(
    postId: string,
    page: number = 1,
    limit: number = 20,
    includeReplies: boolean = true
  ): Promise<CommentsPaginatedResponse> {
    try {
      const response = await api.get(`/community/posts/${postId}/comments`, {
        params: { page, limit, includeReplies }
      });
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch comments');
      }
    } catch (error) {
      throw error;
    }
  },

  // Create a new comment
  async createComment(postId: string, data: CreateCommentData): Promise<Comment> {
    try {
      const response = await api.post(`/community/posts/${postId}/comments`, data);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to create comment');
      }
    } catch (error) {
      throw error;
    }
  },

  // Get a specific comment by ID
  async getCommentById(commentId: string): Promise<Comment> {
    try {
      const response = await api.get(`/community/comments/${commentId}`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch comment');
      }
    } catch (error) {
      throw error;
    }
  },

  // Update a comment
  async updateComment(commentId: string, data: UpdateCommentData): Promise<Comment> {
    try {
      const response = await api.put(`/community/comments/${commentId}`, data);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to update comment');
      }
    } catch (error) {
      throw error;
    }
  },

  // Delete a comment
  async deleteComment(commentId: string): Promise<void> {
    try {
      const response = await api.delete(`/community/comments/${commentId}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete comment');
      }
    } catch (error) {
      throw error;
    }
  },

  // Get replies for a comment
  async getReplies(commentId: string): Promise<Comment[]> {
    try {
      const response = await api.get(`/community/comments/${commentId}/replies`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch replies');
      }
    } catch (error) {
      throw error;
    }
  },

  // Get comment count for a post
  async getCommentCount(postId: string): Promise<{ count: number }> {
    try {
      const response = await api.get(`/community/posts/${postId}/comments/count`);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch comment count');
      }
    } catch (error) {
      throw error;
    }
  },
};