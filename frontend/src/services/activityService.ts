import api from './api';
import { RecentActivity } from './dashboardService';


export interface ActivityFilters {
    userId?: string;
    activityTypes?: string[];
    startDate?: string;
    endDate?: string;
}

export interface PaginatedActivities {
    activities: RecentActivity[];
    total: number;
    page: number;
    totalPages: number;
}

export const activityService = {
    async getMyActivities(limit: number = 10): Promise<{ activities: RecentActivity[] }> {
        const response = await api.get('/activities/my-activities', { params: { limit } });
        return response.data;
    },

    async getUserActivities(
        userId: string,
        page: number = 1,
        limit: number = 20,
        filters?: Partial<ActivityFilters>
    ): Promise<PaginatedActivities> {
        const params = {
            page,
            limit,
            ...filters,
            types: filters?.activityTypes?.join(','),
        };
        const response = await api.get(`/activities/user/${userId}`, { params });
        return response.data;
    },

    async getGlobalActivities(limit: number = 50): Promise<{ activities: RecentActivity[] }> {
        const response = await api.get('/activities/global', { params: { limit } });
        return response.data;
    },
};