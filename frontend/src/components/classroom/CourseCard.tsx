import React, { memo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  Stack,
  Button,
  Paper,
  Tooltip,
} from "@mui/material";
import {
  PlayCircle,
  CheckCircle,
  School,
  Star,
  AccessTime,
  TrendingUp,
  AutoAwesome,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { CourseCardProps } from "../../types/course.types";
import { getCourseTheme, createCourseGradient } from "../../utils/theme.utils";

export const CourseCard = memo(
  ({
    course,
    onClick,
    isEnrolled,
    progress = 0,
    lessonCount = 0,
    completedCount = 0,
  }: CourseCardProps) => {
    const isCompleted = progress === 100;
    const theme = getCourseTheme(course.type);
    const gradient = createCourseGradient(theme);

    return (
      <motion.div
        whileHover={{ y: -12, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <Card
          sx={{
            cursor: "pointer",
            height: "100%",
            position: "relative",
            overflow: "hidden",
            borderRadius: 2,
            boxShadow: isEnrolled
              ? `0 8px 32px ${theme.primary}20`
              : "0 4px 20px rgba(0,0,0,0.08)",
            border: isCompleted ? `2px solid ${theme.primary}` : "none",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              boxShadow: `0 12px 40px ${theme.primary}30`,
            },
          }}
          onClick={onClick}
        >
          {/* Header section */}
          <Box
            sx={{
              height: 180,
              background: gradient,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Decorative background pattern */}
            <Box
              sx={{
                position: "absolute",
                top: -20,
                right: -20,
                width: 100,
                height: 100,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.1)",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: -30,
                left: -30,
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.08)",
              }}
            />
            {/* Course icon */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Typography
                variant="h1"
                sx={{ fontSize: "4rem", opacity: 0.9, zIndex: 2 }}
              >
                {course.icon}
              </Typography>
            </motion.div>

            {/* Status badges */}
            <Stack
              direction="row"
              spacing={1}
              sx={{ position: "absolute", top: 16, right: 16 }}
            >
              {isCompleted && (
                <Tooltip title="Course Completed!" arrow>
                  <Chip
                    icon={<AutoAwesome />}
                    label="Completed"
                    size="small"
                    sx={{
                      bgcolor: "rgba(255, 255, 255, 0.95)",
                      color: theme.primary,
                      fontWeight: 600,
                      "& .MuiChip-icon": { color: theme.primary },
                    }}
                  />
                </Tooltip>
              )}
              {isEnrolled && !isCompleted && (
                <Chip
                  label="In Progress"
                  size="small"
                  sx={{
                    bgcolor: "rgba(255, 255, 255, 0.9)",
                    color: theme.primary,
                    fontWeight: 500,
                  }}
                />
              )}
            </Stack>

            {/* Progress bar */}
            {isEnrolled && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 6,
                  bgcolor: "rgba(255, 255, 255, 0.3)",
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  style={{
                    height: "100%",
                    background: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "0 3px 3px 0",
                  }}
                />
              </Box>
            )}
          </Box>

          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            {/* Course title and description */}
            <Typography
              variant="h5"
              gutterBottom
              fontWeight={700}
              sx={{
                mb: 1,
                lineHeight: 1.6,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {course.title}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 3,
                lineHeight: 1.6,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {course.description}
            </Typography>

            {/* Progress section for enrolled courses */}
            {isEnrolled && (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  mb: 3,
                  bgcolor: `${theme.primary}08`,
                  borderRadius: 2,
                  border: `1px solid ${theme.primary}20`,
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={1}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontWeight={500}
                  >
                    Learning Progress
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <TrendingUp sx={{ fontSize: 16, color: theme.primary }} />
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      color={theme.primary}
                    >
                      {progress}%
                    </Typography>
                  </Stack>
                </Stack>

                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: `${theme.primary}20`,
                    "& .MuiLinearProgress-bar": {
                      bgcolor: theme.primary,
                      borderRadius: 4,
                    },
                  }}
                />

                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  mt={1}
                >
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <CheckCircle sx={{ fontSize: 16, color: "success.main" }} />
                    <Typography variant="caption" color="text.secondary">
                      {completedCount} completed
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <School sx={{ fontSize: 16, color: "text.secondary" }} />
                    <Typography variant="caption" color="text.secondary">
                      {lessonCount} total lessons
                    </Typography>
                  </Stack>
                </Stack>
              </Paper>
            )}

            {/* Action button */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              {isEnrolled ? (
                <>
                  <Stack direction="row" spacing={1}>
                    <Chip
                      label={isCompleted ? "Complete" : "In Progress"}
                      size="small"
                      color={isCompleted ? "success" : "primary"}
                      variant={isCompleted ? "filled" : "outlined"}
                      icon={
                        isCompleted ? (
                          <Star sx={{ fontSize: 16 }} />
                        ) : (
                          <AccessTime sx={{ fontSize: 16 }} />
                        )
                      }
                    />
                  </Stack>
                  <Button
                    endIcon={isCompleted ? <Star /> : <PlayCircle />}
                    variant={isCompleted ? "outlined" : "contained"}
                    sx={{
                      borderRadius: 3,
                      textTransform: "none",
                      fontWeight: 600,
                      px: 3,
                      ...(!isCompleted && {
                        color: "white",
                        background: `linear-gradient(45deg, ${theme.primary} 30%, ${theme.accent} 90%)`,
                        "&:hover": {
                          background: `linear-gradient(45deg, ${theme.primary} 60%, ${theme.accent} 100%)`,
                        },
                      }),
                    }}
                  >
                    {isCompleted ? "Review Course" : "Continue Learning"}
                  </Button>
                </>
              ) : (
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{
                    borderRadius: 3,
                    textTransform: "none",
                    fontWeight: 600,
                    py: 1.5,
                    color: "white",
                    background: `linear-gradient(45deg, ${theme.primary} 30%, ${theme.accent} 90%)`,
                    "&:hover": {
                      background: `linear-gradient(45deg, ${theme.primary} 60%, ${theme.accent} 100%)`,
                    },
                  }}
                >
                  Explore Course
                </Button>
              )}
            </Stack>
          </CardContent>
        </Card>
      </motion.div>
    );
  }
);
