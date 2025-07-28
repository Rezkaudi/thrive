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

export interface PublicProfile {
  id: string;
  name: string;
  bio?: string;
  profilePhoto?: string;
  languageLevel?: string;
  level: number;
  badges: string[];
  createdAt: string;
  totalLessonsCompleted: number;
  totalLessonsAvailable: number;
  totalPoints: number;
  joinedDaysAgo: number;
  totalCourses: number;
  enrolledCourses: number;
  completedCourses: number;
  communityPosts: number;
  sessionsAttended: number;
  publicAchievements: Array<{
    id: string;
    title: string;
    icon: string;
    description: string;
    unlockedAt: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
  }>;
  learningStats: Array<{
    skill: string;
    level: number;
    color: string;
  }>;
  recentMilestones: Array<{
    title: string;
    date: string;
    type: 'lesson' | 'level' | 'achievement' | 'community' | 'course';
    details?: string;
  }>;
  courseProgress: Array<{
    courseTitle: string;
    totalLessons: number;
    completedLessons: number;
    progressPercentage: number;
  }>;
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

  // Get any user's public profile (old method for authenticated users)
  async getUserProfile(userId: string): Promise<Partial<Profile>> {
    const response = await api.get(`/profile/${userId}`);
    return response.data;
  },

  // Get public profile with full details (no authentication required)
  async getPublicProfile(userId: string): Promise<PublicProfile> {
    try {
      // Use the same API instance but make a direct call to the public endpoint
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/public/profile/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'omit', // Don't send cookies for public endpoints
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Profile not found');
        }
        throw new Error(`Failed to fetch profile: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error: any) {
      console.error('Error fetching public profile:', error);
      throw error;
    }
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