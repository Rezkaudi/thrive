import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Typography,
  Button,
  Box,
} from "@mui/material";
import { CheckCircle, LockOutlined } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

interface Props {
  open: boolean;
  onClose: () => void;
  courseId?: string;
}

export const SubscriptionDialog: React.FC<Props> = ({
  open,
  onClose,
  courseId,
}) => {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={2}>
          <LockOutlined color="primary" />
          <Typography variant="h6">Unlock All Lessons</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          <Typography variant="body1">
            You've reached the free lesson limit for this course. Subscribe to
            unlock all lessons and features!
          </Typography>
          <Box sx={{ bgcolor: "grey.50", p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              With a subscription, you'll get:
            </Typography>
            <Stack spacing={1} sx={{ mt: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <CheckCircle color="success" fontSize="small" />
                <Typography variant="body2">
                  Unlimited access to all lessons
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <CheckCircle color="success" fontSize="small" />
                <Typography variant="body2">
                  Live speaking practice sessions
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <CheckCircle color="success" fontSize="small" />
                <Typography variant="body2">Downloadable resources</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <CheckCircle color="success" fontSize="small" />
                <Typography variant="body2">
                  Certificate of completion
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Maybe Later</Button>
        <Button
          variant="contained"
          onClick={() => {
            navigate("/subscription", {
              state: { courseId, returnUrl: `/classroom` },
            });
          }}
          sx={{ color: "white" }}
        >
          View Subscription Plans
        </Button>
      </DialogActions>
    </Dialog>
  );
};
