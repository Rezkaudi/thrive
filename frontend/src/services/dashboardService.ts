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

export interface RecentActivity {
    type: 'lesson_completed' | 'points_earned' | 'post_created' | 'session_booked';
    title: string;
    timestamp: string;
    metadata?: any;
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