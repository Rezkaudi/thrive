import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Paper,
  Alert,
  Chip,
} from "@mui/material";
import { VideoCall } from "@mui/icons-material";
import { format } from "date-fns";
import { Booking, BookingLimits } from "../../services/calendarService";

interface MyBookingsProps {
  myBookings: Booking[];
  onCancelBooking: (booking: Booking) => void;
  bookingLimits?: BookingLimits | null;
}

/**
 * Helper to determine if plan is Standard
 * Standard plans: 'standard' only
 */
const isStandardPlan = (plan: string | null | undefined): boolean => {
  return plan === "standard";
};

const isPremiumPlan = (plan: string | null | undefined): boolean => {
  return (
    plan !== null &&
    plan !== undefined &&
    ["premium", "monthly", "yearly"].includes(plan)
  );
};

export const MyBookings: React.FC<MyBookingsProps> = ({
  myBookings,
  onCancelBooking,
  bookingLimits,
}) => {
  // Determine max active bookings based on plan
  // Standard: 4 active bookings, Premium: 2 active bookings
  const userPlan = bookingLimits?.userPlan;
  const maxActiveBookings =
    bookingLimits?.maxActiveBookings ||
    (isPremiumPlan(userPlan) ? 2 : isStandardPlan(userPlan) ? 4 : 2);
  const activeCount = myBookings.length;
  const remainingBookings = Math.max(0, maxActiveBookings - activeCount);

  // Get plan display name
  const getPlanName = () => {
    if (isPremiumPlan(userPlan)) return "Premium";
    if (isStandardPlan(userPlan)) return "Standard";
    return "";
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <Typography variant="h6" fontWeight={600}>
            My Bookings
          </Typography>
          {userPlan && (
            <Chip
              label={getPlanName()}
              size="small"
              color={isPremiumPlan(userPlan) ? "secondary" : "primary"}
              variant="outlined"
            />
          )}
        </Stack>

        <Alert
          severity={remainingBookings === 0 ? "warning" : "info"}
          sx={{ mb: 2 }}
        >
          <Typography variant="body2">
            <strong>
              {activeCount}/{maxActiveBookings}
            </strong>{" "}
            active bookings
            {remainingBookings > 0
              ? ` • ${remainingBookings} slot${
                  remainingBookings !== 1 ? "s" : ""
                } available`
              : " • Limit reached"}
          </Typography>
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
                  onClick={() => onCancelBooking(booking)}
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
  );
};
