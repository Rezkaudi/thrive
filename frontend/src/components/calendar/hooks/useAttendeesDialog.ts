import { useState } from "react";
import { calendarService, CalendarSession } from "../../../services/calendarService";

interface Attendee {
  bookingId: string;
  name: string;
  profilePhoto?: string;
  level: number;
  languageLevel: string;
}

export const useAttendeesDialog = () => {
  const [attendeesDialog, setAttendeesDialog] = useState<CalendarSession | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);

  const fetchAttendees = async (session: CalendarSession) => {
    try {
      const data = await calendarService.getSessionAttendees(session.id);
      setAttendees(data);
      setAttendeesDialog(session);
    } catch (error) {
      throw error;
    }
  };

  return {
    attendeesDialog,
    setAttendeesDialog,
    attendees,
    fetchAttendees,
  };
};
