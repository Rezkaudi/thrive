import React from "react";
import { Stack, Typography, Button, IconButton, Tooltip } from "@mui/material";
import { Today, Refresh } from "@mui/icons-material";

interface CalendarHeaderProps {
  onTodayClick: () => void;
  onRefresh: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  onTodayClick,
  onRefresh,
}) => {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      mb={4}
    >
      <Typography variant="h3" fontWeight={700}>
        Calendar & Sessions
      </Typography>
      <Stack direction="row" spacing={1}>
        <Button startIcon={<Today />} onClick={onTodayClick}>
          Today
        </Button>
        <Tooltip title="Refresh">
          <IconButton onClick={onRefresh} color="primary">
            <Refresh />
          </IconButton>
        </Tooltip>
      </Stack>
    </Stack>
  );
};
