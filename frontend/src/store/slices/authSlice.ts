// frontend/src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';
import { subscriptionService } from '../../services/subscriptionService';

export interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  csrfToken: string | null;
  isAuthenticated: boolean;
  hasAccessToCourses: boolean;
  hasSubscription: boolean;
  status: string | null;
  currentPlan: string | null;
  isTrialing: boolean;
  // Free trial state (no credit card)
  isInFreeTrial: boolean;
  freeTrialExpired: boolean;
  freeTrialEndDate: Date | null;
  trialConvertedToPaid: boolean;
  loading: boolean;
  authChecking: boolean;
  paymentChecking: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  csrfToken: null,
  isAuthenticated: false,
  loading: true,
  hasAccessToCourses: false,
  hasSubscription: false,
  status: null,
  currentPlan: null,
  isTrialing: false,
  // Free trial state (no credit card)
  isInFreeTrial: false,
  freeTrialExpired: false,
  freeTrialEndDate: null,
  trialConvertedToPaid: false,
  authChecking: true,
  paymentChecking: true,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authService.login(email, password);
      return response;
    } catch (error: any) {
      const errorMsg = error?.response?.data?.error || 'Login failed';
      return rejectWithValue({ error: errorMsg });
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await authService.logout();
});

export const checkAuth = createAsyncThunk('auth/checkAuth', async () => {
  const response = await authService.checkAuth();
  return response;
});

export const refreshToken = createAsyncThunk('auth/refresh', async () => {
  const response = await authService.refresh();
  return response;
});

export const checkPayment = createAsyncThunk('subscriptions/check', async () => {
  const response = await subscriptionService.checkSubscriptionStatus();
  return response;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCSRFToken: (state, action) => {
      state.csrfToken = action.payload;
    },
    setAuthChecking: (state, action) => {
      state.authChecking = action.payload;
    },
    // Add this to update subscription status after upgrade/pay now
    updateSubscriptionStatus: (state, action) => {
      state.currentPlan = action.payload.currentPlan;
      state.isTrialing = action.payload.isTrialing;
      state.status = action.payload.status;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.csrfToken = action.payload.csrfToken;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as { error: string })?.error || 'Login failed';
      })
      // Logout
      .addCase(logout.pending, (state) => {
        state.authChecking = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.csrfToken = null;
        state.isAuthenticated = false;
        state.authChecking = false;
        state.currentPlan = null;
        state.isTrialing = false;
      })
      .addCase(logout.rejected, (state) => {
        state.authChecking = false;
        state.isAuthenticated = false;
        state.user = null;
      })
      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.authChecking = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.authChecking = false;
        if (action.payload.authenticated && action.payload.user) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
        } else {
          state.isAuthenticated = false;
          state.user = null;
        }
      })
      .addCase(checkAuth.rejected, (state) => {
        state.authChecking = false;
        state.isAuthenticated = false;
        state.user = null;
      })
      // Refresh Token
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.csrfToken = action.payload.csrfToken;
        state.user = action.payload.user;
      })
      // Check Subscription
      .addCase(checkPayment.pending, (state) => {
        state.paymentChecking = true;
        state.loading = true;
      })
      .addCase(checkPayment.fulfilled, (state, action) => {
        state.paymentChecking = false;
        state.loading = false;
        state.status = action.payload.status;
        state.hasAccessToCourses = action.payload.hasAccessToCourses;
        state.hasSubscription = action.payload.hasSubscription;
        state.currentPlan = action.payload.currentPlan;
        state.isTrialing = action.payload.isTrialing;
        // Free trial state (no credit card)
        state.isInFreeTrial = action.payload.isInFreeTrial || false;
        state.freeTrialExpired = action.payload.freeTrialExpired || false;
        state.freeTrialEndDate = action.payload.freeTrialEndDate || null;
        state.trialConvertedToPaid = action.payload.trialConvertedToPaid || false;
      })
      .addCase(checkPayment.rejected, (state) => {
        state.paymentChecking = false;
        state.loading = false;
        state.hasAccessToCourses = false;
        state.hasSubscription = false;
        state.currentPlan = null;
        state.isTrialing = false;
        state.isInFreeTrial = false;
        state.freeTrialExpired = false;
        state.freeTrialEndDate = null;
        state.trialConvertedToPaid = false;
      });
  },
});

export const { clearError, setCSRFToken, setAuthChecking, updateSubscriptionStatus } = authSlice.actions;
export default authSlice.reducer;