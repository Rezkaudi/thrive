// frontend/src/services/communityService.ts
import api from './api';

export interface Post {
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
  updatedAt: string;
}

export interface PostsPaginatedResponse {
  posts: Post[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CreatePostData {
  content: string;
  mediaUrls?: string[];
  isAnnouncement?: boolean;
}

export interface UpdatePostData {
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

export const communityService = {
  // Media upload/delete
  async uploadMedia(files: File[]): Promise<MediaUploadResponse> {
    if (!files || files.length === 0) {
      throw new Error('No files provided for upload');
    }

    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append('media', file, file.name); // Explicitly pass filename
    });


    const response = await api.post('/community/upload-media', formData, {
      headers: {
        // Explicitly remove Content-Type to let axios set it
        'Content-Type': undefined,
      },
    });
    return response.data;
  },

  async deleteMedia(mediaUrls: string[]): Promise<{ message: string }> {
    const response = await api.delete('/community/delete-media', {
      data: { mediaUrls },
    });
    return response.data;
  },

  // Post operations
  async getPosts(page: number = 1, limit: number = 20): Promise<PostsPaginatedResponse> {
    const response = await api.get('/community/posts', {
      params: { page, limit },
    });
    return response.data;
  },

  async createPost(data: CreatePostData): Promise<Post> {
    const response = await api.post('/community/posts', data);
    return response.data;
  },

  async updatePost(postId: string, data: UpdatePostData): Promise<Post> {
    const response = await api.put(`/community/posts/${postId}`, data);
    return response.data.post || response.data;
  },

  async deletePost(postId: string): Promise<{ message: string }> {
    const response = await api.delete(`/community/posts/${postId}`);
    return response.data;
  },

  async toggleLike(postId: string): Promise<{ isLiked: boolean; likesCount: number }> {
    const response = await api.post(`/community/posts/${postId}/toggle-like`);
    return response.data;
  },

  // Validation helpers
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

  validatePostContent(content: string, mediaUrls: string[] = []): { valid: boolean; error?: string } {
    if (!content.trim() && mediaUrls.length === 0) {
      return {
        valid: false,
        error: 'Post must have content or media',
      };
    }

    if (content.length > 5000) {
      return {
        valid: false,
        error: 'Post content must not exceed 5000 characters',
      };
    }

    if (mediaUrls.length > 10) {
      return {
        valid: false,
        error: 'Maximum 10 media files allowed per post',
      };
    }

    return { valid: true };
  },
};