// frontend/src/services/profileService.ts
import api from './api';

export interface Profile {
  id: string;
  userId: string;
  name: string;
  bio?: string;
  profilePhoto?: string;
  languageLevel?: string;
  points: number;
  badges: string[];
  level: number;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  name?: string;
  bio?: string;
  languageLevel?: string;
}

export const profileService = {
  // Get current user's profile
  async getMyProfile(): Promise<Profile> {
    const response = await api.get('/profile/me');
    return response.data;
  },

  // Update current user's profile
  async updateProfile(data: UpdateProfileData): Promise<Profile> {
    const response = await api.put('/profile/me', data);
    return response.data;
  },

  // Upload profile photo
  async uploadProfilePhoto(file: File): Promise<{ message: string; profilePhoto: string; profile: Profile }> {
    const formData = new FormData();
    formData.append('photo', file);
    
    const response = await api.post('/profile/me/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete profile photo
  async deleteProfilePhoto(): Promise<{ message: string; profile: Profile }> {
    const response = await api.delete('/profile/me/photo');
    return response.data;
  },

  // Get any user's public profile
  async getUserProfile(userId: string): Promise<Partial<Profile>> {
    const response = await api.get(`/profile/${userId}`);
    return response.data;
  },

  // Validate file before upload
  validateProfilePhoto(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.',
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File size exceeds 5MB limit.',
      };
    }

    return { valid: true };
  },
};