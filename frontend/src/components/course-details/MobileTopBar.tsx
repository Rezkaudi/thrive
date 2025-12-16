import React from "react";
import { Stack, IconButton, Typography } from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";

interface Props {
  title?: string;
  onOpenDrawer: () => void;
}

export const MobileTopBar: React.FC<Props> = ({ title, onOpenDrawer }) => {
  return (
    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
      <IconButton
        onClick={onOpenDrawer}
        sx={{
          bgcolor: "action.hover",
          "&:hover": {
            bgcolor: "action.selected",
          },
        }}
      >
        <MenuIcon />
      </IconButton>
      {title && (
        <Typography variant="h6" fontWeight={600}>
          {title}
        </Typography>
      )}
    </Stack>
  );
};
