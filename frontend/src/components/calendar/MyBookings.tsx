import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Paper,
  Alert,
} from "@mui/material";
import { VideoCall } from "@mui/icons-material";
import { format } from "date-fns";
import { Booking } from "../../services/calendarService";

interface MyBookingsProps {
  myBookings: Booking[];
  onCancelBooking: (booking: Booking) => void;
}

export const MyBookings: React.FC<MyBookingsProps> = ({
  myBookings,
  onCancelBooking,
}) => {
  return (
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
