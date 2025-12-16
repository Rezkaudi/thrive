import React from "react";
import {
  Box,
  Chip,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  CheckCircle,
  EmojiEvents,
  Lock,
  LockOutlined,
} from "@mui/icons-material";
import { motion } from "framer-motion";

interface LessonsListProps {
  lessonLoading: boolean;
  lessons: any[];
  sidebarCollapsed: boolean;
  isEnrolled: (id: string) => boolean;
  selectedCourse?: any;
  selectedCourseColors: { primary: string; secondary: string };
  selectedLesson?: any;
  setSelectedLesson: (lesson: any) => void;
  isMobile: boolean;
  setDrawerOpen?: (v: boolean) => void;
  getLessonTypeIcon: (
    lessonType: string,
    size: "small" | "medium"
  ) => React.ReactNode;
  navigate: (path: string) => void;
}

export const LessonsList: React.FC<LessonsListProps> = ({
  lessonLoading,
  lessons,
  sidebarCollapsed,
  isEnrolled,
  selectedCourse,
  selectedCourseColors,
  selectedLesson,
  setSelectedLesson,
  isMobile,
  setDrawerOpen,
  getLessonTypeIcon,
  navigate,
}) => {
  if (lessonLoading) {
    return (
      <Stack spacing={sidebarCollapsed ? 1 : 2}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton
            key={i}
            variant="rectangular"
            height={sidebarCollapsed ? 48 : 72}
            sx={{
              borderRadius: sidebarCollapsed ? 3 : 2,
              mx: sidebarCollapsed ? 0.5 : 0,
            }}
          />
        ))}
      </Stack>
    );
  }

  return (
    <List sx={{ p: 0 }}>
      {lessons.map((lesson, index) => {
        const isDisabled =
          !isEnrolled(selectedCourse?.id || "") ||
          (lesson.isLocked && lesson.lockReason !== "Subscribe to unlock");
        const isSelected = selectedLesson?.id === lesson.id;

        return (
          <motion.div
            key={lesson.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <ListItem
              disablePadding
              sx={{
                mb: sidebarCollapsed ? 0.5 : 1,
                px: sidebarCollapsed ? 0.5 : 0,
              }}
            >
              <Tooltip
                title={
                  sidebarCollapsed ? (
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {lesson.title}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        {lesson.lessonType.charAt(0) +
                          lesson.lessonType.slice(1).toLowerCase()}
                        {lesson.pointsReward > 0 &&
                          ` • +${lesson.pointsReward} pts`}
                      </Typography>
                      {lesson.isLocked && (
                        <Typography
                          variant="caption"
                          color="warning.main"
                          sx={{ display: "block", mt: 0.5 }}
                        >
                          {lesson.lockReason}
                        </Typography>
                      )}
                    </Box>
                  ) : (
                    ""
                  )
                }
                placement="right"
                arrow
                PopperProps={{
                  sx: {
                    "& .MuiTooltip-tooltip": {
                      bgcolor: "grey.900",
                      color: "white",
                      fontSize: "0.75rem",
                      maxWidth: 200,
                    },
                  },
                }}
              >
                <ListItemButton
                  selected={isSelected}
                  disabled={isDisabled}
                  onClick={() => {
                    if (!isDisabled && !lesson.isLocked) {
                      setSelectedLesson(lesson);
                      if (isMobile) setDrawerOpen?.(false);
                    } else if (lesson.lockReason === "Subscribe to unlock") {
                      navigate("/subscription");
                    }
                  }}
                  sx={{
                    borderRadius: sidebarCollapsed ? 3 : 2,
                    opacity: lesson.isLocked ? 0.7 : 1,
                    minHeight: sidebarCollapsed ? 48 : 72,
                    px: sidebarCollapsed ? 1 : 2,
                    py: sidebarCollapsed ? 1 : 1.5,
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    position: "relative",
                    overflow: "hidden",
                    justifyContent: sidebarCollapsed ? "center" : "flex-start",

                    "&.Mui-selected": {
                      background: `linear-gradient(135deg, ${selectedCourseColors.primary} 0%, ${selectedCourseColors.secondary} 100%)`,
                      color: "white",
                      transform: sidebarCollapsed
                        ? "scale(1.05)"
                        : "translateX(4px)",
                      boxShadow: sidebarCollapsed
                        ? `0 4px 12px ${selectedCourseColors.primary}40`
                        : `4px 0 12px ${selectedCourseColors.primary}30`,
                      "&:hover": {
                        background: `linear-gradient(135deg, ${selectedCourseColors.primary} 0%, ${selectedCourseColors.secondary} 100%)`,
                        transform: sidebarCollapsed
                          ? "scale(1.08)"
                          : "translateX(6px)",
                      },
                      "& .MuiListItemIcon-root": {
                        color: "white",
                      },
                      ...(sidebarCollapsed && {
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          borderRadius: 3,
                          border: `2px solid ${selectedCourseColors.primary}60`,
                          pointerEvents: "none",
                        },
                      }),
                    },

                    "&:hover:not(.Mui-selected)":
                      lesson.lockReason === "Subscribe to unlock"
                        ? {
                            bgcolor: "action.hover",
                            cursor: "pointer",
                            transform: sidebarCollapsed
                              ? "scale(1.02)"
                              : "translateX(2px)",
                          }
                        : {
                            bgcolor: "action.hover",
                            transform: sidebarCollapsed
                              ? "scale(1.02)"
                              : "translateX(2px)",
                          },

                    ...(sidebarCollapsed && {
                      "&::after": {
                        content: `"${lesson.order}"`,
                        position: "absolute",
                        top: 2,
                        right: 2,
                        fontSize: "0.6rem",
                        fontWeight: 700,
                        color: isSelected
                          ? "rgba(255,255,255,0.7)"
                          : "text.secondary",
                        backgroundColor: isSelected
                          ? "rgba(255,255,255,0.1)"
                          : "action.hover",
                        borderRadius: "50%",
                        width: 16,
                        height: 16,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        lineHeight: 1,
                      },
                    }),
                  }}
                >
                  {lesson.lockReason === "Subscribe to unlock" && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(255, 255, 255, 0.1)",
                        backdropFilter: "blur(2px)",
                        zIndex: 1,
                      }}
                    />
                  )}

                  <ListItemIcon
                    sx={{
                      minWidth: sidebarCollapsed ? 0 : 40,
                      zIndex: 2,
                      justifyContent: "center",
                      position: "relative",
                    }}
                  >
                    {lesson.isCompleted ? (
                      <CheckCircle
                        color={isSelected ? "inherit" : "success"}
                        sx={{
                          fontSize: sidebarCollapsed ? 22 : 24,
                          filter:
                            sidebarCollapsed && isSelected
                              ? "drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
                              : "none",
                        }}
                      />
                    ) : lesson.isLocked ? (
                      <Lock
                        color="disabled"
                        sx={{
                          fontSize: sidebarCollapsed ? 20 : 24,
                          filter: sidebarCollapsed
                            ? "drop-shadow(0 1px 2px rgba(0,0,0,0.2))"
                            : "none",
                        }}
                      />
                    ) : !isEnrolled(selectedCourse?.id || "") ? (
                      <Lock
                        color="disabled"
                        sx={{
                          fontSize: sidebarCollapsed ? 20 : 24,
                          filter: sidebarCollapsed
                            ? "drop-shadow(0 1px 2px rgba(0,0,0,0.2))"
                            : "none",
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          color: isSelected ? "inherit" : "action.active",
                          filter:
                            sidebarCollapsed && isSelected
                              ? "drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
                              : "none",
                        }}
                      >
                        {getLessonTypeIcon(
                          lesson.lessonType,
                          sidebarCollapsed ? "small" : "medium"
                        )}
                      </Box>
                    )}

                    {sidebarCollapsed && lesson.isCompleted && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: -2,
                          right: -2,
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: "success.main",
                          border: "2px solid white",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                        }}
                      />
                    )}

                    {sidebarCollapsed &&
                      lesson.pointsReward > 0 &&
                      !lesson.isLocked &&
                      !lesson.isCompleted && (
                        <Box
                          sx={{
                            position: "absolute",
                            bottom: -2,
                            right: -2,
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: selectedCourseColors.primary,
                            border: "2px solid white",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                          }}
                        />
                      )}
                  </ListItemIcon>

                  {!sidebarCollapsed && (
                    <ListItemText
                      sx={{ zIndex: 2 }}
                      primary={
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1}
                          flexWrap="wrap"
                        >
                          <Typography
                            variant="body2"
                            fontWeight={isSelected ? 600 : 500}
                            sx={{
                              flexGrow: 1,
                              lineHeight: 1.3,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {lesson.title}
                          </Typography>
                          {lesson.isLocked && (
                            <Chip
                              size="small"
                              label={
                                lesson.lockReason === "Subscribe to unlock"
                                  ? "Pro"
                                  : "Locked"
                              }
                              icon={
                                lesson.lockReason === "Subscribe to unlock" ? (
                                  <LockOutlined
                                    color="inherit"
                                    sx={{
                                      fontSize: "12px !important",
                                      color: "white",
                                    }}
                                  />
                                ) : undefined
                              }
                              sx={{
                                height: 18,
                                fontSize: "0.6rem",
                                bgcolor:
                                  lesson.lockReason === "Subscribe to unlock"
                                    ? "primary.main"
                                    : "grey.300",
                                color:
                                  lesson.lockReason === "Subscribe to unlock"
                                    ? "white"
                                    : "grey.600",
                                "& .MuiChip-label": { px: 1 },
                              }}
                            />
                          )}
                          {lesson.pointsReward > 0 && !lesson.isLocked && (
                            <Chip
                              size="small"
                              icon={
                                <EmojiEvents
                                  sx={{ fontSize: "12px !important" }}
                                />
                              }
                              label={`+${lesson.pointsReward}`}
                              sx={{
                                height: 18,
                                fontSize: "0.6rem",
                                bgcolor: isSelected
                                  ? "rgba(255,255,255,0.2)"
                                  : `${selectedCourseColors.primary}20`,
                                color: isSelected
                                  ? "inherit"
                                  : selectedCourseColors.primary,
                                "& .MuiChip-label": { px: 1 },
                              }}
                            />
                          )}
                        </Stack>
                      }
                      secondary={
                        <Typography
                          variant="caption"
                          color={isSelected ? "inherit" : "text.secondary"}
                          sx={{
                            opacity: isSelected ? 0.8 : 0.7,
                            fontSize: "0.7rem",
                          }}
                        >
                          {lesson.isLocked
                            ? lesson.lockReason || "Complete previous lesson"
                            : `Lesson ${lesson.order} • ${
                                lesson.lessonType.charAt(0) +
                                lesson.lessonType.slice(1).toLowerCase()
                              }`}
                        </Typography>
                      }
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          </motion.div>
        );
      })}
    </List>
  );
};

export default LessonsList;
