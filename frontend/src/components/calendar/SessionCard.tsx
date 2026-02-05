import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Stack,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  AccessTime,
  Group,
  VideoCall,
  LocationOn,
  Star,
  CheckCircle,
  Cancel,
  ContentCopy,
  Schedule,
  Lock,
  WorkspacePremium,
} from "@mui/icons-material";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { CalendarSession, Booking } from "../../services/calendarService";
import { formatTimeUntilSession, isWithin24Hours } from "../../utils/session";

interface SessionCardProps {
  session: CalendarSession;
  compact?: boolean;
  myBookings: Booking[];
  onSessionClick: (session: CalendarSession) => void;
  onAttendeesClick: (session: CalendarSession) => void;
  onCancelBooking: (booking: Booking) => void;
  onCopyMeetingLink: (url: string) => void;
  user?: any;
}

/**
 * Helper to check if a session requires premium access
 */
const isPremiumSession = (type: string): boolean => {
  return type === "SPEAKING" || type === "EVENT" || type === "PREMIUM";
};

/**
 * Helper to check if user has a standard plan
 * Standard plans: 'standard' only
 */
const isStandardPlan = (plan: string | null | undefined): boolean => {
  return plan === "standard";
};

/**
 * Get session type chip color
 */
const getSessionTypeColor = (
  type: string,
): "primary" | "secondary" | "info" | "warning" | "default" => {
  switch (type) {
    case "PREMIUM":
      return "secondary";
    case "SPEAKING":
      return "primary";
    case "EVENT":
      return "secondary";
    case "STANDARD":
      return "warning";
    default:
      return "default";
  }
};

/**
 * Get session type display name
 */
const getSessionTypeLabel = (type: string): string => {
  switch (type) {
    case "PREMIUM":
      return "Premium";
    case "SPEAKING":
      return "Speaking";
    case "EVENT":
      return "Event";
    case "STANDARD":
      return "Standard";
    default:
      return type;
  }
};

export const SessionCard: React.FC<SessionCardProps> = ({
  session,
  compact = false,
  myBookings,
  onSessionClick,
  onAttendeesClick,
  onCancelBooking,
  onCopyMeetingLink,
  user,
}) => {
  const isBooked = myBookings.some((b) => b.sessionId === session.id);
  const sessionStartTime = new Date(session.scheduledAt);
  const sessionEndTime = new Date(
    sessionStartTime.getTime() + session.duration * 60000,
  );
  const isPast = sessionEndTime < new Date();
  const isFull = session.currentParticipants >= session.maxParticipants;

  // Check if user can access this session type based on plan
  const userPlan = user?.plan || user?.subscriptionPlan;
  // UPDATED: Check for trial status (includes free_trial)
  const userStatus = user?.subscriptionStatus || user?.status;
  // isTrialing is true for both subscription-based trial AND free trial (no credit card)
  const isTrialing = userStatus === "trialing" || userStatus === "free_trial";

  const requiresPremium = isPremiumSession(session.type);
  const hasStandardPlan = isStandardPlan(userPlan);

  // UPDATED: Trial users (including free trial) can access ALL session types
  const cannotAccessSessionType =
    requiresPremium && hasStandardPlan && !isTrialing;

  // Check if within 24 hours
  const within24Hours = isWithin24Hours(session.scheduledAt);
  const timeUntilSession = formatTimeUntilSession(session.scheduledAt);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card
        sx={{
          mb: 2,
          opacity: isPast ? 0.7 : cannotAccessSessionType ? 0.85 : 1,
          border: isBooked
            ? "2px solid"
            : session.type === "STANDARD"
              ? "1px dashed"
              : "1px solid",
          borderColor: isBooked
            ? "primary.main"
            : session.type === "STANDARD"
              ? "warning.main"
              : within24Hours && !isBooked
                ? "warning.main"
                : cannotAccessSessionType
                  ? "grey.300"
                  : "divider",
          position: "relative",
        }}
      >
        {/* Premium Badge Overlay */}
        {cannotAccessSessionType && !isBooked && (
          <Box
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 1,
            }}
          >
            <Tooltip title="Upgrade to Premium to access this session">
              <Chip
                icon={<WorkspacePremium />}
                label="Premium Only"
                size="small"
                color="secondary"
                sx={{ fontWeight: 600 }}
              />
            </Tooltip>
          </Box>
        )}

        <CardContent sx={{ p: compact ? 2 : 3 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="start"
            mb={1}
          >
            <Box flex={1}>
              <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                <Typography variant={compact ? "body2" : "h6"} fontWeight={600}>
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
                {within24Hours && !isBooked && !isPast && (
                  <Chip
                    icon={<AccessTime />}
                    label="24h Notice Required"
                    size="small"
                    color="warning"
                    variant="outlined"
                  />
                )}
              </Stack>
              {session.hostName && (
                <Typography variant="body2" color="text.secondary">
                  Hosted by {session.hostName}
                </Typography>
              )}
            </Box>
            {!cannotAccessSessionType && (
              <Chip
                label={getSessionTypeLabel(session.type)}
                color={getSessionTypeColor(session.type)}
                size="small"
                sx={
                  session.type === "STANDARD" ? { borderRadius: 0 } : undefined
                }
              />
            )}
          </Stack>

          <Stack spacing={compact ? 0.5 : 1} mb={2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <AccessTime fontSize="small" color="action" />
              <Typography variant="body2">
                {format(
                  new Date(session.scheduledAt),
                  compact ? "h:mm a" : "MMM d, yyyy • h:mm a",
                )}{" "}
                ({session.duration} min)
              </Typography>
            </Stack>

            {/* Show time until session */}
            {!isPast && (
              <Stack direction="row" spacing={1} alignItems="center">
                <Schedule fontSize="small" color="action" />
                <Typography
                  variant="body2"
                  color={within24Hours ? "warning.main" : "text.secondary"}
                  fontWeight={within24Hours ? 600 : 400}
                >
                  {timeUntilSession} until session
                </Typography>
              </Stack>
            )}

            <Stack direction="row" spacing={1} alignItems="center">
              <Group fontSize="small" color="action" />
              <Typography variant="body2">
                {session.currentParticipants}/{session.maxParticipants}{" "}
                participants
              </Typography>
              {(user?.role === "ADMIN" || user?.role === "INSTRUCTOR") && (
                <Button size="small" onClick={() => onAttendeesClick(session)}>
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
                  <Typography variant="body2">Online (Google Meet)</Typography>
                  {isBooked && session.meetingUrl && !isPast && (
                    <Tooltip title="Copy meeting link">
                      <IconButton
                        size="small"
                        onClick={() => onCopyMeetingLink(session.meetingUrl!)}
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
                          (b) => b.sessionId === session.id,
                        );
                        if (booking) onCancelBooking(booking);
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
              ) : cannotAccessSessionType ? (
                <Button
                  fullWidth
                  variant="outlined"
                  color="secondary"
                  startIcon={<Lock />}
                  onClick={() => onSessionClick(session)}
                >
                  Upgrade to Premium
                </Button>
              ) : (
                <Button
                  fullWidth
                  variant="contained"
                  disabled={isPast || isFull || within24Hours}
                  onClick={() => onSessionClick(session)}
                >
                  {isPast
                    ? "Session Ended"
                    : isFull
                      ? "Session Full"
                      : within24Hours
                        ? "24h Notice Required"
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
