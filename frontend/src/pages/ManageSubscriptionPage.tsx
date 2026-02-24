// frontend/src/pages/ManageSubscriptionPage.tsx
import React from "react";
import {
  Box,
  Container,
  Typography,
  Breadcrumbs,
  Link as MuiLink,
} from "@mui/material";
import { Link } from "react-router-dom";
import { NavigateNext } from "@mui/icons-material";
import { SubscriptionManagement } from "../components/profile/SubscriptionManagement";

export const ManageSubscriptionPage: React.FC = () => {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: 3 }}>
      <Container maxWidth="lg">
        {/* Breadcrumb */}
        <Breadcrumbs
          separator={<NavigateNext fontSize="small" />}
          sx={{ mb: 3 }}
        >
          <MuiLink
            component={Link}
            to="/profile"
            underline="hover"
            color="text.secondary"
            sx={{ fontSize: "0.875rem" }}
          >
            Profile
          </MuiLink>
          <Typography color="text.primary" sx={{ fontSize: "0.875rem", fontWeight: 600 }}>
            Subscription
          </Typography>
        </Breadcrumbs>

        <SubscriptionManagement />
      </Container>
    </Box>
  );
};
