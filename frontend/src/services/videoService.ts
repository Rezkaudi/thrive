// frontend/src/services/videoService.ts
import api from './api';

export enum VideoType {
  YOUTUBE = 'YOUTUBE',
  S3 = 'S3'
}

export interface Video {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  videoType: VideoType;
  thumbnailUrl?: string;
  duration?: number;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrUpdateVideoData {
  // title: string;
  description: string;
  videoUrl: string;
  videoType: VideoType;
  thumbnailUrl?: string;
  // duration?: number;
  isActive?: boolean;
}

export interface TourVideoStatus {
  hasSeenTour: boolean;
  shouldShowTour: boolean; // 🎯 TRUE = AUTO-SHOW MODAL
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const videoService = {
  // Admin video management
  async createOrUpdateVideo(data: CreateOrUpdateVideoData): Promise<ApiResponse<Video>> {
    const response = await api.post('/videos', data);
    return response.data;
  },

  async getVideo(): Promise<ApiResponse<Video | null>> {
    const response = await api.get('/videos');
    return response.data;
  },

  async deleteVideo(): Promise<ApiResponse<void>> {
    const response = await api.delete('/videos');
    return response.data;
  },

  async videoExists(): Promise<ApiResponse<{ exists: boolean }>> {
    const response = await api.get('/videos/exists');
    return response.data;
  },

  // 🎯 FIRST-TIME LOGIN METHODS
  async getTourVideo(): Promise<ApiResponse<Video | null>> {
    const response = await api.get('/videos/tour');
    return response.data;
  },

  async getTourVideoStatus(): Promise<ApiResponse<TourVideoStatus>> {
    const response = await api.get('/videos/tour/status');
    return response.data;
  },

  async markTourVideoViewed(): Promise<ApiResponse<void>> {
    const response = await api.post('/videos/tour/mark-viewed');
    return response.data;
  },

  // Utility methods
  extractYouTubeVideoId(url: string): string | null {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  },

  getYouTubeThumbnail(url: string): string | null {
    const videoId = this.extractYouTubeVideoId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
  },

  isValidVideoUrl(url: string, type: VideoType): boolean {
    try {
      const urlObj = new URL(url);
      
      if (type === VideoType.YOUTUBE) {
        return this.extractYouTubeVideoId(url) !== null;
      } else if (type === VideoType.S3) {
        return urlObj.hostname.includes('amazonaws.com') || urlObj.hostname.includes('s3');
      }
      
      return false;
    } catch {
      return false;
    }
  }
};