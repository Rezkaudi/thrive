import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export interface Session {
  id: string;
  title: string;
  description: string;
  type: 'SPEAKING' | 'EVENT';
  hostId: string;
  hostName?: string;
  meetingUrl?: string;
  location?: string;
  scheduledAt: string;
  duration: number;
  maxParticipants: number;
  currentParticipants: number;
  pointsRequired: number;
  isActive: boolean;
  isRecurring: boolean;
  recurringParentId?: string;
  recurringWeeks?: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface DeleteOption {
  value: string;
  label: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  recommended?: boolean;
}

export interface DeleteSessionResult {
  success: boolean;
  message: string;
  deletedCount: number;
  newParentId?: string;
  remainingInSeries?: number;
  deletedParentAndPromoted?: boolean;
  deletedRecurringSeries?: boolean;
  deletedFromSeries?: boolean;
}

export interface RecurringSessionDetails {
  session: Session;
  isRecurring: boolean;
  recurringDetails?: {
    parentSession: Session;
    allSessions: Session[];
    totalSessions: number;
    childrenCount: number;
    currentSessionIndex: number;
    canPromoteChild: boolean;
    nextInLine?: Session;
  };
  seriesInfo?: {
    isRecurring: boolean;
    isParent: boolean;
    parentId?: string;
    childrenCount: number;
    totalInSeries: number;
  };
}

interface SessionState {
  sessions: Session[];
  pagination: PaginationInfo;
  filters: {
    type: string;
    isActive: string;
    isRecurring: string;
  };
  loading: boolean;
  error: string | null;
  
  // Session operations
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  
  // Delete-specific state
  deleteOptions: DeleteOption[];
  deleteOptionsLoading: boolean;
  recurringDetails: RecurringSessionDetails | null;
  
  // Form state
  sessionForm: {
    title: string;
    description: string;
    type: 'SPEAKING' | 'EVENT';
    meetingUrl: string;
    location: string;
    scheduledAt: Date;
    duration: number;
    maxParticipants: number;
    pointsRequired: number;
    isActive: boolean;
    isRecurring: boolean;
    recurringWeeks: number;
    updateAllRecurring: boolean;
  };
}

const initialState: SessionState = {
  sessions: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
  filters: {
    type: '',
    isActive: '',
    isRecurring: '',
  },
  loading: false,
  error: null,
  creating: false,
  updating: false,
  deleting: false,
  deleteOptions: [],
  deleteOptionsLoading: false,
  recurringDetails: null,
  sessionForm: {
    title: '',
    description: '',
    type: 'SPEAKING',
    meetingUrl: '',
    location: '',
    scheduledAt: new Date(),
    duration: 30,
    maxParticipants: 8,
    pointsRequired: 0,
    isActive: true,
    isRecurring: false,
    recurringWeeks: 4,
    updateAllRecurring: false,
  },
};

// Async thunks
export const fetchSessions = createAsyncThunk(
  'session/fetchSessions',
  async (params: {
    page?: number;
    limit?: number;
    type?: string;
    isActive?: string;
    isRecurring?: string;
  }) => {
    const response = await api.get('/admin/sessions/paginated', { params });
    return response.data;
  }
);

export const createSession = createAsyncThunk(
  'session/createSession',
  async (sessionData: any, { rejectWithValue }) => {
    try {
      const response = await api.post('/admin/sessions', sessionData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create session');
    }
  }
);

export const updateSession = createAsyncThunk(
  'session/updateSession',
  async ({ sessionId, sessionData }: { sessionId: string; sessionData: any }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/admin/sessions/${sessionId}`, sessionData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update session');
    }
  }
);

export const fetchDeleteOptions = createAsyncThunk(
  'session/fetchDeleteOptions',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/admin/sessions/${sessionId}/delete-options`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch delete options');
    }
  }
);

export const deleteSession = createAsyncThunk(
  'session/deleteSession',
  async ({ sessionId, deleteOption }: { sessionId: string; deleteOption: string }, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/admin/sessions/${sessionId}`, {
        data: { deleteOption } // Send deleteOption in request body
      });
      return { sessionId, ...response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete session');
    }
  }
);

export const fetchRecurringDetails = createAsyncThunk(
  'session/fetchRecurringDetails',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/admin/sessions/${sessionId}/recurring-details`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch recurring details');
    }
  }
);

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    setLimit: (state, action) => {
      state.pagination.limit = action.payload;
      state.pagination.page = 1; // Reset to first page when changing limit
    },
    setFilter: (state, action) => {
      const { filterName, value } = action.payload;
      state.filters[filterName as keyof typeof state.filters] = value;
      state.pagination.page = 1; // Reset to first page when filtering
    },
    clearFilters: (state) => {
      state.filters = {
        type: '',
        isActive: '',
        isRecurring: '',
      };
      state.pagination.page = 1;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetForm: (state) => {
      state.sessionForm = {
        title: '',
        description: '',
        type: 'SPEAKING',
        meetingUrl: '',
        location: '',
        scheduledAt: new Date(),
        duration: 30,
        maxParticipants: 8,
        pointsRequired: 0,
        isActive: true,
        isRecurring: false,
        recurringWeeks: 4,
        updateAllRecurring: false,
      };
    },
    updateForm: (state, action) => {
      state.sessionForm = { ...state.sessionForm, ...action.payload };
    },
    setFormFromSession: (state, action) => {
      const session = action.payload;
      state.sessionForm = {
        title: session.title,
        description: session.description,
        type: session.type,
        meetingUrl: session.meetingUrl || '',
        location: session.location || '',
        scheduledAt: new Date(session.scheduledAt),
        duration: session.duration,
        maxParticipants: session.maxParticipants,
        pointsRequired: session.pointsRequired,
        isActive: session.isActive,
        isRecurring: session.isRecurring,
        recurringWeeks: session.recurringWeeks || 4,
        updateAllRecurring: false,
      };
    },
    clearDeleteOptions: (state) => {
      state.deleteOptions = [];
      state.recurringDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch sessions
      .addCase(fetchSessions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.loading = false;
        state.sessions = action.payload.sessions || [];
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch sessions';
      })
      
      // Create session
      .addCase(createSession.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createSession.fulfilled, (state, action) => {
        state.creating = false;
        // If single session created, add to list
        if (action.payload.id) {
          state.sessions.unshift(action.payload);
          state.pagination.total++;
        }
        // If multiple sessions created (recurring), refresh the list
        // (We'll need to fetch again to see all new sessions)
      })
      .addCase(createSession.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload as string;
      })
      
      // Update session
      .addCase(updateSession.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateSession.fulfilled, (state, action) => {
        state.updating = false;
        // Update the session in the list if it exists
        const sessionIndex = state.sessions.findIndex(s => s.id === action.payload.id);
        if (sessionIndex !== -1) {
          state.sessions[sessionIndex] = action.payload;
        }
      })
      .addCase(updateSession.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      })
      
      // Fetch delete options
      .addCase(fetchDeleteOptions.pending, (state) => {
        state.deleteOptionsLoading = true;
        state.error = null;
      })
      .addCase(fetchDeleteOptions.fulfilled, (state, action) => {
        state.deleteOptionsLoading = false;
        state.deleteOptions = action.payload.availableOptions || [];
        state.recurringDetails = action.payload;
      })
      .addCase(fetchDeleteOptions.rejected, (state, action) => {
        state.deleteOptionsLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete session
      .addCase(deleteSession.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteSession.fulfilled, (state, action) => {
        state.deleting = false;
        
        const { sessionId, deletedCount, deletedRecurringSeries } = action.payload;
        
        if (deletedRecurringSeries) {
          // Remove all sessions in the series (we'll need to refresh to see the changes)
          // For now, remove the main session
          state.sessions = state.sessions.filter(s => s.id !== sessionId);
          state.pagination.total = Math.max(0, state.pagination.total - deletedCount);
        } else {
          // Remove single session
          state.sessions = state.sessions.filter(s => s.id !== sessionId);
          state.pagination.total = Math.max(0, state.pagination.total - 1);
        }
        
        // Clear delete-related state
        state.deleteOptions = [];
        state.recurringDetails = null;
      })
      .addCase(deleteSession.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload as string;
      })
      
      // Fetch recurring details
      .addCase(fetchRecurringDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecurringDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.recurringDetails = action.payload;
      })
      .addCase(fetchRecurringDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setPage,
  setLimit,
  setFilter,
  clearFilters,
  clearError,
  resetForm,
  updateForm,
  setFormFromSession,
  clearDeleteOptions,
} = sessionSlice.actions;

export default sessionSlice.reducer;