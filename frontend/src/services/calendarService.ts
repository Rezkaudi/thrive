import api from './api';
import { format } from 'date-fns';

export interface CalendarSession {
  id: string;
  title: string;
  type: 'SPEAKING' | 'EVENT' | 'STANDARD' | 'PREMIUM';
  hostId: string;
  hostName?: string;
  scheduledAt: string;
  duration: number;
  maxParticipants: number;
  currentParticipants: number;
  pointsRequired: number;
  meetingUrl?: string;
  location?: string;
  description: string;
  isBooked?: boolean;
  canBook?: boolean;
}

export interface Booking {
  id: string;
  userId: string;
  sessionId: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  createdAt: string;
  session?: CalendarSession;
}

/**
 * Subscription Plan Type
 */
export type SubscriptionPlan = 'monthly' | 'yearly' | 'standard' | 'premium';

/**
 * Booking Eligibility Response
 * Contains comprehensive information about whether a user can book a session
 * and their current booking limits based on subscription plan.
 */
export interface BookingEligibility {
  canBook: boolean;
  reasons: string[];
  session: {
    id: string;
    title: string;
    type: string;
    pointsRequired: number;
    spotsAvailable: number;
  };
  user: {
    points: number;
    activeBookings: number;
    // Plan information
    plan: SubscriptionPlan | null;
    hasActiveSubscription: boolean;
    // Active booking limits
    maxActiveBookings: number;
    activeBookingsRemaining: number;
    // Monthly limits (for Standard plan)
    monthlyBookingCount: number;
    monthlyBookingLimit: number | null;
    remainingMonthlyBookings: number | null;
    currentMonth: string;
  };
  // Validation details
  validation: {
    meetsMinimumNotice: boolean;
    hoursUntilSession: number;
    canAccessSessionType: boolean;
    isAlreadyBooked: boolean;
  };
}

/**
 * Booking Limits Information
 * Returned by the /bookings/limits endpoint
 */
export interface BookingLimits {
  userPlan: SubscriptionPlan | null;
  hasActiveSubscription: boolean;
  activeBookingsCount: number;
  maxActiveBookings: number;
  activeBookingsRemaining: number;
  monthlyBookingCount: number;
  monthlyBookingLimit: number | null;
  remainingMonthlyBookings: number | null;
  currentMonth: string;
}

/**
 * Booking Error Response from API
 */
export interface BookingErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    reasons: string[];
  };
}

export const calendarService = {
  async getCalendarSessions(year: number, month: number, view: 'month' | 'week' = 'month') {
    const response = await api.get('/calendar/sessions', {
      params: { year, month, view },
    });
    return response.data;
  },

  async getSessionsByDay(date: Date) {
    const dateStr = format(date, 'yyyy-MM-dd');
    const response = await api.get(`/calendar/sessions/day/${dateStr}`);
    return response.data;
  },

  async checkBookingEligibility(sessionId: string): Promise<BookingEligibility> {
    const response = await api.get(`/calendar/sessions/${sessionId}/eligibility`);
    return response.data;
  },

  async createBooking(sessionId: string) {
    const response = await api.post('/bookings', { sessionId });
    return response.data;
  },

  async cancelBooking(bookingId: string) {
    const response = await api.delete(`/bookings/${bookingId}`);
    return response.data;
  },

  async getUpcomingBookings(): Promise<Booking[]> {
    const response = await api.get('/calendar/bookings/upcoming');
    return response.data;
  },

  async getSessionAttendees(sessionId: string) {
    const response = await api.get(`/calendar/sessions/${sessionId}/attendees`);
    return response.data;
  },

  /**
   * Get current booking limits for the user
   * Useful for displaying limits in the UI
   */
  async getBookingLimits(): Promise<BookingLimits> {
    const response = await api.get('/bookings/limits');
    return response.data.data;
  },
};