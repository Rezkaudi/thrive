import { useState, useEffect } from "react";
import { calendarService, CalendarSession, Booking } from "../../../services/calendarService";

export const useCalendarData = (selectedDate: Date) => {
  const [sessions, setSessions] = useState<CalendarSession[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchCalendarData();
  }, [selectedDate]);

  return {
    sessions,
    myBookings,
    loading,
    refetch: fetchCalendarData,
  };
};
