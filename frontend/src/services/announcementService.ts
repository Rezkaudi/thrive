// frontend/src/services/announcementService.ts - Updated to use community routes
import api from './api';
import { Comment, CreateCommentData, UpdateCommentData } from './commentService';

export interface Announcement {
  id: string;
  author?: {
    userId: string;
    name: string;
    email: string;
    avatar: string;
    level: number;
  };
  content: string;
  likesCount: number;
  isLiked: boolean;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementsPaginatedResponse {
  announcements: Announcement[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CreateAnnouncementData {
  content: string;
}

export interface UpdateAnnouncementData {
  content: string;
}

export const announcementService = {
  // Announcement operations - Use announcement endpoints
  async getAnnouncements(page: number = 1, limit: number = 20): Promise<AnnouncementsPaginatedResponse> {
    const response = await api.get('/announcements', {
      params: { page, limit },
    });
    return response.data;
  },

  async getAnnouncementById(announcementId: string): Promise<Announcement> {
    const response = await api.get(`/announcements/${announcementId}`);
    return response.data;
  },

  async createAnnouncement(data: CreateAnnouncementData): Promise<Announcement> {
    const response = await api.post('/announcements', data);
    return response.data;
  },

  async updateAnnouncement(announcementId: string, data: UpdateAnnouncementData): Promise<Announcement> {
    const response = await api.put(`/announcements/${announcementId}`, data);
    return response.data.announcement || response.data;
  },

  async deleteAnnouncement(announcementId: string): Promise<{ message: string }> {
    const response = await api.delete(`/announcements/${announcementId}`);
    return response.data;
  },

  async toggleLike(announcementId: string): Promise<{ isLiked: boolean; likesCount: number }> {
    const response = await api.post(`/announcements/${announcementId}/toggle-like`);
    return response.data;
  },

  // CHANGED: Comment operations now use community routes
  async getComments(announcementId: string, page: number = 1, limit: number = 20, includeReplies: boolean = true) {
    const response = await api.get(`/community/posts/${announcementId}/comments`, {
      params: { page, limit, includeReplies },
    });
    return response.data;
  },

  async createComment(announcementId: string, data: { content: string; parentCommentId?: string }) {
    const response = await api.post(`/community/posts/${announcementId}/comments`, data);
    return response.data;
  },

  async getCommentCount(announcementId: string) {
    const response = await api.get(`/community/posts/${announcementId}/comments/count`);
    return response.data;
  },

  // CHANGED: Update comment using community route
  async updateComment(commentId: string, data: { content: string }) {
    const response = await api.put(`/community/comments/${commentId}`, data);
    return response.data;
  },

  async deleteComment(commentId: string): Promise<{ message: string }> {
    const response = await api.delete(`/community/comments/${commentId}`);
    return response.data;
  },

  // Validation helpers
  validateAnnouncementContent(content: string): { valid: boolean; error?: string } {
    if (!content.trim()) {
      return {
        valid: false,
        error: 'Announcement content is required',
      };
    }

    if (content.length > 5000) {
      return {
        valid: false,
        error: 'Announcement content must not exceed 5000 characters',
      };
    }

    return { valid: true };
  },
};