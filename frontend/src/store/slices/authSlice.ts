// frontend/src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  csrfToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  authChecking: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  csrfToken: null,
  isAuthenticated: false,
  loading: false,
  authChecking: true,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await authService.login(email, password);
      return response;
    } catch (error: any) {
      // Assuming the error response is like: { error: 'Account is inactive' }
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
        console.log(action)
        state.loading = false;
        state.error = (action.payload as { error: string })?.error || 'Login failed';
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.csrfToken = null;
        state.isAuthenticated = false;
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
      });
  },
});

export const { clearError, setCSRFToken, setAuthChecking } = authSlice.actions;
export default authSlice.reducer;