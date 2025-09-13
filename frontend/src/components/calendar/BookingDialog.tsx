import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Alert,
  FormControlLabel,
  Checkbox,
  Link,
  CircularProgress,
} from "@mui/material";
import { Star } from "@mui/icons-material";
import { format } from "date-fns";
import {
  CalendarSession,
  BookingEligibility,
} from "../../services/calendarService";

interface BookingDialogProps {
  open: boolean;
  onClose: () => void;
  session: CalendarSession | null;
  eligibility: BookingEligibility | null;
  loading: boolean;
  onBook: () => void;
  onSubscribe: () => void;
  onNavigateToSubscription: () => void;
  agreeToTerms: boolean;
  onAgreeToTermsChange: (agreed: boolean) => void;
  userStatus: string;
  hasAccessToCourses: boolean;
  loadingStart: boolean;
}

export const BookingDialog: React.FC<BookingDialogProps> = ({
  open,
  onClose,
  session,
  eligibility,
  loading,
  onBook,
  onSubscribe,
  onNavigateToSubscription,
  agreeToTerms,
  onAgreeToTermsChange,
  userStatus,
  hasAccessToCourses,
  loadingStart,
}) => {
  if (!session) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{session.title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Typography variant="body2" paragraph>
            {session.description}
          </Typography>

          <Stack spacing={1}>
            <Typography variant="body2">
              <strong>Host:</strong> {session.hostName}
            </Typography>
            <Typography variant="body2">
              <strong>Date:</strong>{" "}
              {format(new Date(session.scheduledAt), "MMMM d, yyyy")}
            </Typography>
            <Typography variant="body2">
              <strong>Time:</strong>{" "}
              {format(new Date(session.scheduledAt), "h:mm a")}
            </Typography>
            <Typography variant="body2">
              <strong>Duration:</strong> {session.duration} minutes
            </Typography>

            <Typography variant="body2">
              <strong>Points Required:</strong>{" "}
              {session.pointsRequired === 0 ? (
                <span style={{ color: "#483C32" }}>FREE</span>
              ) : (
                <div style={{ display: "inline-block" }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span>{session.pointsRequired}</span>
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

          {userStatus === "active" && eligibility && !eligibility.canBook && (
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

          {userStatus === "active" && eligibility?.canBook && (
            <Alert severity="success">
              You're eligible to book this session!
            </Alert>
          )}

          {userStatus !== "active" && (
            <Alert severity="warning">Subscribe to access this Booking</Alert>
          )}

          {userStatus !== "active" && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={agreeToTerms}
                  onChange={(e) => onAgreeToTermsChange(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2">
                  I agree to the{" "}
                  <Link
                    href="/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    color="primary"
                  >
                    terms and conditions
                  </Link>
                </Typography>
              }
              sx={{ mt: 2 }}
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {userStatus === "active" ? (
          <Button
            variant="contained"
            onClick={onBook}
            disabled={loading || !eligibility?.canBook}
          >
            {loading ? "Booking..." : "Confirm Booking"}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={
              hasAccessToCourses ? onSubscribe : onNavigateToSubscription
            }
            disabled={loadingStart || !agreeToTerms}
            startIcon={loadingStart && <CircularProgress size={20} />}
          >
            {hasAccessToCourses ? "Pay Now" : "Subscribe Now"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};
