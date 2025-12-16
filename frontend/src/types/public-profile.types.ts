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
  courseProgress: ICourseProgress[];
}

export interface ICourseProgress {
  courseTitle: string;
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
}