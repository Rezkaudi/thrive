import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Paper,
  IconButton,
  Box,
  Chip,
} from "@mui/material";
import { ArrowForward } from "@mui/icons-material";
import { motion } from "framer-motion";
import { UpcomingSession } from "../../services/dashboardService";

interface UpcomingSessionsProps {
  sessions: UpcomingSession[];
  onNavigate: (path: string) => void;
}

const ANIMATION_DELAYS = {
  SESSIONS: 0.3,
} as const;

export const UpcomingSessions: React.FC<UpcomingSessionsProps> = ({
  sessions,
  onNavigate,
}) => {
  if (!sessions || sessions.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: ANIMATION_DELAYS.SESSIONS }}
    >
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6" fontWeight={600}>
              Upcoming Sessions
            </Typography>
            <IconButton color="primary" onClick={() => onNavigate("/calendar")}>
              <ArrowForward />
            </IconButton>
          </Stack>
          <Stack spacing={2}>
            {sessions.slice(0, 3).map((session) => (
              <Paper key={session.id} sx={{ p: 2 }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Typography variant="body1" fontWeight={500}>
                      {session.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(session.scheduledAt).toLocaleDateString()} at{" "}
                      {new Date(session.scheduledAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Typography>
                  </Box>
                  <Chip
                    label={session.type}
                    size="small"
                    color={
                      session.type === "SPEAKING" ? "primary" : "secondary"
                    }
                  />
                </Stack>
              </Paper>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );
};
