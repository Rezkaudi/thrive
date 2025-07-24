// frontend/src/store/slices/dashboardSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboardService, DashboardData } from '../../services/dashboardService';

interface DashboardState {
    data: DashboardData | null;
    loading: boolean;
    error: string | null;
    lastFetched: string | null;
}

const initialState: DashboardState = {
    data: null,
    loading: false,
    error: null,
    lastFetched: null,
};

export const fetchDashboardData = createAsyncThunk(
    'dashboard/fetchData',
    async () => {
        const response = await dashboardService.getDashboardData();
        return response;
    }
);

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        updateStats: (state, action) => {
            if (state.data) {
                state.data.stats = { ...state.data.stats, ...action.payload };
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboardData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDashboardData.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
                state.lastFetched = new Date().toISOString();
            })
            .addCase(fetchDashboardData.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch dashboard data';
            });
    },
});

export const { clearError, updateStats } = dashboardSlice.actions;
export default dashboardSlice.reducer;