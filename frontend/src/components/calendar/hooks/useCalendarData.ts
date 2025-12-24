import { useState, useEffect } from "react";
import { calendarService, CalendarSession, Booking, BookingLimits } from "../../../services/calendarService";

export const useCalendarData = (selectedDate: Date) => {
  const [sessions, setSessions] = useState<CalendarSession[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [bookingLimits, setBookingLimits] = useState<BookingLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const [limitsLoading, setLimitsLoading] = useState(true);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1;

      const [sessionsData, bookingsData] = await Promise.all([
        calendarService.getCalendarSessions(year, month),
        calendarService.getUpcomingBookings(),
      ]);

      setSessions(sessionsData.sessions);
      setMyBookings(bookingsData);
    } catch (error) {
      console.error("Failed to fetch calendar data:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingLimits = async () => {
    try {
      setLimitsLoading(true);
      const limits = await calendarService.getBookingLimits();
      setBookingLimits(limits);
    } catch (error) {
      console.error("Failed to fetch booking limits:", error);
      // Don't throw - limits are not critical for basic functionality
      setBookingLimits(null);
    } finally {
      setLimitsLoading(false);
    }
  };

  const refetch = async () => {
    await Promise.all([
      fetchCalendarData(),
      fetchBookingLimits()
    ]);
  };

  useEffect(() => {
    fetchCalendarData();
    fetchBookingLimits();
  }, [selectedDate]);

  return {
    sessions,
    myBookings,
    bookingLimits,
    loading,
    limitsLoading,
    refetch,
  };
};
