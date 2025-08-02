// frontend/src/services/dashboardService.ts
import api from './api';

export interface DashboardStats {
    totalLessonsCompleted: number;
    totalLessonsAvailable: number;
    totalPoints: number;
    communityPostsCount: number;
    upcomingSessionsCount: number;
}

export interface CourseProgress {
    courseId: string;
    courseTitle: string;
    totalLessons: number;
    completedLessons: number;
    progressPercentage: number;
}

export enum ActivityType {
    USER_REGISTERED = 'USER_REGISTERED',
    LESSON_COMPLETED = 'LESSON_COMPLETED',
    POST_CREATED = 'POST_CREATED',
    SESSION_BOOKED = 'SESSION_BOOKED',
    SESSION_ATTENDED = 'SESSION_ATTENDED',
    COURSE_COMPLETED = 'COURSE_COMPLETED',
    ACHIEVEMENT_EARNED = 'ACHIEVEMENT_EARNED',
    POINTS_EARNED = 'POINTS_EARNED',
    LEVEL_UP = 'LEVEL_UP',
    PROFILE_UPDATED = 'PROFILE_UPDATED'
}

export interface RecentActivity {
    id: string;
    userId: string;
    activityType: string;
    title: string;
    description?: string;
    metadata?: Record<string, any>;
    createdAt: string;
    user?: {
        id: string;
        email: string;
        name: string;
        profilePhoto?: string;
        level: number;
    };
}



export interface Achievement {
    id: string;
    badge: string;
    title: string;
    earnedAt: string;
}

export interface UpcomingSession {
    id: string;
    title: string;
    scheduledAt: string;
    type: string;
}

export interface DashboardData {
    user: {
        id: string;
        email: string;
        role: string;
        name?: string;
        profilePhoto?: string;
        level: number;
        languageLevel?: string;
    };
    stats: DashboardStats;
    courseProgress: CourseProgress[];
    recentActivity: RecentActivity[];
    achievements: Achievement[];
    upcomingSessions: UpcomingSession[];
}

export const dashboardService = {
    async getDashboardData(): Promise<DashboardData> {
        const response = await api.get('/dashboard/data');
        return response.data;
    },
};