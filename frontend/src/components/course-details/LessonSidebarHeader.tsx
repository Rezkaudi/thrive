import React from "react";
import {
  Avatar,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { ChevronLeft, ChevronRight, Close } from "@mui/icons-material";

interface LessonSidebarHeaderProps {
  selectedCourse?: any;
  sidebarCollapsed: boolean;
  selectedCourseColors: { primary: string; secondary: string };
  setSidebarCollapsed: (v: boolean) => void;
  isMobile: boolean;
  setDrawerOpen?: (v: boolean) => void;
}

export const LessonSidebarHeader: React.FC<LessonSidebarHeaderProps> = ({
  selectedCourse,
  sidebarCollapsed,
  selectedCourseColors,
  setSidebarCollapsed,
  isMobile,
  setDrawerOpen,
}) => {
  return (
    <Stack
      direction={sidebarCollapsed ? "column" : "row"}
      justifyContent="space-between"
      alignItems="center"
      spacing={sidebarCollapsed ? 1 : 0}
      mb={sidebarCollapsed ? 0 : 1}
    >
      {sidebarCollapsed && selectedCourse && (
        <Tooltip title={selectedCourse.title} placement="right" arrow>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              background: `linear-gradient(135deg, ${selectedCourseColors.primary} 0%, ${selectedCourseColors.secondary} 100%)`,
              fontSize: "1.2rem",
              cursor: "pointer",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: `0 4px 12px ${selectedCourseColors.primary}40`,
              },
            }}
            onClick={() => setSidebarCollapsed(false)}
          >
            {selectedCourse.icon}
          </Avatar>
        </Tooltip>
      )}

      {!sidebarCollapsed && (
        <Typography variant="h6" fontWeight={700} sx={{ fontSize: "1.1rem" }}>
          {selectedCourse?.title || "Select a Course"}
        </Typography>
      )}

      <Stack direction={sidebarCollapsed ? "column" : "row"} spacing={0.5}>
        {!isMobile && (
          <Tooltip
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            placement={sidebarCollapsed ? "right" : "top"}
            arrow
          >
            <IconButton
              size="small"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              sx={{
                bgcolor: selectedCourseColors.primary + "20",
                color: selectedCourseColors.primary,
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  bgcolor: selectedCourseColors.primary + "30",
                  transform: "scale(1.05)",
                },
              }}
            >
              {sidebarCollapsed ? <ChevronRight /> : <ChevronLeft />}
            </IconButton>
          </Tooltip>
        )}
        {isMobile && (
          <IconButton size="small" onClick={() => setDrawerOpen?.(false)}>
            <Close />
          </IconButton>
        )}
      </Stack>
    </Stack>
  );
};

export default LessonSidebarHeader;
