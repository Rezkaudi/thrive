import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Avatar,
  Typography,
  Box,
  Alert,
  Paper,
  Button,
} from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import { Course } from "../../types/course.types";
import { getCourseTheme, createCourseGradient } from "../../utils/theme.utils";

interface EnrollmentDialogProps {
  course: Course | null;
  onClose: () => void;
  onEnroll: (course: Course) => void;
}

export const EnrollmentDialog: React.FC<EnrollmentDialogProps> = ({
  course,
  onClose,
  onEnroll,
}) => {
  if (!course) return null;

  const theme = getCourseTheme(course.type);
  const gradient = createCourseGradient(theme);

  return (
    <Dialog
      open={!!course}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 4 },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              background: gradient,
            }}
          >
            {course.icon}
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={600}>
              Enroll in {course.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start your learning journey today
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Stack spacing={3}>
          {course.description.split("\n").map((item, index) => (
            <Typography key={index} variant="body1" sx={{ lineHeight: 1.6 }}>
              {item}
            </Typography>
          ))}

          <Alert
            severity="success"
            sx={{
              borderRadius: 2,
              "& .MuiAlert-icon": {
                fontSize: 24,
              },
            }}
          >
            <Typography variant="body2" fontWeight={500}>
              🎉 This course is completely free! Enroll now to start learning
              and earning points.
            </Typography>
          </Alert>

          <Paper
            elevation={0}
            sx={{ p: 3, bgcolor: "background.default", borderRadius: 2 }}
          >
            <Typography variant="subtitle2" gutterBottom color="text.secondary">
              What you'll get:
            </Typography>
            <Stack spacing={1}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <CheckCircle color="success" sx={{ fontSize: 20 }} />
                <Typography variant="body2">
                  Interactive lessons and quizzes
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <CheckCircle color="success" sx={{ fontSize: 20 }} />
                <Typography variant="body2">
                  Track your learning progress
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <CheckCircle color="success" sx={{ fontSize: 20 }} />
                <Typography variant="body2">
                  Earn points and achievements
                </Typography>
              </Stack>
            </Stack>
          </Paper>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={onClose} sx={{ borderRadius: 2 }}>
          Maybe Later
        </Button>
        <Button
          variant="contained"
          onClick={() => onEnroll(course)}
          sx={{
            borderRadius: 2,
            px: 4,
            background: gradient,
            "&:hover": {
              background: createCourseGradient({
                primary: theme.primary,
                secondary: theme.accent,
              }),
            },
          }}
        >
          Enroll Now
        </Button>
      </DialogActions>
    </Dialog>
  );
};
