// File: frontend/src/services/sessionService.ts
import api from './api';

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

export interface PaginatedSessionsResponse {
  sessions: Session[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface CreateSessionData {
  title: string;
  description: string;
  type: 'SPEAKING' | 'EVENT';
  hostId?: string;
  meetingUrl?: string;
  location?: string;
  scheduledAt: string;
  duration: number;
  maxParticipants: number;
  pointsRequired: number;
  isActive: boolean;
  isRecurring?: boolean;
  recurringWeeks?: number;
}

export interface UpdateSessionData {
  title?: string;
  description?: string;
  type?: 'SPEAKING' | 'EVENT';
  hostId?: string;
  meetingUrl?: string;
  location?: string;
  scheduledAt?: string;
  duration?: number;
  maxParticipants?: number;
  pointsRequired?: number;
  isActive?: boolean;
  updateAllRecurring?: boolean;
}

export interface RecurringSessionDetails {
  session: Session;
  isRecurring: boolean;
  recurringDetails: {
    parentSession: Session;
    allSessions: Session[];
    totalSessions: number;
    currentSessionIndex: number;
  } | null;
}

export interface SessionFilters {
  type?: 'SPEAKING' | 'EVENT' | '';
  isActive?: 'true' | 'false' | '';
  isRecurring?: 'true' | 'false' | '';
}

export const sessionService = {
  // Get paginated sessions with filters
  async getSessionsPaginated(
    page: number = 1,
    limit: number = 10,
    filters: SessionFilters = {}
  ): Promise<PaginatedSessionsResponse> {
    const params: any = { page, limit };
    
    // Add filters if they are set
    if (filters.type) params.type = filters.type;
    if (filters.isActive) params.isActive = filters.isActive;
    if (filters.isRecurring) params.isRecurring = filters.isRecurring;
    
    const response = await api.get('/admin/sessions/paginated', { params });
    return response.data;
  },

  // Create session (single or recurring)
  async createSession(data: CreateSessionData): Promise<any> {
    const response = await api.post('/admin/sessions', data);
    return response.data;
  },

  // Update session
  async updateSession(sessionId: string, data: UpdateSessionData): Promise<Session> {
    const response = await api.put(`/admin/sessions/${sessionId}`, data);
    return response.data;
  },

  // Delete session
  async deleteSession(sessionId: string, deleteAllRecurring: boolean = false): Promise<any> {
    const params = deleteAllRecurring ? { deleteAllRecurring: 'true' } : {};
    const response = await api.delete(`/admin/sessions/${sessionId}`, { params });
    return response.data;
  },

  // Get session by ID
  async getSessionById(sessionId: string): Promise<Session> {
    const response = await api.get(`/sessions/${sessionId}`);
    return response.data;
  },

  // Get recurring session details
  async getRecurringSessionDetails(sessionId: string): Promise<RecurringSessionDetails> {
    const response = await api.get(`/admin/sessions/${sessionId}/recurring-details`);
    return response.data;
  },

  // Get upcoming sessions (for general use)
  async getUpcomingSessions(limit: number = 10): Promise<Session[]> {
    const response = await api.get('/sessions/upcoming', { params: { limit } });
    return response.data;
  },

  // Get all sessions with pagination (for general use)
  async getAllSessions(
    page: number = 1,
    limit: number = 20,
    filters: { type?: string; isActive?: boolean } = {}
  ): Promise<PaginatedSessionsResponse> {
    const params: any = { page, limit, ...filters };
    const response = await api.get('/sessions', { params });
    return {
      sessions: response.data.sessions,
      pagination: {
        total: response.data.total,
        page: response.data.page,
        limit: response.data.limit || limit,
        totalPages: response.data.totalPages,
        hasNextPage: response.data.hasNextPage,
        hasPrevPage: response.data.hasPrevPage,
      }
    };
  },

  // Get sessions by date range
  async getSessionsByDateRange(startDate: string, endDate: string): Promise<Session[]> {
    const response = await api.get('/sessions/range', { 
      params: { startDate, endDate } 
    });
    return response.data;
  },
};