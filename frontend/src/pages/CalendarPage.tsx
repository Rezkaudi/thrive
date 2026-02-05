import React, { useState } from "react";
import { Container, Grid, Snackbar, Alert } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store/store";
import { useSweetAlert } from "../utils/sweetAlert";
import { subscriptionService } from "../services/subscriptionService";
import { checkPayment } from "../store/slices/authSlice";
import { sleep } from "../utils/sleep";
import { useNavigate } from "react-router-dom";
import {
  CalendarHeader,
  CalendarGrid,
  MyBookings,
  PointsBalance,
  BookingDialog,
  AttendeesDialog,
  useCalendarData,
  useBookingDialog,
  useAttendeesDialog,
} from "../components/calendar";

export const CalendarPage: React.FC = () => {
  const { showConfirm, showError } = useSweetAlert();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loadingStart, setLoadingStart] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning" | "info",
  });

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const profile = useSelector((state: RootState) => state.dashboard.data);
  const { user, status, hasAccessToCourses } = useSelector(
    (state: RootState) => state.auth,
  );

  // Custom hooks - now includes bookingLimits
  const { sessions, myBookings, bookingLimits, loading, refetch } =
    useCalendarData(selectedDate);
  const {
    bookingDialog,
    setBookingDialog,
    eligibility,
    bookLoading,
    handleBookSession,
  } = useBookingDialog();
  const { attendeesDialog, setAttendeesDialog, attendees, fetchAttendees } =
    useAttendeesDialog();

  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "warning" | "info",
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleBookSessionClick = async () => {
    try {
      await handleBookSession(() => {
        showSnackbar("Session booked successfully!", "success");
        refetch();
      });
    } catch (error: any) {
      setBookingDialog(null);
      // Show detailed error message if available from API
      const errorMessage =
        error?.response?.data?.error?.message || "Failed to book session";
      showError("Booking Failed", errorMessage);
    }
  };

  const handleSubscription = async () => {
    setLoadingStart(true);
    try {
      await subscriptionService.endTrial();
      await sleep(5000);
      await dispatch(checkPayment());
      showSnackbar("Starting Subscription successfully!", "success");
    } catch (error) {
      // Error handled by snackbar
    } finally {
      setLoadingStart(false);
    }
  };

  const handleCancelBooking = async (booking: any) => {
    const result = await showConfirm({
      title: "Cancel Booking",
      text: "Are you sure you want to cancel this booking?",
      icon: "warning",
      confirmButtonText: "Yes, cancel it",
      cancelButtonText: "Keep booking",
    });

    if (result.isConfirmed) {
      try {
        const { calendarService } = await import("../services/calendarService");
        await calendarService.cancelBooking(booking.id);
        showSnackbar("Booking cancelled successfully!", "success");
        refetch();
      } catch (error) {
        showError("Error", "Failed to cancel booking");
      }
    }
  };

  const handleFetchAttendees = async (session: any) => {
    try {
      await fetchAttendees(session);
    } catch (error) {
      showSnackbar("Failed to fetch attendees", "error");
    }
  };

  const copyMeetingLink = (url: string) => {
    navigator.clipboard.writeText(url);
    showSnackbar("Meeting link copied to clipboard", "success");
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <CalendarHeader
        onTodayClick={() => setSelectedDate(new Date())}
        onRefresh={refetch}
      />

      <Grid container spacing={4}>
        {/* Calendar */}
        <Grid size={{ xs: 12, md: 8 }}>
          <CalendarGrid
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            sessions={sessions}
            myBookings={myBookings}
            loading={loading}
            onSessionClick={setBookingDialog}
            onAttendeesClick={handleFetchAttendees}
            onCancelBooking={handleCancelBooking}
            onCopyMeetingLink={copyMeetingLink}
            user={{ ...user, status }}
          />
        </Grid>

        {/* Sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
          <MyBookings
            myBookings={myBookings}
            onCancelBooking={handleCancelBooking}
            bookingLimits={bookingLimits}
          />

          <PointsBalance totalPoints={profile?.stats.totalPoints || 0} />
        </Grid>
      </Grid>

      {/* Booking Dialog */}
      <BookingDialog
        open={!!bookingDialog}
        onClose={() => setBookingDialog(null)}
        session={bookingDialog}
        eligibility={eligibility}
        loading={bookLoading}
        onBook={handleBookSessionClick}
        onSubscribe={handleSubscription}
        onNavigateToSubscription={() => navigate("/subscription")}
        agreeToTerms={agreeToTerms}
        onAgreeToTermsChange={setAgreeToTerms}
        userStatus={status || "inactive"}
        hasAccessToCourses={hasAccessToCourses}
        loadingStart={loadingStart}
      />

      {/* Attendees Dialog */}
      <AttendeesDialog
        open={!!attendeesDialog}
        onClose={() => setAttendeesDialog(null)}
        session={attendeesDialog}
        attendees={attendees}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};
