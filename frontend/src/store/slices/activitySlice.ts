import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { activityService } from '../../services/activityService';
import { RecentActivity } from '../../services/dashboardService';

interface ActivityState {
    myActivities: RecentActivity[];
    userActivities: RecentActivity[];
    globalActivities: RecentActivity[];
    loading: boolean;
    error: string | null;
    pagination: {
        total: number;
        page: number;
        totalPages: number;
    };
}

const initialState: ActivityState = {
    myActivities: [],
    userActivities: [],
    globalActivities: [],
    loading: false,
    error: null,
    pagination: {
        total: 0,
        page: 1,
        totalPages: 0,
    },
};

export const fetchMyActivities = createAsyncThunk(
    'activity/fetchMyActivities',
    async (limit: number = 10) => {
        const response = await activityService.getMyActivities(limit);
        return response.activities;
    }
);

export const fetchUserActivities = createAsyncThunk(
    'activity/fetchUserActivities',
    async ({ userId, page = 1, limit = 20, filters }: {
        userId: string;
        page?: number;
        limit?: number;
        filters?: any;
    }) => {
        const response = await activityService.getUserActivities(userId, page, limit, filters);
        return response;
    }
);

export const fetchGlobalActivities = createAsyncThunk(
    'activity/fetchGlobalActivities',
    async (limit: number = 50) => {
        const response = await activityService.getGlobalActivities(limit);
        return response.activities;
    }
);

const activitySlice = createSlice({
    name: 'activity',
    initialState,
    reducers: {
        clearActivities: (state) => {
            state.myActivities = [];
            state.userActivities = [];
            state.globalActivities = [];
        },
    },
    extraReducers: (builder) => {
        builder
            // My Activities
            .addCase(fetchMyActivities.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyActivities.fulfilled, (state, action) => {
                state.loading = false;
                state.myActivities = action.payload;
            })
            .addCase(fetchMyActivities.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch activities';
            })
            // User Activities
            .addCase(fetchUserActivities.fulfilled, (state, action) => {
                state.userActivities = action.payload.activities;
                state.pagination = {
                    total: action.payload.total,
                    page: action.payload.page,
                    totalPages: action.payload.totalPages,
                };
            })
            // Global Activities
            .addCase(fetchGlobalActivities.fulfilled, (state, action) => {
                state.globalActivities = action.payload;
            });
    },
});

export const { clearActivities } = activitySlice.actions;
export default activitySlice.reducer;