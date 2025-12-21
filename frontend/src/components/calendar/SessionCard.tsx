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
    sessionStartTime.getTime() + session.duration * 60000
  );
  const isPast = sessionEndTime < new Date();
  const isFull = session.currentParticipants >= session.maxParticipants;



  // NEW: Check if within 24 hours
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
          opacity: isPast ? 0.7 : 1,
          border: isBooked ? "2px solid" : "1px solid",
          borderColor: isBooked
            ? "primary.main"
            : within24Hours && !isBooked
            ? "warning.main"
            : "divider",
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
            <Chip
              label={session.type === "SPEAKING" ? "Speaking" : session.type === "STANDARD" ? "Standard" : "Event"}
              color={session.type === "SPEAKING" ? "primary" : session.type === "STANDARD" ? "info" : "secondary"}
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

            {/* NEW: Show time until session */}
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
                          (b) => b.sessionId === session.id
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
              ) : (
                <Button
                  fullWidth
                  variant="contained"
                  disabled={isPast || isFull || myBookings.length >= 2}
                  onClick={() => onSessionClick(session)}
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
