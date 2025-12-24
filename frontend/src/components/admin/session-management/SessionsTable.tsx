// File: components/Sessions/SessionsTable.tsx
import React, { memo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Typography,
  Chip,
  Tooltip,
  IconButton,
  Box,
} from "@mui/material";
import {
  AccessTime,
  Delete,
  Edit,
  Event,
  LocationOn,
  Mic,
  People,
  Repeat,
  Star,
  VideoCall,
} from "@mui/icons-material";
import { Session } from "../../../services/sessionService";

// Utils
const formatDateTime = (date: string) =>
  new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

const getRelativeTime = (date: string) => {
  const sessionDate = new Date(date);
  const now = new Date();
  const diffMs = sessionDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Past";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays < 7) return `In ${diffDays} days`;
  return `In ${Math.ceil(diffDays / 7)} weeks`;
};

// Table row component
const SessionRow: React.FC<{
  session: Session;
  onDelete: (s: Session) => void;
  updating: boolean;
  deleting: boolean;
  dispatch: any;
  setSessionDialog: (v: boolean) => void;
  setEditingSession: (s: Session) => void;
  setFormFromSession: (s: Session) => void;
}> = ({
  session,
  onDelete,
  updating,
  deleting,
  dispatch,
  setSessionDialog,
  setEditingSession,
  setFormFromSession,
}) => {
  const sessionStartTime = new Date(session.scheduledAt);
  const sessionEndTime = new Date(
    sessionStartTime.getTime() + session.duration * 60000
  );
  const isPast = sessionEndTime < new Date();
  const fillPercentage =
    (session.currentParticipants / session.maxParticipants) * 100;

  return (
    <TableRow key={session.id} sx={{ opacity: isPast ? 0.8 : 1 }}>
      {/* Session Details */}
      <TableCell>
        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="body2" fontWeight={600}>
              {session.title}
            </Typography>
            {session.isRecurring && (
              <Tooltip
                title={
                  session.recurringParentId
                    ? "Part of recurring series"
                    : "Recurring session parent"
                }
              >
                <Chip
                  icon={<Repeat />}
                  label={
                    session.recurringParentId
                      ? "Series"
                      : `${session.recurringWeeks}w`
                  }
                  size="small"
                  color="info"
                  variant="outlined"
                />
              </Tooltip>
            )}
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            {session.type === "SPEAKING" ? (
              <>
                <VideoCall sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography variant="caption" color="text.secondary">
                  Online Meeting
                </Typography>
              </>
            ) : session.type === "STANDARD" ? (
              <>
                <Star sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography variant="caption" color="text.secondary">
                  Standard Session
                </Typography>
              </>
            ) : session.location ? (
              <>
                <LocationOn sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography variant="caption" color="text.secondary">
                  {session.location}
                </Typography>
              </>
            ) : (
              <>
                <Event sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography variant="caption" color="text.secondary">
                  Special Event
                </Typography>
              </>
            )}
          </Stack>
          {session.hostName && (
            <Typography variant="caption" color="text.secondary">
              Host: {session.hostName}
            </Typography>
          )}
          <Tooltip title={getRelativeTime(session.scheduledAt)}>
            <Typography
              variant="caption"
              color="primary.main"
              sx={{ cursor: "help" }}
            >
              {getRelativeTime(session.scheduledAt)}
            </Typography>
          </Tooltip>
        </Stack>
      </TableCell>

      {/* Type */}
      <TableCell>
        <Stack direction="row" spacing={0.5} alignItems="center">
          {session.type === "SPEAKING" ? (
            <Mic sx={{ fontSize: 16 }} />
          ) : session.type === "STANDARD" ? (
            <Star sx={{ fontSize: 16 }} />
          ) : (
            <Event sx={{ fontSize: 16 }} />
          )}
          <Chip
            label={session.type === "SPEAKING" ? "Speaking" : session.type === "STANDARD" ? "Standard" : "Event"}
            size="small"
            color={session.type === "SPEAKING" ? "primary" : session.type === "STANDARD" ? "info" : "secondary"}
            sx={{ color: "white" }}
          />
        </Stack>
      </TableCell>

      {/* Date & Time */}
      <TableCell>
        <Stack spacing={0.5}>
          <Typography variant="body2" fontWeight={500}>
            {formatDateTime(session.scheduledAt)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date(session.scheduledAt).toLocaleDateString("en-US", {
              weekday: "long",
            })}
          </Typography>
        </Stack>
      </TableCell>

      {/* Duration */}
      <TableCell>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <AccessTime sx={{ fontSize: 14, color: "text.secondary" }} />
          <Typography variant="body2">{session.duration} min</Typography>
        </Stack>
      </TableCell>

      {/* Participants */}
      <TableCell>
        <Stack spacing={1}>
          <Stack direction="row" spacing={1} alignItems="center">
            <People sx={{ fontSize: 16 }} />
            <Typography variant="body2" fontWeight={500}>
              {session.currentParticipants}/{session.maxParticipants}
            </Typography>
          </Stack>
          <Box
            sx={{
              width: "100%",
              bgcolor: "grey.200",
              borderRadius: 1,
              height: 4,
            }}
          >
            <Box
              sx={{
                width: `${Math.min(fillPercentage, 100)}%`,
                bgcolor:
                  fillPercentage >= 100
                    ? "error.main"
                    : fillPercentage >= 80
                    ? "warning.main"
                    : "success.main",
                height: "100%",
                borderRadius: 1,
                transition: "width 0.3s ease",
              }}
            />
          </Box>
          <Typography variant="caption" color="text.secondary">
            {Math.round(fillPercentage)}% filled
          </Typography>
        </Stack>
      </TableCell>

      {/* Points */}
      <TableCell>
        {session.pointsRequired > 0 ? (
          <Stack direction="row" spacing={0.5} alignItems="center">
            <Star sx={{ fontSize: 16, color: "warning.main" }} />
            <Typography variant="body2" fontWeight={500}>
              {session.pointsRequired}
            </Typography>
          </Stack>
        ) : (
          <Typography variant="body2" color="success.main" fontWeight={500}>
            FREE
          </Typography>
        )}
      </TableCell>

      {/* Actions */}
      <TableCell align="right">
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Edit session">
            <IconButton
              size="small"
              onClick={() => {
                setEditingSession(session);
                dispatch(setFormFromSession(session));
                setSessionDialog(true);
              }}
              disabled={updating}
            >
              <Edit />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete session">
            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete(session)}
              disabled={deleting}
            >
              <Delete />
            </IconButton>
          </Tooltip>
        </Stack>
      </TableCell>
    </TableRow>
  );
};

// Main Table component
export const SessionsTable: React.FC<{
  sessions: Session[];
  onDelete: (s: Session) => void;
  updating: boolean;
  deleting: boolean;
  dispatch: any;
  setSessionDialog: (v: boolean) => void;
  setEditingSession: (s: Session) => void;
  setFormFromSession: (s: Session) => void;
}> = memo(({ sessions, ...rowProps }) => (
  <TableContainer sx={{ overflowX: "auto" }}>
    <Table sx={{ minWidth: { xs: 600, md: 800 } }}>
      <TableHead>
        <TableRow>
          <TableCell>Session Details</TableCell>
          <TableCell>Type</TableCell>
          <TableCell>Date & Time</TableCell>
          <TableCell>Duration</TableCell>
          <TableCell>Participants</TableCell>
          <TableCell>Points</TableCell>
          <TableCell align="right">Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {sessions.map((s) => (
          <SessionRow key={s.id} session={s} {...rowProps} />
        ))}
      </TableBody>
    </Table>
  </TableContainer>
));
