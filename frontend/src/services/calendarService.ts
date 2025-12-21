import api from './api';
import { format } from 'date-fns';

export interface CalendarSession {
  id: string;
  title: string;
  type: 'SPEAKING' | 'EVENT' | 'STANDARD';
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

export interface BookingEligibility {
  canBook: boolean;
  reasons: string[];
  session: {
    id: string;
    title: string;
    pointsRequired: number;
    spotsAvailable: number;
  };
  user: {
    points: number;
    activeBookings: number;
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
};