import React from "react";
import {
  Card,
  CardContent,
  Grid,
  Typography,
  IconButton,
  Paper,
  Box,
  Divider,
  CircularProgress,
  Stack,
} from "@mui/material";
import { ChevronLeft, ChevronRight, Event } from "@mui/icons-material";
import {
  format,
  addDays,
  startOfWeek,
  isSameDay,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  endOfWeek,
  isSameMonth,
  isToday,
} from "date-fns";
import { AnimatePresence } from "framer-motion";
import { CalendarSession, Booking } from "../../services/calendarService";
import { SessionCard } from "./SessionCard";

interface CalendarGridProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  sessions: CalendarSession[];
  myBookings: Booking[];
  loading: boolean;
  onSessionClick: (session: CalendarSession) => void;
  onAttendeesClick: (session: CalendarSession) => void;
  onCancelBooking: (booking: Booking) => void;
  onCopyMeetingLink: (url: string) => void;
  user?: any;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  selectedDate,
  onDateChange,
  sessions,
  myBookings,
  loading,
  onSessionClick,
  onAttendeesClick,
  onCancelBooking,
  onCopyMeetingLink,
  user,
}) => {
  // Generate calendar days for the month view
  const generateCalendarDays = () => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    const days = [];
    let day = calendarStart;

    while (day <= calendarEnd) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  };

  const getSessionsForDay = (date: Date) => {
    return sessions.filter((s) => isSameDay(new Date(s.scheduledAt), date));
  };

  const calendarDays = generateCalendarDays();
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Card>
      <CardContent>
        {/* Calendar Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <IconButton onClick={() => onDateChange(subMonths(selectedDate, 1))}>
            <ChevronLeft />
          </IconButton>
          <Typography variant="h6" fontWeight={600}>
            {format(selectedDate, "MMMM yyyy")}
          </Typography>
          <IconButton onClick={() => onDateChange(addMonths(selectedDate, 1))}>
            <ChevronRight />
          </IconButton>
        </Stack>

        {/* Days of Week Header */}
        <Grid container spacing={1} sx={{ mb: 1 }}>
          {weekDays.map((day) => (
            <Grid size={{ xs: 12 / 7 }} key={day}>
              <Typography
                variant="caption"
                fontWeight={600}
                color="text.secondary"
                textAlign="center"
                display="block"
                sx={{ py: 1 }}
              >
                {day}
              </Typography>
            </Grid>
          ))}
        </Grid>

        {/* Calendar Grid */}
        <Grid container spacing={1}>
          {calendarDays.map((day) => {
            const daySessions = getSessionsForDay(day);
            const hasBooking = daySessions.some((s) =>
              myBookings.some((b) => b.sessionId === s.id)
            );
            const isCurrentMonth = isSameMonth(day, selectedDate);
            const isSelected = isSameDay(day, selectedDate);
            const isCurrentDay = isToday(day);

            return (
              <Grid size={{ xs: 12 / 7 }} key={day.toISOString()}>
                <Paper
                  sx={{
                    p: { xs: 0.5, sm: 1 },
                    minHeight: { xs: 60, sm: 80 },
                    textAlign: "center",
                    cursor: "pointer",
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    bgcolor: isSelected
                      ? "primary.main"
                      : isCurrentDay
                      ? "primary.light"
                      : "background.paper",
                    color: isSelected
                      ? "white"
                      : isCurrentDay
                      ? "primary.contrastText"
                      : isCurrentMonth
                      ? "text.primary"
                      : "text.disabled",
                    border: hasBooking ? "2px solid" : "1px solid",
                    borderColor: hasBooking ? "primary.main" : "divider",
                    opacity: isCurrentMonth ? 1 : 0.5,
                    "&:hover": {
                      bgcolor: isSelected
                        ? "primary.dark"
                        : isCurrentDay
                        ? "primary.main"
                        : "action.hover",
                      transform: "scale(1.02)",
                    },
                    transition: "all 0.2s ease-in-out",
                  }}
                  onClick={() => onDateChange(day)}
                >
                  <Typography
                    variant="body2"
                    fontWeight={isCurrentDay ? 700 : isSelected ? 600 : 400}
                    sx={{ mb: 0.5 }}
                  >
                    {format(day, "d")}
                  </Typography>

                  {/* Session indicators */}
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 0.25,
                      justifyContent: "center",
                    }}
                  >
                    {daySessions.slice(0, 3).map((session, index) => (
                      <Box
                        key={session.id}
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          bgcolor:
                            session.type === "SPEAKING"
                              ? isSelected
                                ? "white"
                                : "primary.main"
                              : session.type === "STANDARD"
                              ? isSelected
                                ? "white"
                                : "warning.main"
                              : isSelected
                              ? "white"
                              : "secondary.main",
                          opacity: 0.8,
                        }}
                      />
                    ))}
                    {daySessions.length > 3 && (
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: "10px",
                          color: isSelected ? "white" : "text.secondary",
                          ml: 0.5,
                        }}
                      >
                        +{daySessions.length - 3}
                      </Typography>
                    )}
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Selected Day Sessions */}
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Sessions on {format(selectedDate, "MMMM d, yyyy")}
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <AnimatePresence>
            {getSessionsForDay(selectedDate).length === 0 ? (
              <Paper sx={{ p: 3, textAlign: "center", bgcolor: "grey.50" }}>
                <Event sx={{ fontSize: 48, color: "grey.300", mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  No sessions scheduled for this day
                </Typography>
              </Paper>
            ) : (
              getSessionsForDay(selectedDate).map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  myBookings={myBookings}
                  onSessionClick={onSessionClick}
                  onAttendeesClick={onAttendeesClick}
                  onCancelBooking={onCancelBooking}
                  onCopyMeetingLink={onCopyMeetingLink}
                  user={user}
                />
              ))
            )}
          </AnimatePresence>
        )}
      </CardContent>
    </Card>
  );
};
