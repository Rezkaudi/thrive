import { AdminPanelSettings, NavigateNext } from "@mui/icons-material";
import { Box, Breadcrumbs, Link as MuiLink, Typography } from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";

interface AdminNavigationButtonProps {
  titlePage: string;
  showContainer?: boolean;
}

const AdminNavigationButton: React.FC<AdminNavigationButtonProps> = ({
  titlePage,
  showContainer = true,
}) => {
  return (
    <Box
      sx={{
        display: "inline-block",
        width: "fit-content",
        maxWidth: "100%",
        px: showContainer ? 1.5 : 0,
        py: showContainer ? 1 : 0,
        borderRadius: showContainer ? 2 : 0,
        border: showContainer ? "1px solid" : "none",
        borderColor: "divider",
        bgcolor: showContainer ? "background.paper" : "transparent",
        overflowX: "auto",
      }}
    >
      <Breadcrumbs
        aria-label="admin page breadcrumb"
        separator={
          <NavigateNext fontSize="small" sx={{ color: "text.disabled" }} />
        }
      >
        <MuiLink
          component={Link}
          to="/admin"
          underline="none"
          color="text.secondary"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.75,
            px: 1.25,
            py: 0.5,
            borderRadius: 1.5,
            fontSize: "0.95rem",
            fontWeight: 600,
            transition: "all 0.2s ease",
            whiteSpace: "nowrap",
            "&:hover": {
              color: "primary.main",
              bgcolor: "action.hover",
            },
          }}
        >
          <AdminPanelSettings sx={{ fontSize: 18 }} />
          Admin Dashboard
        </MuiLink>

        <Typography
          color="text.primary"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            px: 1.25,
            py: 0.5,
            borderRadius: 1.5,
            bgcolor: "action.selected",
            fontSize: "0.95rem",
            fontWeight: 700,
            maxWidth: { xs: 180, sm: 300, md: "none" },
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {titlePage}
        </Typography>
      </Breadcrumbs>
    </Box>
  );
};

export default AdminNavigationButton;
