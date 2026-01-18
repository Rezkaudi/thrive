// frontend/src/components/calendar/BookingDialog.tsx

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
  Box,
  Chip,
} from "@mui/material";
import { Star, Warning } from "@mui/icons-material";
import { format } from "date-fns";
import {
  CalendarSession,
  BookingEligibility,
} from "../../services/calendarService";
import { formatTimeUntilSession, isWithin24Hours } from "../../utils/session";

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

/**
 * Helper to determine if plan is Standard
 * Standard plans: 'standard' only
 */
const isStandardPlan = (plan: string | null): boolean => {
  return plan === "standard";
};

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

  const isSubscribed = userStatus === "active" || userStatus === "trialing";
  const userPlan = eligibility?.user.plan || null;
  const isTrialing = userStatus === "trialing"; // Helper for trial status

  // Calculate booking limits display
  const hasMonthlyLimit = eligibility?.user.monthlyBookingLimit !== null;
  const monthlyRemaining = eligibility?.user.remainingMonthlyBookings || 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          border: session.type === "STANDARD" ? "1px dashed" : "1px solid",
          borderColor:
            session.type === "STANDARD" ? "warning.main" : "rgba(0,0,0,0.12)",
        },
      }}
    >
      <DialogTitle>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <span>{session.title}</span>
          <Chip
            label={session.type}
            size="small"
            color={
              session.type === "STANDARD"
                ? "warning"
                : session.type === "SPEAKING"
                ? "primary"
                : session.type === "EVENT"
                ? "secondary"
                : "default"
            }
            sx={session.type === "STANDARD" ? { borderRadius: 0 } : undefined}
          />
        </Stack>
      </DialogTitle>
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
                <Box
                  component="span"
                  sx={{ display: "inline-flex", alignItems: "center" }}
                >
                  <span>{session.pointsRequired}</span>
                  <Star sx={{ fontSize: 16, color: "warning.main", ml: 0.5 }} />
                </Box>
              )}
            </Typography>

            <Typography variant="body2">
              <strong>Available Spots:</strong>{" "}
              {eligibility?.session.spotsAvailable || 0}
            </Typography>
          </Stack>

          {/* 24-Hour Notice Alert */}
          {session && isWithin24Hours(session.scheduledAt) && (
            <Alert severity="error" sx={{ mt: 2 }}>
              <Typography variant="body2" fontWeight={600} gutterBottom>
                Booking Not Available
              </Typography>
              <Typography variant="body2">
                Sessions must be booked at least 24 hours in advance. This
                session starts in {formatTimeUntilSession(session.scheduledAt)}.
              </Typography>
            </Alert>
          )}

          {/* Session Type Access Warning (Skipped for Trial users) */}
          {isSubscribed &&
            eligibility &&
            !eligibility.validation?.canAccessSessionType &&
            session.type !== "STANDARD" &&
            !isTrialing && (
              <Alert severity="warning" icon={<Warning />}>
                <Typography variant="body2" fontWeight={600} gutterBottom>
                  Premium Session
                </Typography>
                <Typography variant="body2">
                  Your Standard plan can only access Standard sessions. Upgrade
                  to Premium to book {session.type} sessions.
                </Typography>
              </Alert>
            )}

          {/* Trial Limit Warning (Optional: If they used their 1 slot, reasons will handle it, but we can add a specific alert if needed) */}

          {/* General Booking Errors */}
          {isSubscribed &&
            eligibility &&
            !eligibility.canBook &&
            session &&
            !isWithin24Hours(session.scheduledAt) &&
            (isTrialing ||
              eligibility.validation?.canAccessSessionType !== false) && (
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

          {/* Success State */}
          {isSubscribed &&
            eligibility?.canBook &&
            session &&
            !isWithin24Hours(session.scheduledAt) && (
              <Alert severity="success">
                You're eligible to book this session!
              </Alert>
            )}

          {/* Not Subscribed State */}
          {!isSubscribed && (
            <Alert severity="warning">
              Subscribe to access booking features
            </Alert>
          )}

          {!isSubscribed && (
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

        {isSubscribed ? (
          // Check if Standard user (Non-Trial) needs to upgrade
          (() => {
            const needsUpgradeForSessionType =
              !isTrialing && // Trial users bypass this check
              isStandardPlan(userPlan) &&
              (session.type === "SPEAKING" ||
                session.type === "EVENT" ||
                session.type === "PREMIUM");

            const needsUpgradeForMonthlyLimit =
              !isTrialing && // Trial users bypass monthly limit logic (handled by lifetime limit)
              isStandardPlan(userPlan) &&
              hasMonthlyLimit &&
              monthlyRemaining <= 0;

            const needsUpgrade =
              needsUpgradeForSessionType || needsUpgradeForMonthlyLimit;

            if (needsUpgrade) {
              return (
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={onNavigateToSubscription}
                >
                  Upgrade to Premium
                </Button>
              );
            }

            // Check if Trial user needs to upgrade (Limit reached)
            if (
              isTrialing &&
              eligibility &&
              eligibility.user.activeBookingsRemaining <= 0
            ) {
              return (
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={onNavigateToSubscription}
                >
                  Upgrade Now
                </Button>
              );
            }

            return (
              <Button
                variant="contained"
                onClick={onBook}
                disabled={
                  loading ||
                  !eligibility?.canBook ||
                  !!(session && isWithin24Hours(session?.scheduledAt))
                }
              >
                {loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : session && isWithin24Hours(session.scheduledAt) ? (
                  "24h Notice Required"
                ) : (
                  "Confirm Booking"
                )}
              </Button>
            );
          })()
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