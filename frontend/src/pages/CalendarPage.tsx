import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Card,
  Grid,
  CardContent,
  Typography,
  Button,
  Chip,
  Stack,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton,
  Badge,
  CircularProgress,
  Tooltip,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
} from "@mui/material";
import {
  AccessTime,
  Group,
  VideoCall,
  LocationOn,
  Star,
  ChevronLeft,
  ChevronRight,
  Today,
  Event,
  CheckCircle,
  Cancel,
  ContentCopy,
  Refresh,
} from "@mui/icons-material";
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
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import {
  calendarService,
  CalendarSession,
  Booking,
  BookingEligibility,
} from "../services/calendarService";
import { useSweetAlert } from "../utils/sweetAlert";
import { subscriptionService } from "../services/subscriptionService";
import { chackPayment } from "../store/slices/authSlice";

export const CalendarPage: React.FC = () => {
  const { showConfirm, showError } = useSweetAlert();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [sessions, setSessions] = useState<CalendarSession[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStart, setLoadingStart] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const [bookingDialog, setBookingDialog] = useState<CalendarSession | null>(
    null
  );
  const [eligibility, setEligibility] = useState<BookingEligibility | null>(
    null
  );
  const [attendeesDialog, setAttendeesDialog] =
    useState<CalendarSession | null>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as 'success' | 'error' | 'warning' | 'info',
  });

  const profile = useSelector((state: RootState) => state.profile.data);
  const { user, status } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    fetchCalendarData();
  }, [selectedDate]);

  useEffect(() => {
    if (bookingDialog) {
      checkEligibility(bookingDialog.id);
    }
  }, [bookingDialog]);

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
      showSnackbar("Failed to load calendar data", "error");
    } finally {
      setLoading(false);
    }
  };

  const checkEligibility = async (sessionId: string) => {
    try {
      const data = await calendarService.checkBookingEligibility(sessionId);
      setEligibility(data);
    } catch (error) {
      console.error("Failed to check eligibility:", error);
    }
  };

  const handleBookSession = async () => {
    if (!bookingDialog || !eligibility?.canBook) return;

    try {
      await calendarService.createBooking(bookingDialog.id);
      setSnackbar({
        open: true,
        message: "Session booked successfully!",
        severity: "success"
      });
      setBookingDialog(null);
      fetchCalendarData();
    } catch (error) {
      showError("Error", "Failed to book session");
    }
  };

  const handleSubscription = async () => {
    setLoadingStart(true);
    try {
      await subscriptionService.endTrial();
      await dispatch(chackPayment());
      setSnackbar({
        open: true,
        message: "Starting Subscription successfully!",
        severity: "success"
      });
    } catch (error) {
      console.error('Error starting subscription:', error);
    } finally {
      setLoadingStart(false);
    }
  }

  const handleCancelBooking = async (booking: Booking) => {
    const result = await showConfirm({
      title: "Cancel Booking",
      text: "Are you sure you want to cancel this booking?",
      icon: "warning",
      confirmButtonText: "Yes, cancel it",
      cancelButtonText: "Keep booking",
    });

    if (result.isConfirmed) {
      try {
        await calendarService.cancelBooking(booking.id);
        setSnackbar({
          open: true,
          message: "Booking cancelled successfully!",
          severity: "success"
        });
        fetchCalendarData();
      } catch (error) {
        showError("Error", "Failed to cancel booking");
      }
    }
  };

  const fetchAttendees = async (session: CalendarSession) => {
    try {
      const data = await calendarService.getSessionAttendees(session.id);
      setAttendees(data);
      setAttendeesDialog(session);
    } catch (error) {
      showSnackbar("Failed to fetch attendees", "error");
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const copyMeetingLink = (url: string) => {
    navigator.clipboard.writeText(url);
    showSnackbar("Meeting link copied to clipboard", "success");
  };

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

  const SessionCard = ({
    session,
    compact = false,
  }: {
    session: CalendarSession;
    compact?: boolean;
  }) => {
    const isBooked = myBookings.some((b) => b.sessionId === session.id);
    const isPast = new Date(session.scheduledAt) < new Date();
    const isFull = session.currentParticipants >= session.maxParticipants;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <Card
          sx={{
            mb: 2,
            opacity: isPast ? 0.7 : 1,
            border: isBooked ? "2px solid" : "1px solid",
            borderColor: isBooked ? "primary.main" : "divider",
          }}
        >
          <CardContent sx={{ p: compact ? 2 : 3 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="start"
              mb={1}
            >
              <Box flex={1}>
                <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                  <Typography
                    variant={compact ? "body2" : "h6"}
                    fontWeight={600}
                  >
                    {session.title}
                  </Typography>
                  {isBooked && (
                    <Chip
                      icon={<CheckCircle />}
                      label="Booked"
                      size="small"
                      color="primary"
                    />
                  )}
                </Stack>
                {session.hostName && (
                  <Typography variant="body2" color="text.secondary">
                    Hosted by {session.hostName}
                  </Typography>
                )}
              </Box>
              <Chip
                label={session.type === "SPEAKING" ? "Speaking" : "Event"}
                color={session.type === "SPEAKING" ? "primary" : "secondary"}
                size="small"
              />
            </Stack>

            <Stack spacing={compact ? 0.5 : 1} mb={2}>
              <Stack direction="row" spacing={1} alignItems="center">
                <AccessTime fontSize="small" color="action" />
                <Typography variant="body2">
                  {format(
                    new Date(session.scheduledAt),
                    compact ? "h:mm a" : "MMM d, yyyy • h:mm a"
                  )}{" "}
                  ({session.duration} min)
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center">
                <Group fontSize="small" color="action" />
                <Typography variant="body2">
                  {session.currentParticipants}/{session.maxParticipants}{" "}
                  participants
                </Typography>
                {(user?.role === "ADMIN" || user?.role === "INSTRUCTOR") && (
                  <Button size="small" onClick={() => fetchAttendees(session)}>
                    View List
                  </Button>
                )}
              </Stack>

              {session.pointsRequired > 0 && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Star fontSize="small" color="action" />
                  <Typography variant="body2">
                    {session.pointsRequired} points required
                  </Typography>
                </Stack>
              )}

              <Stack direction="row" spacing={1} alignItems="center">
                {session.type === "SPEAKING" ? (
                  <>
                    <VideoCall fontSize="small" color="action" />
                    <Typography variant="body2">
                      Online (Google Meet)
                    </Typography>
                    {isBooked && session.meetingUrl && !isPast && (
                      <Tooltip title="Copy meeting link">
                        <IconButton
                          size="small"
                          onClick={() => copyMeetingLink(session.meetingUrl!)}
                        >
                          <ContentCopy fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </>
                ) : session.location ? (
                  <>
                    <LocationOn fontSize="small" color="action" />
                    <Typography variant="body2">{session.location}</Typography>
                  </>
                ) : null}
              </Stack>
            </Stack>

            {!compact && (
              <Stack direction="row" spacing={1}>
                {isBooked ? (
                  <>
                    {!isPast && (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<Cancel />}
                        onClick={() => {
                          const booking = myBookings.find(
                            (b) => b.sessionId === session.id
                          );
                          if (booking) handleCancelBooking(booking);
                        }}
                      >
                        Cancel Booking
                      </Button>
                    )}
                    {session.meetingUrl && !isPast && (
                      <Button
                        variant="contained"
                        size="small"
                        href={session.meetingUrl}
                        target="_blank"
                        startIcon={<VideoCall />}
                      >
                        Join Session
                      </Button>
                    )}
                  </>
                ) : (
                  <Button
                    fullWidth
                    variant="contained"
                    disabled={isPast || isFull || myBookings.length >= 2}
                    onClick={() => setBookingDialog(session)}
                  >
                    {isPast
                      ? "Session Ended"
                      : isFull
                        ? "Session Full"
                        : "Book Session"}
                  </Button>
                )}
              </Stack>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Typography variant="h3" fontWeight={700}>
          Calendar & Sessions
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            startIcon={<Today />}
            onClick={() => setSelectedDate(new Date())}
          >
            Today
          </Button>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchCalendarData} color="primary">
              <Refresh />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      <Grid container spacing={4}>
        {/* Calendar */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              {/* Calendar Header */}
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
              >
                <IconButton
                  onClick={() => setSelectedDate(subMonths(selectedDate, 1))}
                >
                  <ChevronLeft />
                </IconButton>
                <Typography variant="h6" fontWeight={600}>
                  {format(selectedDate, "MMMM yyyy")}
                </Typography>
                <IconButton
                  onClick={() => setSelectedDate(addMonths(selectedDate, 1))}
                >
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
                          p: 1,
                          minHeight: 80,
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
                        onClick={() => setSelectedDate(day)}
                      >
                        <Typography
                          variant="body2"
                          fontWeight={
                            isCurrentDay ? 700 : isSelected ? 600 : 400
                          }
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
                    <Paper
                      sx={{ p: 3, textAlign: "center", bgcolor: "grey.50" }}
                    >
                      <Event sx={{ fontSize: 48, color: "grey.300", mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        No sessions scheduled for this day
                      </Typography>
                    </Paper>
                  ) : (
                    getSessionsForDay(selectedDate).map((session) => (
                      <SessionCard key={session.id} session={session} />
                    ))
                  )}
                </AnimatePresence>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
          {/* My Bookings */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                My Bookings
              </Typography>

              <Alert severity="info" sx={{ mb: 2 }}>
                You can book up to 2 sessions at a time
              </Alert>

              {myBookings.length === 0 ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                  py={2}
                >
                  No active bookings
                </Typography>
              ) : (
                <Stack spacing={2}>
                  {myBookings.map((booking) => (
                    <Paper key={booking.id} sx={{ p: 2 }}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {booking.session?.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {booking.session &&
                          format(
                            new Date(booking.session.scheduledAt),
                            "MMM d • h:mm a"
                          )}
                      </Typography>
                      {booking.session?.meetingUrl && (
                        <Button
                          size="small"
                          startIcon={<VideoCall />}
                          href={booking.session.meetingUrl}
                          target="_blank"
                          sx={{ mt: 1 }}
                        >
                          Join
                        </Button>
                      )}
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleCancelBooking(booking)}
                        sx={{ mt: 1, ml: 1 }}
                      >
                        Cancel
                      </Button>
                    </Paper>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>

          {/* Points Balance */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Points Balance
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="h3" fontWeight={700} color="primary">
                    {profile?.points || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Available Points
                  </Typography>
                </Box>
                <Alert severity="info">
                  <Typography variant="body2">
                    Earn points by completing lessons and participating in the
                    community!
                  </Typography>
                </Alert>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Booking Dialog */}
      <Dialog
        open={!!bookingDialog}
        onClose={() => setBookingDialog(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{bookingDialog?.title}</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Typography variant="body2" paragraph>
              {bookingDialog?.description}
            </Typography>

            <Stack spacing={1}>
              <Typography variant="body2">
                <strong>Host:</strong> {bookingDialog?.hostName}
              </Typography>
              <Typography variant="body2">
                <strong>Date:</strong>{" "}
                {bookingDialog &&
                  format(new Date(bookingDialog.scheduledAt), "MMMM d, yyyy")}
              </Typography>
              <Typography variant="body2">
                <strong>Time:</strong>{" "}
                {bookingDialog &&
                  format(new Date(bookingDialog.scheduledAt), "h:mm a")}
              </Typography>
              <Typography variant="body2">
                <strong>Duration:</strong> {bookingDialog?.duration} minutes
              </Typography>

              <Typography variant="body2">
                <strong>Points Required:</strong>{" "}
                {bookingDialog?.pointsRequired === 0 ? (
                  <span style={{ color: "#00B894" }}>FREE</span>
                ) : (
                  <div style={{ display: "inline-block" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span>{bookingDialog?.pointsRequired}</span>
                      <Star sx={{ fontSize: 16, color: "warning.main" }} />
                    </div>
                  </div>
                )}
              </Typography>

              <Typography variant="body2">
                <strong>Available Spots:</strong>{" "}
                {eligibility?.session.spotsAvailable || 0}
              </Typography>
            </Stack>

            {status === "active" && eligibility && !eligibility.canBook && (
              <Alert severity="warning">
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  Cannot book this session:
                </Typography>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {eligibility.reasons.map((reason, index) => (
                    <li key={index}>
                      <Typography variant="body2">{reason}</Typography>
                    </li>
                  ))}
                </ul>
              </Alert>
            )}

            {status === "active" && eligibility?.canBook && (
              <Alert severity="success">
                You're eligible to book this session!
              </Alert>
            )}

            {status !== "active" && (
              <Alert severity="warning">
                Subscribe to access this Booking
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBookingDialog(null)}>Cancel</Button>
          {status === "active" ? <Button
            variant="contained"
            onClick={handleBookSession}
            disabled={!eligibility?.canBook}
          >
            Confirm Booking
          </Button> :
            <Button
              variant="contained"
              onClick={handleSubscription}
              disabled={loadingStart}
              startIcon={loadingStart && <CircularProgress size={20} />}
            >
              Subscripe Now
            </Button>
          }
        </DialogActions>
      </Dialog>

      {/* Attendees Dialog */}
      <Dialog
        open={!!attendeesDialog}
        onClose={() => setAttendeesDialog(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Session Attendees - {attendeesDialog?.title}</DialogTitle>
        <DialogContent>
          <List>
            {attendees.length === 0 ? (
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
                py={2}
              >
                No attendees yet
              </Typography>
            ) : (
              attendees.map((attendee, index) => (
                <React.Fragment key={attendee.bookingId}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar src={attendee.profilePhoto}>
                        {attendee.name[0]}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={attendee.name}
                      secondary={`Level ${attendee.level} • ${attendee.languageLevel}`}
                    />
                  </ListItem>
                  {index < attendees.length - 1 && (
                    <Divider variant="inset" component="li" />
                  )}
                </React.Fragment>
              ))
            )}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAttendeesDialog(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};